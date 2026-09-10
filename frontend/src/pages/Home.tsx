import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Home() {
  const { isAuthenticated, user } = useAuth();

  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";
  const isFarmer = isAuthenticated && user?.role === "FARMER";
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  return (
    <main>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                🌾 Fresh from local farmers
              </span>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Fresh produce.
                <span className="block text-green-600">
                  Direct from farmers.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                ORB connects farmers directly with customers, making fresh
                agricultural products easier to discover and buy.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                {isCustomer && (
                  <Link
                    to="/products"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-700"
                  >
                    Explore Products
                  </Link>
                )}

                {isFarmer && (
                  <Link
                    to="/farmer"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-700"
                  >
                    Farmer Dashboard
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-green-700"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Join ORB
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
              <div className="grid grid-cols-2 gap-4">
                <CategoryCard emoji="🥬" title="Vegetables" />

                <CategoryCard emoji="🥭" title="Fruits" />

                <CategoryCard emoji="🌾" title="Grains" />

                <CategoryCard emoji="🥛" title="Dairy" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-green-50">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Grow with ORB</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">Are you a farmer?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Apply to sell your farm products. Your profile is reviewed by an admin before products and image uploads are unlocked.</p>
            </div>
            <Link to="/register/farmer" className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">Become a farmer</Link>
          </div>
        </section>

        <section className="border-y bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            <Stat value="Fresh" label="Farm products" />

            <Stat value="Direct" label="Farmer connection" />

            <Stat value="Secure" label="Online payments" />

            <Stat value="Local" label="Farmers first" />
          </div>
        </section>
    </main>
  );
}

interface CategoryCardProps {
  emoji: string;
  title: string;
}

function CategoryCard({ emoji, title }: CategoryCardProps) {
  return (
    <div className="rounded-2xl bg-green-50 p-8 text-center transition hover:-translate-y-1 hover:shadow-md">
      <div className="text-5xl">{emoji}</div>

      <p className="mt-4 font-semibold text-gray-800">{title}</p>
    </div>
  );
}

interface StatProps {
  value: string;
  label: string;
}

function Stat({ value, label }: StatProps) {
  return (
    <div>
      <p className="text-3xl font-bold text-green-600">{value}</p>

      <p className="mt-1 text-gray-600">{label}</p>
    </div>
  );
}

export default Home;
