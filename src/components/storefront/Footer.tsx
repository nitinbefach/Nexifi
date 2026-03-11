import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Truck,
  Shield,
  Headset,
  RotateCcw,
} from "lucide-react";

const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=best-selling", label: "Best Selling" },
  { href: "/products?sort=newest", label: "New Arrivals" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track Order" },
];

const helpLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const trustBadges = [
  { icon: Truck, label: "Free Shipping", desc: "On orders above ₹999" },
  { icon: Shield, label: "Secure Payment", desc: "100% secure checkout" },
  { icon: Headset, label: "24/7 Support", desc: "Dedicated support" },
  { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" },
];

export default function Footer() {
  return (
    <footer className="mb-16 border-t bg-white md:mb-0">
      {/* Trust Badges */}
      <div className="border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 md:gap-6 md:py-10 lg:px-8">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-nexifi-orange/10 md:size-12">
                  <Icon className="size-5 text-nexifi-orange md:size-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground sm:text-sm">
                    {badge.label}
                  </p>
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-10">
          {/* Brand + Contact */}
          <div className="col-span-2 md:col-span-2">
            <Link
              href="/"
              className="inline-block transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="NEXIFI"
                width={140}
                height={48}
                className="h-8 w-auto sm:h-9"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Next is Now. Shop electronics, gadgets & more at wholesale prices
              with fast delivery across India.
            </p>

            {/* Contact Info */}
            <ul className="mt-5 space-y-2.5">
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-nexifi-orange" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
              <li>
                <a
                  href="tel:+919999999999"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
                >
                  <Phone className="size-4 shrink-0 text-nexifi-orange" />
                  +91 99999 99999
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@nexifi.in"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
                >
                  <Mail className="size-4 shrink-0 text-nexifi-orange" />
                  support@nexifi.in
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="mt-5 flex gap-2.5">
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold text-foreground">Help</h4>
            <ul className="mt-4 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NEXIFI. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded border bg-white px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              UPI
            </span>
            <span className="rounded border bg-white px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              Visa
            </span>
            <span className="rounded border bg-white px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              Mastercard
            </span>
            <span className="rounded border bg-white px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              COD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
