'use server'

import { validateRole } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { insertAuditLog } from '@/lib/audit'

export async function updateOrderStatus(orderId: string, currentStatus: string, newStatus: string, reason?: string) {
  const { user } = await validateRole(['full_admin', 'order_fulfillment'])
  const email = user?.email || 'ADMIN'
  const supabase = createAdminClient()

  // Fetch current order state from DB for safety
  const { data: order, error: orderFetchError } = await supabase
    .from('orders')
    .select('status, notes, order_ref')
    .eq('id', orderId)
    .single()

  if (orderFetchError || !order) {
    throw new Error('Order not found')
  }

  const dbStatus = order.status

  // Define active/fulfilled states vs inactive/unfulfilled states
  const FULFILLED_STATUSES = ['confirmed', 'packed', 'shipped', 'delivered']
  const UNFULFILLED_STATUSES = ['pending', 'expired', 'cancelled']

  const wasFulfilled = FULFILLED_STATUSES.includes(dbStatus)
  const isFulfilled = FULFILLED_STATUSES.includes(newStatus)

  let stockChanged = false

  if (!wasFulfilled && isFulfilled) {
    // Transitioning from unfulfilled -> fulfilled: DECREMENT STOCK
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    if (itemsError || !items) throw new Error('Failed to fetch order items')

    // Decrement stock for each variant atomically
    for (const item of items) {
      const { error: rpcError } = await supabase.rpc('decrement_variant_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      })

      if (rpcError) {
        throw new Error(`Insufficient stock or database error: ${rpcError.message || rpcError.details}`)
      }
    }
    stockChanged = true
  } else if (wasFulfilled && !isFulfilled) {
    // Transitioning from fulfilled -> unfulfilled (e.g., cancelled): INCREMENT STOCK
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('variant_id, quantity')
      .eq('order_id', orderId)

    if (itemsError || !items) throw new Error('Failed to fetch order items')

    // Restore stock for each variant atomically
    for (const item of items) {
      const { error: rpcError } = await supabase.rpc('increment_variant_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity
      })

      if (rpcError) {
        throw new Error(`Failed to restore stock: ${rpcError.message || rpcError.details}`)
      }
    }
    stockChanged = true
  }

  // Update the order status and optional notes
  const updatePayload: any = { 
    status: newStatus, 
    updated_at: new Date().toISOString() 
  }

  if (newStatus === 'cancelled' && reason) {
    const existingNotes = order.notes ? `${order.notes}\n` : ''
    updatePayload.notes = `${existingNotes}Cancellation Reason: ${reason}`
  }

  const { error: orderError } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId)

  if (orderError) throw new Error('Failed to update order status')

  await insertAuditLog({
    action_type: 'order_status_change',
    actor_email: email,
    entity_type: 'order',
    entity_id: orderId,
    entity_label: order.order_ref || orderId,
    old_value: { status: dbStatus },
    new_value: { status: newStatus }
  })

  revalidatePath('/admin/orders')
  if (stockChanged) {
    revalidatePath('/admin/inventory')
    revalidatePath('/shop')
  }
  return { success: true }
}

