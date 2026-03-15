// PhonePe Business Payment Gateway — server-side helper
import crypto from "crypto";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Use UAT (sandbox) if no merchant ID is set, production otherwise
const API_BASE = MERCHANT_ID
  ? "https://api.phonepe.com/apis/hermes"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox";

/**
 * Generate SHA256 checksum for PhonePe API requests
 */
function generateChecksum(payload: string, endpoint: string): string {
  const base64Payload = Buffer.from(payload).toString("base64");
  const hashInput = base64Payload + endpoint + SALT_KEY;
  const hash = crypto.createHash("sha256").update(hashInput).digest("hex");
  return `${hash}###${SALT_INDEX}`;
}

/**
 * Verify PhonePe callback checksum
 */
export function verifyChecksum(
  xVerifyHeader: string,
  responseBody: string
): boolean {
  const hash = crypto
    .createHash("sha256")
    .update(responseBody + SALT_KEY)
    .digest("hex");
  const expectedChecksum = `${hash}###${SALT_INDEX}`;
  return xVerifyHeader === expectedChecksum;
}

interface CreateOrderParams {
  amount: number; // in rupees
  orderId: string;
  customerPhone: string;
  customerEmail?: string;
}

interface PhonePeCreateResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
  merchantTransactionId: string;
}

/**
 * Create a PhonePe payment order and return the redirect URL
 */
export async function createPhonePeOrder(
  params: CreateOrderParams
): Promise<PhonePeCreateResponse> {
  if (!MERCHANT_ID || !SALT_KEY) {
    throw new Error(
      "PhonePe credentials not configured. Set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY."
    );
  }

  const merchantTransactionId = `NEXIFI_${params.orderId}_${Date.now()}`;
  const amountInPaise = Math.round(params.amount * 100);

  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId,
    merchantUserId: `GUEST_${params.customerPhone}`,
    amount: amountInPaise,
    redirectUrl: `${APP_URL}/api/phonepe/verify?txnId=${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `${APP_URL}/api/webhooks/phonepe`,
    mobileNumber: params.customerPhone,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString("base64");
  const endpoint = "/pg/v1/pay";
  const checksum = generateChecksum(payloadString, endpoint);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  const data = await response.json();

  if (
    data.success &&
    data.data?.instrumentResponse?.redirectInfo?.url
  ) {
    return {
      success: true,
      redirectUrl: data.data.instrumentResponse.redirectInfo.url,
      merchantTransactionId,
    };
  }

  return {
    success: false,
    error: data.message || "Failed to create PhonePe order",
    merchantTransactionId,
  };
}

interface PhonePeStatusResponse {
  success: boolean;
  state: "COMPLETED" | "PENDING" | "FAILED";
  transactionId?: string;
  paymentInstrument?: string;
  error?: string;
}

/**
 * Check the status of a PhonePe payment transaction
 */
export async function verifyPhonePePayment(
  merchantTransactionId: string
): Promise<PhonePeStatusResponse> {
  if (!MERCHANT_ID || !SALT_KEY) {
    throw new Error("PhonePe credentials not configured.");
  }

  const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
  const hashInput = endpoint + SALT_KEY;
  const hash = crypto.createHash("sha256").update(hashInput).digest("hex");
  const checksum = `${hash}###${SALT_INDEX}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  });

  const data = await response.json();

  if (data.success && data.code === "PAYMENT_SUCCESS") {
    return {
      success: true,
      state: "COMPLETED",
      transactionId: data.data?.transactionId,
      paymentInstrument: data.data?.paymentInstrument?.type,
    };
  }

  if (data.code === "PAYMENT_PENDING") {
    return {
      success: false,
      state: "PENDING",
    };
  }

  return {
    success: false,
    state: "FAILED",
    error: data.message || "Payment verification failed",
  };
}
