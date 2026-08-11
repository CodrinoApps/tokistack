use std::collections::HashMap;

use aws_sdk_ssm::error::SdkError;
use aws_sdk_ssm::operation::get_parameters::{GetParametersError, GetParametersOutput};

#[derive(Debug, thiserror::Error)]
pub enum SsmError {
    #[error("unknown SSM parameters: {}", .0.join(", "))]
    UnknownParameters(Vec<String>),
    #[error("SSM parameter {0} has no value")]
    MissingValue(String),
    #[error(transparent)]
    Sdk(#[from] Box<SdkError<GetParametersError>>),
}

pub async fn resolve<const N: usize>(
    client: &aws_sdk_ssm::Client,
    names: [&str; N],
) -> Result<[String; N], SsmError> {
    let response = client
        .get_parameters()
        .set_names(Some(names.iter().map(|name| name.to_string()).collect()))
        .with_decryption(true)
        .send()
        .await
        .map_err(Box::new)?;

    values_in_order(response, names)
}

fn values_in_order<const N: usize>(
    response: GetParametersOutput,
    names: [&str; N],
) -> Result<[String; N], SsmError> {
    let invalid = response.invalid_parameters();
    if !invalid.is_empty() {
        return Err(SsmError::UnknownParameters(invalid.to_vec()));
    }

    let mut values: HashMap<String, String> = response
        .parameters
        .unwrap_or_default()
        .into_iter()
        .filter_map(|parameter| Some((parameter.name?, parameter.value?)))
        .collect();

    let mut resolved = Vec::with_capacity(N);
    for name in names {
        let value = values
            .remove(name)
            .ok_or_else(|| SsmError::MissingValue(name.to_string()))?;
        resolved.push(value);
    }

    Ok(resolved.try_into().expect("one value per requested name"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use aws_sdk_ssm::types::Parameter;

    fn parameter(name: &str, value: &str) -> Parameter {
        Parameter::builder().name(name).value(value).build()
    }

    #[test]
    fn values_are_returned_in_order_they_were_requested() {
        let response = GetParametersOutput::builder()
            .parameters(parameter("/b", "2"))
            .parameters(parameter("/a", "1"))
            .build();

        let [a, b] = values_in_order(response, ["/a", "/b"]).unwrap();
        assert_eq!(a, "1");
        assert_eq!(b, "2");
    }

    #[test]
    fn unknown_parameters_are_rejected() {
        let response = GetParametersOutput::builder()
            .invalid_parameters("/missing")
            .build();

        assert!(matches!(
            values_in_order(response, ["/missing"]),
            Err(SsmError::UnknownParameters(names)) if names == ["/missing"]
        ));
    }

    #[test]
    fn absent_values_are_rejected() {
        let response = GetParametersOutput::builder()
            .parameters(Parameter::builder().name("/a").build())
            .build();

        assert!(matches!(
            values_in_order(response, ["/a"]),
            Err(SsmError::MissingValue(name)) if name == "/a"
        ));
    }
}
