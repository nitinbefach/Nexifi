"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import CouponInput from "@/components/storefront/CouponInput";
import PaymentMethodSelector from "@/components/storefront/PaymentMethodSelector";
import { formatINR } from "@/lib/utils";

type Step = "address" | "payment" | "confirm";
const stepOrder: Step[] = ["address", "payment", "confirm"];

const FREE_SHIPPING_THRESHOLD =
  Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD) || 499;
const COD_CHARGE = Number(process.env.NEXT_PUBLIC_COD_CHARGE) || 49;
const GST_PERCENT = Number(process.env.NEXT_PUBLIC_GST_PERCENT) || 18;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Payment & coupon state
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [coupon, setCoupon] = useState<{
    code: string;
    amount: number;
    description?: string;
  } | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentIndex = stepOrder.indexOf(currentStep);

  // Calculate totals
  const discountAmount = coupon?.amount || 0;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const codCharge = paymentMethod === "cod" ? COD_CHARGE : 0;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round(((taxableAmount * GST_PERCENT) / 100) * 100) / 100;
  const total = Math.round((subtotal - discountAmount + shipping + codCharge + gstAmount) * 100) / 100;

  // Validate address step
  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Invalid Indian phone (10 digits starting with 6-9)";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Invalid pincode (6 digits)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (currentStep === "address" && !validateAddress()) return;
    const next = stepOrder[currentIndex + 1];
    if (next) setCurrentStep(next);
  };

  const goBack = () => {
    const prev = stepOrder[currentIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");

    const orderPayload = {
      guest_name: `${form.firstName} ${form.lastName}`.trim(),
      guest_email: form.email,
      guest_phone: form.phone,
      shipping_address: {
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        address_line1: form.address,
        address_line2: form.address2 || undefined,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      payment_method: paymentMethod,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        image: item.image,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
      })),
      coupon_code: coupon?.code,
    };

    try {
      // Use different endpoint for online vs COD payments
      const endpoint =
        paymentMethod === "online"
          ? "/api/phonepe/create-order"
          : "/api/orders/create";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.stockErrors) {
          setOrderError(data.stockErrors.join(". "));
        } else {
          setOrderError(data.error || "Failed to place order");
        }
        return;
      }

      // For online payments, redirect to PhonePe gateway
      if (paymentMethod === "online" && data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
        return;
      }

      // For COD, go to confirmation page
      clearCart();
      router.push(`/order-confirmation/${data.order_number}`);
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const steps = [
    { key: "address" as const, label: "Address" },
    { key: "payment" as const, label: "Payment" },
    { key: "confirm" as const, label: "Confirm" },
  ];

  const inputClass = (field: string) =>
    `mt-1.5 h-11 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition-colors focus:border-nexifi-orange focus:ring-2 focus:ring-nexifi-orange/20 ${
      errors[field] ? "border-red-400" : ""
    }`;

  // Empty cart guard
  if (itemCount === 0 && !placing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-nexifi-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-nexifi-orange-dark"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/cart" className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">Checkout</h1>
          <div className="mt-1 h-1 w-10 rounded-full bg-nexifi-orange md:w-12" />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
        {steps.map((step, i) => {
          const isActive = currentStep === step.key;
          const isCompleted = currentIndex > i;
          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => { if (i <= currentIndex) setCurrentStep(step.key); }}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2 ${
                  isActive
                    ? "bg-nexifi-orange text-white"
                    : isCompleted
                    ? "bg-nexifi-orange/10 text-nexifi-orange"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs ${
                    isActive
                      ? "bg-white text-nexifi-orange"
                      : isCompleted
                      ? "bg-nexifi-orange text-white"
                      : "bg-muted-foreground/20 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 sm:w-10 ${isCompleted ? "bg-nexifi-orange" : "bg-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="mt-6 rounded-2xl border bg-card p-5 sm:mt-8 sm:p-6">
        {/* STEP 1: Address */}
        {currentStep === "address" && (
          <div>
            <h2 className="text-lg font-semibold">Contact & Shipping</h2>

            {/* Contact Info */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">First Name *</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass("firstName")} placeholder="Arjun" />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name *</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass("lastName")} placeholder="Kumar" />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass("email")} placeholder="arjun@example.com" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputClass("phone")} placeholder="9876543210" maxLength={10} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <h3 className="mt-6 text-sm font-semibold text-muted-foreground">Shipping Address</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Address Line 1 *</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass("address")} placeholder="123 MG Road, Sector 15" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Address Line 2</label>
                <input type="text" value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} className={inputClass("address2")} placeholder="Apartment, floor, landmark (optional)" />
              </div>
              <div>
                <label className="block text-sm font-medium">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass("city")} placeholder="Mumbai" />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">State *</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass("state")} placeholder="Maharashtra" />
                {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Pincode *</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={inputClass("pincode")} placeholder="400001" maxLength={6} />
                {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
              </div>
            </div>

            <Button onClick={goNext} className="mt-6 bg-nexifi-orange text-white hover:bg-nexifi-orange-dark" size="lg">
              Continue to Payment
            </Button>
          </div>
        )}

        {/* STEP 2: Payment */}
        {currentStep === "payment" && (
          <div>
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <div className="mt-4">
              <PaymentMethodSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
                subtotal={subtotal}
              />
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold">Have a coupon?</h3>
              <CouponInput
                subtotal={subtotal}
                onApply={setCoupon}
                onRemove={() => setCoupon(null)}
                appliedCode={coupon?.code}
                appliedAmount={coupon?.amount}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={goBack} size="lg">Back</Button>
              <Button onClick={goNext} className="bg-nexifi-orange text-white hover:bg-nexifi-orange-dark" size="lg">
                Review Order
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {currentStep === "confirm" && (
          <div>
            <h2 className="text-lg font-semibold">Review Your Order</h2>
            <div className="mt-4 space-y-3">
              {/* Address summary */}
              <div className="rounded-xl bg-muted/40 p-4">
                <h3 className="text-sm font-semibold">Shipping Address</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.firstName} {form.lastName}<br />
                  {form.address}{form.address2 ? `, ${form.address2}` : ""}<br />
                  {form.city}, {form.state} - {form.pincode}<br />
                  Phone: {form.phone} | Email: {form.email}
                </p>
              </div>

              {/* Payment summary */}
              <div className="rounded-xl bg-muted/40 p-4">
                <h3 className="text-sm font-semibold">Payment</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {paymentMethod === "cod" ? "Cash on Delivery" : "PhonePe / UPI"}
                </p>
              </div>

              {/* Order summary */}
              <div className="rounded-xl bg-muted/40 p-4">
                <h3 className="text-sm font-semibold">Order Summary</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({coupon?.code})</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "Free" : formatINR(shipping)}
                    </span>
                  </div>
                  {codCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COD Charge</span>
                      <span>{formatINR(codCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST ({GST_PERCENT}%)</span>
                    <span>{formatINR(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-nexifi-orange">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {orderError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {orderError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={goBack} size="lg" disabled={placing}>Back</Button>
              <Button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="bg-nexifi-orange text-white hover:bg-nexifi-orange-dark"
                size="lg"
              >
                {placing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — ${formatINR(total)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
