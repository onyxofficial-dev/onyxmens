import { createClient, validateRole } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Admin',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number as ₹ with Indian grouping (e.g. ₹1,23,450) */
function formatINR(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN').format(amount)
}

/** Human-readable relative time from a date string */
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** Status badge colour map */
function statusStyle(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'confirmed': return 'bg-blue-100 text-blue-800'
    case 'packed': return 'bg-indigo-100 text-indigo-800'
    case 'shipped': return 'bg-purple-100 text-purple-800'
    case 'delivered': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'expired': return 'bg-gray-200 text-gray-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminDashboard() {
  try {
    await validateRole(['full_admin', 'inventory_editor', 'order_fulfillment'])
  } catch (err) {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10) // YYYY-MM-DD

  // Fetch all 10 dashboard datasets in parallel
  const [
    sameDayOrdersRes,
    ordersCountRes,
    pendingCountRes,
    productsCountRes,
    revenueRowsRes,
    statusRowsRes,
    recentOrdersRes,
    lowStockVariantsRes,
    orderItemsForTopRes,
    auditLogsRes
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_ref, status, subtotal, created_at, customer_name, customer_mobile')
      .eq('is_same_day_delivery', true)
      .gte('created_at', `${todayStr}T00:00:00`)
      .not('status', 'in', '("delivered","cancelled","expired")')
      .order('created_at', { ascending: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('subtotal, created_at, status')
      .not('status', 'in', '("cancelled","expired")'),
    supabase.from('orders').select('status'),
    supabase
      .from('orders')
      .select('order_ref, customer_name, subtotal, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('product_variants')
      .select('id, size, color, stock_quantity, is_out_of_stock, products(name, product_images(image_url, is_cover))')
      .or('stock_quantity.lte.5,is_out_of_stock.eq.true')
      .order('stock_quantity', { ascending: true }),
    supabase
      .from('order_items')
      .select('product_name, quantity, line_total, orders(status)'),
    supabase
      .from('audit_log')
      .select('id, table_name, record_id, action, changed_by, old_values, new_values, timestamp')
      .order('timestamp', { ascending: false })
      .limit(15)
  ])

  const sameDayOrders = sameDayOrdersRes.data
  const ordersCount = ordersCountRes.count
  const pendingCount = pendingCountRes.count
  const productsCount = productsCountRes.count
  const revenueRows = revenueRowsRes.data
  const statusRows = statusRowsRes.data
  const recentOrders = recentOrdersRes.data
  const lowStockVariants = lowStockVariantsRes.data
  const orderItemsForTop = orderItemsForTopRes.data
  const auditLogs = auditLogsRes.data

  // Start of week (Monday)
  const dayOfWeek = now.getDay() // 0=Sun
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - diffToMon)
  weekStart.setHours(0, 0, 0, 0)

  // Start of month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let revenueToday = 0
  let revenueWeek = 0
  let revenueMonth = 0
  let revenueAll = 0

  for (const row of revenueRows || []) {
    const amt = row.subtotal ?? 0
    const d = new Date(row.created_at)
    revenueAll += amt
    if (row.created_at?.slice(0, 10) === todayStr) revenueToday += amt
    if (d >= weekStart) revenueWeek += amt
    if (d >= monthStart) revenueMonth += amt
  }

  // ── Order status breakdown ────────────────────────────────────────────
  const ALL_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'expired'] as const
  const statusCounts: Record<string, number> = {}
  for (const s of ALL_STATUSES) statusCounts[s] = 0
  for (const row of statusRows || []) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
  }

  // Aggregate top-selling products by product_name
  const topMap: Record<string, { units: number; revenue: number }> = {}
  for (const item of orderItemsForTop || []) {
    const orderStatus = (item.orders as any)?.status
    if (orderStatus === 'cancelled' || orderStatus === 'expired') continue
    const key = item.product_name
    if (!topMap[key]) topMap[key] = { units: 0, revenue: 0 }
    topMap[key].units += item.quantity
    topMap[key].revenue += item.line_total
  }
  const topProducts = Object.entries(topMap)
    .sort((a, b) => b[1].units - a[1].units)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...data }))

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="font-bebas-neue text-4xl font-black mb-8">DASHBOARD</h1>

      {/* ── Same Day Deliveries Priority Section ────────────────── */}
      <div className="bg-white border border-black mb-8 shadow-sm">
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">⚡</span>
            <h2 className="font-bebas-neue text-xl tracking-wider uppercase font-black">Same Day Deliveries — Today</h2>
          </div>
          <span className="text-xs font-inter font-bold uppercase tracking-widest bg-yellow-400 text-black px-2 py-1">
            {sameDayOrders?.length || 0} pending
          </span>
        </div>
        <div className="p-6">
          {(!sameDayOrders || sameDayOrders.length === 0) ? (
            <p className="font-inter text-sm text-gray-500 italic">No same day orders today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="bg-neutral-100 text-black uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="p-3 border-b border-black">Order Ref</th>
                    <th className="p-3 border-b border-black">Customer</th>
                    <th className="p-3 border-b border-black">WhatsApp Chat</th>
                    <th className="p-3 border-b border-black text-right">Total</th>
                    <th className="p-3 border-b border-black">Status</th>
                    <th className="p-3 border-b border-black text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sameDayOrders.map((o) => {
                    const elapsed = timeAgo(o.created_at)
                    const mobile = o.customer_mobile.startsWith('91') ? o.customer_mobile : `91${o.customer_mobile}`
                    return (
                      <tr key={o.id} className="hover:bg-neutral-50">
                        <td className="p-3 font-mono font-bold text-xs">
                          <Link href={`/admin/orders?ref=${o.order_ref}`} className="hover:underline">
                            {o.order_ref}
                          </Link>
                        </td>
                        <td className="p-3 font-bold text-xs">{o.customer_name}</td>
                        <td className="p-3">
                          <a
                            href={`https://wa.me/${mobile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-bold"
                          >
                            💬 Chat ({o.customer_mobile})
                          </a>
                        </td>
                        <td className="p-3 text-right font-bold text-xs">{formatINR(o.subtotal)}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-1 text-[9px] uppercase tracking-widest font-black ${statusStyle(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-right text-xs text-gray-500 font-bold">{elapsed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Today', value: revenueToday },
          { label: 'This Week', value: revenueWeek },
          { label: 'This Month', value: revenueMonth },
          { label: 'All Time', value: revenueAll },
        ].map((r) => (
          <div key={r.label} className="bg-white p-5 border border-black shadow-sm">
            <p className="text-[10px] uppercase tracking-widest font-inter font-bold text-gray-500 mb-1">{r.label}</p>
            <p className="font-bebas-neue text-3xl md:text-4xl">{formatINR(r.value)}</p>
          </div>
        ))}
      </div>

      {/* ── Existing 3 Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-black shadow-sm">
          <p className="text-xs uppercase tracking-widest font-inter font-bold text-gray-500 mb-2">Total Orders</p>
          <p className="font-bebas-neue text-5xl">{ordersCount || 0}</p>
        </div>
        <div className="bg-white p-6 border border-black shadow-sm">
          <p className="text-xs uppercase tracking-widest font-inter font-bold text-gray-500 mb-2">Pending Orders</p>
          <p className="font-bebas-neue text-5xl text-red-600">{pendingCount || 0}</p>
        </div>
        <div className="bg-white p-6 border border-black shadow-sm">
          <p className="text-xs uppercase tracking-widest font-inter font-bold text-gray-500 mb-2">Active Products</p>
          <p className="font-bebas-neue text-5xl">{productsCount || 0}</p>
        </div>
      </div>

      {/* ── Order Status Breakdown ────────────────────────────────── */}
      <Link href="/admin/orders" className="block mb-8">
        <div className="bg-white border border-black p-4 shadow-sm hover:bg-gray-50 transition-colors">
          <p className="text-[10px] uppercase tracking-widest font-inter font-bold text-gray-500 mb-3">Order Status Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-widest font-bold ${statusStyle(s)}`}
              >
                {s} <span className="font-black">·</span> {statusCounts[s]}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* ── Recent Orders + Top Selling ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders — 2/3 width */}
        <div className="lg:col-span-2 bg-white border border-black shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-black">
            <p className="text-xs uppercase tracking-widest font-inter font-bold">Recent Orders</p>
            <Link href="/admin/orders" className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-black">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter text-sm">
              <thead className="bg-black text-white uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="p-3">Order Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(recentOrders || []).map((o) => (
                  <tr key={o.order_ref} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-xs">{o.order_ref}</td>
                    <td className="p-3 text-xs truncate max-w-[140px]">{o.customer_name}</td>
                    <td className="p-3 text-xs text-right">{formatINR(o.subtotal)}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold ${statusStyle(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-gray-500 text-right whitespace-nowrap">{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-400 text-xs">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products — 1/3 width */}
        <div className="bg-white border border-black shadow-sm">
          <div className="p-4 border-b border-black">
            <p className="text-xs uppercase tracking-widest font-inter font-bold">Top Selling Products</p>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.length === 0 && (
              <div className="p-6 text-center text-gray-400 text-xs">No sales data yet.</div>
            )}
            {topProducts.map((tp, idx) => (
              <div key={tp.name} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <span className="font-bebas-neue text-lg text-gray-300 w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{tp.name}</p>
                  <p className="text-[10px] text-gray-500">{tp.units} units · {formatINR(tp.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Low Stock + Audit Log ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-black shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-black">
            <p className="text-xs uppercase tracking-widest font-inter font-bold">Low Stock Alerts</p>
            <Link href="/admin/inventory" className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-black">
              Inventory →
            </Link>
          </div>
          {(!lowStockVariants || lowStockVariants.length === 0) ? (
            <div className="p-6 text-center text-green-700 text-xs font-inter font-bold">
              ✓ All variants in stock
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-inter text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="p-3 font-bold">Product</th>
                    <th className="p-3 font-bold">Size</th>
                    <th className="p-3 font-bold">Color</th>
                    <th className="p-3 font-bold text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStockVariants.map((v: any) => {
                    const productName = v.products?.name || '—'
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-xs font-bold truncate max-w-[160px]">{productName}</td>
                        <td className="p-3 text-xs">{v.size}</td>
                        <td className="p-3 text-xs capitalize">{v.color}</td>
                        <td className="p-3 text-xs text-right font-bold">
                          {v.is_out_of_stock ? (
                            <span className="text-red-600">OOS</span>
                          ) : (
                            <span className={v.stock_quantity <= 2 ? 'text-red-600' : 'text-yellow-600'}>
                              {v.stock_quantity}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Log / Recent Activity */}
        <div className="bg-white border border-black shadow-sm">
          <div className="p-4 border-b border-black">
            <p className="text-xs uppercase tracking-widest font-inter font-bold">Recent Activity</p>
          </div>
          {(!auditLogs || auditLogs.length === 0) ? (
            <div className="p-6 text-center text-gray-400 text-xs font-inter">No recent activity found.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {auditLogs.map((log: any) => (
                <AuditLogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Audit log entry — rendered as a collapsible feed item.
// Since this is a server component, we use <details> for expand/collapse.
// ---------------------------------------------------------------------------

function AuditLogEntry({ log }: { log: any }) {
  const actionLabel = log.action?.toLowerCase() || ''
  const tableName = log.table_name?.replace(/_/g, ' ') || ''
  const actor = log.changed_by || 'SYSTEM'
  const time = log.timestamp ? timeAgo(log.timestamp) : ''

  // Build a human-readable label from new_values if present
  const label =
    log.new_values?.label ||
    log.new_values?.name ||
    log.new_values?.order_ref ||
    log.new_values?.action_detail ||
    ''

  // Determine if there's meaningful data to show
  const hasChangedData = log.new_values || log.old_values

  const actionColor =
    actionLabel === 'insert' ? 'text-green-700 bg-green-50' :
    actionLabel === 'delete' ? 'text-red-700 bg-red-50' :
    'text-blue-700 bg-blue-50'

  return (
    <div className="p-3">
      <div className="flex items-start gap-2">
        <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-black ${actionColor}`}>
          {actionLabel}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-inter">
            <span className="font-bold">{tableName}</span>
            {label && <span className="text-gray-500"> · {label}</span>}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {actor} · {time}
          </p>
        </div>
      </div>
      {hasChangedData && (
        <details className="mt-1.5 ml-8">
          <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            show data
          </summary>
          <pre className="mt-1 p-2 bg-gray-50 text-[10px] text-gray-600 overflow-x-auto max-h-32 border border-gray-100 font-mono leading-relaxed">
            {JSON.stringify(
              actionLabel === 'delete' ? log.old_values : log.new_values,
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  )
}
