"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import SearchBar from "./SearchBar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { toggleMobileMenu, isSearchOpen, toggleSearch } = useUIStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const isHomepage = pathname === "/";

  return (
    <>
      {/* Announcement Bar */}
      <div className="nexifi-gradient">
        <div className="mx-auto max-w-7xl px-4 py-1 text-center text-[11px] font-medium tracking-wide text-white sm:px-6 md:text-sm lg:px-8">
          Free shipping on orders above Rs. 999 | COD Available
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md safe-top">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 px-4 sm:h-14 sm:px-6 md:h-[68px] lg:h-[72px] lg:px-8">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>

            <Link
              href="/"
              className="flex items-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="NEXIFI"
                width={140}
                height={48}
                className="h-7 w-auto sm:h-8 md:h-10 lg:h-11"
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex lg:gap-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors md:text-base ${
                    isActive
                      ? "bg-nexifi-orange/10 text-nexifi-orange"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Mobile Search Toggle (hidden on homepage where search is always visible) */}
            {!isHomepage && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <Search className="size-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              aria-label="Shopping cart"
              className="relative md:size-10"
            >
              <ShoppingCart className="size-5 md:size-[22px]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-nexifi-orange text-[9px] font-bold text-white md:size-5 md:text-[11px]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>

          </div>
        </div>

        {/* Homepage: Always-visible mobile search */}
        {isHomepage && (
          <div className="border-t bg-background px-3 py-2 md:hidden">
            <SearchBar />
          </div>
        )}

        {/* Other pages: Toggled mobile search overlay */}
        {!isHomepage && isSearchOpen && (
          <div className="border-t bg-background px-3 py-2.5 md:hidden">
            <SearchBar autoFocus onSubmit={() => useUIStore.getState().closeSearch()} />
          </div>
        )}
      </header>
    </>
  );
}
