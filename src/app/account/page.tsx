export default function ProfilePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
      <p className="mt-2 text-sm text-gray-500">
        View and update your personal information, including your name, phone
        number, and profile picture.
      </p>

      {/* Placeholder Profile Edit Form */}
      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
            Avatar
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-500">
            Change Photo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
          </div>
        </div>

        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Save Changes
        </button>
      </div>
    </div>
  );
}
