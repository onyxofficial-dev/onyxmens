'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { INDIAN_STATES } from '@/lib/types'
import { submitOrder } from './actions'
import { PageTitle } from '@/components/page-title'
import { ShoppingCart, ClipboardList, MessageCircle, Check, ChevronRight, Shield, Truck, Package } from 'lucide-react'
import { checkoutFormSchema, checkoutSavedAddressSchema, orderLookupSchema } from '@/lib/validations'

// CONFIG VALUE: WhatsApp number from environment or fallback.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918758987200'

// ─── Progress Stepper ────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'YOUR CART', icon: ShoppingCart },
  { id: 2, label: 'FILL DETAILS', icon: ClipboardList },
  { id: 3, label: 'WHATSAPP CONFIRM', icon: MessageCircle },
]

function ProgressStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const StepIcon = step.icon
          const isActive = step.id === currentStep
          const isComplete = step.id < currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-11 h-11 md:w-14 md:h-14 flex items-center justify-center border-2 transition-all duration-300 ${
                    isComplete
                      ? 'bg-black border-black text-white'
                      : isActive
                        ? 'bg-black border-black text-white scale-110'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <StepIcon className={`w-5 h-5 md:w-6 md:h-6 ${step.id === 3 && isActive ? 'text-green-400' : ''}`} />
                  )}
                </motion.div>
                <p className={`mt-2 text-[10px] md:text-xs font-inter font-bold tracking-widest uppercase text-center leading-tight ${
                  isActive ? 'text-black' : isComplete ? 'text-black' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-10 md:w-20 h-[2px] mx-1 md:mx-3 mb-6 transition-colors duration-300 ${
                  step.id < currentStep ? 'bg-black' : 'bg-gray-300'
                }`}>
                  <div className={`h-full transition-all duration-500 ${
                    step.id < currentStep ? 'w-full bg-black' : 'w-0'
                  }`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Cart Summary Sidebar ────────────────────────────────────────────
function CartSummary({ items, total }: { items: any[]; total: number }) {
  const shipping = total >= 999 ? 0 : 99
  const tax = 0
  const grandTotal = total + shipping

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-50 border border-black p-6 sticky top-24"
    >
      <h3 className="font-bebas-neue font-black text-xl mb-4 flex items-center gap-2">
        <Package className="w-5 h-5" />
        ORDER SUMMARY
      </h3>
      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0">
            <div className="w-14 h-14 border border-gray-200 flex-shrink-0 bg-white">
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-xs font-bold truncate">{item.name}</p>
              <p className="font-inter text-[10px] text-gray-500">
                {item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`}
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="font-inter text-[10px] text-gray-500">Qty: {item.quantity}</span>
                <span className="font-inter text-xs font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-3 space-y-2">
        <div className="flex justify-between text-xs font-inter">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold">₹{total.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-xs font-inter">
          <span className="text-gray-500">Shipping</span>
          <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>
        <div className="border-t border-black pt-2 mt-2 flex justify-between">
          <span className="font-bebas-neue text-lg font-black">TOTAL</span>
          <span className="font-bebas-neue text-lg font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-inter text-gray-500">
          <Shield className="w-3 h-3 flex-shrink-0" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-inter text-gray-500">
          <Truck className="w-3 h-3 flex-shrink-0" />
          <span>{shipping === 0 ? 'Free Delivery' : 'Fast Delivery'}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Mobile Cart Strip (visible on mobile, fixed at top of form) ─────
function MobileCartStrip({ items, total }: { items: any[]; total: number }) {
  const [expanded, setExpanded] = useState(false)
  const shipping = total >= 999 ? 0 : 99
  const tax = 0
  const grandTotal = total + shipping

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-gray-50 border border-black p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span className="font-inter text-xs font-bold uppercase tracking-widest">
            {items.length} {items.length === 1 ? 'item' : 'items'} in cart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bebas-neue text-lg font-black">₹{grandTotal.toLocaleString('en-IN')}</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border border-t-0 border-black bg-gray-50"
          >
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-gray-200 flex-shrink-0 bg-white">
                    <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs font-bold truncate">{item.name}</p>
                    <p className="font-inter text-[10px] text-gray-500">
                      {item.size} · {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-inter text-xs font-bold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-300 space-y-1">
                <div className="flex justify-between text-[10px] font-inter text-gray-500">
                  <span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-[10px] font-inter text-gray-500">
                  <span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// RECEIPT GENERATOR (CANVAS API)
// ═══════════════════════════════════════════════════════════════════════

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function generateReceiptBlob(
  orderRef: string,
  data: any,
  items: any[],
  total: number,
  tax: number,
  shipping: number,
  grandTotal: number,
  addressParts: string[]
): Promise<Blob | null> {
  return new Promise(async (resolve) => {
    // 1. Preload all product images
    const loadedEntries = await Promise.all(
      items.map(async (item) => {
        if (!item.image) return null
        const img = await loadImage(item.image)
        return img ? { id: item.id, img } : null
      })
    )
    const imgMap = new Map<string, HTMLImageElement>()
    loadedEntries.forEach((entry) => {
      if (entry) imgMap.set(entry.id, entry.img)
    })

    // 2. Calculate dynamic height
    let height = 50 // starting top margin
    height += 35 // ONYX title
    height += 35 // Subtitle & divider
    height += 30 // ORDER REF
    height += 25 // Date
    height += 25 // Payment method
    height += 35 // Divider line
    height += 25 // TABLE HEADER: ITEM, QTY, PRICE
    height += 30 // Divider line
    
    // Each item takes 65px (room for 50px image + size/color metadata)
    items.forEach(() => {
      height += 65
    })
    
    height += 35 // Divider line
    height += 25 // SHIPPING ADDRESS:
    height += 20 // Name
    height += 20 // Mobile
    addressParts.forEach(() => {
      height += 20
    })
    
    height += 35 // Divider line
    height += 25 // Subtotal

    height += 25 // Shipping
    height += 30 // Divider line
    height += 35 // GRAND TOTAL
    height += 40 // Thick divider
    height += 25 // Thank you
    height += 20 // Support info
    height += 50 // Bottom margin

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }

    // Fill white
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Solid border around receipt
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 6
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30)

    function drawLine(lineY: number, width = 1, isDashed = false) {
      if (!ctx) return
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = width
      if (isDashed) {
        ctx.setLineDash([6, 6])
      } else {
        ctx.setLineDash([])
      }
      ctx.beginPath()
      ctx.moveTo(40, lineY)
      ctx.lineTo(560, lineY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    let y = 65

    // Brand Header
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'center'
    ctx.font = 'bold 36px "Courier New", Courier, monospace'
    ctx.fillText('O N Y X', 300, y)
    y += 28

    ctx.font = '12px "Courier New", Courier, monospace'
    ctx.fillText('✦ MENS CLOTHING ✦', 300, y)
    y += 25

    drawLine(y, 2, false)
    y += 30

    // Metadata
    ctx.textAlign = 'left'
    ctx.font = 'bold 14px "Courier New", Courier, monospace'
    ctx.fillText(`ORDER REF: ${orderRef}`, 40, y)
    y += 25
    
    ctx.font = '14px "Courier New", Courier, monospace'
    ctx.fillText(`DATE: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}`, 40, y)
    y += 25

    ctx.fillText(`PAYMENT: ${data.paymentMethod === 'Prepaid' ? 'PREPAID (UPI)' : 'CASH ON DELIVERY (COD)'}`, 40, y)
    y += 20

    drawLine(y, 1, true)
    y += 25

    // Table Header
    ctx.font = 'bold 14px "Courier New", Courier, monospace'
    ctx.textAlign = 'left'
    ctx.fillText('ITEM DESCRIPTION', 105, y)
    ctx.textAlign = 'center'
    ctx.fillText('QTY', 450, y)
    ctx.textAlign = 'right'
    ctx.fillText('PRICE', 560, y)
    y += 15

    drawLine(y, 1, false)
    y += 25

    // Items
    ctx.font = '14px "Courier New", Courier, monospace'
    items.forEach((item) => {
      if (!ctx) return

      // Draw thumbnail image if available
      const img = imgMap.get(item.id)
      if (img) {
        ctx.drawImage(img, 40, y - 10, 50, 50)
      } else {
        ctx.strokeStyle = '#CCCCCC'
        ctx.lineWidth = 1
        ctx.strokeRect(40, y - 10, 50, 50)
        ctx.fillStyle = '#999999'
        ctx.font = '8px "Courier New", Courier, monospace'
        ctx.textAlign = 'center'
        ctx.fillText('NO IMG', 65, y + 18)
        ctx.fillStyle = '#000000'
        ctx.font = '14px "Courier New", Courier, monospace'
      }

      ctx.textAlign = 'left'
      ctx.font = 'bold 14px "Courier New", Courier, monospace'
      const name = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name.toUpperCase()
      ctx.fillText(name, 105, y + 8)

      // Qty
      ctx.textAlign = 'center'
      ctx.fillText(item.quantity.toString(), 450, y + 8)

      // Price
      ctx.textAlign = 'right'
      const lineTotal = item.price * item.quantity
      ctx.fillText(`₹${lineTotal.toLocaleString('en-IN')}`, 560, y + 8)

      y += 22
      // Subtext size/color
      ctx.textAlign = 'left'
      ctx.fillStyle = '#666666'
      ctx.font = '12px "Courier New", Courier, monospace'
      ctx.fillText(`SIZE: ${item.size || '—'} · COLOR: ${item.color || '—'}`, 105, y + 4)
      ctx.fillStyle = '#000000'
      ctx.font = '14px "Courier New", Courier, monospace'

      y += 43
    })

    drawLine(y - 8, 1, true)
    y += 20

    // Shipping Address
    ctx.textAlign = 'left'
    ctx.font = 'bold 14px "Courier New", Courier, monospace'
    ctx.fillText('SHIPPING ADDRESS:', 40, y)
    y += 22

    ctx.font = '14px "Courier New", Courier, monospace'
    ctx.fillText(data.fullName.toUpperCase(), 40, y)
    y += 20
    ctx.fillText(data.mobile, 40, y)
    y += 20

    addressParts.forEach((part) => {
      if (!ctx) return
      ctx.fillText(part.toUpperCase(), 40, y)
      y += 20
    })

    drawLine(y, 1, true)
    y += 25

    // Bill Summary
    ctx.textAlign = 'left'
    ctx.fillText('SUBTOTAL', 40, y)
    ctx.textAlign = 'right'
    ctx.fillText(`₹${total.toLocaleString('en-IN')}`, 560, y)
    y += 25



    ctx.textAlign = 'left'
    ctx.fillText('SHIPPING', 40, y)
    ctx.textAlign = 'right'
    ctx.fillText(shipping === 0 ? 'FREE' : `₹${shipping}`, 560, y)
    y += 20

    drawLine(y, 1, false)
    y += 25

    ctx.font = 'bold 16px "Courier New", Courier, monospace'
    ctx.textAlign = 'left'
    ctx.fillText('GRAND TOTAL', 40, y)
    ctx.textAlign = 'right'
    ctx.fillText(`₹${grandTotal.toLocaleString('en-IN')}`, 560, y)
    y += 25

    drawLine(y, 2, false)
    y += 30

    // Footer Thank you
    ctx.textAlign = 'center'
    ctx.font = 'italic 12px "Courier New", Courier, monospace'
    ctx.fillText('THANK YOU FOR SHOPPING WITH ONYX!', 300, y)
    y += 20
    ctx.font = '11px "Courier New", Courier, monospace'
    ctx.fillText('SUPPORT: SUPPORT@ONYX.COM · ONYX-MENSWEAR.COM', 300, y)

    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ORDER PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function OrderPage() {
  const router = useRouter()
  const { items, total, clearCart, validateCartStock } = useCart()

  useEffect(() => {
    validateCartStock()
  }, [])

  const shipping = total >= 999 ? 0 : 99
  const tax = 0
  const grandTotal = total + shipping

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [cityVal, setCityVal] = useState('')
  const [paymentMethodVal, setPaymentMethodVal] = useState('')
  const [upiTxnId, setUpiTxnId] = useState('')

  const [mobileNum, setMobileNum] = useState('')
  const [savedAddressMask, setSavedAddressMask] = useState<string | null>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleBlur = (fieldName: string, value: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    let valToValidate = value
    if (fieldName === 'mobile' || fieldName === 'pincode') {
      valToValidate = value.replace(/\D/g, '')
      if (fieldName === 'mobile') setMobileNum(valToValidate)
    }

    const schema = useSavedAddress ? checkoutSavedAddressSchema : checkoutFormSchema
    const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape]
    if (fieldSchema) {
      const result = fieldSchema.safeParse(valToValidate)
      if (!result.success) {
        setErrors(prev => ({ ...prev, [fieldName]: result.error.issues[0].message }))
      } else {
        setErrors(prev => ({ ...prev, [fieldName]: undefined }))
      }
    }
  }

  const handleChange = (fieldName: string, value: string) => {
    if (fieldName === 'city') {
      setCityVal(value)
    }
    if (fieldName === 'mobile') {
      setMobileNum(value)
    }
    if (fieldName === 'paymentMethod') {
      setPaymentMethodVal(value)
    }

    if (errors[fieldName]) {
      const schema = useSavedAddress ? checkoutSavedAddressSchema : checkoutFormSchema
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape]
      if (fieldSchema) {
        let valToValidate = value
        if (fieldName === 'mobile' || fieldName === 'pincode') {
          valToValidate = value.replace(/\D/g, '')
        }
        const result = fieldSchema.safeParse(valToValidate)
        if (result.success) {
          setErrors(prev => ({ ...prev, [fieldName]: undefined }))
        } else {
          setErrors(prev => ({ ...prev, [fieldName]: result.error.issues[0].message }))
        }
      }
    }
  }

  const currentStep = 2

  const handleMobileBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const rawVal = e.target.value
    const val = rawVal.replace(/\D/g, '')
    
    setMobileNum(val)
    e.target.value = val

    handleBlur('mobile', val)

    const parsed = orderLookupSchema.safeParse({ mobile: val })
    if (parsed.success) {
      setIsLookingUp(true)
      setSavedAddressMask(null)
      setUseSavedAddress(false)
      try {
        const res = await fetch(`/api/lookup?mobile=${val}`)
        if (res.ok) {
          const data = await res.json()
          if (data.found && data.maskedIdentifier) {
            setSavedAddressMask(data.maskedIdentifier)
          }
        }
      } catch (err) {
        console.error('Lookup failed', err)
      } finally {
        setIsLookingUp(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    const formData = new FormData(e.currentTarget)
    let notes = formData.get('notes') as string
    const upiId = formData.get('upiTxnId') as string
    if (paymentMethodVal === 'Prepaid' && upiId?.trim()) {
      const upiLine = `UPI Transaction ID: ${upiId.trim()}`
      notes = notes ? `${notes}\n${upiLine}` : upiLine
    }

    const data = {
      fullName: formData.get('fullName') as string,
      mobile: formData.get('mobile') as string,
      email: formData.get('email') as string,
      addressLine1: formData.get('addressLine1') as string,
      addressLine2: formData.get('addressLine2') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pincode: formData.get('pincode') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      notes: notes || null,
      useSavedAddress
    }

    const schema = useSavedAddress ? checkoutSavedAddressSchema : checkoutFormSchema
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string | undefined> = {}
      parsed.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (!fieldErrors[path]) {
          fieldErrors[path] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsSubmitting(false)

      const firstErrorField = Object.keys(fieldErrors)[0]
      if (firstErrorField) {
        const element = e.currentTarget.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    const validatedData = parsed.data

    try {
      const submitData = {
        ...validatedData,
        useSavedAddress
      }
      const res = await submitOrder(submitData, items, total, items.length)
      if (!res.success) {
        if (res.errors) {
          setErrors(res.errors as Record<string, string>)
        } else if (res.error) {
          setErrorMsg(res.error)
        } else {
          setErrorMsg('An unknown error occurred.')
        }
        setIsSubmitting(false)
        return
      }

      const { orderRef, finalAddress, isSameDay, waLink } = res

      const addressParts = finalAddress ? [
        finalAddress.address_line1,
        finalAddress.address_line2,
        `${finalAddress.city}, ${finalAddress.state}`,
        `PIN: ${finalAddress.pincode}`
      ].filter(Boolean) : []

      // Store full receipt details in sessionStorage for the success page
      const receiptData = {
        orderRef,
        customerName: data.fullName,
        customerMobile: data.mobile,
        items: [...items],
        subtotal: total,
        tax: 0,
        shipping,
        total: grandTotal,
        paymentMethod: data.paymentMethod,
        isSameDay,
        waLink,
        createdAt: new Date().toISOString(),
        addressParts
      }

      sessionStorage.setItem('onyx_receipt', JSON.stringify(receiptData))
      clearCart()

      // Direct WhatsApp redirect in new tab
      window.open(waLink, '_blank')
      
      // Navigate to dedicated success page
      router.push(`/order/success?ref=${orderRef}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Main Form ──────────────────────────────────────────────────
  return (
    <>
      <PageTitle title="Checkout" />
      <Header />
      <main className="w-full bg-white px-4 md:px-8 lg:px-16 py-8 md:py-12">
        {/* Stepper */}
        <ProgressStepper currentStep={currentStep} />

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="font-inter text-sm text-gray-500">Your cart is empty.</p>
            <a href="/shop" className="inline-block mt-4 font-inter text-xs font-bold uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-colors">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* ── Left: Form ────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Mobile cart strip (hidden on lg+) */}
              <MobileCartStrip items={items} total={total} />

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-black"
              >
                {/* Form header */}
                <div className="bg-black text-white px-6 py-4">
                  <h1 className="font-bebas-neue font-black text-2xl tracking-wider">SHIPPING & PAYMENT</h1>
                  <p className="font-inter text-xs text-gray-400 mt-1">Fill in your details to complete the order</p>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 text-sm font-inter border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {/* ── Contact Info ───────────────── */}
                  <div className="space-y-4">
                    <h2 className="font-bebas-neue font-black text-xl flex items-center gap-2">
                      <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-inter">1</span>
                      CONTACT INFO
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Full Name *</label>
                        <input 
                          name="fullName" 
                          type="text" 
                          placeholder="John Doe" 
                          onBlur={(e) => handleBlur('fullName', e.target.value)}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.fullName ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                        />
                        {errors.fullName && <p className="text-xs text-red-600 mt-1 font-inter">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Mobile Number *</label>
                        <input
                          name="mobile"
                          type="tel"
                          inputMode="numeric"
                          placeholder="9876543210"
                          value={mobileNum}
                          onChange={(e) => handleChange('mobile', e.target.value)}
                          onBlur={handleMobileBlur}
                          className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.mobile ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`}
                        />
                        {errors.mobile && <p className="text-xs text-red-600 mt-1 font-inter">{errors.mobile}</p>}
                        {isLookingUp && <p className="text-xs text-gray-500 mt-1 font-inter animate-pulse">Looking up...</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Email <span className="font-normal text-gray-400">(optional)</span></label>
                      <input 
                        name="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        onBlur={(e) => handleBlur('email', e.target.value)}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.email ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                      />
                      {errors.email && <p className="text-xs text-red-600 mt-1 font-inter">{errors.email}</p>}
                    </div>
                  </div>

                  {/* ── Shipping Address ───────────── */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h2 className="font-bebas-neue font-black text-xl flex items-center gap-2">
                      <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-inter">2</span>
                      SHIPPING ADDRESS
                    </h2>

                    {savedAddressMask && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 p-4 mb-4"
                      >
                        <p className="text-sm font-inter mb-2">
                          ✅ Found a saved address ending in <strong>{savedAddressMask}</strong>.
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-inter font-bold">
                          <input
                            type="checkbox"
                            checked={useSavedAddress}
                            onChange={(e) => setUseSavedAddress(e.target.checked)}
                            className="accent-black w-4 h-4"
                          />
                          Use this saved address
                        </label>
                      </motion.div>
                    )}

                    {!useSavedAddress && (
                      <>
                        <div>
                          <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Address Line 1 *</label>
                          <input 
                            name="addressLine1" 
                            type="text" 
                            placeholder="Building, Street" 
                            onBlur={(e) => handleBlur('addressLine1', e.target.value)}
                            onChange={(e) => handleChange('addressLine1', e.target.value)}
                            className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.addressLine1 ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                          />
                          {errors.addressLine1 && <p className="text-xs text-red-600 mt-1 font-inter">{errors.addressLine1}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Address Line 2</label>
                          <input 
                            name="addressLine2" 
                            type="text" 
                            placeholder="Landmark, Area" 
                            onBlur={(e) => handleBlur('addressLine2', e.target.value)}
                            onChange={(e) => handleChange('addressLine2', e.target.value)}
                            className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.addressLine2 ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                          />
                          {errors.addressLine2 && <p className="text-xs text-red-600 mt-1 font-inter">{errors.addressLine2}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">City *</label>
                            <input 
                              name="city" 
                              type="text" 
                              placeholder="Mumbai" 
                              value={cityVal}
                              onChange={(e) => handleChange('city', e.target.value)}
                              onBlur={(e) => handleBlur('city', e.target.value)}
                              className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.city ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                            />
                            {errors.city && <p className="text-xs text-red-600 mt-1 font-inter">{errors.city}</p>}
                            {cityVal.trim().toLowerCase() === 'jamnagar' && (
                              <div className="mt-2 p-3 bg-neutral-50 border border-black text-black text-[11px] font-inter leading-relaxed">
                                ⚡ <strong>Same Day Delivery available!</strong><br />
                                Orders placed before 2:00 PM are delivered today within Jamnagar city.
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">State *</label>
                            <select 
                              name="state" 
                              onBlur={(e) => handleBlur('state', e.target.value)}
                              onChange={(e) => handleChange('state', e.target.value)}
                              className={`w-full border p-3 text-sm font-inter bg-white focus:ring-2 focus:ring-black focus:outline-none ${errors.state ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`}
                            >
                              <option value="">Select State</option>
                              {INDIAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                            {errors.state && <p className="text-xs text-red-600 mt-1 font-inter">{errors.state}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">Pincode *</label>
                            <input 
                              name="pincode" 
                              type="text" 
                              inputMode="numeric"
                              placeholder="400001" 
                              onBlur={(e) => {
                                const val = e.target.value.replace(/\D/g, '')
                                e.target.value = val
                                handleBlur('pincode', val)
                              }}
                              onChange={(e) => handleChange('pincode', e.target.value)}
                              className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.pincode ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
                            />
                            {errors.pincode && <p className="text-xs text-red-600 mt-1 font-inter">{errors.pincode}</p>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── Payment Method ─────────────── */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h2 className="font-bebas-neue font-black text-xl flex items-center gap-2">
                      <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-inter">3</span>
                      PAYMENT METHOD
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer border border-black p-4 hover:bg-gray-50 transition-colors has-[:checked]:bg-black has-[:checked]:text-white">
                        <input type="radio" name="paymentMethod" value="Cash on Delivery" onChange={(e) => handleChange('paymentMethod', e.target.value)} className="accent-black w-4 h-4" />
                        <div>
                          <span className="text-sm font-inter font-bold">💵 Cash on Delivery</span>
                          <p className="text-[10px] font-inter opacity-60 mt-0.5">Pay when you receive</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer border border-black p-4 hover:bg-gray-50 transition-colors has-[:checked]:bg-black has-[:checked]:text-white">
                        <input type="radio" name="paymentMethod" value="Prepaid" onChange={(e) => handleChange('paymentMethod', e.target.value)} className="accent-black w-4 h-4" />
                        <div>
                          <span className="text-sm font-inter font-bold">💳 Prepaid (UPI)</span>
                          <p className="text-[10px] font-inter opacity-60 mt-0.5">UPI / Bank Transfer</p>
                        </div>
                      </label>
                    </div>

                    {paymentMethodVal === 'Prepaid' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <label className="block text-xs font-bold font-inter mb-1 uppercase tracking-wider">UPI Transaction ID (Optional)</label>
                        <input
                          name="upiTxnId"
                          type="text"
                          placeholder="e.g. 412345678901"
                          value={upiTxnId}
                          onChange={(e) => setUpiTxnId(e.target.value)}
                          className="w-full border border-black p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </motion.div>
                    )}

                    {errors.paymentMethod && <p className="text-xs text-red-600 mt-1 font-inter">{errors.paymentMethod}</p>}
                  </div>

                  {/* ── Notes ─────────────────────── */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h2 className="font-bebas-neue font-black text-xl">ADDITIONAL NOTES</h2>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Any special instructions for your order..."
                      onBlur={(e) => handleBlur('notes', e.target.value)}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className={`w-full border p-3 text-sm font-inter focus:ring-2 focus:ring-black focus:outline-none ${errors.notes ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`}
                    />
                    {errors.notes && <p className="text-xs text-red-600 mt-1 font-inter">{errors.notes}</p>}
                  </div>

                  {/* ── Submit ─────────────────────── */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-600 text-white p-4 font-bebas-neue font-black text-xl hover:bg-green-700 border-2 border-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {isSubmitting ? 'PROCESSING...' : 'PLACE ORDER VIA WHATSAPP'}
                    </button>
                    <p className="text-center text-[10px] font-inter text-gray-400 mt-2">
                      Your order will be saved and a WhatsApp message will open for confirmation
                    </p>
                  </div>
                </div>
              </motion.form>
            </div>

            {/* ── Right: Cart Summary (desktop only) ────────── */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <CartSummary items={items} total={total} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
