'use client'

import { useEffect, useState, Fragment } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateOrderStatus } from './actions'
import { buildWALink, WA_ENABLED_STATUSES } from '@/lib/whatsapp-templates'
import { useSearchParams } from 'next/navigation'

type OrderItem = {
  id: string
  product_name: string
  variant_label: string
  quantity: number
  unit_price: number
  product_image_url?: string
}

type Order = {
  id: string
  order_ref: string
  status: string
  customer_name: string
  customer_mobile: string
  customer_email?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  pincode?: string
  payment_method?: string
  notes?: string
  subtotal: number
  created_at: string
  is_same_day_delivery?: boolean
  order_items?: OrderItem[]
}

export default function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const searchParams = useSearchParams()
  const refParam = searchParams.get('ref')

  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>(() => {
    const initial: Record<string, OrderItem[]> = {}
    initialOrders.forEach((order) => {
      if (order.order_items) {
        initial[order.id] = order.order_items
      }
    })
    return initial
  })
  const [loadingItems, setLoadingItems] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(refParam || '')

  const [filterSameDay, setFilterSameDay] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new as Order
          setOrders((prev) => [newOrder, ...prev])
          // Fetch order items for the new order immediately to show its images
          const { data } = await supabase
            .from('order_items')
            .select('id, product_name, variant_label, quantity, unit_price, product_image_url')
            .eq('order_id', newOrder.id)
          if (data) {
            setOrderItems((prev) => ({ ...prev, [newOrder.id]: data }))
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => 
            prev.map((o) => o.id === payload.new.id ? { ...o, ...(payload.new as Order) } : o)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (refParam) {
      setSearchQuery(refParam)
    }
  }, [refParam])

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return

    setLoadingItems(orderId)
    const supabase = createClient()
    const { data } = await supabase
      .from('order_items')
      .select('id, product_name, variant_label, quantity, unit_price, product_image_url')
      .eq('order_id', orderId)

    if (data) {
      setOrderItems((prev) => ({ ...prev, [orderId]: data }))
    }
    setLoadingItems(null)
  }

  const handleStatusChange = async (orderId: string, currentStatus: string, newStatus: string) => {
    if (currentStatus === newStatus) return

    let reason: string | undefined = undefined

    if (newStatus === 'cancelled') {
      const confirmed = window.confirm('Are you sure you want to cancel this order?')
      if (!confirmed) {
        return
      }

      const inputReason = window.prompt('Enter cancellation reason:')
      if (inputReason === null || inputReason.trim() === '') {
        alert('Cancellation aborted. A reason is required.')
        return
      }
      reason = inputReason.trim()
    }

    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, currentStatus, newStatus, reason)
      setOrders((prev) => 
        prev.map((o) => o.id === orderId ? { 
          ...o, 
          status: newStatus,
          notes: reason ? `${o.notes || ''}\nCancellation Reason: ${reason}`.trim() : o.notes
        } : o)
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const toggleExpanded = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
      await fetchOrderItems(orderId)
    }
  }

  // Filter orders based on search query and other filters
  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      const matchSearch =
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_mobile.includes(q) ||
        o.order_ref.toLowerCase().includes(q)
      if (!matchSearch) return false
    }

    if (filterSameDay && !o.is_same_day_delivery) {
      return false
    }

    if (filterStatus !== 'all' && o.status !== filterStatus) {
      return false
    }

    if (filterDate === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      if (o.created_at?.slice(0, 10) !== todayStr) {
        return false
      }
    }

    return true
  })

  return (
    <div>
      <h1 className="font-bebas-neue text-4xl font-black mb-8">ORDERS</h1>
      
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, mobile, or order ref"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-black text-sm font-inter placeholder-gray-400 bg-white"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-black px-4 py-2 text-xs uppercase tracking-widest font-bold bg-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>

        <select
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-black px-4 py-2 text-xs uppercase tracking-widest font-bold bg-white focus:outline-none"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
        </select>
        
        <label className="flex items-center gap-2 cursor-pointer font-inter text-xs font-bold uppercase tracking-wider border border-black px-4 py-2 bg-white hover:bg-neutral-50 select-none">
          <input
            type="checkbox"
            checked={filterSameDay}
            onChange={(e) => setFilterSameDay(e.target.checked)}
            className="accent-black w-4 h-4 cursor-pointer"
          />
          <span>⚡ Same Day</span>
        </label>
      </div>
      <p className="text-xs text-gray-500 mb-6">
        Showing {filtered.length} of {orders.length} orders
      </p>
      
      <div className="bg-white border border-black overflow-x-auto">
        <table className="w-full text-left font-inter text-sm">
          <thead className="bg-black text-white uppercase tracking-widest text-xs">
            <tr>
              <th className="p-4 font-bold"></th>
              <th className="p-4 font-bold">Order Ref</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold">Customer</th>
              <th className="p-4 font-bold">Total</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((order) => (
              <Fragment key={order.id}>
                <tr 
                  key={order.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpanded(order.id)}
                >
                  <td className="p-4 text-center">
                    <span className="text-lg">{expandedOrderId === order.id ? '−' : '+'}</span>
                  </td>
                  <td className="p-4 font-bold">
                    <div className="flex items-center gap-3">
                      {orderItems[order.id] && orderItems[order.id].length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden flex-shrink-0">
                          {orderItems[order.id].map((item) => (
                            <img
                              key={item.id}
                              src={item.product_image_url || '/placeholder.png'}
                              alt={item.product_name}
                              title={`${item.product_name} (${item.variant_label}) x${item.quantity}`}
                              className="inline-block h-8 w-8 object-cover border border-black bg-white"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{order.order_ref}</span>
                          {order.is_same_day_delivery && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-black tracking-widest bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">
                              ⚡ SAME DAY
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {order.customer_name}
                    <br />
                    <span className="text-xs text-gray-500">{order.customer_mobile}</span>
                  </td>
                  <td className="p-4 font-bold">₹{order.subtotal}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                      disabled={updating === order.id}
                      className="border border-black p-2 text-xs uppercase tracking-widest bg-white disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {updating === order.id && <span className="ml-2 text-xs text-gray-500">...</span>}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {WA_ENABLED_STATUSES.includes(order.status) ? (
                      <button
                        onClick={() => {
                          const waLink = buildWALink(order)
                          if (waLink) window.open(waLink, '_blank')
                        }}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs uppercase tracking-widest font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer rounded"
                      >
                        📲 Send Message
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 font-inter">Not Available</span>
                    )}
                  </td>
                </tr>

                {/* Expanded Detail Panel */}
                {expandedOrderId === order.id && (
                  <tr>
                    <td colSpan={7} className="p-6 bg-gray-50 border-t-2 border-black">
                      <div className="space-y-6">
                        {/* Section 1: Customer */}
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-widest mb-3">Customer Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-inter">
                            <div>
                              <p className="text-xs text-gray-500">Name</p>
                              <p className="font-bold">{order.customer_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Mobile</p>
                              <p className="font-bold">{order.customer_mobile}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-bold">{order.customer_email || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Payment Method</p>
                              <p className="font-bold">{order.payment_method || '—'}</p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                            <p className="text-sm font-inter">
                              {order.address_line1}
                              {order.address_line2 && `, ${order.address_line2}`}
                              <br />
                              {order.city}, {order.state} {order.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Section 2: Items */}
                        <div>
                          <h3 className="font-bold text-sm uppercase tracking-widest mb-3">Order Items</h3>
                          {loadingItems === order.id ? (
                            <p className="text-xs text-gray-500">Loading items...</p>
                          ) : (
                            <div className="overflow-x-auto border border-gray-200">
                              <table className="w-full text-xs font-inter min-w-[500px]">
                                <thead className="bg-gray-200">
                                  <tr>
                                    <th className="p-2 text-left font-bold w-12">Image</th>
                                    <th className="p-2 text-left font-bold">Product</th>
                                    <th className="p-2 text-left font-bold">Variant</th>
                                    <th className="p-2 text-center font-bold">Qty</th>
                                    <th className="p-2 text-right font-bold">Unit Price</th>
                                    <th className="p-2 text-right font-bold">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {(orderItems[order.id] || []).map((item) => (
                                    <tr key={item.id} className="align-middle">
                                      <td className="p-2">
                                        <img
                                          src={item.product_image_url || '/placeholder.png'}
                                          alt={item.product_name}
                                          className="w-10 h-10 object-cover border border-black bg-white"
                                        />
                                      </td>
                                      <td className="p-2 font-bold">{item.product_name}</td>
                                      <td className="p-2">{item.variant_label}</td>
                                      <td className="p-2 text-center">{item.quantity}</td>
                                      <td className="p-2 text-right">₹{item.unit_price}</td>
                                      <td className="p-2 text-right font-bold">₹{item.unit_price * item.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Section 3: Notes */}
                        {order.notes && (
                          <div>
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-3">Notes</h3>
                            <p className="text-sm font-inter bg-white border border-gray-200 p-3">{order.notes}</p>
                          </div>
                        )}

                        {/* Section 4: WhatsApp Action */}
                        {WA_ENABLED_STATUSES.includes(order.status) && (
                          <div className="pt-4 border-t border-gray-200">
                            <button
                              onClick={() => {
                                const waLink = buildWALink(order)
                                if (waLink) window.open(waLink, '_blank')
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs uppercase tracking-widest font-bold rounded transition-colors"
                            >
                              📲 Send Status Update
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
