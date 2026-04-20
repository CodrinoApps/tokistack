const EXTENSION_HTTP_PORT = process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT ?? "2773";

/**
 * Calls the parameters extension layer to fetch secured strings from SSM
 * @param name
 * @returns
 */
export async function resolveParameter(name: string): Promise<string> {
  const url = `http://localhost:${EXTENSION_HTTP_PORT}/systemsmanager/parameters/get?name=${
    encodeURIComponent(name)
  }&withDecryption=true`;

  const response = await fetch(url, {
    headers: {
      "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN ?? "",
    },
  });

  const data = (await response.json()) as { Parameter: { Value: string } };
  return data.Parameter.Value;
}
