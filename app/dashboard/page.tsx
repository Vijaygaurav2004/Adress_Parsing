"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AddressForm from "@/components/AddressForm"
import ParsedAddressDetails from "@/components/ParsedAddressDetails"
import type { ParsedAddress } from "@/types"
import { auth } from "@/lib/firebase"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [parsedAddresses, setParsedAddresses] = useState<ParsedAddress[]>([])
  const [currentParsedAddress, setCurrentParsedAddress] = useState<ParsedAddress | null>(null)
  const [showParsedDetails, setShowParsedDetails] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleAddressParsed = (parsedAddress: ParsedAddress) => {
    setParsedAddresses([...parsedAddresses, parsedAddress])
    setCurrentParsedAddress(parsedAddress)
    setShowParsedDetails(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Address Parser Dashboard
          </h1>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-black/90"
          >
            Sign Out
          </button>
        </div>

        {showParsedDetails && currentParsedAddress ? (
          <ParsedAddressDetails 
            parsedAddress={currentParsedAddress}
            onBack={() => setShowParsedDetails(false)}
          />
        ) : (
          <AddressForm onAddressParsed={handleAddressParsed} />
        )}
      </div>
    </main>
  )
} 