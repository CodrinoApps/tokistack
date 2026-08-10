use std::{
    collections::HashMap,
    sync::Arc,
    time::{Duration, SystemTime},
};

use lambda_runtime::Error;
use lambda_runtime::layers::{OpenTelemetryFaasTrigger, OpenTelemetryLayer};
use opentelemetry::{
    Context, KeyValue, global,
    trace::{Span, TraceContextExt, Tracer, TracerProvider as _},
};
use opentelemetry_appender_tracing::layer::OpenTelemetryTracingBridge;
use opentelemetry_otlp::{Protocol, WithExportConfig, WithHttpConfig};
use opentelemetry_sdk::{
    Resource,
    logs::SdkLoggerProvider,
    metrics::{PeriodicReader, SdkMeterProvider, Temporality},
    trace::SdkTracerProvider,
};
use tracing_subscriber::{
    EnvFilter, Layer, filter::LevelFilter, layer::SubscriberExt, util::SubscriberInitExt,
};

use crate::cluster::Cluster;

/// New Relic EU-region OTLP ingest.
const ENDPOINT: &str = "https://otlp.eu01.nr-data.net";

/// Caps how long a single exporter can block when the telemetry backend is
/// unreachable.
const EXPORT_TIMEOUT: Duration = Duration::from_secs(2);

/// Silences the exporter's own HTTP stack.
const LOG_EXPORT_FILTER_DIRECTIVES: [&str; 3] = ["opentelemetry=off", "hyper=off", "reqwest=off"];

/// FaaS process suspension as per:
/// (<https://opentelemetry.io/docs/specs/otel/metrics/sdk/#forceflush>).
const METRIC_EXPORT_INTERVAL: Duration = Duration::from_secs(3600);

pub struct Telemetry {
    traces: SdkTracerProvider,
    metrics: SdkMeterProvider,
    logs: SdkLoggerProvider,
}

impl Telemetry {
    pub fn flush(&self) {
        let _ = self.traces.force_flush();
        let _ = self.metrics.force_flush();
        let _ = self.logs.force_flush();
    }

    /// Runtime layer that flushes all exporters when an invocation completes.
    pub fn layer(self: &Arc<Self>) -> OpenTelemetryLayer<impl Fn() + Clone> {
        let telemetry = Arc::clone(self);
        OpenTelemetryLayer::new(move || telemetry.flush())
            .with_trigger(OpenTelemetryFaasTrigger::Other)
    }

    pub fn record_cold_start(&self, phases: &[(&'static str, SystemTime, SystemTime)]) {
        let (Some(first), Some(last)) = (phases.first(), phases.last()) else {
            return;
        };

        let tracer = self.traces.tracer("cold_start");
        let root = tracer
            .span_builder("cold_start")
            .with_start_time(first.1)
            .start(&tracer);
        let ctx = Context::current_with_span(root);

        for (name, start, end) in phases {
            tracer
                .span_builder(*name)
                .with_start_time(*start)
                .start_with_context(&tracer, &ctx)
                .end_with_timestamp(*end);
        }

        ctx.span().end_with_timestamp(last.2);
    }
}

fn service_name(cluster: &Cluster, service: &str) -> String {
    format!("{service}-{}", cluster.name())
}

fn default_env_filter() -> EnvFilter {
    EnvFilter::builder()
        .with_default_directive(LevelFilter::INFO.into())
        .from_env_lossy()
}

fn log_export_filter() -> Result<EnvFilter, Error> {
    let mut filter = EnvFilter::new("info");
    for directive in LOG_EXPORT_FILTER_DIRECTIVES {
        filter = filter.add_directive(directive.parse()?);
    }
    Ok(filter)
}

pub fn init(
    cluster: &Cluster,
    license_key: String,
    service: &str,
) -> Result<Arc<Telemetry>, Error> {
    let headers = HashMap::from([("api-key".to_string(), license_key)]);
    let service_name = service_name(cluster, service);

    let resource = Resource::builder()
        .with_service_name(service_name.clone())
        .with_attributes([
            KeyValue::new("cloud.provider", "aws"),
            KeyValue::new("cloud.platform", "aws_lambda"),
            KeyValue::new(
                "cloud.region",
                std::env::var("AWS_REGION").unwrap_or_default(),
            ),
            KeyValue::new("deployment.environment.name", cluster.name().to_string()),
            KeyValue::new(
                "faas.name",
                std::env::var("AWS_LAMBDA_FUNCTION_NAME").unwrap_or_default(),
            ),
            KeyValue::new(
                "faas.version",
                std::env::var("AWS_LAMBDA_FUNCTION_VERSION").unwrap_or_default(),
            ),
            KeyValue::new(
                "service.instance.id",
                std::env::var("AWS_LAMBDA_LOG_STREAM_NAME").unwrap_or_default(),
            ),
        ])
        .build();

    let traces = SdkTracerProvider::builder()
        .with_resource(resource.clone())
        .with_batch_exporter(
            opentelemetry_otlp::SpanExporter::builder()
                .with_http()
                .with_protocol(Protocol::HttpBinary)
                .with_endpoint(format!("{ENDPOINT}/v1/traces"))
                .with_headers(headers.clone())
                .with_timeout(EXPORT_TIMEOUT)
                .build()?,
        )
        .build();

    let metrics = SdkMeterProvider::builder()
        .with_resource(resource.clone())
        .with_reader(
            PeriodicReader::builder(
                opentelemetry_otlp::MetricExporter::builder()
                    .with_http()
                    .with_protocol(Protocol::HttpBinary)
                    .with_endpoint(format!("{ENDPOINT}/v1/metrics"))
                    .with_headers(headers.clone())
                    .with_temporality(Temporality::Delta)
                    .with_timeout(EXPORT_TIMEOUT)
                    .build()?,
            )
            .with_interval(METRIC_EXPORT_INTERVAL)
            .build(),
        )
        .build();

    let logs = SdkLoggerProvider::builder()
        .with_resource(resource)
        .with_batch_exporter(
            opentelemetry_otlp::LogExporter::builder()
                .with_http()
                .with_protocol(Protocol::HttpBinary)
                .with_endpoint(format!("{ENDPOINT}/v1/logs"))
                .with_headers(headers)
                .with_timeout(EXPORT_TIMEOUT)
                .build()?,
        )
        .build();

    global::set_meter_provider(metrics.clone());

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer().json().without_time())
        .with(tracing_opentelemetry::layer().with_tracer(traces.tracer(service_name)))
        .with(OpenTelemetryTracingBridge::new(&logs).with_filter(log_export_filter()?))
        .with(default_env_filter())
        .init();

    Ok(Arc::new(Telemetry {
        traces,
        metrics,
        logs,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn service_names_are_suffixed_with_the_cluster_name() {
        assert_eq!(
            service_name(&Cluster::Production, "tokistack-admin"),
            "tokistack-admin-production"
        );
        assert_eq!(
            service_name(&Cluster::from_name("testing").unwrap(), "tokistack-admin"),
            "tokistack-admin-testing"
        );
    }

    #[test]
    fn log_export_filter_directives_parse() {
        log_export_filter().unwrap();
    }

    #[test]
    fn missing_rust_log_defaults_to_info() {
        unsafe { std::env::remove_var("RUST_LOG") };
        assert_eq!(default_env_filter().to_string(), "info");
    }

    #[test]
    fn cold_start_phases_form_one_backdated_trace() {
        let exporter = opentelemetry_sdk::trace::InMemorySpanExporter::default();
        let telemetry = Telemetry {
            traces: SdkTracerProvider::builder()
                .with_simple_exporter(exporter.clone())
                .build(),
            metrics: SdkMeterProvider::builder().build(),
            logs: SdkLoggerProvider::builder().build(),
        };

        let t0 = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000);
        let t1 = t0 + Duration::from_secs(1);
        let t2 = t1 + Duration::from_secs(2);

        telemetry.record_cold_start(&[("config_and_ssm", t0, t1), ("db_connect", t1, t2)]);

        let spans = exporter.get_finished_spans().unwrap();
        assert_eq!(spans.len(), 3);

        let root = spans.iter().find(|span| span.name == "cold_start").unwrap();
        assert_eq!(root.start_time, t0);
        assert_eq!(root.end_time, t2);

        for child in spans.iter().filter(|span| span.name != "cold_start") {
            assert_eq!(child.parent_span_id, root.span_context.span_id());
            assert_eq!(child.span_context.trace_id(), root.span_context.trace_id());
        }
    }
}
