"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, Timestamp, deleteDoc, doc } from "firebase/firestore"
import type { ParsedAddress } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, AlertTriangle } from "lucide-react"

export default function History() {
  const { user } = useAuth()
  const [addressHistory, setAddressHistory] = useState<ParsedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchHistory = async () => {
    if (!user) return

    try {
      const addressRef = collection(db, "addressHistory")
      const q = query(
        addressRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      )

      const querySnapshot = await getDocs(q)
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          societyName: data.societyName,
          block: data.block,
          flat: data.flat,
          id: doc.id,
          timestamp: data.timestamp instanceof Timestamp 
            ? data.timestamp.toDate().toISOString()
            : data.timestamp,
          latitude: data.latitude,
          longitude: data.longitude,
          original: data.original,
          proximityNote: data.proximityNote
        } as ParsedAddress
      })

      setAddressHistory(history)
      setError(null)
    } catch (error: any) {
      console.error("Error fetching history:", error)
      if (error.message.includes("requires an index")) {
        setError("Database is being optimized. Please wait a few minutes and refresh the page.")
      } else {
        setError("Failed to load address history. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  const handleDeleteAll = async () => {
    if (!user) return
    setDeleteLoading(true)
    try {
      const q = query(
        collection(db, "addressHistory"),
        where("userId", "==", user.uid)
      )
      const querySnapshot = await getDocs(q)
      
      await Promise.all(
        querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      )
      
      setAddressHistory([])
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error("Error deleting addresses:", error)
      setError("Failed to delete addresses. Please try again.")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">History</h1>
          <p className="text-gray-600 text-lg">All previous addresses are listed here</p>
        </div>
        {addressHistory.length > 0 && !showDeleteConfirm && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete All
          </Button>
        )}
      </div>

      {showDeleteConfirm && (
        <Card className="mb-8 p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Delete All Addresses?</h3>
              <p className="text-red-700 mb-4">This action cannot be undone. All addresses will be permanently deleted.</p>
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAll}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete All"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {addressHistory.length === 0 ? (
        <div className="text-gray-500">No addresses found in history.</div>
      ) : (
        <div className="space-y-8">
          {addressHistory.map((address) => (
            <Link 
              key={address.id} 
              href={`/dashboard/parsed-address/${address.id}`}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                {/* Location Header */}
                <div className="bg-[#E0F2F1] p-6">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">Lat: {address.latitude}, Long: {address.longitude}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Society: {address.original}</span>
                    </div>
                  </div>
                </div>

                {/* Address Details */}
                <div className="p-8 bg-[#F8FDFF]">
                  <div className="grid grid-cols-3 gap-10">
                    <div className="space-y-3">
                      <h3 className="text-gray-600 uppercase text-sm">FLAT NUMBER</h3>
                      <div className="border p-4 bg-white rounded-lg">
                        {address.flat || "Not detected"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-gray-600 uppercase text-sm">BLOCK NAME</h3>
                      <div className="border p-4 bg-white rounded-lg">
                        {address.block || "Not detected"}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-gray-600 uppercase text-sm">SOCIETY NAME</h3>
                      <div className="border p-4 bg-white rounded-lg">
                        {address.societyName}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

//history page