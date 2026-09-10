import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function FarmerLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
