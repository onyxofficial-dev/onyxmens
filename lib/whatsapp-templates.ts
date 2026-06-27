export interface Order {
  order_ref: string
  customer_name: string
  customer_mobile: string
  status: string
  notes?: string
}

export const WA_TEMPLATES: Record<string, (order: Order) => string> = {
  pending: (o) =>
    `Hi ${o.customer_name}, we received your ONYX order request *${o.order_ref}* (Pending Confirmation). Please confirm if you want to proceed with this order.\n— ONYX`,

  confirmed: (o) =>
    `Hi ${o.customer_name}, your ONYX order *${o.order_ref}* has been confirmed ✅\nWe're preparing your items. We'll update you once packed.\n— ONYX`,

  packed: (o) =>
    `Hi ${o.customer_name}, your ONYX order *${o.order_ref}* is packed 📦\nIt will be dispatched soon.\n— ONYX`,

  shipped: (o) =>
    `Hi ${o.customer_name}, your ONYX order *${o.order_ref}* is on its way 🚚\nExpect delivery in 3–5 business days.\n— ONYX`,

  delivered: (o) =>
    `Hi ${o.customer_name}, your ONYX order *${o.order_ref}* has been delivered 🎉\nFor returns or issues, reply to this message within 7 days.\n— ONYX`,

  cancelled: (o) =>
    `Hi ${o.customer_name}, your ONYX order *${o.order_ref}* has been cancelled.\nReason: ${o.notes || 'Not specified'}.\nFor help, reply here.\n— ONYX`,
}

export function buildWALink(order: Order, status?: string): string {
  const statusToUse = status || order.status
  const message = WA_TEMPLATES[statusToUse]?.(order)
  if (!message) return ''
  
  const mobile = order.customer_mobile.startsWith('91')
    ? order.customer_mobile
    : `91${order.customer_mobile}`
  
  return `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`
}

export const WA_ENABLED_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

