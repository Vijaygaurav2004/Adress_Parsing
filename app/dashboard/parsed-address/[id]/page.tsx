"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { ParsedAddress } from "@/types"
import ParsedAddressDetails from "@/components/ParsedAddressDetails"

export default function ParsedAddressPage() {
  const { id } = useParams()
  const [address, setAddress] = useState<ParsedAddress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAddress() {
      try {
        const docRef = doc(db, "addressHistory", id as string)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setAddress(docSnap.data() as ParsedAddress)
        }
      } catch (error) {
        console.error("Error fetching address:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAddress()
  }, [id])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!address) {
    return <div>Address not found</div>
  }

  return (
    <div className="p-8">
      <ParsedAddressDetails 
        parsedAddress={address}
        onBack={() => window.history.back()}
      />
    </div>
  )
} 