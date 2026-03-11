"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900">500</h1>
      <p className="mt-4 text-xl text-gray-600">Something went wrong</p>
      <p className="mt-2 text-gray-500">
        An unexpected error occurred. Please try again or go back to the home
        page.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#7C3AED] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7C3AED]/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
