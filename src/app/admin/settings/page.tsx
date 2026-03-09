export default function AdminSettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
      <p className="mt-2 text-sm text-gray-500">
        Configure your NEXIFI store settings including general information,
        payment methods, shipping options, and email notifications.
      </p>

      {/* Placeholder Settings Form */}
      <div className="mt-6 max-w-3xl space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            General Settings
          </h3>
          <div className="space-y-4">
            {["Store Name", "Store Email", "Store Phone", "Store Address"].map(
              (field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field}
                  </label>
                  <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Currency & Tax
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Default Currency", "Tax Rate (%)", "Tax Included in Prices"].map(
              (field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field}
                  </label>
                  <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Shipping Settings
          </h3>
          <div className="space-y-4">
            {[
              "Free Shipping Threshold",
              "Default Shipping Rate",
              "Shipping Origins",
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field}
                </label>
                <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
              </div>
            ))}
          </div>
        </div>

        <button className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Save Settings
        </button>
      </div>
    </div>
  );
}
