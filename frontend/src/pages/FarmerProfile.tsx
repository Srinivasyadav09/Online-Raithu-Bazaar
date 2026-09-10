import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Lock, Save } from "lucide-react";
import { getMyFarmerProfile, updateMyFarmerProfile, uploadFarmerImage } from "../api/farmers";
import type { Farmer } from "../types/farmer";
import { toMediaUrl } from "../utils/media";
import { getApiErrorMessage } from "../utils/apiError";

export default function FarmerProfile() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [form, setForm] = useState({ farm_name: "", description: "", location: "", district: "", state: "", years_of_farming: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const load = useCallback(async () => { try { const data = await getMyFarmerProfile(); setFarmer(data); setForm({ farm_name: data.farm_name, description: data.description || "", location: data.location || "", district: data.district || "", state: data.state || "", years_of_farming: data.years_of_farming?.toString() || "" }); } catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to load profile.")); } }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent) { event.preventDefault(); setSaving(true); setError(""); setMessage(""); try { const data = await updateMyFarmerProfile({ ...form, years_of_farming: form.years_of_farming ? Number(form.years_of_farming) : undefined }); setFarmer(data); setMessage("Profile saved successfully."); } catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to save profile.")); } finally { setSaving(false); } }

  async function upload(kind: "profile_image" | "farm_image", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !farmer?.organic_certified) return;
    setUploading(true); setError(""); setMessage("");
    try { const url = await uploadFarmerImage(file); const data = await updateMyFarmerProfile({ [kind]: url }); setFarmer(data); setMessage("Image uploaded successfully."); }
    catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to upload image.")); }
    finally { setUploading(false); event.target.value = ""; }
  }

  if (!farmer) return <main className="mx-auto max-w-4xl px-4 py-10">{error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : <p>Loading profile...</p>}</main>;
  const verified = farmer.organic_certified && farmer.verification_status === "COMPLETED";
  const input = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";
  return <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div className="mb-6"><Link to="/farmer" className="text-sm font-medium text-green-700 hover:underline">← Back to dashboard</Link><h1 className="mt-3 text-3xl font-bold text-gray-900">My Farm Profile</h1></div>
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">{farmer.farm_name}</h2><p className="mt-1 text-sm text-gray-500">Status: {farmer.verification_status === "PROFILE_SUBMITTED" ? "Profile submitted" : farmer.verification_status === "VERIFYING" ? "Verifying" : "Completed"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{verified ? "Organic certified" : "Pending verification"}</span></div>
      {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}{message && <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">{message}</div>}
      <form onSubmit={save} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Farm name" value={form.farm_name} onChange={(v) => setForm({ ...form, farm_name: v })} input={input} />
        <Field label="Years of farming" type="number" value={form.years_of_farming} onChange={(v) => setForm({ ...form, years_of_farming: v })} input={input} />
        <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} input={input} /><Field label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} input={input} /><Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} input={input} />
        <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium text-gray-700">Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} /></div>
        <div className="sm:col-span-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"><Save size={18} />{saving ? "Saving..." : "Save profile"}</button></div>
      </form>

      <div className="mt-10 border-t pt-8"><div className="flex items-center gap-3"><ImagePlus className="text-green-600" /><div><h2 className="font-bold text-gray-900">Farm images</h2><p className="text-sm text-gray-500">Image uploads are available only after verification.</p></div></div>
        {verified ? <div className="mt-5 grid gap-5 sm:grid-cols-2"><ImageUpload label="Profile image" src={farmer.profile_image} disabled={uploading} onChange={(e) => void upload("profile_image", e)} /><ImageUpload label="Farm image" src={farmer.farm_image} disabled={uploading} onChange={(e) => void upload("farm_image", e)} /></div> : <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-50 p-5 text-sm text-gray-500"><Lock size={18} />Complete admin verification to upload images.</div>}
      </div>
    </div>
  </main>;
}

function Field({ label, value, onChange, input, type = "text" }: { label: string; value: string; onChange: (v: string) => void; input: string; type?: string }) { return <div><label className="mb-2 block text-sm font-medium text-gray-700">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={input} /></div>; }
function ImageUpload({ label, src, disabled, onChange }: { label: string; src: string | null; disabled: boolean; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) { const media = toMediaUrl(src); return <div className="rounded-2xl border border-gray-200 p-4"><div className="mb-3 h-40 overflow-hidden rounded-xl bg-gray-100">{media ? <img src={media} alt={label} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl">🌾</div>}</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">{label}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled} onChange={onChange} className="sr-only" /></label></div>; }
