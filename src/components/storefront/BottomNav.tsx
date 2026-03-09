"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Headset, SlidersHorizontal, ArrowUpDown, Zap } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useProductPageStore } from "@/stores/product-page-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/contact", label: "Support", icon: Headset },
];

function StandardNav({ pathname }: { pathname: string }) {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <div className="flex items-center justify-around py-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`tap-highlight relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium transition-colors ${
              isActive
                ? "text-nexifi-orange"
                : "text-muted-foreground"
            }`}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className={`size-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              {item.label === "Cart" && itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 flex size-3.5 items-center justify-center rounded-full bg-nexifi-orange text-[8px] font-bold text-white"
                  aria-label={`${itemCount} items in cart`}
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
            {isActive && (
              <span className="absolute top-0 h-[3px] w-8 rounded-full bg-nexifi-orange" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

function FilterSortBar() {
  const toggleFilter = useUIStore((s) => s.toggleFilter);
  const toggleSort = useUIStore((s) => s.toggleSort);

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <button
        onClick={toggleFilter}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors active:bg-muted"
        aria-label="Open filters"
      >
        <SlidersHorizontal className="size-4" />
        Filter
      </button>
      <button
        onClick={toggleSort}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors active:bg-muted"
        aria-label="Open sort options"
      >
        <ArrowUpDown className="size-4" />
        Sort
      </button>
    </div>
  );
}

function ProductActionBar() {
  const product = useProductPageStore((s) => s.product);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.productId,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      variantId: product.variantId,
      quantity: 1,
    });
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <button
        onClick={handleAddToCart}
        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-nexifi-orange py-2.5 text-sm font-semibold text-nexifi-orange transition-colors active:bg-nexifi-orange/5"
      >
        <ShoppingCart className="size-4" />
        Add to Cart
      </button>
      <Link
        href="/checkout"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexifi-orange py-2.5 text-sm font-semibold text-white transition-colors active:bg-nexifi-orange-dark"
      >
        <Zap className="size-4" />
        Buy Now
      </Link>
    </div>
  );
}

function CartBar() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const isEmpty = itemCount === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Link
        href="/products"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexifi-orange py-2.5 text-sm font-semibold text-white transition-colors active:bg-nexifi-orange-dark"
      >
        Continue Shopping
      </Link>
      <Link
        href="/checkout"
        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexifi-orange py-2.5 text-sm font-semibold text-white transition-colors active:bg-nexifi-orange-dark"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  // Product detail: /products/something (but not /products exactly)
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);
  // Product listing: /products exactly OR /categories/something
  const isProductListing =
    pathname === "/products" || /^\/categories\/[^/]+$/.test(pathname);
  // Cart page
  const isCartPage = pathname === "/cart";

  // Determine which bar to show
  let content: React.ReactNode;
  if (isProductDetail) {
    content = <ProductActionBar />;
  } else if (isProductListing) {
    content = <FilterSortBar />;
  } else if (isCartPage) {
    content = <CartBar />;
  } else {
    content = <StandardNav pathname={pathname} />;
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-md md:hidden safe-bottom"
    >
      {content}
    </nav>
  );
}
