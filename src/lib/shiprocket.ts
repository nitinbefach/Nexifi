// Shiprocket API client — configured in Sprint 6
// Placeholder for shipping integration

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let authToken: string | null = null;

export async function getShiprocketToken(): Promise<string> {
  if (authToken) return authToken;

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  const data = await response.json();
  authToken = data.token;
  return authToken!;
}

export async function shiprocketFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getShiprocketToken();
  return fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
