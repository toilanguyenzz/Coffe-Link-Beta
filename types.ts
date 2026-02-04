
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

  // ========== HUB-CENTRIC FIELDS (NEW) ==========
  // Expanded role for Hub system
  role: 'farmer' | 'worker' | 'hub_leader' | 'contractor' | 'expert' | 'trader' | 'admin' | 'agent';

  // Hub assignment
  hubId?: string;                  // ID của Hub user thuộc về (1 User = 1 Hub)

  // Manual location (khi user từ chối GPS)
  isManualLocation?: boolean;      // True nếu chọn Hub thủ công
  manualAddress?: {
    provinceCode: string;
    districtCode: string;
    wardCode: string;
  };

  // Farmer-specific: Danh sách thợ ruột
  favoriteWorkers?: string[];      // List UID của thợ quen

  // Worker-specific profile
  workerProfile?: WorkerProfile;

  // Agent-specific profile (Đại lý thu mua)
  agentProfile?: {
    shopName: string;
    taxId?: string;
    address: string;
    totalPurchased: number;   // kg
    totalFarmers: number;
    rating: number;
  };

  // ========== REFERRAL SYSTEM FIELDS ==========
  referredBy?: string;             // UID của Trưởng Hub giới thiệu
  referralCode?: string;           // Mã giới thiệu riêng (cho Hub Leader)
  referralCount?: number;          // Số user đã giới thiệu (cached)
  referralBonus?: number;          // Tổng tiền thưởng tích lũy (VNĐ)
  // ===============================================

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
  productImage?: string;
  createdAt?: any;
}

// ============================================================
// HUB-CENTRIC ARCHITECTURE TYPES (Tầng 1-4)
// ============================================================

// Season Mode cho chế độ mùa vụ
export type SeasonMode = 'CARE' | 'HARVEST';

// Job Types cho dịch vụ nhân công
export type JobType = 'harvest' | 'irrigation' | 'pruning' | 'fertilizing' | 'spraying' | 'other';

// Service Request Status Flow
export type ServiceRequestStatus = 'OPEN' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Service Request Types
export type ServiceRequestType = 'P2P_BOOKING' | 'HUB_POOLING';

// ============ CAMPAIGN TYPE (3 loại Chiến dịch) ============
// INPUT = Vật tư (Phân bón, Thuốc BVTV)
// LABOR = Nhân công (Đội thợ mùa vụ)
// OUTPUT = Nông sản (Gom hàng bán cho nhà máy)
export type CampaignType = 'INPUT' | 'LABOR' | 'OUTPUT';

// ============ WORKER PROFILE ============
export interface WorkerProfile {
  skills: JobType[];
  rating: number;                  // 0-5 sao
  totalRatings: number;            // Số lượt đánh giá
  completedJobs: number;
  availability: 'available' | 'busy' | 'on_leave';
  dailyRate?: number;              // Giá công/ngày (VND)
  experience?: string;             // Mô tả kinh nghiệm
}

// ============ HUB (Trạm) ============
export interface Hub {
  id: string;
  name: string;                    // "Trạm Chư Sê"
  location: { lat: number; lng: number };
  radius: number;                  // km - bán kính phục vụ
  seasonMode: SeasonMode;          // Chế độ mùa vụ hiện tại
  leaderId: string;                // UID của Trưởng Trạm (Ông Hùng)
  leaderName?: string;             // Display name
  leaderPhone?: string;            // SĐT liên hệ
  address?: string;                // Địa chỉ vật lý

  // Statistics (updated via Cloud Functions)
  memberCount?: number;            // Số nông dân trong trạm
  workerCount?: number;            // Số thợ đăng ký
  activeCampaigns?: number;        // Số deal đang chạy

  createdAt: any;
  updatedAt?: any;
}

// ============ VN ADMINISTRATIVE DATA (Địa giới hành chính) ============
export interface Province {
  code: string;                    // "64" (Gia Lai)
  name: string;                    // "Gia Lai"
}

export interface District {
  code: string;                    // "643"
  name: string;                    // "Chư Sê"
  provinceCode: string;
}

export interface Ward {
  code: string;                    // "24124"
  name: string;                    // "Ia Hlốp"
  districtCode: string;
  hubId?: string;                  // ID của Hub phục vụ xã này (optional - có thể query theo location)
}

// ============ CAMPAIGN (Gom đơn phân bón) ============
export interface Campaign {
  id: string;
  hubId: string;
  title: string;                   // "Deal Phân NPK 14k"
  description?: string;
  productName: string;
  productImage?: string;

  // Pricing
  originalPrice: number;           // 380,000 VND/bao
  dealPrice: number;               // 350,000 VND/bao (nhờ gom đơn)
  unit: string;                    // "bao 50kg"

  // Mục tiêu gom đơn
  targetQuantity: number;          // 400 bao (20 tấn)
  currentQuantity: number;         // Số đã đặt
  minOrderQuantity?: number;       // Tối thiểu mỗi đơn (VD: 5 bao)

  // Thời gian
  startDate: string;               // ISO date
  endDate: string;                 // ISO date - hết hạn
  pickupDate?: string;             // Ngày dự kiến nhận hàng
  status: 'ACTIVE' | 'FULFILLED' | 'CLOSED' | 'CANCELLED';

  // Deep link & Viral
  deepLinkCode: string;            // Unique code cho short URL
  qrCodeUrl?: string;              // URL ảnh QR

  // Commission
  commissionRate?: number;         // % hoa hồng cho Hub Leader

  // Campaign Type (NEW for Marketing)
  type?: CampaignType;             // INPUT | LABOR | OUTPUT
  totalParticipants?: number;      // Số người tham gia
  savingsPerUnit?: number;         // Tiết kiệm/đơn vị so với giá thị trường

  // Dynamic Pricing Tiers (New for Unicorn Strategy)
  pricingTiers?: {
    minQuantity: number;
    price: number;
  }[];

  createdAt: any;
  updatedAt?: any;
}

// ============ CAMPAIGN ORDER (Đơn đặt hàng trong Campaign) ============
export interface CampaignOrder {
  id: string;
  campaignId: string;
  userId: string;
  userName?: string;
  userPhone?: string;

  quantity: number;                // Số lượng đặt
  totalAmount: number;             // Tổng tiền
  depositAmount: number;           // Tiền cọc (VD: 30%)
  depositPaid: boolean;
  depositPaidAt?: any;

  // Pickup confirmation
  pickupConfirmed: boolean;
  pickupConfirmedAt?: any;
  pickupQrCode?: string;           // Mã QR để quét khi nhận hàng

  createdAt: any;
}

// ============ SERVICE REQUEST (Yêu cầu tìm thợ) ============
export interface ServiceRequest {
  id: string;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string;
  hubId: string;

  type: ServiceRequestType;        // P2P_BOOKING | HUB_POOLING
  status: ServiceRequestStatus;

  // Chi tiết công việc
  jobType: JobType;
  jobDescription?: string;
  workersNeeded: number;           // Số thợ cần
  daysNeeded: number;              // Số ngày làm
  startDate: string;               // Ngày bắt đầu
  location?: {                     // Vị trí vườn
    lat: number;
    lng: number;
    address?: string;
  };

  // Tài chính
  estimatedCost: number;           // Ước tính tổng chi phí
  dailyRate?: number;              // Giá công/ngày/người
  depositAmount: number;           // Tiền cọc (30% với HUB_POOLING)
  depositPaid: boolean;

  // Matching (cho P2P_BOOKING)
  matchedWorkerId?: string;
  matchedWorkerName?: string;
  matchedAt?: any;

  // Facebook share (Vampire Attack)
  isSharedToFacebook: boolean;
  facebookPosterId?: string;       // ID của ảnh poster đã generate

  // Rating sau khi hoàn thành
  farmerRating?: number;           // Farmer đánh giá thợ
  workerRating?: number;           // Thợ đánh giá farmer

  createdAt: any;
  updatedAt?: any;
  completedAt?: any;
}

// ============ WORKER ATTENDANCE (Chấm công mùa vụ) ============
export interface WorkerAttendance {
  id: string;
  serviceRequestId: string;
  workerId: string;
  workerName?: string;
  date: string;                    // YYYY-MM-DD

  checkInTime?: string;            // HH:mm
  checkOutTime?: string;
  hoursWorked?: number;

  // Ghi nhận bởi
  recordedBy: string;              // UID của Cai thầu/Hub Leader

  notes?: string;
  createdAt: any;
}

// ============ HUB LEADER STATS (Thống kê Trưởng Hub) ============
export interface HubLeaderStats {
  hubId: string;
  leaderId: string;
  leaderName: string;

  totalReferrals: number;
  monthlyReferrals: number;
  totalSavingsGenerated: number;
  totalOrdersGenerated: number;
  rank?: number;
  updatedAt?: any;
}

// ============ REFERRAL BONUS (Giao dịch thưởng) ============
export type ReferralBonusType = 'SIGNUP' | 'FIRST_ORDER' | 'CAMPAIGN_JOIN';

export interface ReferralBonus {
  id: string;
  hubLeaderId: string;
  hubLeaderName?: string;
  referredUserId: string;
  referredUserName?: string;
  campaignId?: string;
  bonusType: ReferralBonusType;
  bonusAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  createdAt: any;
  confirmedAt?: any;
  paidAt?: any;
}