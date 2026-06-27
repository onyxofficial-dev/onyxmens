'use client'

import { useState } from 'react'
import { adjustInventory } from './actions'
import { resolveImageUrl } from '@/lib/image-utils'

type Variant = {
  id: string
  product_id: string
  products: { 
    name: string
    product_images?: Array<{ image_url: string, is_cover: boolean }>
  }
  size: string
  color: string
  stock_quantity: number
  is_out_of_stock: boolean
}

export default function AdminInventoryClient({ variants }: { variants: Variant[] }) {
  const [adjusting, setAdjusting] = useState<string | null>(null)
  
  // States for the modal/inline edit
  const [newStock, setNewStock] = useState<number>(0)
  const [reason, setReason] = useState('manual_count')
  const [isSaving, setIsSaving] = useState(false)

  const handleAdjustClick = (variant: Variant) => {
    setAdjusting(variant.id)
    setNewStock(variant.stock_quantity)
    setReason('manual_count')
  }

  const handleSave = async (variantId: string) => {
    const variant = variants.find(v => v.id === variantId)
    const currentStock = variant?.stock_quantity ?? 0
    const difference = newStock - currentStock

    if (difference === 0) {
      setAdjusting(null)
      return
    }

    if (Math.abs(difference) > 100) {
      if (!confirm(`Warning: You are making a large inventory adjustment of ${difference > 0 ? '+' : ''}${difference} units. Are you sure you want to proceed?`)) {
        return
      }
    }

    setIsSaving(true)
    try {
      await adjustInventory(variantId, newStock, reason)
      setAdjusting(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update inventory')
    } finally {
      setIsSaving(false)
    }
  }

  // Get cover image URL for a variant
  const getCoverImage = (variant: Variant): string | null => {
    const images = variant.products?.product_images || []
    const cover = images.find(img => img.is_cover) || images[0]
    return cover?.image_url || null
  }

  return (
    <div>
      <h1 className="font-bebas-neue text-4xl font-black mb-8">INVENTORY</h1>
      
      <div className="bg-white border border-black overflow-x-auto">
        <table className="w-full text-left font-inter text-sm">
          <thead className="bg-black text-white uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-bold">Image</th>
              <th className="p-4 font-bold">Product</th>
              <th className="p-4 font-bold">Variant (Size/Color)</th>
              <th className="p-4 font-bold">Current Stock</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {variants.map((v) => {
              const coverImageUrl = getCoverImage(v)
              return (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  {coverImageUrl ? (
                    <img 
                      src={resolveImageUrl(coverImageUrl)} 
                      width={40} 
                      height={40} 
                      alt="Product"
                      className="object-cover rounded border border-gray-300"
                      style={{ borderRadius: '4px' }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 border border-gray-300 rounded" style={{ borderRadius: '4px' }}></div>
                  )}
                </td>
                <td className="p-4 font-bold">{v.products?.name || 'Unknown Product'}</td>
                <td className="p-4">{v.size} / {v.color}</td>
                <td className="p-4 font-bold">
                  {adjusting === v.id ? (
                    <input 
                      type="number" 
                      value={newStock} 
                      onChange={e => setNewStock(parseInt(e.target.value) || 0)}
                      disabled={isSaving}
                      className="border border-black p-1 w-20 text-center disabled:opacity-50"
                    />
                  ) : (
                    <span className={v.stock_quantity <= 5 ? 'text-red-600' : ''}>
                      {v.stock_quantity}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {v.is_out_of_stock ? (
                    <span className="px-2 py-1 text-xs uppercase tracking-widest font-bold bg-red-100 text-red-800">OOS</span>
                  ) : v.stock_quantity <= 5 ? (
                    <span className="px-2 py-1 text-xs uppercase tracking-widest font-bold bg-yellow-100 text-yellow-800">Low</span>
                  ) : (
                    <span className="px-2 py-1 text-xs uppercase tracking-widest font-bold bg-green-100 text-green-800">In Stock</span>
                  )}
                </td>
                <td className="p-4">
                  {adjusting === v.id ? (
                    <div className="flex flex-col gap-2">
                      <select 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        disabled={isSaving}
                        className="border border-black p-1 text-xs disabled:opacity-50 bg-white"
                      >
                        <option value="manual_count">Manual Count</option>
                        <option value="damaged">Damaged/Lost</option>
                        <option value="restock">Restock</option>
                      </select>
                      <div className="flex gap-2">
                        <button 
                          disabled={isSaving} 
                          onClick={() => handleSave(v.id)} 
                          className="text-xs uppercase font-bold text-green-600 hover:text-green-800 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          disabled={isSaving} 
                          onClick={() => setAdjusting(null)} 
                          className="text-xs uppercase font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAdjustClick(v)}
                      className="text-xs uppercase tracking-widest text-blue-600 hover:text-blue-800 font-bold"
                    >
                      Adjust
                    </button>
                  )}
                </td>
              </tr>
            )})}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No variants found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
