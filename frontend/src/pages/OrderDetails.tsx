import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Package, ShoppingBag } from "lucide-react";

import { getOrder, type Order } from "../api/orders";
import { getApiErrorMessage } from "../utils/apiError";

function formatPrice(value: string | number) {
  return Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = Number(orderId);
    if (!orderId || !Number.isInteger(id) || id <= 0) {
      return;
    }

    let cancelled = false;
    getOrder(id)
      .then((data) => { if (!cancelled) setOrder(data); })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { status?: number } }).response;
          if (response?.status === 401) { navigate("/login"); return; }
        }
        setError(getApiErrorMessage(err, "Unable to load this order."));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [navigate, orderId]);

  if (!orderId || !Number.isInteger(Number(orderId)) || Number(orderId) <= 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-5 text-red-600">Invalid order.</p>
          <Link to="/orders" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"><ArrowLeft size={18} />Back to Orders</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center bg-gray-50"><p className="text-gray-600">Loading order...</p></div>;

  if (error || !order) return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="mb-5 text-red-600">{error || "Order not found."}</p>
        <Link to="/orders" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"><ArrowLeft size={18} />Back to Orders</Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3 text-sm">
          <Link to="/orders" className="inline-flex items-center gap-2 font-medium text-gray-500 hover:text-green-700"><ArrowLeft size={16} />My Orders</Link>
          <span className="text-gray-400">/</span><span className="font-medium text-gray-800">{order.order_number}</span>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1><p className="mt-1 inline-flex items-center gap-2 text-sm text-gray-500"><CalendarDays size={16} />{formatDate(order.created_at)}</p></div>
          <div className="text-left sm:text-right"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-green-700">₹{formatPrice(order.total_amount)}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-2"><Package size={20} className="text-green-600" /><h2 className="text-lg font-bold text-gray-900">Items</h2></div>
            <div className="space-y-3">{order.items.map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{item.product_name}</p><p className="mt-1 text-sm text-gray-500">{item.quantity} {item.unit} × ₹{formatPrice(item.unit_price)}</p></div><p className="font-semibold text-gray-900">₹{formatPrice(item.total_price)}</p></div>)}</div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="mb-3 flex items-center gap-2"><MapPin size={20} className="text-green-600" /><h2 className="font-bold text-gray-900">Delivery</h2></div><div className="text-sm leading-6 text-gray-600"><p className="font-medium text-gray-800">{order.shipping_name}</p><p>{order.shipping_phone}</p><p>{order.shipping_address}</p><p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p></div></section>
            <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="mb-3 flex items-center gap-2"><CreditCard size={20} className="text-green-600" /><h2 className="font-bold text-gray-900">Payment</h2></div><p className="text-sm text-gray-600">Status: <span className="font-semibold text-gray-900">{order.payment_status}</span></p><p className="mt-2 text-sm text-gray-600">Order: <span className="font-semibold text-gray-900">{order.status}</span></p></section>
          </div>
        </div>

        <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><ShoppingBag size={17} />Continue Shopping</Link>
      </div>
    </main>
  );
}
