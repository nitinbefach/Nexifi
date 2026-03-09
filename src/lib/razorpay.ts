// Razorpay server-side helper — used only in API routes
// Will be configured when Razorpay keys are available

export function getRazorpayInstance() {
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
