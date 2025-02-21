"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AddressForm from "@/components/AddressForm"
import ParsedAddressDetails from "@/components/ParsedAddressDetails"
import type { ParsedAddress } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Papa from 'papaparse'
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp, deleteDoc, doc } from "firebase/firestore"
import { parseAddress } from "@/utils/addressParser"

// Add this interface near the top of the file
interface CsvRow {
  latitude?: string;
  lat?: string;
  longitude?: string;
  long?: string;
  lng?: string;
  address?: string;
  location?: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [parsedAddresses, setParsedAddresses] = useState<ParsedAddress[]>([])
  const [currentParsedAddress, setCurrentParsedAddress] = useState<ParsedAddress | null>(null)
  const [showParsedDetails, setShowParsedDetails] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvProgress, setCsvProgress] = useState<number>(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleAddressParsed = async (parsedAddress: ParsedAddress) => {
    try {
      // First save to Firebase to get an ID
      const docRef = await addDoc(collection(db, "addressHistory"), {
        ...parsedAddress,
        userId: user?.uid,
        timestamp: Timestamp.now(),
        source: 'single_entry'
      });

      // Navigate to the parsed-address page with the new ID
      router.push(`/dashboard/parsed-address/${docRef.id}`)
    } catch (error) {
      console.error("Error saving address:", error)
    }
  }

  const processCSV = async (file: File) => {
    setCsvLoading(true)
    setCsvError(null)
    setCsvProgress(0)
    setUploadSuccess(false)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        header = header.toLowerCase().trim()
        if (header.includes('lat')) return 'latitude'
        if (header.includes('long') || header.includes('lng')) return 'longitude'
        if (header.includes('address') || header.includes('location')) return 'address'
        return header
      },
      complete: async (results) => {
        try {
          const total = results.data.length
          let processed = 0
          let errors: string[] = []
          const processedAddresses: ParsedAddress[] = []

          // First, validate and parse all rows
          const validRows = (results.data as CsvRow[]).filter((row, index) => {
            const lat = parseFloat(row.latitude || row.lat || '')
            const lng = parseFloat(row.longitude || row.long || row.lng || '')
            const address = row.address || row.location || ''

            if (isNaN(lat) || isNaN(lng)) {
              errors.push(`Row ${index + 1}: Invalid coordinates`)
              return false
            }

            if (!address) {
              errors.push(`Row ${index + 1}: Missing address`)
              return false
            }

            return true
          })

          // Then process each valid row
          for (const row of validRows as CsvRow[]) {
            try {
              const lat = parseFloat(row.latitude || row.lat || '')
              const lng = parseFloat(row.longitude || row.long || row.lng || '')
              const address = row.address || row.location || ''

              // Parse the address
              const parsedAddress = parseAddress(lat, lng, address)

              // Log the parsing results for debugging
              console.log('Parsing Results:', {
                original: address,
                parsed: parsedAddress,
                coordinates: { lat, lng }
              })

              // Store in Firebase
              const docRef = await addDoc(collection(db, "addressHistory"), {
                ...parsedAddress,
                userId: user?.uid,
                timestamp: Timestamp.now(),
                latitude: lat.toString(),
                longitude: lng.toString(),
                original: address,
                source: 'csv_upload'
              })

              processedAddresses.push({
                ...parsedAddress,
                id: docRef.id,
                latitude: lat.toString(),
                longitude: lng.toString(),
                original: address
              })

              processed++
              setCsvProgress(Math.round((processed / validRows.length) * 100))
            } catch (err) {
              console.error('Error processing row:', err)
              errors.push(`Row ${processed + 1}: Failed to process - ${err}`)
            }
          }

          // Show processing summary
          if (errors.length > 0) {
            setCsvError(
              `Processing complete:\n` +
              `✓ Successfully processed: ${processed} addresses\n` +
              `✗ Errors (${errors.length}):\n${errors.slice(0, 3).join('\n')}` +
              (errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : '')
            )
          }

          if (processed > 0) {
            // Just update the UI state, no redirect
            setUploadSuccess(true)
            setParsedAddresses(processedAddresses)
            setShowParsedDetails(true)
            setCurrentParsedAddress(processedAddresses[0])
          }
        } catch (error) {
          console.error('Error processing CSV:', error)
          setCsvError('Failed to process CSV file. Please try again.')
        } finally {
          setCsvLoading(false)
        }
      },
      error: (error) => {
        setCsvError(`Failed to parse CSV: ${error.message}`)
        setCsvLoading(false)
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvError("Please upload a CSV file")
      return
    }

    processCSV(file)
  }

  const handleDeleteAll = async () => {
    if (!user) return
    
    try {
      // Delete from Firebase
      for (const address of parsedAddresses) {
        if (address.id) {
          await deleteDoc(doc(db, "addressHistory", address.id))
        }
      }
      
      // Clear local state
      setParsedAddresses([])
      setCurrentParsedAddress(null)
      setShowParsedDetails(false)
      setUploadSuccess(false)
      
    } catch (error) {
      console.error("Error deleting addresses:", error)
      setCsvError("Failed to delete addresses. Please try again.")
    }
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Address Parser</h1>
      
      <div className="grid gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Single Address</h2>
          <AddressForm onAddressParsed={handleAddressParsed} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => document.getElementById('csvFile')?.click()}
                disabled={csvLoading}
                className="bg-black hover:bg-black/90"
              >
                {csvLoading ? 'Processing...' : 'Upload CSV'}
              </Button>
              <input
                type="file"
                id="csvFile"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              {csvLoading && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${csvProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{csvProgress}%</span>
                </div>
              )}
            </div>
            
            {csvError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md whitespace-pre-line">
                {csvError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                {parsedAddresses.length > 0 
                  ? `Successfully processed ${parsedAddresses.length} addresses!`
                  : 'Processing complete. No valid addresses found.'}
              </div>
            )}
            
            {uploadSuccess && parsedAddresses.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleDeleteAll}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete All
                </Button>
              </div>
            )}
            
            <div className="text-sm text-gray-500">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>latitude/lat</li>
                <li>longitude/long/lng</li>
                <li>address/location</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {showParsedDetails && currentParsedAddress && (
        <ParsedAddressDetails
          parsedAddress={currentParsedAddress}
          onBack={() => setShowParsedDetails(false)}
        />
      )}
    </div>
  )
} 