/**
 * LocationService.ts
 * Service để lấy dữ liệu địa giới hành chính Việt Nam
 * Source: https://provinces.open-api.vn/
 */

import { Province, District, Ward } from '../types';

const API_BASE = 'https://provinces.open-api.vn/api';

/**
 * Lấy danh sách tất cả Tỉnh/Thành phố
 */
export async function getProvinces(): Promise<Province[]> {
    try {
        const response = await fetch(`${API_BASE}/p/`);
        if (!response.ok) throw new Error('Failed to fetch provinces');

        const data = await response.json();
        return data.map((p: any) => ({
            code: String(p.code),
            name: p.name
        }));
    } catch (error) {
        console.error('Error fetching provinces:', error);
        // Fallback hardcoded data for Tây Nguyên region
        return [
            { code: '64', name: 'Gia Lai' },
            { code: '66', name: 'Đắk Lắk' },
            { code: '67', name: 'Đắk Nông' },
            { code: '68', name: 'Lâm Đồng' },
            { code: '62', name: 'Kon Tum' }
        ];
    }
}

/**
 * Lấy danh sách Quận/Huyện theo Tỉnh
 */
export async function getDistricts(provinceCode: string): Promise<District[]> {
    try {
        const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
        if (!response.ok) throw new Error('Failed to fetch districts');

        const data = await response.json();
        return (data.districts || []).map((d: any) => ({
            code: String(d.code),
            name: d.name,
            provinceCode: provinceCode
        }));
    } catch (error) {
        console.error('Error fetching districts:', error);
        return [];
    }
}

/**
 * Lấy danh sách Xã/Phường theo Huyện
 */
export async function getWards(districtCode: string): Promise<Ward[]> {
    try {
        const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
        if (!response.ok) throw new Error('Failed to fetch wards');

        const data = await response.json();
        return (data.wards || []).map((w: any) => ({
            code: String(w.code),
            name: w.name,
            districtCode: districtCode
        }));
    } catch (error) {
        console.error('Error fetching wards:', error);
        return [];
    }
}

/**
 * Tìm tên địa phương từ code
 */
export async function getLocationNames(
    provinceCode: string,
    districtCode: string,
    wardCode: string
): Promise<{ provinceName: string; districtName: string; wardName: string }> {
    try {
        const [provinces, districts, wards] = await Promise.all([
            getProvinces(),
            getDistricts(provinceCode),
            getWards(districtCode)
        ]);

        return {
            provinceName: provinces.find(p => p.code === provinceCode)?.name || '',
            districtName: districts.find(d => d.code === districtCode)?.name || '',
            wardName: wards.find(w => w.code === wardCode)?.name || ''
        };
    } catch (error) {
        console.error('Error getting location names:', error);
        return { provinceName: '', districtName: '', wardName: '' };
    }
}
