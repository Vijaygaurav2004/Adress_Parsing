export interface Society {
    name: string
    latitude: number
    longitude: number
    blocks: string[]
    flatsInEachBlock: string[]
  }
  
  export interface ParsedAddress {
    societyName: string
    block: string | null
    flat: string | null
    proximityNote?: string
    latitude?: string
    longitude?: string
    original?: string
    timestamp?: string
    id?: string
  }
  
  export type FirebaseError = {
    code: string;
    message: string;
  };
  
  