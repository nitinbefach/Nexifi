"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import SearchBar from "./SearchBar";

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories", hasDropdown: true },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  categories: NavCategory[];
}

export default function Navbar({ categories }: NavbarProps) {
  const pathname = usePathname();
  const { toggleMobileMenu, isSearchOpen, toggleSearch } = useUIStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const isHomepage = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clean up dropdown timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

  const openDropdown = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  return (
    <>
      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 w-full bg-white safe-top md:transition-shadow md:duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        {/* Top Row: Logo + Search + Actions */}
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-14 md:transition-all md:duration-300 ${
            scrolled
              ? "md:h-14"
              : "md:h-16 lg:h-[68px]"
          }`}
        >
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-9 md:hidden"
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
                className={`w-auto h-7 md:transition-all md:duration-300 ${
                  scrolled ? "md:h-7" : "md:h-8 lg:h-9"
                }`}
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Search */}
          <div className="hidden max-w-lg flex-1 md:block lg:max-w-xl xl:max-w-2xl">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Support — desktop only */}
            <a
              href="tel:+919999999999"
              className="mr-2 hidden items-center gap-2 xl:flex"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-nexifi-orange/10">
                <Phone className="size-4 text-nexifi-orange" />
              </div>
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  24/7 Support
                </span>
                <p className="text-sm font-semibold text-foreground">
                  +91 99999 99999
                </p>
              </div>
            </a>

            {/* Mobile Search Toggle */}
            {!isHomepage && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 md:hidden"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <Search className="size-5" />
              </Button>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              aria-label="Shopping cart"
              className="relative flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <ShoppingCart className="size-5 md:size-[22px]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 left-6 flex size-[18px] items-center justify-center rounded-full bg-nexifi-orange text-[10px] font-bold text-white md:size-5 md:text-[11px]">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
              <div className="hidden md:block">
                <span className="block text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  Cart
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {itemCount} Item{itemCount !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Row: Desktop Navigation */}
        <nav className="hidden border-t border-gray-100 md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                // Categories dropdown
                if (link.hasDropdown) {
                  return (
                    <li
                      key={link.href}
                      className="relative"
                      onMouseEnter={openDropdown}
                      onMouseLeave={closeDropdown}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-1 px-4 text-sm font-medium transition-colors ${
                            scrolled ? "py-2.5" : "py-3.5"
                        } ${
                          isActive
                            ? "text-nexifi-orange"
                            : "text-foreground hover:text-nexifi-orange"
                        }`}
                      >
                        {link.label}
                        <ChevronDown
                          className={`size-3.5 transition-transform duration-200 ${
                            dropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Link>

                      {/* Dropdown */}
                      {dropdownOpen && categories.length > 0 && (
                        <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.slug}`}
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted hover:text-nexifi-orange"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex px-4 text-sm font-medium transition-colors ${
                          scrolled ? "py-2.5" : "py-3.5"
                      } ${
                        isActive
                          ? "text-nexifi-orange"
                          : "text-foreground hover:text-nexifi-orange"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/track-order"
                className="flex items-center gap-1.5 py-3 font-medium text-muted-foreground transition-colors hover:text-nexifi-orange"
              >
                Track Order
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile: Always-visible search on homepage */}
        {isHomepage && (
          <div className="border-t bg-background px-3 py-2 md:hidden">
            <SearchBar />
          </div>
        )}

        {/* Mobile: Toggled search on other pages */}
        {!isHomepage && isSearchOpen && (
          <div className="border-t bg-background px-3 py-2.5 md:hidden">
            <SearchBar
              autoFocus
              onSubmit={() => useUIStore.getState().closeSearch()}
            />
          </div>
        )}
      </header>
    </>
  );
}
