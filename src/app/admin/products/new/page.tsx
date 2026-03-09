export default function NewProductPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      <p className="mt-2 text-sm text-gray-500">
        Fill in the details below to add a new product to your NEXIFI store
        catalog.
      </p>

      {/* Placeholder Product Form */}
      <div className="mt-6 bg-white rounded-lg shadow p-6 space-y-6 max-w-3xl">
        {[
          "Product Name",
          "Description",
          "SKU",
          "Price",
          "Compare at Price",
          "Category",
          "Stock Quantity",
          "Weight",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700">
              {field}
            </label>
            <div
              className={`mt-1 w-full rounded-md border border-gray-300 bg-gray-50 ${
                field === "Description" ? "h-24" : "h-10"
              }`}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Images
          </label>
          <div className="mt-1 h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-400">
            Drag and drop images here or click to upload
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
            Save Product
          </button>
          <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
