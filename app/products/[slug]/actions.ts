'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'
import { reviewFormSchema } from '@/lib/validations'

export async function submitReview(formData: FormData) {
  // 0. Rate Limiting Check
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1'
  const rateLimitRes = await checkRateLimit(ip, 'review_submission', 3, 3600) // max 3 per hour
  if (!rateLimitRes.success) {
    return {
      success: false,
      error: "Too many reviews submitted from this IP. Please try again later."
    }
  }

  const adminClient = createAdminClient()

  const productId = formData.get('productId') as string
  if (!productId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId)) {
    return { success: false, error: 'Invalid product ID' }
  }

  const rawData = {
    reviewerName: formData.get('reviewerName'),
    customerMobile: formData.get('customerMobile'),
    rating: formData.get('rating'),
    title: formData.get('title') || undefined,
    body: formData.get('body'),
  }

  const parsed = reviewFormSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      error: "Invalid review data. Please check all fields."
    }
  }

  const validatedData = parsed.data

  try {
    // Verify purchase: Check if customer purchased this product
    const { count, error: countError } = await adminClient
      .from('orders')
      .select(`
        id,
        order_items!inner (
          product_id
        )
      `, { count: 'exact' })
      .eq('customer_mobile', validatedData.customerMobile)
      .eq('order_items.product_id', productId)
      .not('status', 'in', '(cancelled,expired)')

    if (countError) {
      console.error('Verify purchase error:', countError)
      return { success: false, error: 'Unable to verify purchase' }
    }

    // If no purchase found, reject the review
    if (count === 0) {
      return { success: false, error: 'Only customers who purchased this product can leave a review.' }
    }

    // Insert review as verified purchase (using adminClient to bypass RLS)
    const { error } = await adminClient
      .from('reviews')
      .insert({
        product_id: productId,
        reviewer_name: validatedData.reviewerName,
        rating: validatedData.rating,
        title: validatedData.title || null,
        body: validatedData.body,
        customer_mobile: validatedData.customerMobile,
        purchase_verified: true,
        is_approved: true
      })

    if (error) {
      console.error('Review insert error:', error)
      return { success: false, error: 'Something went wrong. Please check your inputs or try again.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Runtime review error:', err)
    return { success: false, error: 'Something went wrong. Please check your inputs or try again.' }
  }
}
