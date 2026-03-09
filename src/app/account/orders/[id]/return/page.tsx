"use client";

import { useParams } from "next/navigation";

export default function ReturnRequestPage() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">
        Request a Return &mdash; Order #{params.id}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Select the items you want to return, provide a reason, and submit your
        return request for review.
      </p>

      {/* Return Request Form Placeholder */}
      <form className="mt-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Items to Return
          </label>
          <div className="mt-2 space-y-2">
            {[1, 2].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
              >
                <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-gray-700">
                  Product Item {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Return
          </label>
          <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Details
          </label>
          <div className="mt-1 h-24 w-full rounded-md border border-gray-300 bg-gray-50" />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
        >
          Submit Return Request
        </button>
      </form>
    </div>
  );
}
