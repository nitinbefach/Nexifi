"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import BottomNav from "@/components/storefront/BottomNav";
import MobileNav from "@/components/storefront/MobileNav";
import CartSidebar from "@/components/storefront/CartSidebar";

const footerHiddenPatterns = [
  /^\/products$/, // product listing
  /^\/products\/[^/]+$/, // product detail
  /^\/categories\/[^/]+$/, // category detail
  /^\/cart$/, // cart
];

interface NavCategory {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: NavCategory[];
  children: React.ReactNode;
}

export default function StorefrontShell({ categories, children }: Props) {
  const pathname = usePathname();
  const hideFooter = footerHiddenPatterns.some((p) => p.test(pathname));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <MobileNav />
      <CartSidebar />

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  );
}
