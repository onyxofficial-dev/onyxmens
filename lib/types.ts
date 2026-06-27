export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          category: string
          intent_tags: string[] | null
          description: string | null
          fabric_details: string | null
          fit_notes: string | null
          fit: string | null
          design_tags: string[]
          care_instructions: string | null
          base_price: number
          is_active: boolean
          search_document: string | null
          search_tsv: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          image_url: string
          sort_order: number
          is_cover: boolean
        }
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          color_hex: string | null
          stock_quantity: number
          is_out_of_stock: boolean
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          mobile: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_ref: string
          status: string
          payment_method: string
          payment_status: string
          customer_id: string | null
          customer_name: string
          customer_mobile: string
          customer_email: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          notes: string | null
          subtotal: number
          item_count: number
          whatsapp_opened: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string
          product_name: string
          variant_label: string
          product_image_url: string
          unit_price: number
          quantity: number
          line_total: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          reviewer_name: string
          rating: number | null
          title: string | null
          body: string
          is_approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'is_approved'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      rate_limits: {
        Row: {
          ip: string
          route: string
          count: number
          reset_time: string
        }
        Insert: Database['public']['Tables']['rate_limits']['Row']
        Update: Partial<Database['public']['Tables']['rate_limits']['Row']>
      }
    }
  }
}

// DOMAIN MODELS
export interface Product {
  id: string
  name: string
  category: string
  intent_tags?: string[]
  description?: string | null
  fabric_details?: string | null
  fit_notes?: string | null
  fit?: string | null
  design_tags?: string[]
  care_instructions?: string | null
  base_price: number
  is_active: boolean
  images?: ProductImage[]
  variants?: ProductVariant[]
}

export interface SearchResult {
  id: string
  slug: string
  name: string
  base_price: number
  category: string
  fit: string | null
  cover_image_url: string | null
  rank: number
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  sort_order: number
  is_cover: boolean
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  color_hex?: string | null
  stock_quantity: number
  is_out_of_stock: boolean
}

export interface Customer {
  id: string
  name: string
  mobile: string
  email?: string | null
}

export interface Order {
  id: string
  order_ref: string
  status: string
  payment_method: string
  payment_status: string
  customer_id?: string | null
  customer_name: string
  customer_mobile: string
  customer_email?: string | null
  address_line1: string
  address_line2?: string | null
  city: string
  state: string
  pincode: string
  notes?: string | null
  subtotal: number
  item_count: number
  whatsapp_opened: boolean
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_label: string
  product_image_url: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface Review {
  id: string
  product_id: string
  reviewer_name: string
  rating?: number | null
  title?: string | null
  body: string
  is_approved: boolean
  created_at: string
}

// Ensure the old cart items map correctly, or simply use what they had for cart
export interface CartItem {
  id: string
  product_id: string
  variant_id: string // Updated to match new variant model
  name: string
  image: string
  size: string
  color: string
  quantity: number
  price: number
}

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const
