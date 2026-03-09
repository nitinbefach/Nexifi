"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

type Step = "address" | "payment" | "confirm";

const stepOrder: Step[] = ["address", "payment", "confirm"];

function formatINR(price: number) {
  return `Rs. ${price.toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>("address");
  const { subtotal, itemCount } = useCart();
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const currentIndex = stepOrder.indexOf(currentStep);

  const isAddressValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.address.trim() &&
    form.city.trim() &&
    form.pincode.trim() &&
    form.phone.trim();

  const goNext = () => {
    const next = stepOrder[currentIndex + 1];
    if (next) setCurrentStep(next);
  };
  const goBack = () => {
    const prev = stepOrder[currentIndex - 1];
    if (prev) setCurrentStep(prev);
  };

  const steps = [
    { key: "address" as const, label: "Address" },
    { key: "payment" as const, label: "Payment" },
    { key: "confirm" as const, label: "Confirm" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/cart" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Checkout</h1>
      </div>

      {/* Step Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2 sm:mt-8">
        {steps.map((step, i) => {
          const isActive = currentStep === step.key;
          const isCompleted = currentIndex > i;
          return (
            <React.Fragment key={step.key}>
              <button
                onClick={() => {
                  if (i <= currentIndex) setCurrentStep(step.key);
                }}
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
                <div
                  className={`h-px w-6 sm:w-10 ${
                    isCompleted ? "bg-nexifi-orange" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="mt-6 rounded-xl border p-5 sm:mt-8 sm:p-6">
        {currentStep === "address" && (
          <div>
            <h2 className="text-lg font-semibold">Shipping Address</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">First Name *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="Arjun"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="Kumar"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Address *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="123 MG Road, Sector 15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Pincode *</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="400001"
                  maxLength={6}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange/30"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <Button
              onClick={goNext}
              disabled={!isAddressValid}
              className="mt-6 bg-nexifi-orange text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
              size="lg"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {currentStep === "payment" && (
          <div>
            <h2 className="text-lg font-semibold">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {[
                { id: "razorpay", label: "Pay with Razorpay", desc: "UPI, Cards, Wallets, Net Banking" },
                { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order" },
              ].map((method) => (
                <label
                  key={method.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-nexifi-orange/50"
                >
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked={method.id === "razorpay"}
                    className="accent-nexifi-orange"
                  />
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={goBack} size="lg">
                Back
              </Button>
              <Button
                onClick={goNext}
                className="bg-nexifi-orange text-white hover:bg-nexifi-orange-dark"
                size="lg"
              >
                Review Order
              </Button>
            </div>
          </div>
        )}

        {currentStep === "confirm" && (
          <div>
            <h2 className="text-lg font-semibold">Review Your Order</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-semibold">Shipping Address</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.firstName} {form.lastName}<br />
                  {form.address}<br />
                  {form.city} - {form.pincode}<br />
                  Phone: {form.phone}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-semibold">Payment</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Razorpay (UPI/Cards/Wallets)
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="text-sm font-semibold">Order Summary</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "Free" : formatINR(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-nexifi-orange">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={goBack} size="lg">
                Back
              </Button>
              <Button
                className="bg-nexifi-orange text-white hover:bg-nexifi-orange-dark"
                size="lg"
              >
                Place Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
