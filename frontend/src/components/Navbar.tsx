import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, User, X, Package, LayoutDashboard, LogOut, Sprout, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-green-700",
    ].join(" ");

  function closeMobileMenu() { setMobileOpen(false); }
  function handleLogout() { logout(); closeMobileMenu(); navigate("/"); }

  const links = user?.role === "CUSTOMER"
    ? [
        { to: "/customer", label: "Dashboard", icon: <LayoutDashboard size={17} />, end: true },
        { to: "/products", label: "Products", icon: null, end: false },
        { to: "/orders", label: "My Orders", icon: <Package size={17} />, end: true },
        { to: "/cart", label: "Cart", icon: <ShoppingCart size={17} />, end: true },
      ]
    : user?.role === "FARMER"
      ? [
          { to: "/farmer", label: "Dashboard", icon: <LayoutDashboard size={17} />, end: true },
          { to: "/farmer/profile", label: "My Farm", icon: <Sprout size={17} />, end: false },
          ...(user ? [{ to: "/farmer/products", label: "My Products", icon: <Package size={17} />, end: true }] : []),
        ]
      : user?.role === "ADMIN"
        ? [{ to: "/admin", label: "Admin Dashboard", icon: <ShieldCheck size={17} />, end: true }]
        : [];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={closeMobileMenu} className="flex shrink-0 items-center gap-2">
          <span className="text-3xl">            <img
              src={logo}
              alt="ORB Logo"
              className="mx-auto h-16 w-16 object-contain"
            ></img></span>
          <div>
            <div className="text-xl font-bold leading-tight text-green-700">ORB</div>
            <div className="hidden text-[11px] leading-tight text-gray-500 sm:block">Online Raithu Bazaar</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.icon}{link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <User size={18} className="text-gray-500" />
                <div className="max-w-[150px]">
                  <p className="truncate text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs uppercase text-gray-500">{user?.role}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600">
                <LogOut size={17} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-green-700">Login</Link>
              <Link to="/register" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Register</Link>
            </>
          )}
        </div>

        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden" aria-label="Toggle navigation" aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <NavLink to="/" end onClick={closeMobileMenu} className={navLinkClass}>Home</NavLink>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={closeMobileMenu} className={navLinkClass}>
                {link.icon}{link.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-gray-200" />
            {isAuthenticated ? (
              <>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs uppercase text-gray-500">{user?.role}</p>
                </div>
                <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut size={17} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Login</Link>
                <Link to="/register" onClick={closeMobileMenu} className="rounded-lg bg-green-600 px-4 py-2 text-center text-sm font-semibold text-white">Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
