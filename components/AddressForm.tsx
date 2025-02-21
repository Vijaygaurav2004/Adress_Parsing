import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseAddress } from "@/utils/addressParser"
import type { ParsedAddress } from "@/types"
import Map from "./Map"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface AddressFormProps {
  onAddressParsed?: (parsedAddress: ParsedAddress) => void
}

export default function AddressForm({ onAddressParsed }: AddressFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [address, setAddress] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const parsedAddress = parseAddress(
        Number.parseFloat(latitude), 
        Number.parseFloat(longitude), 
        address
      )

      // Add to Firebase with Timestamp
      const docRef = await addDoc(collection(db, "addressHistory"), {
        ...parsedAddress,
        userId: user?.uid,
        timestamp: Timestamp.now(),
        latitude,
        longitude,
        original: address
      })

      // Call the callback if provided
      if (onAddressParsed) {
        onAddressParsed(parsedAddress)
      } else {
        // Redirect to parsed address page only if no callback provided
        router.push(`/dashboard/parsed-address/${docRef.id}`)
      }
    } catch (error) {
      const err = error as Error
      console.error("Error saving address:", err)
      setError(err.message || "Failed to save address. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enter Address</h2>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
            <Input 
              id="address" 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              className="mt-1 bg-blue-50/50 border-gray-200" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="latitude" className="text-sm font-medium text-gray-700">Latitude</Label>
            <Input 
              id="latitude" 
              type="text" 
              value={latitude} 
              onChange={(e) => setLatitude(e.target.value)} 
              className="mt-1 bg-blue-50/50 border-gray-200" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="longitude" className="text-sm font-medium text-gray-700">Longitude</Label>
            <Input 
              id="longitude" 
              type="text" 
              value={longitude} 
              onChange={(e) => setLongitude(e.target.value)} 
              className="mt-1 bg-blue-50/50 border-gray-200" 
              required 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-black/90"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              'Parse Address'
            )}
          </Button>
        </form>
      </div>
      <div className="h-[400px]">
        <Map 
          latitude={latitude ? Number(latitude) : undefined}
          longitude={longitude ? Number(longitude) : undefined}
        />
      </div>
    </div>
  )
}

