interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <span className="text-4xl text-green-600">&#10003;</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold">Thank You!</h1>
      <p className="mt-2 text-gray-500">
        Your order has been placed successfully.
      </p>

      <div className="mt-8 rounded-xl border p-6">
        <p className="text-sm text-gray-500">Order Number</p>
        <p className="mt-1 text-2xl font-bold tracking-wide">#{id}</p>
      </div>

      <div className="mt-8 rounded-xl bg-gray-50 p-6 text-left">
        <h2 className="font-semibold">What&apos;s Next?</h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          <li>You will receive an order confirmation email shortly.</li>
          <li>We will notify you when your order ships.</li>
          <li>Expected delivery in 3-5 business days.</li>
        </ul>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <a
          href="/"
          className="rounded-full bg-gray-900 px-8 py-2.5 text-sm font-semibold text-white"
        >
          Continue Shopping
        </a>
        <a
          href="#"
          className="rounded-full border px-8 py-2.5 text-sm font-semibold"
        >
          View Order
        </a>
      </div>
    </div>
  );
}
