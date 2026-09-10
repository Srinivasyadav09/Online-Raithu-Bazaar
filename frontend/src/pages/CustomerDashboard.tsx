import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart, Package, ArrowRight } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-medium text-green-100">
            Customer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome, {user?.name || "Customer"}!
          </h1>

          <p className="mt-3 max-w-2xl text-green-50">
            Discover fresh products directly from local farmers, manage your
            cart, and track your orders.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-green-700 transition hover:bg-green-50"
          >
            <ShoppingBag size={19} />
            Browse Products
            <ArrowRight size={18} />
          </Link>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>

          <p className="mt-1 text-gray-500">
            Manage your ORB shopping experience.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Browse Products */}
            <Link
              to="/products"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <ShoppingBag size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Browse Products
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Explore fresh vegetables, fruits, grains, dairy, and other
                products from local farmers.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-green-700">
                Shop now
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShoppingCart size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">My Cart</h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Review your selected products, update quantities, and proceed to
                checkout.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-700">
                View Cart
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            {/* Orders */}
            <Link
              to="/orders"
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Package size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                My Orders
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                View your previous orders and track their current status and
                payment information.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-purple-700">
                View Orders
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">How ORB works</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                1
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Choose Products</h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Browse fresh products available from ORB farmers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                2
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Add to Cart</h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Select quantities and review your cart before checkout.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                3
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Place Your Order
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Complete secure payment and track your order.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
