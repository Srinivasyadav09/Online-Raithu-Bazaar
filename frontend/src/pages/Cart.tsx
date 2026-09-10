import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart";
import type { Cart as CartType } from "../types/cart";
import { getApiErrorMessage } from "../utils/apiError";
import { toMediaUrl } from "../utils/media";

export default function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);

  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  const [clearing, setClearing] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCart()
      .then((data) => {
        if (!cancelled) setCart(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError(getApiErrorMessage(err, "Unable to load your cart."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleDecrease(itemId: number, currentQuantity: string) {
    const quantity = Number(currentQuantity);

    if (quantity <= 1) {
      return;
    }

    try {
      setUpdatingItemId(itemId);
      setError("");

      await updateCartItem(itemId, quantity - 1);

      // Always reload using GET /cart because that response
      // contains the nested product information required by the UI.
      const refreshedCart = await getCart();

      setCart(refreshedCart);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to update cart quantity."));
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleIncrease(
    itemId: number,
    currentQuantity: string,
    stockQuantity: string,
  ) {
    const quantity = Number(currentQuantity);
    const stock = Number(stockQuantity);

    if (quantity >= stock) {
      return;
    }

    try {
      setUpdatingItemId(itemId);
      setError("");

      await updateCartItem(itemId, quantity + 1);

      const refreshedCart = await getCart();

      setCart(refreshedCart);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to update cart quantity."));
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemove(itemId: number) {
    try {
      setRemovingItemId(itemId);
      setError("");

      await removeCartItem(itemId);

      const refreshedCart = await getCart();

      setCart(refreshedCart);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to remove item from cart."));
    } finally {
      setRemovingItemId(null);
    }
  }

  async function handleClearCart() {
    if (!cart || cart.items.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove all items from your cart?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setError("");

      await clearCart();

      const refreshedCart = await getCart();

      setCart(refreshedCart);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to clear your cart."));
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <ShoppingCart size={40} className="mx-auto mb-4 text-gray-400" />

          <p className="mb-5 text-red-600">{error}</p>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  const isEmpty = cart.items.length === 0;

  const subtotal = Number(cart.subtotal);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link
            to="/customer"
            className="font-medium text-gray-500 hover:text-green-700"
          >
            Dashboard
          </Link>

          <span className="text-gray-400">/</span>

          <span className="font-medium text-gray-800">Cart</span>
        </div>

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>

            <p className="mt-2 text-gray-600">
              Review your items before checkout.
            </p>
          </div>

          {!isEmpty && (
            <button
              type="button"
              onClick={handleClearCart}
              disabled={clearing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />

              {clearing ? "Clearing..." : "Clear Cart"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty cart */}
        {isEmpty ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag size={56} className="mx-auto mb-5 text-gray-300" />

            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Browse fresh products from our farmers and add something delicious
              to your cart.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                <ShoppingBag size={19} />
                Browse Products
              </Link>

              <Link
                to="/customer"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Cart items */}
            <div className="space-y-4">
              {cart.items.map((item) => {
                const quantity = Number(item.quantity);
                const price = Number(item.product.price);
                const stock = Number(item.product.stock_quantity);

                const itemTotal = price * quantity;

                const isUpdating = updatingItemId === item.id;

                const isRemoving = removingItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-50 sm:h-28 sm:w-28">
                        {item.product.image ? (
                          <img
                            src={toMediaUrl(item.product.image)}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">🥬</span>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {item.product.name}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              ₹
                              {price.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              / {item.product.unit}
                            </p>

                            {item.product.organic && (
                              <span className="mt-2 inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                Organic
                              </span>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-green-700">
                              ₹
                              {itemTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleDecrease(item.id, item.quantity)
                              }
                              disabled={
                                quantity <= 1 || isUpdating || isRemoving
                              }
                              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Decrease ${item.product.name}`}
                            >
                              <Minus size={16} />
                            </button>

                            <span className="w-8 text-center font-semibold text-gray-900">
                              {quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleIncrease(
                                  item.id,
                                  item.quantity,
                                  item.product.stock_quantity,
                                )
                              }
                              disabled={
                                quantity >= stock || isUpdating || isRemoving
                              }
                              className="rounded-lg border border-gray-300 p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label={`Increase ${item.product.name}`}
                            >
                              <Plus size={16} />
                            </button>

                            <span className="text-sm text-gray-500">
                              {item.product.unit}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={isRemoving || isUpdating}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />

                            {isRemoving ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({cart.items.length})</span>

                  <span>
                    ₹
                    {subtotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>

                  <span className="font-medium text-green-600">Free</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-green-700">
                      ₹
                      {subtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white transition hover:bg-green-700"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <ShoppingBag size={18} />
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
