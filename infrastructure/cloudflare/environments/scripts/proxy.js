export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const apiUrl = new URL(url.pathname + url.search, env.API_GATEWAY_URL);
      const headers = new Headers(request.headers);
      headers.set("X-Origin-Secret", env.ORIGIN_HEADER_SECRET);
      headers.set("X-Forwarded-Host", url.hostname);
      headers.set("X-Forwarded-Proto", "https");
      headers.set("Host", apiUrl.hostname);

      return fetch(apiUrl, {
        method: request.method,
        headers,
        body: request.body,
      });
    }

    return env.FRONTEND.fetch(request);
  },
};
