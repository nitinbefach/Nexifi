"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error("Login failed", {
          description: error.message || "Invalid email or password",
        });
      } else {
        toast.success("Welcome back!");
        router.push("/admin");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="NEXIFI"
              width={160}
              height={54}
              className="h-10 w-auto"
              priority
            />
          </div>

          <h1 className="text-center text-xl font-semibold text-gray-900">
            Admin Login
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Sign in to manage your store
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange"
                placeholder="admin@nexifi.in"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-nexifi-orange focus:ring-1 focus:ring-nexifi-orange"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-nexifi-orange py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nexifi-orange-dark disabled:opacity-50"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Admin access only. Contact support if you need help.
          </p>
        </div>
      </div>
    </div>
  );
}
