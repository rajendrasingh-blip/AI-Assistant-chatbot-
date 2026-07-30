export async function callApi<TBody, TResponse>(
  url: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status} - ${responseText}`
    );
  }

  return JSON.parse(responseText) as TResponse;
}