'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Truck, Package } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { orderStatusSchema } from '@/lib/validations'
import { PageTitle } from '@/components/page-title'

const STATUS_STEPS = [
  { status: 'confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

interface OrderData {
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  estimated_delivery_date: string | null
  tracking_number: string | null
  items: Array<{
    product_name: string
    size: string
    quantity: number
    price_inr: number
  }>
  total_inr: number
  shipping_address: {
    first_name: string
    address_line_1: string
    city: string
    state: string
    pincode: string
  }
}

export default function OrderStatusPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.orderId
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!phone) {
      setError('Phone number is required to view order status.')
      setLoading(false)
      return
    }

    const parsed = orderStatusSchema.safeParse({ phone })
    if (!parsed.success) {
      setError('Invalid phone number. Please check your order confirmation message.')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'X-Guest-Phone': parsed.data.phone,
          },
        })

        if (!res.ok) {
          setError('Order not found. Please check your order ID and phone number.')
          setLoading(false)
          return
        }

        const data = await res.json()
        setOrder(data)
      } catch (err) {
        setError('Failed to load order. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, phone])

  if (loading) {
    return (
      <>
        <PageTitle title="Order Status" />
        <Header />
        <main className="w-full bg-white min-h-96 flex items-center justify-center">
          <p className="text-sm font-inter">Loading order...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <PageTitle title="Order Status" />
        <Header />
        <main className="w-full bg-white min-h-96 flex items-center justify-center px-8">
          <div className="text-center">
            <h1 className="font-bebas-neue text-2xl font-black uppercase mb-4">Order Not Found</h1>
            <p className="text-sm font-inter opacity-60 mb-6">{error}</p>
            <a href="/new-drops" className="text-xs uppercase tracking-widest font-inter hover:underline">
              Back to shopping
            </a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status)

  return (
    <>
      <PageTitle title="Order Status" />
      <Header />

      <main className="w-full bg-white">
        {/* Order Header */}
        <section className="w-full px-8 py-12 border-b border-black">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-3xl font-black uppercase mb-2">Order {order.order_number}</h1>
            <p className="text-sm font-inter opacity-60">
              Ordered on {new Date(order.created_at).toLocaleDateString('en-IN')}
            </p>
          </motion.div>
        </section>

        {/* Status Timeline */}
        <section className="w-full px-8 py-12 border-b border-black">
          <h2 className="font-bebas-neue text-lg font-black uppercase mb-8">Order Status</h2>
          <div className="flex items-center gap-4">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex

              return (
                <motion.div
                  key={step.status}
                  className="flex items-center flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-xs uppercase tracking-widest font-inter mt-2 text-center ${isActive ? '' : 'opacity-40'}`}>
                      {step.label}
                    </p>
                  </div>

                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${isActive ? 'bg-black' : 'bg-gray-300'}`} />
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Order Details */}
        <div className="grid md:grid-cols-3 gap-8 w-full px-8 py-12">
          {/* Items */}
          <motion.div
            className="md:col-span-2 border-b md:border-b-0 md:border-r border-black pb-8 md:pr-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bebas-neue text-lg font-black uppercase mb-6">Order Items</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-inter font-bold">{item.product_name}</p>
                  <p className="text-xs font-inter opacity-60">
                    Size {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-inter font-bold">₹{item.price_inr}</p>
              </div>
            ))}
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-bebas-neue text-lg font-black uppercase mb-6">Summary</h3>
            <div className="space-y-3 text-sm font-inter mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.total_inr}</span>
              </div>
              {order.estimated_delivery_date && (
                <div className="flex justify-between text-xs opacity-60">
                  <span>Est. Delivery</span>
                  <span>{new Date(order.estimated_delivery_date).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              {order.tracking_number && (
                <div className="flex justify-between text-xs opacity-60">
                  <span>Tracking</span>
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              )}
            </div>

            <div className="border-t border-black pt-4">
              <div className="flex justify-between font-bebas-neue text-lg font-black uppercase">
                <span>Total</span>
                <span>₹{order.total_inr}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-8 pt-8 border-t border-black">
              <h4 className="text-xs uppercase tracking-widest font-inter font-bold mb-3">Shipping Address</h4>
              <p className="text-xs font-inter opacity-80">
                {order.shipping_address.first_name}
                <br />
                {order.shipping_address.address_line_1}
                <br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  )
}
