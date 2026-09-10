import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { toMediaUrl } from "../utils/media";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-48 items-center justify-center bg-green-50">
        {product.image ? (
          <img
            src={toMediaUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl">🥬</span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>

          {product.organic && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
              Organic
            </span>
          )}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-green-700">₹{product.price}</p>

            <p className="text-sm text-gray-500">per {product.unit}</p>
          </div>

          <p
            className={
              product.is_available
                ? "text-sm text-green-600"
                : "text-sm text-red-500"
            }
          >
            {product.is_available
              ? `${product.stock_quantity} available`
              : "Out of stock"}
          </p>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-5 block w-full rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
        >
          View Product
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
