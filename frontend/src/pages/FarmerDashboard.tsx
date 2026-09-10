import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock3, Lock, Sprout, ShieldCheck } from "lucide-react";
import { getMyFarmerProfile } from "../api/farmers";
import type { Farmer, FarmerVerificationStatus } from "../types/farmer";
import { getApiErrorMessage } from "../utils/apiError";

const steps: { key: FarmerVerificationStatus; label: string; description: string }[] = [
  { key: "PROFILE_SUBMITTED", label: "Profile submitted", description: "Your farmer application has been received." },
  { key: "VERIFYING", label: "Verifying", description: "ORB admin is reviewing your farm details." },
  { key: "COMPLETED", label: "Completed", description: "Your farm is verified and organic certified." },
];

export default function FarmerDashboard() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setFarmer(await getMyFarmerProfile()); setError(""); }
    catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to load your farmer application.")); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const currentIndex = useMemo(() => steps.findIndex((step) => step.key === farmer?.verification_status), [farmer]);
  const verified = farmer?.organic_certified === true && farmer.verification_status === "COMPLETED";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-r from-green-700 to-green-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div><p className="text-sm font-medium text-green-100">Farmer portal</p><h1 className="mt-1 text-3xl font-bold">{farmer?.farm_name || "Your farm"}</h1><p className="mt-2 text-green-50">Track your verification and manage your farm once approved.</p></div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur"><div className="flex items-center gap-2"><ShieldCheck size={18} />{verified ? "Organic certified" : "Verification in progress"}</div></div>
        </div>
      </div>

      {error && <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {farmer && <>
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-900">Verification status</h2><p className="mt-1 text-sm text-gray-500">There are only three application stages.</p></div><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{farmer.verification_status === "PROFILE_SUBMITTED" ? "Profile submitted" : farmer.verification_status === "VERIFYING" ? "Verifying" : "Completed"}</span></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const done = index < currentIndex || farmer.verification_status === "COMPLETED";
              const current = index === currentIndex;
              return <div key={step.key} className={`rounded-2xl border p-5 ${current ? "border-green-300 bg-green-50" : done ? "border-green-200 bg-white" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${done || current ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"}`}>{done ? <Check size={19} /> : current ? <Clock3 size={19} /> : index + 1}</div><h3 className="font-semibold text-gray-900">{step.label}</h3></div>
                <p className="mt-3 text-sm leading-6 text-gray-500">{step.description}</p>
              </div>;
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <Link to="/farmer/profile" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Sprout className="text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">My Farm Profile</h2><p className="mt-2 text-sm leading-6 text-gray-500">Review and update your submitted farm information.</p></Link>
          {verified ? <Link to="/farmer/products" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Check className="text-green-600" /><h2 className="mt-4 text-lg font-bold text-gray-900">My Products</h2><p className="mt-2 text-sm leading-6 text-gray-500">Add produce, upload product images and manage your listings.</p></Link> : <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6"><Lock className="text-gray-400" /><h2 className="mt-4 text-lg font-bold text-gray-700">Products locked</h2><p className="mt-2 text-sm leading-6 text-gray-500">Product creation and image uploads unlock after verification is completed.</p></div>}
        </section>
      </>}
    </main>
  );
}
