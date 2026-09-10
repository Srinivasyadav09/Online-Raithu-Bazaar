import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Package, ShoppingBag, CreditCard } from "lucide-react";

import { getOrders } from "../api/orders";
import type { Order } from "../api/orders";
import { getApiErrorMessage } from "../utils/apiError";

function formatPrice(value: string) {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "PROCESSING":
      return "bg-blue-100 text-blue-700";

    case "SHIPPED":
      return "bg-purple-100 text-purple-700";

    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function getPaymentClass(paymentStatus: string) {
  switch (paymentStatus.toUpperCase()) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "REFUNDED":
      return "bg-purple-100 text-purple-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getOrders();

        setOrders(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError(getApiErrorMessage(err, "Unable to load your orders."));
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/customer"
            className="font-medium text-gray-500 transition hover:text-green-700"
          >
            Dashboard
          </Link>

          <span className="text-gray-400">/</span>

          <span className="font-medium text-gray-800">My Orders</span>
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

            <p className="mt-2 text-gray-600">
              View and track all your ORB orders.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* No orders */}
        {!error && orders.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <Package size={58} className="mx-auto mb-5 text-gray-300" />

            <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              You haven't placed an order yet. Browse our fresh products and
              place your first order.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <ShoppingBag size={19} />
              Browse Products
            </Link>
          </div>
        )}

        {/* Orders */}
        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="border-b border-gray-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">
                          {order.order_number}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentClass(
                            order.payment_status,
                          )}`}
                        >
                          Payment: {order.payment_status}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          {formatDate(order.created_at)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Package size={16} />
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-gray-500">Order Total</p>

                      <p className="mt-1 text-2xl font-bold text-green-700">
                        ₹{formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5 sm:p-6">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Order Items
                  </h3>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product_name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {item.quantity} {item.unit} × ₹
                            {formatPrice(item.unit_price)}
                          </p>
                        </div>

                        <p className="font-semibold text-gray-900">
                          ₹{formatPrice(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping */}
                  <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin size={18} className="text-green-600" />

                        <h3 className="font-semibold text-gray-900">
                          Delivery Address
                        </h3>
                      </div>

                      <div className="text-sm leading-6 text-gray-600">
                        <p className="font-medium text-gray-800">
                          {order.shipping_name}
                        </p>

                        <p>{order.shipping_phone}</p>

                        <p>{order.shipping_address}</p>

                        <p>
                          {order.shipping_city}, {order.shipping_state} -{" "}
                          {order.shipping_pincode}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <CreditCard size={18} className="text-green-600" />

                        <h3 className="font-semibold text-gray-900">Payment</h3>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          Payment status:{" "}
                          <span className="font-medium text-gray-800">
                            {order.payment_status}
                          </span>
                        </p>

                        <p className="mt-1">
                          Order status:{" "}
                          <span className="font-medium text-gray-800">
                            {order.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom actions */}
                  <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to="/products"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <ShoppingBag size={17} />
                      Continue Shopping
                    </Link>

                    <button
                      type="button"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      View Order
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
