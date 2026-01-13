
export type EcoTag = 'ORGANIC' | 'BIOLOGICAL' | 'CHEMICAL' | 'NEUTRAL';
export type BadgeTier = 'MEMBER' | 'PRO_FARMER' | 'ECO_PIONEER' | 'CERTIFIED_ORGANIC';

export interface GardenMetrics {
  consistencyScore: number; // 0-100: Tracks hard work (frequency of logging)
  ecoPotentialIndex: number; // 0-100: Tracks organic inputs (hidden if low)
  currentBadge: BadgeTier;
  nextMilestone?: string;
}

export interface StreakData {
  current: number;
  highest: number;
  lastLogDate: string | null; // ISO Date YYYY-MM-DD
}

export interface IntercroppingTree {
  id: string;
  type: 'Coffee' | 'Durian' | 'Avocado' | 'Cassia' | 'Pepper' | 'Other';
  name: string;
  count: number;
  plantYear: number;
}

export interface GardenData {
  id: string;
  name: string; 
  boundary: { lat: number; lng: number }[]; // The polygon coordinates for EUDR check
  center: { lat: number; lng: number }; // For weather API calls
  metrics: {
    areaSqM: number; // e.g., 12500
    areaHa: number;  // e.g., 1.25
    estimatedTrees: number; // Logic: areaSqM / 9 (Assume 3mx3m density)
  }
}

export interface UserProfile {
  uid: string;              // From Firebase Auth
  email: string;
  displayName: string;
  photoURL?: string;
  farmerId: string;         // Unique ID e.g., "VN-CF-8821"
  
  // Refactored: We no longer force a binary 'farmingType'. 
  // We use metrics to determine the UI state.
  farmingType: 'organic' | 'traditional' | null; 
  
  gardenMetrics?: GardenMetrics; // New Data-Driven Metric
  
  // Proof of Work & Trust Data
  streak?: StreakData;
  gardenLocation?: {
    lat: number;
    lng: number;
    verifiedAt: any; 
    accuracy?: number;
  };

  // Carbon Asset Data
  intercropping?: IntercroppingTree[];
  
  // Green Metrics
  chemicalReductionRate?: number; // e.g., 30 (percent)

  role: 'farmer' | 'expert' | 'trader';
  createdAt: any;           
  updatedAt?: any;          
  
  traceabilityEnabled: boolean;

  plantingYear?: number;
  eudrStatus?: 'passed' | 'needs_review'; 
  
  surveyData?: any; // Legacy field, eventually replace with gardenData list
}

// Interface chuẩn hóa cho Deal trên Marketplace
export interface Deal {
  id: string;
  title: string;            
  
  // Pricing
  originalPrice: number;    
  price: number;            
  
  // Inventory Logic
  currentQuantity: number;  
  maxQuantity: number;      
  
  // Status & Promotion
  isPromoted: boolean;
  status: string;           
  
  // Smart Metadata
  ecoTag: EcoTag; // New field for logic engine
  
  // Optional UI Fields
  brand?: string;
  unit?: string;
  expiryTime?: string;
  createdAt?: any;
}