export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">NEXIFI</h2>
          <p className="mt-1 text-sm text-gray-500">Next is Now</p>
        </div>
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
