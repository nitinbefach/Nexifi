// PhonePe Business Payment Gateway — v2 Standard Checkout (OAuth)
import crypto from "crypto";

const CLIENT_ID = process.env.PHONEPE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || "";
const CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || "1";
const WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME || "";
const WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const IS_PRODUCTION = process.env.PHONEPE_ENV === "production";

// API base URLs
const SANDBOX_BASE = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const PROD_AUTH_BASE = "https://api.phonepe.com/apis/identity-manager";
const PROD_API_BASE = "https://api.phonepe.com/apis/pg";

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth access token (cached until expiry)
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < (cachedToken.expiresAt * 1000) - 60_000) {
    return cachedToken.token;
  }

  const authUrl = IS_PRODUCTION
    ? `${PROD_AUTH_BASE}/v1/oauth/token`
    : `${SANDBOX_BASE}/v1/oauth/token`;

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_version: CLIENT_VERSION,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PhonePe auth failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: data.expires_at || (Date.now() / 1000 + 3600),
  };

  return cachedToken.token;
}

/**
 * Get the API base URL for payment operations
 */
function getApiBase(): string {
  return IS_PRODUCTION ? PROD_API_BASE : SANDBOX_BASE;
}

// ─── Create Payment ─────────────────────────────────────────────

interface CreatePaymentParams {
  merchantOrderId: string;
  amount: number; // in rupees
  orderId: string; // internal DB order ID (stored in udf1)
}

interface CreatePaymentResponse {
  success: boolean;
  redirectUrl?: string;
  phonePeOrderId?: string;
  merchantOrderId: string;
  error?: string;
}

/**
 * Create a PhonePe v2 payment and return the redirect URL
 */
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResponse> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "PhonePe credentials not configured. Set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET."
    );
  }

  const token = await getAccessToken();
  const amountInPaise = Math.round(params.amount * 100);

  const payload = {
    merchantOrderId: params.merchantOrderId,
    amount: amountInPaise,
    paymentFlow: {
      type: "PG_CHECKOUT",
      merchantUrls: {
        redirectUrl: `${APP_URL}/api/phonepe/verify?orderId=${params.merchantOrderId}`,
      },
    },
    metaInfo: {
      udf1: params.orderId, // internal order ID for lookup
    },
  };

  const response = await fetch(`${getApiBase()}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.ok && data.redirectUrl) {
    return {
      success: true,
      redirectUrl: data.redirectUrl,
      phonePeOrderId: data.orderId,
      merchantOrderId: params.merchantOrderId,
    };
  }

  return {
    success: false,
    error: data.message || data.code || "Failed to create PhonePe payment",
    merchantOrderId: params.merchantOrderId,
  };
}

// ─── Check Order Status ─────────────────────────────────────────

interface OrderStatusResponse {
  success: boolean;
  state: "COMPLETED" | "PENDING" | "FAILED";
  transactionId?: string;
  paymentMode?: string;
  error?: string;
}

/**
 * Check the status of a PhonePe payment by merchantOrderId
 */
export async function checkOrderStatus(
  merchantOrderId: string
): Promise<OrderStatusResponse> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("PhonePe credentials not configured.");
  }

  const token = await getAccessToken();

  const response = await fetch(
    `${getApiBase()}/checkout/v2/order/${merchantOrderId}/status?details=false`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (data.state === "COMPLETED") {
    const payment = data.paymentDetails?.[0];
    return {
      success: true,
      state: "COMPLETED",
      transactionId: payment?.transactionId,
      paymentMode: payment?.paymentMode,
    };
  }

  if (data.state === "PENDING") {
    return { success: false, state: "PENDING" };
  }

  return {
    success: false,
    state: "FAILED",
    error: data.errorCode || data.message || "Payment failed",
  };
}

// ─── Webhook Verification ───────────────────────────────────────

/**
 * Verify PhonePe webhook Authorization header
 * PhonePe sends SHA256(username:password) as the Authorization header
 */
export function verifyWebhookAuth(authorizationHeader: string): boolean {
  if (!WEBHOOK_USERNAME || !WEBHOOK_PASSWORD) {
    console.warn("[PhonePe] Webhook credentials not configured");
    return false;
  }

  const expectedHash = crypto
    .createHash("sha256")
    .update(`${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`)
    .digest("hex");

  return authorizationHeader === expectedHash;
}
