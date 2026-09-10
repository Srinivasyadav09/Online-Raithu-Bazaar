import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout } from "lucide-react";
import { registerFarmer } from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";

export default function FarmerRegister() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", farm_name: "", description: "", location: "", district: "", state: "", years_of_farming: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await registerFarmer({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        farm_name: form.farm_name,
        description: form.description || undefined,
        location: form.location || undefined,
        district: form.district || undefined,
        state: form.state || undefined,
        years_of_farming: form.years_of_farming ? Number(form.years_of_farming) : undefined,
      });
      loginUser(response.user, response.access_token);
      navigate("/farmer");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Unable to submit your farmer application."));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";

  return (
    <main className="min-h-screen bg-green-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <div className="text-center">
          <Sprout className="mx-auto text-green-600" size={42} />
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Become an ORB Farmer</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Submit your farm details. An admin will verify your application before you can publish products and receive the organic-certified badge.
          </p>
        </div>

        {error && <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} required className={inputClass} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required className={inputClass} />
              <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} className={inputClass} />
              <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} required minLength={8} className={inputClass} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">Farm details</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <Field label="Farm name" value={form.farm_name} onChange={(v) => update("farm_name", v)} required className={inputClass} />
              <Field label="Years of farming" type="number" min="0" value={form.years_of_farming} onChange={(v) => update("years_of_farming", v)} className={inputClass} />
              <Field label="Location" value={form.location} onChange={(v) => update("location", v)} className={inputClass} />
              <Field label="District" value={form.district} onChange={(v) => update("district", v)} className={inputClass} />
              <Field label="State" value={form.state} onChange={(v) => update("state", v)} className={inputClass} />
            </div>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="description">Farm description</label>
              <textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={inputClass} placeholder="Tell us about your farm and farming practices" />
            </div>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Your application starts as <strong>Profile submitted</strong>. You can log in and track verification, but images and products remain locked until an admin completes verification.
          </div>

          <button disabled={loading} className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Submitting application..." : "Submit farmer application"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-green-700 hover:underline">Login</Link>
        </p>
      </div>
    </main>
  );
}

interface FieldProps { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; minLength?: number; min?: string; className: string; }
function Field({ label, value, onChange, type = "text", required, minLength, min, className }: FieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return <div><label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">{label}</label><input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} minLength={minLength} min={min} className={className} /></div>;
}
