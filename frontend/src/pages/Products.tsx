import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch {
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Fresh Products</h1>

          <p className="mt-2 text-gray-600">
            Buy fresh products directly from ORB farmers.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">No products available.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
