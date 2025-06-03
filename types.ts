
// What AI is expected to return per restaurant (before client-side ID)
export interface AiRestaurant {
  name: string;
  description: string;
  genre: string;
  access: string;
  budget: string;
  address: string;
  url: string;
}

// Restaurant type used in the app, with client-side ID
export interface Restaurant extends AiRestaurant {
  id: string;
}

export interface WebChunk {
  uri: string;
  title: string;
}

// The local GroundingChunk interface is no longer used as geminiService.ts
// now directly processes the SDK's grounding chunk structure.
/*
export interface GroundingChunk {
  web?: WebChunk;
  // other potential fields like retrievedContext, custom etc.
}
*/

export interface SearchCriteria {
  station: string;
  genre: string;
  keywords: string;
  isReGacha?: boolean; // Flag to indicate if this is a "re-gacha"
}
