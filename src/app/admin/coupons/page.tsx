export default function AdminCouponsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create and manage discount coupons for your NEXIFI store. Set
            percentage or fixed-amount discounts with optional expiry dates.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Create Coupon
        </button>
      </div>

      {/* Placeholder Coupon List */}
      <div className="mt-6 bg-white rounded-lg shadow divide-y divide-gray-200">
        {[
          { code: "WELCOME10", discount: "10%", uses: 142, active: true },
          { code: "SUMMER25", discount: "25%", uses: 58, active: true },
          { code: "FLAT50", discount: "$50", uses: 200, active: false },
        ].map((coupon) => (
          <div
            key={coupon.code}
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div>
              <p className="text-sm font-mono font-medium text-gray-900">
                {coupon.code}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {coupon.discount} off &middot; {coupon.uses} uses
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  coupon.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {coupon.active ? "Active" : "Expired"}
              </span>
              <button className="text-sm text-indigo-600 hover:text-indigo-500">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
