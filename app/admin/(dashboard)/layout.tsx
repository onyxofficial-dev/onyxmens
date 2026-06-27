'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('onyxmensofficial@gmail.com')

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-inter">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-black text-white p-4 md:p-6 flex flex-col md:min-h-screen">
        <div className="flex md:block justify-between items-center mb-4 md:mb-12">
          <div>
            <Link href="/">
              <h1 className="font-bebas-neue text-3xl md:text-4xl tracking-widest text-white hover:opacity-80 transition-opacity">ONYX<span className="text-red-500">.</span></h1>
            </Link>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-inter tracking-widest uppercase">Admin Portal</p>
          </div>
          
          <div className="md:hidden text-right">
            <p className="text-[10px] text-gray-400">Logged in</p>
            <button 
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 font-bold block"
            >
              Logout
            </button>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-row flex-wrap gap-4 md:flex-col md:gap-0 md:space-y-4 border-t border-b md:border-none border-gray-800 py-3 md:py-0 mb-4 md:mb-0">
          <Link href="/admin" className="block text-xs md:text-sm font-bold opacity-80 hover:opacity-100 uppercase tracking-widest">Dashboard</Link>
          <Link href="/admin/orders" className="block text-xs md:text-sm font-bold opacity-80 hover:opacity-100 uppercase tracking-widest">Orders</Link>
          <Link href="/admin/products" className="block text-xs md:text-sm font-bold opacity-80 hover:opacity-100 uppercase tracking-widest">Products</Link>
          <Link href="/admin/inventory" className="block text-xs md:text-sm font-bold opacity-80 hover:opacity-100 uppercase tracking-widest">Inventory</Link>
        </nav>
        
        <div className="hidden md:block mt-auto border-t border-gray-800 pt-6">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-bold truncate">{userEmail}</p>
          <button 
            onClick={handleLogout}
            className="text-xs uppercase tracking-widest text-red-400 hover:text-red-300 mt-4 font-bold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
