import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter } from "lucide-react";

const shopLinks = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=best-selling", label: "Best Selling" },
  { href: "/products?sort=newest", label: "New Arrivals" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const helpLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mb-16 md:mb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-10 lg:gap-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <Image
                src="/logo.png"
                alt="NEXIFI"
                width={140}
                height={48}
                className="h-8 w-auto sm:h-9 md:h-10"
              />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground md:text-base md:mt-4">
              Next is Now. Shop electronics, gadgets & more at wholesale prices with fast delivery across India.
            </p>
            <div className="mt-4 flex gap-2.5 md:mt-5">
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white md:p-2.5" aria-label="Instagram">
                <Instagram className="size-4 md:size-5" />
              </a>
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white md:p-2.5" aria-label="Facebook">
                <Facebook className="size-4 md:size-5" />
              </a>
              <a href="#" className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-nexifi-orange hover:text-white md:p-2.5" aria-label="Twitter">
                <Twitter className="size-4 md:size-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm md:font-semibold md:text-foreground">
              Shop
            </h4>
            <ul className="mt-3 space-y-2 md:mt-4 md:space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm md:font-semibold md:text-foreground">
              Company
            </h4>
            <ul className="mt-3 space-y-2 md:mt-4 md:space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm md:font-semibold md:text-foreground">
              Help
            </h4>
            <ul className="mt-3 space-y-2 md:mt-4 md:space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-nexifi-orange md:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center gap-2.5 border-t pt-5 sm:flex-row sm:justify-between md:mt-12 md:pt-8">
          <p className="text-xs text-muted-foreground md:text-sm">
            &copy; {new Date().getFullYear()} NEXIFI. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground md:gap-4 md:text-sm">
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium md:px-3 md:py-1.5">UPI</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium md:px-3 md:py-1.5">Visa</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium md:px-3 md:py-1.5">Mastercard</span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium md:px-3 md:py-1.5">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
