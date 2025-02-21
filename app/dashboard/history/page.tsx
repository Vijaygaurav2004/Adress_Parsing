"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore"
import type { ParsedAddress } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, AlertTriangle, History as HistoryIcon } from "lucide-react"

export default function History() {
  const { user } = useAuth()
  const [addressHistory, setAddressHistory] = useState<ParsedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user) return

    try {
      const addressRef = collection(db, "addressHistory")
      const q = query(
        addressRef,
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      )

      const querySnapshot = await getDocs(q)
      const history = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as ParsedAddress[]

      setAddressHistory(history)
    } catch (err) {
      console.error("Error fetching history:", err)
      setError("Failed to load address history")
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleDeleteEntry = async (id: string) => {
    if (!user) return
    
    try {
      setDeleteLoading(true)
      await deleteDoc(doc(db, "addressHistory", id))
      setAddressHistory(prev => prev.filter(addr => addr.id !== id))
    } catch (error) {
      console.error("Error deleting entry:", error)
      setError("Failed to delete entry")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!user) return
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAll = async () => {
    try {
      setDeleteLoading(true)
      const promises = addressHistory.map(address => 
        deleteDoc(doc(db, "addressHistory", address.id!))
      )
      await Promise.all(promises)
      setAddressHistory([])
    } catch (error) {
      console.error("Error deleting all addresses:", error)
      setError("Failed to delete all addresses")
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Address History</h1>
          <p className="text-gray-500 mt-1">View and manage your parsed addresses</p>
        </div>
        {addressHistory.length > 0 && (
          <Button
            onClick={handleDeleteAll}
            variant="destructive"
            disabled={deleteLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleteLoading ? "Deleting..." : "Delete All"}
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
                  onClick={confirmDeleteAll}
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
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="max-w-sm mx-auto">
            <HistoryIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-500">Start by parsing an address or uploading a CSV file.</p>
          </div>
        </div>
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
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Lat: {address.latitude}, Long: {address.longitude}
                    </div>
                    <div className="text-sm text-gray-600">
                      Society: {address.original}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        if (address.id) handleDeleteEntry(address.id)
                      }}
                      variant="outline"
                      size="sm"
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="p-8 bg-[#F8FDFF]">
                  <div className="grid grid-cols-3 gap-10">
                    {[
                      { label: "FLAT NUMBER", value: address.flat },
                      { label: "BLOCK NAME", value: address.block },
                      { label: "SOCIETY NAME", value: address.societyName }
                    ].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <h3 className="text-gray-600 uppercase text-sm">{item.label}</h3>
                        <div className="border p-4 bg-white rounded-lg">
                          {item.value || "Not detected"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Proximity Note */}
                  {address.proximityNote && (
                    <div className="mt-6 text-sm text-gray-600 border-t pt-4 border-gray-200">
                      {address.proximityNote}
                    </div>
                  )}
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