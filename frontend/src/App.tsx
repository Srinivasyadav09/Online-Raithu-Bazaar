import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProfile from "./pages/FarmerProfile";
import FarmerProducts from "./pages/FarmerProducts";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Register from "./pages/Register";
import FarmerRegister from "./pages/FarmerRegister";
import CustomerLayout from "./components/CustomerLayout";
import FarmerLayout from "./components/FarmerLayout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/farmer" element={<FarmerRegister />} />

        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["FARMER"]} />}>
          <Route element={<FarmerLayout />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
            <Route path="/farmer/products" element={<FarmerProducts />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
