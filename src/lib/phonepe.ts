// PhonePe Business — server-side helper
// Will be configured when PhonePe Business credentials are provided

export async function createPhonePeOrder(_params: {
  amount: number;
  orderId: string;
  customerPhone: string;
}) {
  throw new Error("PhonePe integration not yet configured — use COD for now");
}

export async function verifyPhonePePayment(_transactionId: string) {
  throw new Error("PhonePe integration not yet configured");
}
