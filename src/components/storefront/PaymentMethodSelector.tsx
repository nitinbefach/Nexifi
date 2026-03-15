"use client";

import React from "react";
import { Banknote, Smartphone } from "lucide-react";

interface PaymentMethodSelectorProps {
  selected: "cod" | "online";
  onChange: (method: "cod" | "online") => void;
  subtotal: number;
}

const COD_MAX_AMOUNT = 5000;
const COD_CHARGE = Number(process.env.NEXT_PUBLIC_COD_CHARGE) || 49;

export default function PaymentMethodSelector({
  selected,
  onChange,
  subtotal,
}: PaymentMethodSelectorProps) {
  const codAvailable = subtotal <= COD_MAX_AMOUNT;

  return (
    <div className="space-y-3">
      {/* COD */}
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
          selected === "cod"
            ? "border-nexifi-orange bg-nexifi-orange/5"
            : "hover:border-muted-foreground/30"
        } ${!codAvailable ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          type="radio"
          name="payment_method"
          value="cod"
          checked={selected === "cod"}
          onChange={() => onChange("cod")}
          disabled={!codAvailable}
          className="mt-0.5 accent-nexifi-orange"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Banknote className="size-4 text-green-600" />
            <span className="text-sm font-medium">Cash on Delivery</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {codAvailable
              ? `Pay when you receive your order. COD charge: ₹${COD_CHARGE}`
              : `COD not available for orders above ₹${COD_MAX_AMOUNT}`}
          </p>
        </div>
      </label>

      {/* PhonePe / UPI */}
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
          selected === "online"
            ? "border-nexifi-orange bg-nexifi-orange/5"
            : "hover:border-muted-foreground/30"
        }`}
      >
        <input
          type="radio"
          name="payment_method"
          value="online"
          checked={selected === "online"}
          onChange={() => onChange("online")}
          className="mt-0.5 accent-nexifi-orange"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 text-purple-600" />
            <span className="text-sm font-medium">PhonePe / UPI</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            UPI, Debit/Credit Cards, Net Banking — No extra charge
          </p>
        </div>
      </label>
    </div>
  );
}
