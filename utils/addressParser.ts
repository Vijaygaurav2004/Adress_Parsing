import Fuse from 'fuse.js';
import type { ParsedAddress, Society } from "@/types"
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

function findBestSocietyMatch(address: string): { society: Society; similarity: number } | null {
  const options = {
    threshold: 0.7, // More lenient threshold
    keys: ['name'],
    includeScore: true,
    minMatchCharLength: 3
  };
  
  const fuse = new Fuse(societies, options);
  let result = fuse.search(address);
  
  if (result.length === 0) {
    // Try matching with individual words
    const words = address.split(/[\s,.-]+/);
    for (const word of words) {
      if (word.length > 3) {
        result = fuse.search(word);
        if (result.length > 0) break;
      }
    }
  }
  
  if (result.length > 0 && result[0].item) {
    return {
      society: result[0].item as Society,
      similarity: 1 - (result[0].score || 0)
    };
  }
  
  return null;
}

function findBlockMatch(society: Society, address: string): string | null {
  // First try to find exact block number/letter with common prefixes
  const blockRegex = /(?:block|blk|bock|b|tower|t)[- ]?([0-9A-Za-z]+)/gi;
  const matches = address.match(blockRegex);
  
  if (matches) {
    for (const match of matches) {
      const blockNumber = match.replace(/(?:block|blk|bock|b|tower|t)[- ]?/i, '').trim();
      // Exact match with society blocks
      if (society.blocks.includes(blockNumber)) {
        return blockNumber;
      }
      // Try case-insensitive match for blocks like "Magnifica"
      const caseInsensitiveMatch = society.blocks.find(
        block => block.toLowerCase() === blockNumber.toLowerCase()
      );
      if (caseInsensitiveMatch) {
        return caseInsensitiveMatch;
      }
    }
  }

  // Try to find standalone block identifiers
  const parts = address.split(/[,\s.-]+/).filter(part => part.length > 0);
  for (const part of parts) {
    // Skip parts that look like flat numbers
    if (part.match(/^\d{3,}$/)) continue;
    
    // Direct match with society blocks
    if (society.blocks.includes(part)) {
      return part;
    }
    // Case-insensitive match for named blocks
    const caseInsensitiveMatch = society.blocks.find(
      block => block.toLowerCase() === part.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch;
    }
  }

  // Try fuzzy matching with variations
  const blockVariations = society.blocks.flatMap(block => [
    block,
    `block ${block}`,
    `block-${block}`,
    `b ${block}`,
    `b-${block}`,
    `tower ${block}`,
    `tower-${block}`,
    `t ${block}`,
    `t-${block}`,
    `${block} block`,
    `${block}block`,
    `blk ${block}`,
    `blk-${block}`,
    `bock ${block}`,
    `bock-${block}`,
    `${block}-`,
    `-${block}`,
    block.toLowerCase(),
    block.toUpperCase()
  ]);

  const fuse = new Fuse(blockVariations, { 
    threshold: 0.3, // More strict threshold
    minMatchCharLength: 1,
    ignoreLocation: true
  });
  
  // Try matching each part of the address
  for (const part of parts) {
    // Skip parts that look like flat numbers or are too long
    if (part.match(/^(?:flat|fl|unit|#|no|room)/i) || 
        part.match(/^\d{3,}$/) || 
        part.length > 15) continue;
    
    const result = fuse.search(part);
    if (result.length > 0) {
      // Find the original block in the matched variation
      for (const block of society.blocks) {
        if (result[0].item.toLowerCase().includes(block.toLowerCase())) {
          return block;
        }
      }
    }
  }

  // As a last resort, look for single numbers/letters that match block identifiers
  const singleIdentifiers = address.match(/\b([0-9A-Za-z])\b/g);
  if (singleIdentifiers) {
    for (const identifier of singleIdentifiers) {
      if (society.blocks.includes(identifier)) {
        return identifier;
      }
      // Case-insensitive match for single letter blocks
      const caseInsensitiveMatch = society.blocks.find(
        block => block.toLowerCase() === identifier.toLowerCase()
      );
      if (caseInsensitiveMatch) {
        return caseInsensitiveMatch;
      }
    }
  }
  
  return null;
}

function findFlatMatch(society: Society, address: string): string | null {
  // First try to find exact flat numbers
  const flatRegex = /(?:flat|fl|unit|#|no|room|^)\s*(\d{2,4})\b/gi;
  const matches = address.match(flatRegex);
  
  if (matches) {
    for (const match of matches) {
      const flatNumber = match.replace(/(?:flat|fl|unit|#|no|room|\s)/gi, '');
      if (society.flatsInEachBlock.includes(flatNumber)) {
        return flatNumber;
      }
    }
  }

  // Try to find standalone numbers that match flat numbers
  const numbers = address.match(/\b\d{3}\b/g);
  if (numbers) {
    const matchedFlat = society.flatsInEachBlock.find(flat => 
      numbers.includes(flat)
    );
    if (matchedFlat) return matchedFlat;
  }

  // Try fuzzy matching as last resort
  const flatVariations = society.flatsInEachBlock.flatMap(flat => [
    flat,
    `flat ${flat}`,
    `flat-${flat}`,
    `fl ${flat}`,
    `fl-${flat}`,
    `unit ${flat}`,
    `unit-${flat}`,
    `#${flat}`,
    `no ${flat}`,
    `no-${flat}`,
    `number ${flat}`,
    `${flat}`,
    `room ${flat}`,
    `room-${flat}`,
    `-${flat}`,
    `${flat}-`
  ]);

  const fuse = new Fuse(flatVariations, { 
    threshold: 0.4,
    minMatchCharLength: 2
  });
  
  const parts = address.split(/[,\s.-]+/);
  for (const part of parts) {
    const result = fuse.search(part);
    if (result.length > 0) {
      return society.flatsInEachBlock.find(flat => 
        result[0].item.toLowerCase().includes(flat)
      ) || null;
    }
  }
  
  return null;
}

export function parseAddress(latitude: number, longitude: number, address: string): ParsedAddress {
  const normalizedAddress = address.toLowerCase();
  
  const societyMatch = findBestSocietyMatch(normalizedAddress);
  
  if (!societyMatch) {
    return {
      societyName: "Not Serviceable",
      block: null,
      flat: null,
      proximityNote: "No matching society found"
    };
  }

  const society = societyMatch.society;
  
  const distance = calculateDistance(latitude, longitude, society.latitude, society.longitude);
  
  if (distance > 5) {
    return {
      societyName: society.name,
      block: null,
      flat: null,
      proximityNote: "Location is beyond 5 km range of registered society coordinates"
    };
  }

  const blockMatch = findBlockMatch(society, normalizedAddress);
  const flatMatch = findFlatMatch(society, normalizedAddress);

  return {
    societyName: society.name,
    block: blockMatch,
    flat: flatMatch,
    proximityNote: `Location is within 5 km range of ${society.name}. ${
      societyMatch.similarity < 0.8 ? 
      "Address components were auto-corrected from input." : 
      ""
    }`.trim()
  };
}