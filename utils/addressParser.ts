import type { ParsedAddress } from "@/types"
import { societies } from "@/utils/societies"

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function parseAddress(latitude: number, longitude: number, address: string): ParsedAddress {
  const normalizedAddress = address.toLowerCase()
  
  const societyMatch = societies.find((society) => 
    normalizedAddress.includes(society.name.toLowerCase())
  )

  console.log('Society Match:', societyMatch) // Debug log

  if (!societyMatch) {
    return {
      societyName: "Not Serviceable",
      block: null,
      flat: null,
      proximityNote: "No matching society found"
    }
  }

  const distance = calculateDistance(latitude, longitude, societyMatch.latitude, societyMatch.longitude)
  console.log('Distance:', distance) // Debug log
  
  if (distance > 5) {
    return {
      societyName: "Not Serviceable",
      block: null,
      flat: null,
      proximityNote: "Location is beyond 5 km range of registered society coordinates"
    }
  }

  const blockMatch = societyMatch.blocks.find((block) => {
    const blockRegex = new RegExp(`\\b${block}\\b`, "i")
    const matches = blockRegex.test(normalizedAddress) // Use normalizedAddress instead of address
    console.log(`Testing block ${block}:`, matches) // Debug log
    return matches
  })

  const flatMatch = societyMatch.flatsInEachBlock.find((flat) => {
    const flatRegex = new RegExp(`\\b${flat}\\b`, "i")
    const matches = flatRegex.test(normalizedAddress) // Use normalizedAddress instead of address
    console.log(`Testing flat ${flat}:`, matches) // Debug log
    return matches
  })

  return {
    societyName: societyMatch.name,
    block: blockMatch || null,
    flat: flatMatch || null,
    proximityNote: "Location is within 5 km range of registered society coordinates"
  }
}

