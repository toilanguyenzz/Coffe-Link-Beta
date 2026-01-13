
import { EcoTag } from '../types';

export interface Product {
  id: number;
  name: string;
  brand: string;
  marketPrice: number;
  memberPrice: number;
  minQty: number; // Số lượng tối thiểu để chốt đơn
  currentQty: number; // Số lượng đã đăng ký
  unit: string;
  expiryTime: string; // Giờ kết thúc
  ecoTag: EcoTag; // New field
}

export interface Service {
  id: number;
  name: string;
  provider: string;
  price: string;
  status: 'available' | 'busy';
  rating: number;
  distance: string;
}

export const groupBuyProducts: Product[] = [
  {
    id: 1,
    name: "Phân bón NPK 16-16-8",
    brand: "Phú Mỹ",
    marketPrice: 850000,
    memberPrice: 820000,
    minQty: 50,
    currentQty: 42,
    unit: "Bao 50kg",
    expiryTime: "14:00",
    ecoTag: 'CHEMICAL'
  },
  {
    id: 2,
    name: "Thuốc trừ rệp sáp Motox",
    brand: "Syngenta",
    marketPrice: 120000,
    memberPrice: 95000,
    minQty: 100,
    currentQty: 15,
    unit: "Chai 500ml",
    expiryTime: "17:00",
    ecoTag: 'CHEMICAL'
  },
  {
    id: 3,
    name: "Nấm Đối Kháng Trichoderma",
    brand: "Viện Eakmat",
    marketPrice: 90000,
    memberPrice: 75000,
    minQty: 200,
    currentQty: 180,
    unit: "Gói 1kg",
    expiryTime: "16:00",
    ecoTag: 'BIOLOGICAL' // Organic input
  },
  {
    id: 4,
    name: "Đạm Cá Cô Đặc (Fish Protein)",
    brand: "Organic US",
    marketPrice: 250000,
    memberPrice: 210000,
    minQty: 20,
    currentQty: 12,
    unit: "Can 5L",
    expiryTime: "15:30",
    ecoTag: 'ORGANIC' // Organic input
  }
];

export const agriServices: Service[] = [
  {
    id: 1,
    name: "Phun thuốc Drone",
    provider: "Đội bay Anh Ba",
    price: "200.000₫/ha",
    status: 'available',
    rating: 4.8,
    distance: "2km"
  },
  {
    id: 2,
    name: "Nhân công làm cỏ",
    provider: "Tổ hợp tác 5",
    price: "250.000₫/công",
    status: 'busy',
    rating: 4.5,
    distance: "5km"
  },
  {
    id: 3,
    name: "Xe tải chở cà (3 tấn)",
    provider: "Vận tải Tám Hùng",
    price: "Thương lượng",
    status: 'available',
    rating: 5.0,
    distance: "1km"
  }
];
