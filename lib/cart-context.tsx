'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  product_id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image: string
  slug?: string
  isOutofStock?: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  validateCartStock: () => Promise<void>
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    const initCart = async () => {
      const saved = localStorage.getItem('onyx_cart')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const now = Date.now()
          // Check 7-day expiration (7 * 24 * 60 * 60 * 1000)
          if (parsed.saved_at && now - parsed.saved_at < 604800000) {
            setItems(parsed.items || [])
          } else {
            localStorage.removeItem('onyx_cart')
          }
        } catch (e) {
          console.log('[v0] Cart hydration error')
        }
      }
      setMounted(true)
    }
    initCart()
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('onyx_cart', JSON.stringify({
        items,
        saved_at: Date.now()
      }))
    }
  }, [items, mounted])

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size && i.color === item.color)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const validateCartStock = async () => {
    const saved = localStorage.getItem('onyx_cart')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      let loadedItems: CartItem[] = parsed.items || []
      if (loadedItems.length === 0) return

      const supabase = createClient()
      const variantIds = loadedItems.map(i => i.id)
      
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, stock_quantity, is_out_of_stock')
        .in('id', variantIds)
      
      if (variants) {
        loadedItems = loadedItems.map(item => {
          const variant = variants.find(v => v.id === item.id)
          if (!variant || variant.is_out_of_stock || variant.stock_quantity < item.quantity) {
            return { ...item, isOutofStock: true }
          }
          return { ...item, isOutofStock: false }
        })
        setItems(loadedItems)
      }
    } catch (err) {
      console.log('[Cart] Stock check failed', err)
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, validateCartStock, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
