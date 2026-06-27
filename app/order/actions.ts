'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'
import { checkoutFormSchema, checkoutSavedAddressSchema } from '@/lib/validations'

export async function submitOrder(formData: any, cartItems: any[], total: number, itemCount: number) {
  // 0. Rate Limiting Check
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1'
  const host = headerList.get('host') || 'onyx-menswear.com'
  const rateLimitRes = await checkRateLimit(ip, 'order_submission', 5, 3600) // max 5 per hour
  if (!rateLimitRes.success) {
    return {
      success: false,
      error: "Too many orders submitted from this IP. Please try again later."
    }
  }

  const supabase = createAdminClient()

  // 1. Zod Validation
  const schema = formData.useSavedAddress ? checkoutSavedAddressSchema : checkoutFormSchema
  const parsed = schema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const validatedData = parsed.data

  try {
    // 1b. Server-Side Price & Product Verification
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty." }
    }

    const variantIds = cartItems.map(item => item.variant_id || item.id)
    const { data: dbVariants, error: dbVariantsError } = await supabase
      .from('product_variants')
      .select(`
        id,
        products (
          id,
          name,
          base_price,
          is_active,
          is_live
        )
      `)
      .in('id', variantIds)

    if (dbVariantsError || !dbVariants) {
      console.error('Database variants fetch error:', dbVariantsError)
      return { success: false, error: "Failed to verify product information." }
    }

    // Verify and compute correct subtotal
    let calculatedSubtotal = 0
    let calculatedItemCount = 0
    const verifiedOrderItems: any[] = []

    for (const item of cartItems) {
      const vId = item.variant_id || item.id
      const dbVariant = dbVariants.find(v => v.id === vId)
      
      const rawProduct = dbVariant?.products
      const dbProduct = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct

      if (!dbVariant || !dbProduct || !dbProduct.is_active || !dbProduct.is_live) {
        return {
          success: false,
          error: `Product "${item.name}" is no longer available. Please remove it and try again.`
        }
      }

      const canonicalPrice = dbProduct.base_price
      calculatedSubtotal += canonicalPrice * item.quantity
      calculatedItemCount += item.quantity

      verifiedOrderItems.push({
        product_id: dbProduct.id,
        variant_id: dbVariant.id,
        product_name: dbProduct.name,
        variant_label: `${item.size || 'N/A'} / ${item.color || 'N/A'}`,
        product_image_url: item.image || '',
        unit_price: canonicalPrice,
        quantity: item.quantity,
        line_total: canonicalPrice * item.quantity,
      })
    }

    // Compare client-calculated subtotal against server-calculated ones
    const clientGrandTotal = total
    if (calculatedSubtotal !== clientGrandTotal) {
      return {
        success: false,
        error: "Some items in your cart have updated prices. Please refresh your cart and try again."
      }
    }

    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const orderRef = `ONX-${dateStr}-${randomNum}`

    let customerId = null
    let addressData = {
      address_line1: '',
      address_line2: null as string | null,
      city: '',
      state: '',
      pincode: '',
    }

    // 2. Customer Lookup
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('mobile', validatedData.mobile)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      if (formData.useSavedAddress) {
        return {
          success: false,
          error: "No saved address found for this mobile number."
        }
      }
      const { data: newCustomer, error: newCustomerError } = await supabase
        .from('customers')
        .insert({
          name: validatedData.fullName,
          mobile: validatedData.mobile,
          email: validatedData.email || null,
        })
        .select('id')
        .single()

      if (newCustomerError) {
        console.error('Customer insert error:', newCustomerError)
        return {
          success: false,
          error: "Something went wrong. Please check your inputs or try again."
        }
      }

      if (newCustomer) {
        customerId = newCustomer.id
      }
    }

    // 3. Resolve Address
    if (formData.useSavedAddress && customerId) {
      const { data: latestOrder } = await supabase
        .from('orders')
        .select('address_line1, address_line2, city, state, pincode')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestOrder) {
        addressData = {
          address_line1: latestOrder.address_line1,
          address_line2: latestOrder.address_line2 || null,
          city: latestOrder.city,
          state: latestOrder.state,
          pincode: latestOrder.pincode,
        }
      } else {
        return {
          success: false,
          error: "No saved address found for this mobile number."
        }
      }
    } else {
      const fullData = validatedData as any
      addressData = {
        address_line1: fullData.addressLine1,
        address_line2: fullData.addressLine2 || null,
        city: fullData.city,
        state: fullData.state,
        pincode: fullData.pincode,
      }
    }

    const isJamnagar = addressData.city ? addressData.city.trim().toLowerCase() === 'jamnagar' : false

    // 4. Create order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_ref: orderRef,
        status: 'pending',
        payment_method: validatedData.paymentMethod,
        payment_status: 'pending',
        customer_id: customerId,
        customer_name: validatedData.fullName,
        customer_mobile: validatedData.mobile,
        customer_email: validatedData.email || null,
        ...addressData,
        notes: validatedData.notes || null,
        subtotal: calculatedSubtotal,
        item_count: calculatedItemCount,
        whatsapp_opened: false,
        is_same_day_delivery: isJamnagar,
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Order insert error:', orderError)
      return {
        success: false,
        error: "Something went wrong. Please check your inputs or try again."
      }
    }

    // 5. Create order items (using verified server-side mapped data)
    const orderItemsData = verifiedOrderItems.map((item) => ({
      ...item,
      order_id: newOrder.id
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)

    if (itemsError) {
      console.error('Failed to create order items:', itemsError)
    }

    // 6. Build WhatsApp confirmation link
    const divider = '---------------------------------------------'

    const itemLines = cartItems.map((item, idx) => {
      const lineTotal = item.price * item.quantity
      const protocol = host.includes('localhost') ? 'http' : 'https'
      const itemLink = item.slug ? `${protocol}://${host}/products/${item.slug}` : ''
      return [
        `*${idx + 1}. ${item.name.toUpperCase()}*`,
        `   Size: ${item.size || '—'} · Color: ${item.color || '—'}`,
        `   Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = *₹${lineTotal.toLocaleString('en-IN')}*`,
        itemLink ? `   Link: ${itemLink}` : '',
      ].filter(Boolean).join('\n')
    }).join('\n\n')

    const addressParts = [
      addressData.address_line1,
      addressData.address_line2,
      `${addressData.city}, ${addressData.state}`,
      `PIN: ${addressData.pincode}`
    ].filter((line): line is string => Boolean(line))

    const paymentEmoji = validatedData.paymentMethod === 'Prepaid' ? '💳' : '💵'
    const paymentLabel = validatedData.paymentMethod === 'Prepaid' ? 'Prepaid (UPI)' : 'Cash on Delivery (COD)'

    const shipping = total >= 999 ? 0 : 99
    const grandTotal = total + shipping

    const standardText = [
      `🛍️ *ONYX — ORDER CONFIRMATION*`,
      divider,
      `📋 *ORDER REF:* \`${orderRef}\``,
      divider,
      ``,
      `🛒 *ITEMS PURCHASED*`,
      itemLines,
      ``,
      divider,
      ``,
      `👤 *CUSTOMER INFO*`,
      `• *Name:* ${validatedData.fullName}`,
      `• *Mobile:* ${validatedData.mobile}`,
      validatedData.email ? `• *Email:* ${validatedData.email}` : '',
      ``,
      `📍 *SHIPPING ADDRESS*`,
      ...addressParts.map(line => `• ${line.toUpperCase()}`),
      ``,
      divider,
      ``,
      `💰 *BILLING SUMMARY*`,
      `\`\`\``,
      `Subtotal:  ₹${total.toLocaleString('en-IN')}`,
      `Shipping:  ${shipping === 0 ? 'FREE' : '₹' + shipping}`,
      `-----------------------`,
      `TOTAL:     ₹${grandTotal.toLocaleString('en-IN')}`,
      `\`\`\``,
      ``,
      `${paymentEmoji} *Payment:* ${paymentLabel}`,
      validatedData.notes ? `📝 *Notes:* _${validatedData.notes}_` : '',
      ``,
      divider,
      `_Tap Send to confirm this order. Our team will verify and dispatch it shortly._`,
    ].filter(Boolean).join('\n')

    const waText = isJamnagar
      ? `🚀 SAME DAY DELIVERY ORDER\n\n${standardText}`
      : standardText

    const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919714367460'
    const encodedText = encodeURIComponent(waText)
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`

    return { 
      success: true,
      orderRef,
      finalAddress: addressData,
      isSameDay: isJamnagar,
      waLink
    }
  } catch (err) {
    console.error('Runtime order submission error:', err)
    return {
      success: false,
      error: "Something went wrong. Please check your inputs or try again."
    }
  }
}
