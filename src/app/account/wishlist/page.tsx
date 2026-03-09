export default function WishlistPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
      <p className="mt-2 text-sm text-gray-500">
        Browse the products you have saved for later. Add them to your cart when
        you are ready to purchase.
      </p>

      {/* Placeholder Wishlist Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-200 flex items-center justify-center text-sm text-gray-400">
              Product Image
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900">
                Wishlist Item {item}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${(item * 24.99).toFixed(2)}
              </p>
              <button className="mt-3 w-full px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
