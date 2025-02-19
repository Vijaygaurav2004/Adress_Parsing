import Map from './Map'
import { ParsedAddress } from '@/types'

interface ResultsDisplayProps {
  latestParsedAddress: ParsedAddress | undefined
}

export default function ResultsDisplay({ latestParsedAddress }: ResultsDisplayProps) {
  if (!latestParsedAddress) {
    return (
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-2">Location Preview</h2>
        <p className="text-gray-500">Enter an address to see it on the map</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Location Preview</h2>
      <Map 
        latitude={Number(latestParsedAddress.latitude)} 
        longitude={Number(latestParsedAddress.longitude)} 
      />
      <div className="mt-4 space-y-2">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Latitude:</span> {latestParsedAddress.latitude}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Longitude:</span> {latestParsedAddress.longitude}
        </p>
      </div>
    </div>
  )
}

