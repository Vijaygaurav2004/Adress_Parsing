"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { History, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50/40">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Address Parser</h2>
        </div>
        <nav className="space-y-1 px-3">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === "/dashboard"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <MapPin className="h-4 w-4" />
            Parse Address
          </Link>
          <Link
            href="/dashboard/history"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              pathname === "/dashboard/history"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <History className="h-4 w-4" />
            History
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 