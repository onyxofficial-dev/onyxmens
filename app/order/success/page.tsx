'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PageTitle } from '@/components/page-title'
import { 
  Check, 
  CheckCircle2, 
  MessageCircle, 
  ShoppingCart, 
  ClipboardList, 
  ArrowRight,
  Printer,
  Download
} from 'lucide-react'

// Progress Stepper steps
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

// Helper: load image on canvas
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// Helper: generate receipt PNG blob
function generateReceiptBlob(
  orderRef: string,
  data: { paymentMethod: string; customerName: string; customerMobile: string },
  items: any[],
  total: number,
  tax: number,
  shipping: number,
  grandTotal: number,
  addressParts: string[]
): Promise<Blob | null> {
  return new Promise(async (resolve) => {
    const loadedEntries = await Promise.all(
      items.map(async (item) => {
        if (!item.image) return null
        const img = await loadImage(item.image)
        return img ? { id: item.id || item.variant_id, img } : null
      })
    )
    const imgMap = new Map<string, HTMLImageElement>()
    loadedEntries.forEach((entry) => {
      if (entry) imgMap.set(entry.id, entry.img)
    })

    let height = 50 
    height += 35 
    height += 35 
    height += 30 
    height += 25 
    height += 25 
    height += 35 
    height += 25 
    height += 30 
    
    items.forEach(() => {
      height += 65
    })
    
    height += 35 
    height += 25 
    height += 20 
    height += 20 
    addressParts.forEach(() => {
      height += 20
    })
    
    height += 35 
    height += 25 
    height += 25 
    height += 30 
    height += 35 
    height += 40 
    height += 25 
    height += 20 
    height += 50 

    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

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

    items.forEach((item) => {
      if (!ctx) return

      const img = imgMap.get(item.id || item.variant_id)
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

      ctx.textAlign = 'center'
      ctx.fillText(item.quantity.toString(), 450, y + 8)

      ctx.textAlign = 'right'
      const lineTotal = item.price * item.quantity
      ctx.fillText(`₹${lineTotal.toLocaleString('en-IN')}`, 560, y + 8)

      y += 22
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

    ctx.textAlign = 'left'
    ctx.font = 'bold 14px "Courier New", Courier, monospace'
    ctx.fillText('SHIPPING ADDRESS:', 40, y)
    y += 22

    ctx.font = '14px "Courier New", Courier, monospace'
    ctx.fillText(data.customerName.toUpperCase(), 40, y)
    y += 20
    ctx.fillText(data.customerMobile, 40, y)
    y += 20

    addressParts.forEach((part) => {
      if (!ctx) return
      ctx.fillText(part.toUpperCase(), 40, y)
      y += 20
    })

    drawLine(y, 1, true)
    y += 25

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

    ctx.textAlign = 'center'
    ctx.font = 'italic 12px "Courier New", Courier, monospace'
    ctx.fillText('THANK YOU FOR SHOPPING WITH ONYX!', 300, y)
    y += 20
    ctx.font = '11px "Courier New", Courier, monospace'
    ctx.fillText('SUPPORT: ONYXMENSOFFICIAL@GMAIL.COM · ONYX-MENSWEAR.COM', 300, y)

    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ref) {
      router.replace('/shop')
      return
    }

    const raw = sessionStorage.getItem('onyx_receipt')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        
        // Expiry check (24 hours)
        const isExpired = Date.now() - new Date(parsed.createdAt).getTime() > 24 * 60 * 60 * 1000
        if (isExpired) {
          sessionStorage.removeItem('onyx_receipt')
          setReceipt(null)
        } else if (parsed.orderRef === ref) {
          setReceipt(parsed)
        } else {
          setReceipt(null)
        }
      } catch (err) {
        console.error('Failed to parse receipt data', err)
        setReceipt(null)
      }
    } else {
      setReceipt(null)
    }
    setLoading(false)
  }, [ref, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-inter text-xs uppercase tracking-widest text-gray-500">
        Loading Receipt...
      </div>
    )
  }

  // Fallback UI (no sessionStorage data or ref mismatch)
  if (!receipt) {
    return (
      <>
        <PageTitle title="Order Confirmed" />
        <Header />
        <main className="w-full bg-neutral-50 min-h-[70vh] flex items-center py-12 px-4 md:px-6">
          <div className="max-w-md mx-auto bg-white border border-black p-8 text-center shadow-sm w-full">
            <CheckCircle2 className="w-12 h-12 text-black mx-auto mb-4" />
            <h2 className="font-bebas-neue text-3xl tracking-wider mb-2">ORDER RECEIVED</h2>
            <p className="font-inter text-xs text-gray-600 mb-6 leading-relaxed">
              Your order reference: <strong className="text-black font-bold font-mono">{ref}</strong>
            </p>
            <div className="bg-neutral-50 border border-neutral-200 p-4 text-xs font-inter text-gray-500 text-left mb-6 leading-relaxed">
              We couldn't load your full receipt in this browser session, but your order has been placed successfully in our system.<br /><br />
              Please check your WhatsApp for the order confirmation message.
            </div>
            
            <div className="space-y-3">
              <a
                href={`/orders/${ref}`}
                className="w-full bg-black text-white hover:bg-neutral-900 transition-colors p-3 font-inter font-black text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2"
              >
                Track your order
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/shop"
                className="w-full border border-black hover:bg-neutral-50 transition-colors p-3 font-inter font-bold text-xs uppercase tracking-widest inline-block"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // Full Receipt UI
  return (
    <>
      <PageTitle title="Order Confirmed" />
      <Header />
      <main className="w-full bg-neutral-50 min-h-screen py-12 px-4 md:px-6">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          
          <ProgressStepper currentStep={3} />

          {/* Direct WhatsApp Call to Action Banner */}
          <div className="w-full bg-green-500 text-white p-6 text-center border border-black mb-8 shadow-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-12 h-12 bg-white text-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
            </motion.div>
            <h2 className="font-bebas-neue text-2xl tracking-wider mb-2">LAST STEP: SEND WHATSAPP CONFIRMATION</h2>
            <p className="font-inter text-xs max-w-sm mx-auto mb-4 leading-relaxed text-green-50">
              Your order is saved as <strong>PENDING</strong>. Tap the button below to open WhatsApp, pre-fill your message, and tap <strong>Send</strong>.
            </p>
            {receipt.isSameDay && (
              <div className="bg-green-600 border border-white text-white p-3 mb-4 text-xs font-inter leading-relaxed max-w-sm mx-auto text-left shadow-sm">
                ⚡ <strong>Your order qualifies for Same Day Delivery.</strong><br />
                Our team will reach out on WhatsApp to confirm your delivery window.
              </div>
            )}
            <button
              onClick={() => {
                window.open(receipt.waLink, '_blank')
              }}
              className="bg-black text-white hover:bg-neutral-900 transition-colors px-8 py-4 font-inter font-black text-sm uppercase tracking-widest border-2 border-white inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <MessageCircle className="w-5 h-5 text-green-400 fill-green-400" />
              Open WhatsApp & Confirm
            </button>
          </div>

          {/* AESTHETIC PAPER RECEIPT */}
          <div className="w-full bg-white border border-neutral-300 p-6 md:p-8 shadow-md relative overflow-hidden font-mono text-neutral-800 text-xs">
            {/* Receipt cut edge accent lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200" />
            
            <div className="text-center mb-6">
              <h1 className="font-sans font-black text-2xl tracking-widest">O N Y X</h1>
              <p className="text-[10px] tracking-widest text-neutral-500 mt-1">✦ MENS CLOTHING ✦</p>
              <p className="text-[10px] text-neutral-400 mt-2">--------------------------------------------------</p>
            </div>

            <div className="space-y-1 mb-6 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>ORDER REF:</span>
                <span>{receipt.orderRef}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{new Date(receipt.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT:</span>
                <span>{receipt.paymentMethod === 'Prepaid' ? 'PREPAID (UPI)' : 'CASH ON DELIVERY'}</span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 mb-4">----------------- ITEM SUMMARY -----------------</p>

            {/* Items List */}
            <div className="space-y-4 mb-6">
              {receipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover border border-neutral-300 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-100 border border-neutral-300 flex-shrink-0 flex items-center justify-center text-[8px] text-neutral-400">NO IMG</div>
                    )}
                    <div>
                      <span className="font-bold">{item.name.toUpperCase()}</span>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        SIZE: {item.size || '—'} · COLOR: {item.color || '—'} · QTY: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold mt-2">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-neutral-400 mb-4">---------------- SHIPPING INFO -----------------</p>

            <div className="mb-6 text-[11px] space-y-1">
              <p className="font-bold">{receipt.customerName.toUpperCase()}</p>
              <p>{receipt.customerMobile}</p>
              {receipt.addressParts && receipt.addressParts.map((part: string, idx: number) => (
                <p key={idx}>{part.toUpperCase()}</p>
              ))}
            </div>

            <p className="text-[10px] text-neutral-400 mb-4">----------------- BILL DETAILS -----------------</p>

            <div className="space-y-2 mb-6 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span>₹{receipt.subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>SHIPPING</span>
                <span>{receipt.shipping === 0 ? 'FREE' : `₹${receipt.shipping}`}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-neutral-300 flex justify-between font-bold text-sm">
                <span>GRAND TOTAL</span>
                <span>₹{receipt.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 mb-6">--------------------------------------------------</p>

            <div className="text-center text-[10px] text-neutral-500 italic">
              <p>THANK YOU FOR SHOPPING WITH ONYX!</p>
              <p className="mt-1 font-sans font-normal not-italic text-[9px] text-neutral-400">SUPPORT: ONYXMENSOFFICIAL@GMAIL.COM · ONYX-MENSWEAR.COM</p>
            </div>

            <div className="mt-8 flex justify-center gap-4 no-print">
              <button
                onClick={() => window.print()}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-neutral-300"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={async () => {
                  try {
                    const blob = await generateReceiptBlob(
                      receipt.orderRef,
                      { paymentMethod: receipt.paymentMethod, customerName: receipt.customerName, customerMobile: receipt.customerMobile },
                      receipt.items,
                      receipt.subtotal,
                      receipt.tax || 0,
                      receipt.shipping,
                      receipt.total,
                      receipt.addressParts
                    )
                    if (blob) {
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `onyx-receipt-${receipt.orderRef}.png`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                    }
                  } catch (err) {
                    console.error('Download failed', err)
                  }
                }}
                className="bg-black text-white hover:bg-neutral-900 px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>
          </div>

          <div className="mt-8 text-center no-print space-y-4">
            <div>
              <a
                href={`/orders/${receipt.orderRef}?phone=${receipt.customerMobile}`}
                className="font-inter text-xs font-bold uppercase tracking-widest text-black hover:underline transition-all inline-flex items-center gap-1"
              >
                Track your order
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div>
              <a
                href="/shop"
                className="font-inter text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-colors"
              >
                Back to Shop
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-inter text-xs uppercase tracking-widest text-gray-500">
        Loading...
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
