'use client'

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { checkSlugUniqueness, saveProduct, archiveProductAction, uploadProductImage, deleteProductAction } from '../actions'
import { resolveImageUrl } from '@/lib/image-utils'
import { CATEGORY_FIT_MAP, DESIGN_TAGS_VOCABULARY } from '@/lib/search-config'

type DBVariant = {
  id?: string
  size: string
  color: string
  color_hex: string
  stock_quantity: number
}

type DBImage = {
  id?: string
  image_url: string
  sort_order: number
  is_cover: boolean
}

type ProductData = {
  id: string
  name: string
  slug: string
  category: string
  description: string
  fabric_details: string
  fit_notes: string
  fit: string | null
  design_tags: string[]
  care_instructions: string
  base_price: number
  intent_tags: string[]
  is_featured: boolean
  is_live: boolean
  is_active: boolean
}

type ProductFormProps = {
  initialProduct?: ProductData
  initialVariants?: DBVariant[]
  initialImages?: DBImage[]
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const CATEGORIES = [
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Shirts', slug: 'shirts' },
  { name: 'Jeans', slug: 'jeans' },
  { name: 'Outerwear', slug: 'outerwear' },
]
const AVAILABLE_INTENT_TAGS = [
  { name: 'Tailored', slug: 'tailored' },
  { name: 'Off-duty', slug: 'off-duty' },
  { name: 'Layering', slug: 'layering' },
  { name: 'Festive Minimal', slug: 'festive-minimal' },
  { name: 'Essentials', slug: 'essentials' },
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
}

function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const VariantRow = memo(({
  variant,
  index,
  onUpdate,
  onDelete
}: {
  variant: DBVariant;
  index: number;
  onUpdate: (index: number, field: keyof DBVariant, value: any) => void;
  onDelete: (index: number) => void;
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="p-3">
        <select
          value={variant.size}
          onChange={e => onUpdate(index, 'size', e.target.value)}
          className="border border-gray-300 p-2 text-xs uppercase font-bold bg-white"
        >
          {AVAILABLE_SIZES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </td>
      <td className="p-3">
        <input
          required
          type="text"
          value={variant.color}
          onChange={e => onUpdate(index, 'color', e.target.value)}
          className="border border-gray-300 p-2 text-xs w-28 font-bold"
          placeholder="e.g. Off-Black"
        />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <input
            required
            type="text"
            pattern="^#([A-Fa-f0-9]{6})$"
            value={variant.color_hex}
            onChange={e => onUpdate(index, 'color_hex', e.target.value)}
            className="border border-gray-300 p-2 text-xs w-24 font-mono font-bold"
            placeholder="#000000"
          />
          <div
            className="w-5 h-5 border border-gray-300"
            style={{ backgroundColor: /^#[A-Fa-f0-9]{6}$/.test(variant.color_hex) ? variant.color_hex : '#ffffff' }}
          />
        </div>
      </td>
      <td className="p-3">
        <input
          required
          type="number"
          min="0"
          value={variant.stock_quantity}
          onChange={e => onUpdate(index, 'stock_quantity', parseInt(e.target.value) || 0)}
          className="border border-gray-300 p-2 text-xs w-20 text-center font-bold"
        />
      </td>
      <td className="p-3 text-right">
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-xs uppercase font-bold text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </td>
    </tr>
  )
})
VariantRow.displayName = 'VariantRow'

export default function ProductForm({
  initialProduct,
  initialVariants = [],
  initialImages = [],
}: ProductFormProps) {
  const router = useRouter()
  const isEditMode = !!initialProduct

  // Form states
  const [productId] = useState(() => initialProduct?.id || safeRandomUUID())
  const [name, setName] = useState(initialProduct?.name || '')
  const [slug, setSlug] = useState(initialProduct?.slug || '')
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(isEditMode)
  const [category, setCategory] = useState(initialProduct?.category || 't-shirts')
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [fabricDetails, setFabricDetails] = useState(initialProduct?.fabric_details || '')
  const [fitNotes, setFitNotes] = useState(initialProduct?.fit_notes || '')
  const [careInstructions, setCareInstructions] = useState(initialProduct?.care_instructions || '')
  const [basePrice, setBasePrice] = useState<number>(initialProduct?.base_price || 2999)
  const [intentTags, setIntentTags] = useState<string[]>(initialProduct?.intent_tags || [])
  const [fit, setFit] = useState<string | null>(initialProduct?.fit || null)
  const [designTags, setDesignTags] = useState<string[]>(initialProduct?.design_tags || [])
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false)
  const [isLive, setIsLive] = useState(initialProduct?.is_live || false)
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true)

  // Variants and Images lists
  const [variants, setVariants] = useState<DBVariant[]>(initialVariants)
  const [images, setImages] = useState<DBImage[]>(initialImages)
  
  // Track removed database entries to clean up
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])

  // UI helper states
  const [slugError, setSlugError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Debounced Slug Generation
  useEffect(() => {
    if (isEditMode || isSlugManuallyEdited || !name) return;
    
    const timer = setTimeout(async () => {
      try {
        const generated = generateSlug(name)
        let finalSlug = generated
        let count = 1
        let unique = await checkSlugUniqueness(finalSlug)
        while (!unique && count < 50) {
          count++
          finalSlug = `${generated}-${count}`
          unique = await checkSlugUniqueness(finalSlug)
        }
        if (count >= 50) {
          setSlugError('Failed to generate a unique slug automatically. Please input one manually.')
        } else {
          setSlug(finalSlug)
          setSlugError(null)
        }
      } catch (err: any) {
        console.error(err)
        setErrorMsg('Failed to check slug uniqueness. Using default generated slug.')
        setSlug(generateSlug(name))
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, isEditMode, isSlugManuallyEdited]);

  // Check manual slug uniqueness on blur of slug field
  const handleSlugBlur = async () => {
    if (slug) {
      const unique = await checkSlugUniqueness(slug, isEditMode ? productId : undefined)
      if (!unique) {
        setSlugError('This slug is already taken. Please choose another.')
      } else {
        setSlugError(null)
      }
    }
  }

  // Check if live publish status is allowed
  const hasMinImages = images.length >= 2
  const hasInStockVariant = variants.some(v => v.stock_quantity > 0)
  const canPublish = hasMinImages && hasInStockVariant

  // Force isLive to false if publishing requirements are not met
  useEffect(() => {
    if (!canPublish && isLive) {
      setIsLive(false)
    }
  }, [canPublish, isLive])

  // Variant Builder Handlers
  const addVariantRow = useCallback(() => {
    setVariants(prev => [
      ...prev,
      { size: 'M', color: 'Black', color_hex: '#000000', stock_quantity: 10 },
    ])
  }, [])

  const updateVariantRow = useCallback((index: number, field: keyof DBVariant, value: any) => {
    setVariants(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const deleteVariantRow = useCallback((index: number) => {
    setVariants(prev => {
      const target = prev[index]
      const targetId = target.id
      if (targetId) {
        setRemovedVariantIds(rv => [...rv, targetId])
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // Intent tags selection
  const handleTagToggle = useCallback((tagSlug: string) => {
    setIntentTags(prev => 
      prev.includes(tagSlug) ? prev.filter(t => t !== tagSlug) : [...prev, tagSlug]
    )
  }, [])

  // Design tag toggle
  const handleDesignTagToggle = useCallback((tag: string) => {
    setDesignTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }, [])

  // Available fit values for currently selected category
  const availableFits = useMemo(() => {
    return CATEGORY_FIT_MAP[category] || []
  }, [category])

  // Reset fit when category changes if current fit is invalid for new category
  useEffect(() => {
    if (fit && !availableFits.includes(fit)) {
      setFit(null)
    }
  }, [availableFits, fit])

  // Image Upload Handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setErrorMsg(null)

    try {
      const uploadedImages: DBImage[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('productId', productId)

        const { publicUrl } = await uploadProductImage(formData)

        uploadedImages.push({
          image_url: publicUrl,
          sort_order: images.length + i,
          is_cover: images.length === 0 && i === 0, // Cover if first
        })
      }

      setImages(prev => [...prev, ...uploadedImages])
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // Image Actions
  const deleteImage = useCallback((index: number) => {
    setImages(prev => {
      const target = prev[index]
      const targetId = target.id
      if (targetId) {
        setRemovedImageIds(ri => [...ri, targetId])
      }
      const remaining = prev.filter((_, i) => i !== index)
      
      if (target.is_cover && remaining.length > 0) {
        remaining[0].is_cover = true
      }
      return remaining
    })
  }, [])

  const setAsCover = useCallback((index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_cover: i === index,
    })))
  }, [])

  const moveImage = useCallback((index: number, direction: 'up' | 'down') => {
    setImages(prev => {
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[newIndex]
      updated[newIndex] = temp

      return updated.map((img, i) => ({
        ...img,
        sort_order: i,
      }))
    })
  }, [])

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg(null)

    if (slugError) {
      setErrorMsg('Please resolve the slug error before saving.')
      setIsSaving(false)
      return
    }

    if (variants.length === 0) {
      setErrorMsg('A product must have at least one variant.')
      setIsSaving(false)
      return
    }

    try {
      await saveProduct(
        {
          id: productId,
          name,
          slug,
          category,
          description,
          fabric_details: fabricDetails,
          fit_notes: fitNotes,
          fit,
          design_tags: designTags,
          care_instructions: careInstructions,
          base_price: basePrice,
          intent_tags: intentTags,
          is_featured: isFeatured,
          is_live: isLive,
          is_active: isActive,
        },
        variants,
        images,
        removedVariantIds,
        removedImageIds
      )
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product.')
      setIsSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('This will archive the product. Orders referencing it will not be affected. This cannot be undone without database access. Do you want to proceed?')) {
      return
    }

    setIsArchiving(true)
    try {
      await archiveProductAction(productId)
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to archive product.')
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('WARNING: This will permanently delete the product and all associated variants, images, and reviews from the database. This action CANNOT be undone. Do you want to proceed?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteProductAction(productId)
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete product permanently.')
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-inter max-w-4xl bg-white border border-black p-4 sm:p-8">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 text-sm font-inter">
          {errorMsg}
        </div>
      )}

      {/* Basic details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Product Name *</label>
          <input
            required
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-black p-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Slug (URL Path) *</label>
          <input
            required
            type="text"
            value={slug}
            onChange={e => {
              setSlug(e.target.value);
              setIsSlugManuallyEdited(true);
            }}
            onBlur={handleSlugBlur}
            readOnly={isEditMode}
            className={`w-full border border-black p-3 text-sm ${isEditMode ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
          />
          {slugError && <p className="text-red-600 text-xs mt-1">{slugError}</p>}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Category *</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-black p-3 text-sm bg-white"
          >
            {CATEGORIES.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Base Price (₹) *</label>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={basePrice}
            onChange={e => setBasePrice(parseInt(e.target.value) || 0)}
            className="w-full border border-black p-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Fit</label>
          <select
            value={fit || ''}
            onChange={e => setFit(e.target.value || null)}
            className="w-full border border-black p-3 text-sm bg-white"
          >
            <option value="">— No fit specified —</option>
            {availableFits.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <p className="text-[10px] text-gray-500 mt-1 font-inter">Fit options are filtered by category. Select category first.</p>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest font-bold mb-2">Description *</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border border-black p-3 text-sm"
        />
      </div>

      {/* Accordion fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Fabric Details</label>
          <textarea
            rows={2}
            value={fabricDetails}
            onChange={e => setFabricDetails(e.target.value)}
            className="w-full border border-black p-3 text-sm"
            placeholder="e.g. 100% Organic Cotton"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Fit Notes</label>
          <textarea
            rows={2}
            value={fitNotes}
            onChange={e => setFitNotes(e.target.value)}
            className="w-full border border-black p-3 text-sm"
            placeholder="e.g. Relaxed fit, model wears size L"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Care Instructions</label>
          <textarea
            rows={2}
            value={careInstructions}
            onChange={e => setCareInstructions(e.target.value)}
            className="w-full border border-black p-3 text-sm"
            placeholder="e.g. Machine wash cold, dry flat"
          />
        </div>
      </div>

      {/* Intent tags, Design tags & Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-3">Intent Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTENT_TAGS.map(tag => {
              const isSelected = intentTags.includes(tag.slug)
              return (
                <button
                  type="button"
                  key={tag.slug}
                  onClick={() => handleTagToggle(tag.slug)}
                  className={`px-3 py-1.5 border text-xs uppercase tracking-widest font-bold transition-all ${
                    isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-bold mb-3">Design Tags</label>
          <div className="flex flex-wrap gap-2">
            {DESIGN_TAGS_VOCABULARY.map(tag => {
              const isSelected = designTags.includes(tag)
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleDesignTagToggle(tag)}
                  className={`px-3 py-1.5 border text-xs uppercase tracking-widest font-bold transition-all ${
                    isSelected ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 font-inter">Design details independent of fit (e.g. Backprint).</p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs uppercase tracking-widest font-bold mb-2">Featured Listing</label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="accent-black w-4 h-4"
            />
            Show in Bestsellers Section on Homepage
          </label>
        </div>
      </div>

      {/* Images Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bebas-neue text-2xl font-black">PRODUCT IMAGES</h3>
            <p className="text-xs text-gray-500 font-inter">Minimum 2 images required to publish. First image serves as the cover.</p>
          </div>
          <label className="px-4 py-2 border border-black bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black cursor-pointer transition-all">
            {uploading ? 'UPLOADING...' : 'UPLOAD IMAGES'}
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 p-8 text-center text-xs opacity-50">
            No images uploaded yet. Upload at least 2 images.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="border border-black p-2 flex flex-col gap-2 relative bg-gray-50">
                <div className="aspect-[3/4] relative bg-gray-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={resolveImageUrl(img.image_url)}
                    alt={`Product image ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                  {img.is_cover && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest font-bold bg-black text-white px-2 py-0.5 border border-white">
                      COVER
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {!img.is_cover && (
                     <button
                       type="button"
                       onClick={() => setAsCover(idx)}
                       className="text-[10px] uppercase font-bold text-left hover:underline"
                     >
                       Make Cover
                     </button>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, 'up')}
                        className="text-[10px] disabled:opacity-30 hover:font-bold"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 'down')}
                        className="text-[10px] disabled:opacity-30 hover:font-bold"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteImage(idx)}
                      className="text-[10px] uppercase font-bold text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variant Builder Section */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bebas-neue text-2xl font-black">VARIANTS & STOCK</h3>
            <p className="text-xs text-gray-500 font-inter">Add size and color combinations. Stock must be greater than 0 to publish.</p>
          </div>
          <button
            type="button"
            onClick={addVariantRow}
            className="px-4 py-2 border border-black bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all"
          >
            + ADD VARIANT
          </button>
        </div>

        <div className="overflow-x-auto border border-black">
          <table className="w-full text-left text-sm font-inter">
            <thead className="bg-black text-white text-xs uppercase tracking-widest">
              <tr>
                <th className="p-3">Size</th>
                <th className="p-3">Color</th>
                <th className="p-3">Color Hex</th>
                <th className="p-3">Stock Qty</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variants.map((v, idx) => (
                <VariantRow 
                  key={v.id || idx}
                  variant={v}
                  index={idx}
                  onUpdate={updateVariantRow}
                  onDelete={deleteVariantRow}
                />
              ))}
              {variants.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs opacity-50">
                    No variants added. Click &quot;+ ADD VARIANT&quot; to build product variants.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish status and Actions */}
      <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group flex items-center">
            <input
              type="checkbox"
              id="isLiveCheckbox"
              disabled={!canPublish}
              checked={isLive}
              onChange={e => setIsLive(e.target.checked)}
              className="accent-black w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
            />
            <label
              htmlFor="isLiveCheckbox"
              className={`ml-2 text-sm uppercase tracking-widest font-bold cursor-pointer select-none ${
                !canPublish ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Publish (Live on site)
            </label>
            {!canPublish && (
              <span className="absolute bottom-6 left-0 bg-black text-white text-[10px] uppercase tracking-wider px-3 py-1.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white">
                Upload at least 2 images & 1 in-stock variant to publish
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {isEditMode && (
            <>
              <button
                type="button"
                disabled={isDeleting || isArchiving}
                onClick={handleDelete}
                className="px-6 py-3 border border-red-600 bg-red-600 text-white text-xs uppercase tracking-widest font-bold hover:bg-red-700 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'DELETING...' : 'DELETE PERMANENTLY'}
              </button>
              <button
                type="button"
                disabled={isDeleting || isArchiving}
                onClick={handleArchive}
                className="px-6 py-3 border border-black text-black text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isArchiving ? 'ARCHIVING...' : 'ARCHIVE PRODUCT'}
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 md:flex-none px-8 py-3 bg-black text-white text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black border border-black transition-all disabled:opacity-50"
          >
            {isSaving ? 'SAVING...' : 'SAVE PRODUCT'}
          </button>
        </div>
      </div>
    </form>
  )
}
