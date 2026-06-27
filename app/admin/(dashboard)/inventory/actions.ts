'use server'

import { validateRole } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { insertAuditLog } from '@/lib/audit'

export async function adjustInventory(variantId: string, newStock: number, reason: string) {
  await validateRole(['full_admin', 'inventory_editor'])
  const supabase = createAdminClient()

  // 1. Fetch current stock to calculate difference for log
  const { data: variant, error: varError } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single()

  if (varError || !variant) throw new Error('Variant not found')

  const difference = newStock - variant.stock_quantity

  if (difference !== 0) {
    // 2. Update variant stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ 
        stock_quantity: newStock,
        is_out_of_stock: newStock <= 0 
      })
      .eq('id', variantId)

    if (updateError) throw new Error('Failed to update stock')

    // 3. Log the adjustment
    const { data: { user } } = await supabase.auth.getUser()
    const email = user?.email || 'ADMIN'

    await supabase.from('inventory_log').insert({
      variant_id: variantId,
      change_amount: difference,
      reason: reason,
      source: 'manual_adjustment',
      changed_by: email
    })

    await insertAuditLog({
      action_type: 'stock_adjusted',
      actor_email: email,
      entity_type: 'variant',
      entity_id: variantId,
      old_value: { stock: variant.stock_quantity },
      new_value: { stock: newStock }
    })
  }

  revalidatePath('/admin/inventory')
  return { success: true }
}
