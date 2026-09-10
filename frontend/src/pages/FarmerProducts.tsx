import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { getCategories } from "../api/products";
import { createMyProduct, deleteMyProduct, getMyFarmerProfile, getMyProducts, updateMyProduct, uploadFarmerImage } from "../api/farmers";
import type { Product, Category } from "../types/product";
import { getApiErrorMessage } from "../utils/apiError";
import { toMediaUrl } from "../utils/media";

const emptyForm = { category_id: "", name: "", description: "", price: "", unit: "kg", stock_quantity: "", image: "", organic: true, is_available: true };

type ProductForm = typeof emptyForm;

export default function FarmerProducts() {
  const [verified, setVerified] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const farmer = await getMyFarmerProfile();
      const ok = farmer.organic_certified && farmer.verification_status === "COMPLETED";
      setVerified(ok);
      if (ok) { setProducts(await getMyProducts()); setCategories(await getCategories()); }
    } catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to load products.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const payload = { ...form, category_id: Number(form.category_id), price: form.price, stock_quantity: form.stock_quantity };
      if (editingId) { await updateMyProduct(editingId, payload); setMessage("Product updated successfully."); }
      else { await createMyProduct(payload); setMessage("Product added successfully."); }
      setForm(emptyForm); setEditingId(null); await load();
    } catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to save product.")); }
    finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this product?")) return;
    try { await deleteMyProduct(id); setProducts((items) => items.filter((item) => item.id !== id)); setMessage("Product deleted."); }
    catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to delete product.")); }
  }

  async function uploadImage(file: File) {
    try { const url = await uploadFarmerImage(file); setForm((current) => ({ ...current, image: url })); setMessage("Image uploaded. Save the product to attach it."); }
    catch (err: unknown) { setError(getApiErrorMessage(err, "Unable to upload image.")); }
  }

  function edit(product: Product) { setEditingId(product.id); setForm({ category_id: String(product.category_id), name: product.name, description: product.description || "", price: String(product.price), unit: product.unit, stock_quantity: String(product.stock_quantity), image: product.image || "", organic: product.organic, is_available: product.is_available }); window.scrollTo({ top: 0, behavior: "smooth" }); }

  if (loading) return <main className="mx-auto max-w-6xl px-4 py-10"><p>Loading products...</p></main>;
  if (!verified) return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm"><Lock className="mx-auto text-gray-400" size={40} /><h1 className="mt-4 text-2xl font-bold text-gray-900">Products are locked</h1><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">Your farmer account must reach <strong>Completed</strong> verification and become organic certified before you can add products or upload product images.</p><Link to="/farmer" className="mt-6 inline-flex rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">View verification status</Link></div></main>;

  const input = "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100";
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6"><Link to="/farmer" className="text-sm font-medium text-green-700 hover:underline">← Back to dashboard</Link><h1 className="mt-3 text-3xl font-bold text-gray-900">My Products</h1><p className="mt-1 text-sm text-gray-500">Manage produce available to ORB customers.</p></div>
    {(error || message) && <div className={`mb-6 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{error || message}</div>}
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">{editingId ? "Edit product" : "Add a product"}</h2><p className="mt-1 text-sm text-gray-500">Product listings are visible to customers after they are saved.</p></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Cancel edit</button>}</div>
      <form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2">
        <div><label className="mb-2 block text-sm font-medium text-gray-700">Category</label><select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={input}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <Field label="Product name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} input={input} required />
        <Field label="Price (₹)" type="number" step="0.01" min="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} input={input} required />
        <Field label="Unit" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} input={input} required />
        <Field label="Stock quantity" type="number" step="0.01" min="0" value={form.stock_quantity} onChange={(v) => setForm({ ...form, stock_quantity: v })} input={input} required />
        <div><label className="mb-2 block text-sm font-medium text-gray-700">Product image</label><div className="flex gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"><ImagePlus size={18} /> Upload<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadImage(file); }} /></label>{form.image && <span className="flex items-center text-xs text-green-700">Image ready</span>}</div></div>
        <div className="sm:col-span-2"><label className="mb-2 block text-sm font-medium text-gray-700">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} /></div>
        <label className="flex items-center gap-3 text-sm text-gray-700"><input type="checkbox" checked={form.organic} onChange={(e) => setForm({ ...form, organic: e.target.checked })} className="h-4 w-4" /> Organic product</label>
        <label className="flex items-center gap-3 text-sm text-gray-700"><input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="h-4 w-4" /> Available to customers</label>
        <div className="sm:col-span-2"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"><Plus size={18} />{saving ? "Saving..." : editingId ? "Update product" : "Add product"}</button></div>
      </form>
    </section>

    <section className="mt-8"><h2 className="text-xl font-bold text-gray-900">Your listings</h2><div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => { const media = toMediaUrl(product.image); return <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"><div className="h-48 bg-green-50">{media ? <img src={media} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">🥬</div>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-gray-900">{product.name}</h3><span className="text-sm font-semibold text-green-700">₹{Number(product.price).toLocaleString("en-IN")}/{product.unit}</span></div><p className="mt-2 line-clamp-2 text-sm text-gray-500">{product.description || "Fresh farm product"}</p><p className="mt-3 text-xs text-gray-500">Stock: {product.stock_quantity} {product.unit} · {product.is_available ? "Available" : "Hidden"}</p><div className="mt-4 flex gap-2"><button type="button" onClick={() => edit(product)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-50"><Pencil size={15} /> Edit</button><button type="button" onClick={() => void remove(product.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={15} /> Delete</button></div></div></article>; })}</div>{products.length === 0 && <div className="mt-4 rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">No products yet. Add your first product above.</div>}</section>
  </main>;
}

function Field({
  label,
  value,
  onChange,
  input,
  type = "text",
  step,
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  input: string;
  type?: string;
  step?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={input}
        required={required}
      />
    </div>
  );
}
