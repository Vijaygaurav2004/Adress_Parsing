import type { ParsedAddress } from "@/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, MapPin, Building2, Home } from "lucide-react"

interface ParsedAddressDetailsProps {
  parsedAddress: ParsedAddress
  onBack: () => void
}

export default function ParsedAddressDetails({ 
  parsedAddress, 
  onBack 
}: ParsedAddressDetailsProps) {
  const isServiceable = parsedAddress.societyName !== "Not Serviceable"

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="p-8">
        {/* Status Banner */}
        <div className={`mb-8 p-6 rounded-xl border ${
          isServiceable 
            ? 'bg-green-50 border-green-100' 
            : 'bg-red-50 border-red-100'
        }`}>
          <div className="flex items-center gap-3">
            {isServiceable ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3 className={`text-xl font-semibold ${
                isServiceable ? 'text-green-800' : 'text-red-800'
              }`}>
                {isServiceable ? 'Address Verified!' : 'Not Serviceable'}
              </h3>
              <p className={`mt-1 ${
                isServiceable ? 'text-green-700' : 'text-red-700'
              }`}>
                {isServiceable 
                  ? 'Location is within our service area'
                  : 'This location is outside our service area'}
              </p>
            </div>
          </div>
        </div>

        {/* Society Details */}
        <div className="mb-8">
          <Badge variant={isServiceable ? "default" : "destructive"} className="mb-2">
            <MapPin className="w-3 h-3 mr-1" />
            {parsedAddress.societyName}
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900">Parsed Address Details</h2>
        </div>

        {/* Address Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">FLAT NUMBER</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-900 font-medium">
              {parsedAddress.flat || "Not detected"}
            </div>
          </Card>

          <Card className="p-6 border-2 border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">BLOCK NAME</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-900 font-medium">
              {parsedAddress.block || "Not detected"}
            </div>
          </Card>
        </div>

        {/* Proximity Note */}
        {parsedAddress.proximityNote && (
          <div className={`mb-8 text-sm italic ${
            isServiceable ? 'text-blue-600' : 'text-red-600'
          }`}>
            {parsedAddress.proximityNote}
          </div>
        )}

        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Address Entry
        </Button>
      </div>
    </Card>
  )
} 