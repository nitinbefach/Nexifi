export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Bulk Upload Products
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload a CSV or Excel file to add multiple products to your NEXIFI store
        at once. Download the template to ensure your file is formatted
        correctly.
      </p>

      <div className="mt-6 max-w-2xl space-y-6">
        {/* Template Download */}
        <div className="bg-card rounded-lg shadow p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Download Template
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use this CSV template to format your product data
            </p>
          </div>
          <button className="px-4 py-2 border border-border text-sm font-medium rounded-md text-foreground hover:bg-muted">
            Download
          </button>
        </div>

        {/* Dropzone Placeholder */}
        <div className="bg-card rounded-lg shadow p-6">
          <div className="h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <svg
              className="h-10 w-10 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs mt-1">Supports CSV and XLSX files</p>
          </div>

          <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
            Upload and Process
          </button>
        </div>
      </div>
    </div>
  );
}
