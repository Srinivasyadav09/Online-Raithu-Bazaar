import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ShoppingBag } from "lucide-react";

import { createOrder, type Order } from "../api/orders";
import { createRazorpayOrder, verifyRazorpayPayment } from "../api/payments";
import { getCart } from "../api/cart";

import type { Cart as CartType } from "../types/cart";

import { getApiErrorMessage } from "../utils/apiError";
export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartType | null>(null);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  /*
   * Load cart
   */
  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const data = await getCart();

        if (!data.items || data.items.length === 0) {
          navigate("/cart");
          return;
        }

        setCart(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError(
          getApiErrorMessage(err, "Unable to load checkout information."),
        );
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [navigate]);

  /*
   * Format money
   */
  function formatPrice(value: string | number) {
    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /*
   * Handle form changes
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /*
   * Create ORB order and start Razorpay
   */
  async function handlePlaceOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setPlacingOrder(true);
      setError("");

      /*
       * STEP 1
       * Create ORB order
       */
      const order = await createOrder({
        shipping: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      });


      setCreatedOrder(order);

      /*
       * STEP 2
       * Create Razorpay order
       */
      setPaymentLoading(true);

      const razorpayOrder = await createRazorpayOrder({
        order_id: order.id,
      });


      /*
       * STEP 3
       * Make sure Razorpay loaded
       */
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page and try again.",
        );
      }

      /*
       * STEP 4
       * Razorpay options
       */
      const options: RazorpayOptions = {
        key: razorpayOrder.key_id,

        amount: razorpayOrder.amount,

        currency: razorpayOrder.currency,

        name: "Online Raithu Bazaar",

        description: `Payment for ${order.order_number}`,

        order_id: razorpayOrder.razorpay_order_id,

        prefill: {
          name: form.name,
          contact: form.phone,
        },

        notes: {
          order_number: order.order_number,
        },

        theme: {
          color: "#16a34a",
        },

        /*
         * STEP 5
         * Payment successful on Razorpay
         */
        handler: async (response) => {
          try {
            setError("");


            /*
             * STEP 6
             * Verify payment on backend
             */
            await verifyRazorpayPayment({
              order_id: order.id,

              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,
            });


            setPaymentSuccess(true);
          } catch (err: unknown) {


            setError(
              getApiErrorMessage(err, "Payment verification failed. Please contact support."),
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        /*
         * Customer closes Razorpay
         */
        modal: {
          ondismiss: () => {


            setPaymentLoading(false);
          },
        },
      };

      /*
       * STEP 7
       * Open Razorpay
       */
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (err: unknown) {


      setError(
        getApiErrorMessage(err, "Unable to start payment."),
      );

      setPaymentLoading(false);
    } finally {
      setPlacingOrder(false);
    }
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    );
  }

  /*
   * Payment successful
   */
  if (paymentSuccess && createdOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Payment Successful
          </h1>

          <p className="mt-3 text-gray-600">
            Your order has been confirmed successfully.
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 p-5">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>

              <p className="mt-1 font-bold text-green-700">
                {createdOrder.order_number}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Amount Paid</p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                ₹{formatPrice(createdOrder.total_amount)}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Payment Status</p>

              <p className="mt-1 font-semibold text-green-600">PAID</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              View My Orders
            </button>

            <Link
              to="/products"
              className="block text-sm font-medium text-green-700 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * No cart
   */
  if (!cart) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">No checkout information available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-700"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          <p className="mt-2 text-gray-500">
            Enter your delivery details and review your order.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-3">
          {/* Delivery information */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <MapPin size={22} className="text-green-700" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>

                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                {/* City / State */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      State
                    </label>

                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                {/* PIN / Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pincode"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      PIN Code
                    </label>

                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="500001"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <ShoppingBag size={22} className="text-green-700" />
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>

              {/* Cart items */}
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const quantity = Number(item.quantity);

                  const price = Number(item.product.price);

                  const itemTotal = quantity * price;

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {quantity} × ₹{formatPrice(price)} /{" "}
                          {item.product.unit}
                        </p>
                      </div>

                      <p className="shrink-0 font-medium text-gray-900">
                        ₹{formatPrice(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t" />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>

                  <span>₹{formatPrice(cart.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>

                  <span>₹0.00</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>

                    <span>₹{formatPrice(cart.subtotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment button */}
              <button
                type="submit"
                disabled={placingOrder || paymentLoading}
                className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {placingOrder
                  ? "Creating Order..."
                  : paymentLoading
                    ? "Opening Payment..."
                    : "Pay with Razorpay"}
              </button>

              <p className="mt-3 text-center text-xs text-gray-500">
                You will be redirected to secure Razorpay Checkout.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
