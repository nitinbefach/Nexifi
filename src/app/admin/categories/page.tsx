export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="mt-2 text-sm text-gray-500">
            Organize your NEXIFI product catalog by creating and managing
            categories and subcategories.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Add Category
        </button>
      </div>

      {/* Placeholder Category List */}
      <div className="mt-6 bg-white rounded-lg shadow divide-y divide-gray-200">
        {["Electronics", "Clothing", "Home & Kitchen", "Sports"].map(
          (cat, i) => (
            <div
              key={cat}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400">
                  IMG
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat}</p>
                  <p className="text-xs text-gray-500">
                    {(i + 1) * 12} products
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="text-sm text-indigo-600 hover:text-indigo-500">
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:text-red-500">
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
