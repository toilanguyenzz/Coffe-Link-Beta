/**
 * LaborManagerService.ts - Smart Labor Manager Service
 * Quản lý thợ thông minh: Ứng tiền, Tính công, Thanh toán
 */

import * as LocalStorage from './LocalStorageService';

// ========== TYPES ==========
export interface Worker {
    id: string;
    name: string;
    phone?: string;
    avatar?: string;
    rating: number;
    totalJobs: number;
    bankAccount?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export interface Advance {
    id: string;
    workerId: string;
    workerName: string;
    amount: number;
    reason: 'phone_card' | 'breakfast' | 'send_home' | 'other';
    reasonLabel: string;
    photoEvidence?: string;
    createdAt: string;
    jobId: string;
}

export interface LaborJob {
    id: string;
    farmerId: string;
    farmerName: string;
    title: string;
    jobType: 'contract' | 'daily'; // Khoán vs Công Nhật
    pricePerUnit: number; // Đơn giá
    unit: string; // 'kg' cho khoán, 'ngày' cho công nhật
    slopeFactor: number; // 1.0 or 1.1
    qualityFactor: number; // 0.95 - 1.0
    workersNeeded: number;
    workers: Worker[];
    totalQuantity: number;
    status: 'recruiting' | 'in_progress' | 'calculating' | 'paid';
    startDate: string;
    endDate?: string;
    location: {
        name: string;
        lat?: number;
        lng?: number;
    };
    createdAt: string;
}

export interface WorkerPayment {
    workerId: string;
    workerName: string;
    daysWorked: number;
    quantityHarvested: number;
    grossAmount: number;    // Tổng trước trừ
    totalAdvances: number;  // Tổng tiền đã ứng
    bonus: number;          // Thưởng
    deductions: number;     // Khấu trừ
    netAmount: number;      // Thực lĩnh
    advances: Advance[];
}

// ========== CONSTANTS ==========
export const ADVANCE_REASONS = [
    { value: 'phone_card', label: 'Thẻ điện thoại', emoji: '📱' },
    { value: 'breakfast', label: 'Ăn sáng', emoji: '🍜' },
    { value: 'send_home', label: 'Gửi về quê', emoji: '💸' },
    { value: 'other', label: 'Khác', emoji: '📝' }
] as const;

export const REGION_BASE_PRICES: Record<string, { daily: number; contract: number }> = {
    'chu_pah': { daily: 250000, contract: 800 },      // 800đ/kg
    'ia_grai': { daily: 260000, contract: 850 },
    'dak_doa': { daily: 240000, contract: 780 },
    'default': { daily: 250000, contract: 800 }
};

// ========== LOCAL STORAGE KEYS ==========
const KEYS = {
    CURRENT_JOB: 'labor_current_job',
    ADVANCES: 'labor_advances',
    JOBS_HISTORY: 'labor_jobs_history',
    WORKERS: 'labor_workers'
};

// ========== SERVICE FUNCTIONS ==========

/**
 * Tạo job tuyển thợ mới
 */
export function createJob(job: Omit<LaborJob, 'id' | 'createdAt' | 'status' | 'workers'>): LaborJob {
    const newJob: LaborJob = {
        ...job,
        id: `job_${Date.now()}`,
        status: 'recruiting',
        workers: [],
        createdAt: new Date().toISOString()
    };

    localStorage.setItem(KEYS.CURRENT_JOB, JSON.stringify(newJob));
    return newJob;
}

/**
 * Lấy job hiện tại
 */
export function getCurrentJob(): LaborJob | null {
    const data = localStorage.getItem(KEYS.CURRENT_JOB);
    return data ? JSON.parse(data) : null;
}

/**
 * Cập nhật job
 */
export function updateJob(updates: Partial<LaborJob>): LaborJob | null {
    const job = getCurrentJob();
    if (!job) return null;

    const updated = { ...job, ...updates };
    localStorage.setItem(KEYS.CURRENT_JOB, JSON.stringify(updated));
    return updated;
}

/**
 * Thêm thợ vào job
 */
export function addWorkerToJob(worker: Worker): void {
    const job = getCurrentJob();
    if (!job) return;

    if (!job.workers.find(w => w.id === worker.id)) {
        job.workers.push(worker);
        localStorage.setItem(KEYS.CURRENT_JOB, JSON.stringify(job));
    }
}

/**
 * Lấy danh sách tiền ứng của job hiện tại
 */
export function getAdvances(jobId?: string): Advance[] {
    const data = localStorage.getItem(KEYS.ADVANCES);
    const advances: Advance[] = data ? JSON.parse(data) : [];

    if (jobId) {
        return advances.filter(a => a.jobId === jobId);
    }
    return advances;
}

/**
 * Lấy tổng tiền ứng của một thợ
 */
export function getWorkerTotalAdvances(workerId: string, jobId?: string): number {
    const advances = getAdvances(jobId);
    return advances
        .filter(a => a.workerId === workerId)
        .reduce((sum, a) => sum + a.amount, 0);
}

/**
 * Lấy tổng tiền ứng của job
 */
export function getJobTotalAdvances(jobId: string): number {
    const advances = getAdvances(jobId);
    return advances.reduce((sum, a) => sum + a.amount, 0);
}

/**
 * Thêm tiền ứng
 */
export function addAdvance(advance: Omit<Advance, 'id' | 'createdAt'>): Advance {
    const advances = getAdvances();
    const reasonInfo = ADVANCE_REASONS.find(r => r.value === advance.reason);

    const newAdvance: Advance = {
        ...advance,
        id: `adv_${Date.now()}`,
        reasonLabel: reasonInfo?.label || 'Khác',
        createdAt: new Date().toISOString()
    };

    advances.push(newAdvance);
    localStorage.setItem(KEYS.ADVANCES, JSON.stringify(advances));

    return newAdvance;
}

/**
 * Xóa tiền ứng
 */
export function removeAdvance(advanceId: string): void {
    const advances = getAdvances();
    const filtered = advances.filter(a => a.id !== advanceId);
    localStorage.setItem(KEYS.ADVANCES, JSON.stringify(filtered));
}

/**
 * Tính tiền công thông minh
 */
export function calculatePayment(params: {
    jobType: 'contract' | 'daily';
    quantity: number;           // Số kg hoặc số ngày
    pricePerUnit: number;       // Đơn giá
    slopeFactor: number;        // Hệ số dốc (1.0 hoặc 1.1)
    qualityFactor?: number;     // Hệ số chất lượng (0.95 - 1.0)
    totalAdvances: number;      // Tổng đã ứng
    bonus?: number;             // Thưởng
}): {
    grossAmount: number;
    slopeBonus: number;
    qualityDeduction: number;
    netBeforeAdvance: number;
    netAmount: number;
    breakdown: string[];
} {
    const {
        jobType,
        quantity,
        pricePerUnit,
        slopeFactor,
        qualityFactor = 1.0,
        totalAdvances,
        bonus = 0
    } = params;

    // Tính tổng trước hệ số
    const baseAmount = quantity * pricePerUnit;

    // Tính bonus dốc
    const slopeBonus = slopeFactor > 1.0 ? baseAmount * (slopeFactor - 1.0) : 0;

    // Tính khấu trừ chất lượng
    const qualityDeduction = qualityFactor < 1.0 ? baseAmount * (1.0 - qualityFactor) : 0;

    // Tổng trước khi trừ ứng
    const grossAmount = baseAmount + slopeBonus - qualityDeduction + bonus;

    // Thực lĩnh
    const netAmount = grossAmount - totalAdvances;

    // Breakdown chi tiết
    const breakdown: string[] = [];
    const unitLabel = jobType === 'contract' ? 'kg' : 'ngày';

    breakdown.push(`${quantity} ${unitLabel} x ${pricePerUnit.toLocaleString()}đ = ${baseAmount.toLocaleString()}đ`);

    if (slopeBonus > 0) {
        breakdown.push(`+ Hệ số đất dốc (+10%): +${slopeBonus.toLocaleString()}đ`);
    }

    if (qualityDeduction > 0) {
        breakdown.push(`- Chất lượng (-${((1 - qualityFactor) * 100).toFixed(0)}%): -${qualityDeduction.toLocaleString()}đ`);
    }

    if (bonus > 0) {
        breakdown.push(`+ Thưởng: +${bonus.toLocaleString()}đ`);
    }

    if (totalAdvances > 0) {
        breakdown.push(`- Đã ứng: -${totalAdvances.toLocaleString()}đ`);
    }

    return {
        grossAmount,
        slopeBonus,
        qualityDeduction,
        netBeforeAdvance: grossAmount,
        netAmount,
        breakdown
    };
}

/**
 * Tính sản lượng quy đổi (cà phê tươi -> nhân)
 */
export function calculateYield(freshWeight: number, conversionRate: number = 4.5): {
    freshKg: number;
    dryKg: number;
    estimatedValue: number;
} {
    const dryKg = freshWeight / conversionRate;
    // Giả sử giá cà phê nhân khoảng 70,000đ/kg
    const estimatedValue = dryKg * 70000;

    return {
        freshKg: freshWeight,
        dryKg: Math.round(dryKg * 10) / 10,
        estimatedValue: Math.round(estimatedValue)
    };
}

/**
 * Tạo link chia sẻ tuyển thợ
 */
export function generateRecruitmentLink(job: LaborJob): string {
    const params = new URLSearchParams({
        job: job.id,
        title: job.title,
        price: job.pricePerUnit.toString(),
        type: job.jobType,
        workers: job.workersNeeded.toString()
    });

    return `coffeelink://hire?${params.toString()}`;
}

/**
 * Tạo text chia sẻ Facebook/Zalo
 */
export function generateShareText(job: LaborJob): string {
    const typeLabel = job.jobType === 'daily' ? 'Công Nhật' : 'Khoán';
    const priceLabel = job.jobType === 'daily'
        ? `${job.pricePerUnit.toLocaleString()}đ/ngày`
        : `${job.pricePerUnit.toLocaleString()}đ/kg`;

    return `🌿 VIỆC LÀM: ${job.title}
💰 ${typeLabel}: ${priceLabel}
👥 Cần: ${job.workersNeeded} người
📍 Tại: ${job.location.name}
📞 Liên hệ: ${job.farmerName}

👉 Tải App CoffeeLink để nhận việc ngay!`;
}

/**
 * Lấy gợi ý giá theo vùng
 */
export function getSuggestedPrice(region: string = 'default'): { daily: number; contract: number; suggestion: string } {
    const prices = REGION_BASE_PRICES[region] || REGION_BASE_PRICES['default'];

    return {
        ...prices,
        suggestion: `Giá khu vực hôm nay: ${prices.daily.toLocaleString()}đ/ngày. Để ${(prices.daily + 10000).toLocaleString()}đ để tìm nhanh hơn.`
    };
}

// Mock workers data
export function getMockWorkers(): Worker[] {
    return [
        { id: 'w1', name: 'Anh Tùng', phone: '0901234567', rating: 4.8, totalJobs: 15 },
        { id: 'w2', name: 'Chị Hoa', phone: '0912345678', rating: 4.5, totalJobs: 8 },
        { id: 'w3', name: 'Anh Bình', phone: '0923456789', rating: 4.9, totalJobs: 23 },
        { id: 'w4', name: 'Chị Mai', phone: '0934567890', rating: 4.3, totalJobs: 5 },
        { id: 'w5', name: 'Anh Hoàng', phone: '0945678901', rating: 4.7, totalJobs: 12 }
    ];
}
