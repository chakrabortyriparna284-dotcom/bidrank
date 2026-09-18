"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface EditProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

const CATEGORIES = [
  "AI",
  "Developer Tools",
  "Productivity",
  "Marketing",
  "Sales",
  "Design",
  "Finance",
  "Analytics",
  "Consumer",
  "Other",
];

export function EditProductDialog({ isOpen, onClose, product }: EditProductDialogProps) {
  const updateProduct = useMutation(api.products.updateProduct);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setTagline(product.tagline || "");
      setDescription(product.description || "");
      setCategory(product.category || CATEGORIES[0]);
      setWebsiteUrl(product.websiteUrl || "");
      setTwitterUrl(product.twitterUrl || "");
      setDemoUrl(product.demoUrl || "");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setError(null);
    setSaving(true);

    try {
      await updateProduct({
        productId: product._id,
        name,
        tagline,
        description,
        category,
        websiteUrl,
        twitterUrl: twitterUrl || undefined,
        demoUrl: demoUrl || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update product details");
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit {product.name}</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Update your SaaS listing details. Changes reflect immediately on public profiles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs text-zinc-300">
              Product Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-category" className="text-xs text-zinc-300">
              Category
            </Label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-tagline" className="text-xs text-zinc-300">
              Tagline
            </Label>
            <Input
              id="edit-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={100}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-xs text-zinc-300">
              Description
            </Label>
            <textarea
              id="edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-websiteUrl" className="text-xs text-zinc-300">
              Website URL
            </Label>
            <Input
              id="edit-websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm focus-visible:ring-emerald-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-950/40 border border-red-800/60 rounded-md text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
