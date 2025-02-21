"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { ParsedAddress } from "@/types"
import { useRouter } from "next/navigation"
import ParsedAddressDetails from "@/components/ParsedAddressDetails"

interface ParsedAddressClientProps {
  id: string
}

export default function ParsedAddressClient({ id }: ParsedAddressClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [parsedAddress, setParsedAddress] = useState<ParsedAddress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAddress() {
      if (!user) return

      try {
        const docRef = doc(db, "addressHistory", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setParsedAddress({
            ...docSnap.data(),
            id: docSnap.id
          } as ParsedAddress)
        } else {
          setError("Address not found")
        }
      } catch (error) {
        console.error("Error fetching address:", error)
        setError("Failed to load address details")
      } finally {
        setLoading(false)
      }
    }

    fetchAddress()
  }, [id, user])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !parsedAddress) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <ParsedAddressDetails
        parsedAddress={parsedAddress}
        onBack={() => router.push("/dashboard")}
      />
    </div>
  )
} 