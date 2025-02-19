"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapProps {
  latitude?: number
  longitude?: number
}

export default function Map({ latitude, longitude }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError("Google Maps API key is not configured")
      return
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    })

    loader.load().then(() => {
      if (mapRef.current) {
        const defaultLocation = { lat: 12.9716, lng: 77.5946 } // Default to Bangalore
        const location = latitude && longitude 
          ? { lat: latitude, lng: longitude }
          : defaultLocation

        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: location,
            zoom: 15,
            styles: [
              {
                featureType: "all",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }]
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9e9e9e" }]
              }
            ]
          })
        }

        // Update marker position
        if (latitude && longitude) {
          const position = { lat: latitude, lng: longitude }
          
          if (markerRef.current) {
            markerRef.current.setPosition(position)
          } else {
            markerRef.current = new google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              animation: google.maps.Animation.DROP
            })
          }
          
          mapInstanceRef.current.panTo(position)
        }
      }
    }).catch((error) => {
      setError("Failed to load Google Maps: " + error.message)
    })
  }, [latitude, longitude])

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="font-medium">Error loading map</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-xl overflow-hidden"
      style={{ border: '1px solid #e5e7eb' }}
    />
  )
} 