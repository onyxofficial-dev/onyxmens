import { createAdminClient } from '@/lib/supabase/admin'

export async function insertAuditLog(payload: {
  action_type: string
  actor_email: string
  entity_type: string
  entity_id?: string
  entity_label?: string
  old_value?: any
  new_value?: any
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from('audit_log').insert({
      table_name: payload.entity_type,
      record_id: payload.entity_id || payload.entity_label || '',
      action: (payload.action_type.includes('create') || payload.action_type.includes('new') || payload.action_type.includes('submit')) ? 'INSERT' :
              (payload.action_type.includes('delete') || payload.action_type.includes('archive')) ? 'DELETE' : 'UPDATE',
      changed_by: payload.actor_email,
      old_values: payload.old_value ? (typeof payload.old_value === 'object' ? payload.old_value : { value: payload.old_value }) : null,
      new_values: {
        ...(payload.new_value && typeof payload.new_value === 'object' ? payload.new_value : { value: payload.new_value }),
        ...(payload.entity_label ? { label: payload.entity_label } : {}),
        action_detail: payload.action_type
      }
    })
  } catch (error) {
    console.error('Audit log insertion failed:', error)
  }
}
