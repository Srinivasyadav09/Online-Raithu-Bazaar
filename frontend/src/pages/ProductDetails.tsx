import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingCart, Package } from "lucide-react";
import { getProduct } from "../api/products";
import { addToCart } from "../api/cart";
import type { Product } from "../types/product";
import { useAuth } from "../hooks/useAuth";

import { getApiErrorMessage } from "../utils/apiError";
export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const id = Number(productId);

        if (!productId || Number.isNaN(id)) {
          setError("Invalid product.");
          return;
        }

        const data = await getProduct(id);
        setProduct(data);

        // Start quantity from 1 whenever a new product is loaded.
        setQuantity(1);
      } catch {
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    if (!product) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "CUSTOMER") {
      setError("Only customers can add products to the cart.");
      return;
    }

    try {
      setAdding(true);
      setMessage("");
      setError("");

      await addToCart({
        product_id: product.id,
        quantity,
      });

      setMessage(`${product.name} added to your cart.`);
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(err, "Unable to add the product to your cart."),
      );
    } finally {
      setAdding(false);
    }
  }

  function increaseQuantity() {
    if (!product) {
      return;
    }

    const stock = Number(product.stock_quantity);

    setQuantity((current) => Math.min(stock, current + 1));
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-5 text-red-600">{error}</p>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <ArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stock = Number(product.stock_quantity);
  const isAvailable = product.is_available && stock > 0;

  const price = Number(product.price);

  const totalPrice = price * quantity;

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

          <Link
            to="/products"
            className="font-medium text-gray-500 transition hover:text-green-700"
          >
            Products
          </Link>

          <span className="text-gray-400">/</span>

          <span className="max-w-[220px] truncate font-medium text-gray-800">
            {product.name}
          </span>
        </div>

        {/* Product Card */}
        <div className="grid overflow-hidden rounded-2xl bg-white shadow-sm md:grid-cols-2">
          {/* Product Image */}
          <div className="flex min-h-[350px] items-center justify-center bg-green-50 p-6 sm:min-h-[500px]">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full max-h-[500px] w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <span className="text-8xl">🥬</span>

                <p className="mt-4 text-sm text-gray-500">Fresh farm product</p>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            {/* Organic badge */}
            {product.organic && (
              <span className="mb-4 w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Organic
              </span>
            )}

            {/* Product name */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            {/* Description */}
            <p className="mt-4 leading-7 text-gray-600">
              {product.description ||
                "Fresh quality product directly from our farmer."}
            </p>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-700">
                ₹
                {price.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>

              <span className="text-gray-500">/ {product.unit}</span>
            </div>

            {/* Farmer Details */}
            {product.farmer && (
              <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-4">
                  {/* Farmer Image */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100">
                    {product.farmer.profile_image ? (
                      <img
                        src={product.farmer.profile_image}
                        alt={product.farmer.farm_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👨‍🌾</span>
                    )}
                  </div>

                  {/* Farmer Information */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                      Sold by
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      {product.farmer.farm_name}
                    </h2>

                    {/* Location */}
                    {(product.farmer.location ||
                      product.farmer.district ||
                      product.farmer.state) && (
                      <p className="mt-1 text-sm text-gray-600">
                        📍{" "}
                        {[
                          product.farmer.location,
                          product.farmer.district,
                          product.farmer.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    {/* Rating / Certification */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {product.farmer.rating > 0 && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                          ⭐ {product.farmer.rating.toFixed(1)}
                        </span>
                      )}

                      {product.farmer.organic_certified && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          🌱 Organic Certified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            {isAvailable && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold text-gray-700">
                  Quantity
                </p>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="rounded-lg border border-gray-300 p-2.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="w-10 text-center text-lg font-semibold text-gray-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stock}
                    className="rounded-lg border border-gray-300 p-2.5 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Selected total */}
            {isAvailable && (
              <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">Selected quantity</span>

                <span className="font-semibold text-gray-900">
                  ₹
                  {totalPrice.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {message}
              </div>
            )}

            {/* Error message */}
            {error && product && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Add to cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable || adding}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingCart size={20} />

              {adding ? "Adding..." : "Add to Cart"}
            </button>

            {/* View Cart */}
            {message && (
              <Link
                to="/cart"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 bg-white px-6 py-3.5 font-semibold text-green-700 transition hover:bg-green-50"
              >
                <ShoppingCart size={19} />
                View Cart
              </Link>
            )}

            {/* View Orders */}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                to="/orders"
                className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
              >
                <Package size={17} />
                View My Orders
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
