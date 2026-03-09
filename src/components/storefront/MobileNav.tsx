"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  LayoutGrid,
  Phone,
  Info,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";

const menuLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "All Products", icon: Package },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/contact", label: "Contact Us", icon: Phone },
  { href: "/about", label: "About NEXIFI", icon: Info },
];

export default function MobileNav() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const pathname = usePathname();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent side="left" className="w-[280px] p-0 sm:w-[320px]">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-left">
            <Image
              src="/logo.png"
              alt="NEXIFI"
              width={140}
              height={48}
              className="h-7 w-auto"
            />
          </SheetTitle>
          <p className="text-xs text-muted-foreground">Next is Now</p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <nav className="flex flex-col py-2">
            {menuLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`tap-highlight flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-nexifi-orange/10 text-nexifi-orange"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="flex-1">{link.label}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              );
            })}
          </nav>

          <Separator />

          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Need Help?
            </p>
            <a
              href="tel:+919999999999"
              className="mt-2 flex items-center gap-2 text-sm font-medium text-nexifi-orange"
            >
              <Phone className="size-4" />
              +91 99999 99999
            </a>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
