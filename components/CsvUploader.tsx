import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { parseAddress } from "@/utils/addressParser"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/AuthContext"
import Papa from 'papaparse'

// Move interface to types file if used elsewhere, or prefix with underscore if unused
interface _CsvRow {
  latitude?: string
  lat?: string
  longitude?: string
  long?: string
  lng?: string
  address?: string
  location?: string
}

export default function CsvUploader() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  const processCSV = async (file: File) => {
    setLoading(true)
    setError(null)
    setProgress(0)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers to handle different formats
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
          const errors: string[] = []

          for (const row of results.data as _CsvRow[]) {
            try {
              // Handle different possible column names
              const lat = parseFloat(row.latitude || row.lat || '')
              const lng = parseFloat(row.longitude || row.long || row.lng || '')
              const address = row.address || row.location || ''
              
              if (isNaN(lat) || isNaN(lng)) {
                errors.push(`Invalid coordinates for row ${processed + 1}`)
                continue
              }

              if (!address) {
                errors.push(`Missing address for row ${processed + 1}`)
                continue
              }

              const parsedAddress = parseAddress(lat, lng, address)
              
              await addDoc(collection(db, "addressHistory"), {
                ...parsedAddress,
                userId: user?.uid,
                timestamp: Timestamp.now(),
                latitude: lat.toString(),
                longitude: lng.toString(),
                original: address,
                source: 'csv_upload'
              })

              processed++
              setProgress(Math.round((processed / total) * 100))
            } catch (err) {
              errors.push(`Error processing row ${processed + 1}`)
            }
          }

          if (errors.length > 0) {
            setError(`Processed with some errors:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''}`)
          }

          setProgress(100)
        } catch (error) {
          setError(error instanceof Error ? error.message : "Failed to process CSV file")
        } finally {
          setLoading(false)
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`)
        setLoading(false)
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError("Please upload a CSV file")
      return
    }

    processCSV(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => document.getElementById('csvFile')?.click()}
          disabled={loading}
          className="bg-black hover:bg-black/90"
        >
          {loading ? 'Processing...' : 'Upload CSV'}
        </Button>
        <input
          type="file"
          id="csvFile"
          accept=".csv"
          className="hidden"
          onChange={handleFileUpload}
        />
        {loading && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md whitespace-pre-line">
          {error}
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
  )
} 