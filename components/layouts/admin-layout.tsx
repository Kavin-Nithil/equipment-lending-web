"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_role")
    router.push("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} border-r border-border bg-background transition-all duration-300`}
      >
        <div className="p-4 border-b border-border">
          <Link href="/admin/dashboard" className="text-2xl font-bold text-primary flex items-center gap-2">
            <span>⚙️</span>
            {sidebarOpen && "SchoolEquip"}
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition"
          >
            <span>📊</span>
            {sidebarOpen && "Dashboard"}
          </Link>
          <Link
            href="/admin/requests"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition"
          >
            <span>✅</span>
            {sidebarOpen && "Requests"}
          </Link>
          <Link
            href="/admin/equipment"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition"
          >
            <span>📦</span>
            {sidebarOpen && "Equipment"}
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg bg-red-600/10 text-red-600 font-medium hover:bg-red-600/20 transition border border-red-600/20"
          >
            {sidebarOpen ? "Logout" : "🚪"}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
