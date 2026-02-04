
import React, { useState } from 'react';
import { BadgeCheck, Phone, Star, MapPin, ScanLine, Droplets } from 'lucide-react';
import PriceCalculator from '../tools/PriceCalculator';
import SimplePriceForecast from '../features/SimplePriceForecast';
import MoistureScannerModal from '../modals/MoistureScannerModal';

const HarvestView: React.FC = () => {
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    return (
        <div className="space-y-8 pb-10">

            {/* 0. NEW FEATURE: MOISTURE SCANNER BANNER */}
            <div
                onClick={() => setIsScannerOpen(true)}
                className="relative overflow-hidden rounded-[2rem] bg-blue-600 p-1 shadow-lg shadow-blue-200 cursor-pointer active:scale-95 transition-transform"
            >
                <div className="rounded-[1.8rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 h-32 w-32 translate-x-10 -translate-y-10 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <ScanLine className="h-6 w-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">Mới</span>
                                <h3 className="text-white font-black text-sm uppercase tracking-wide">Soi Độ Ẩm AI</h3>
                            </div>
                            <p className="text-blue-100 text-[10px] font-medium">Chụp ảnh hạt để định giá chuẩn xác</p>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-lg">
                        <Droplets className="h-4 w-4 fill-current" />
                    </div>
                </div>
            </div>

            {/* 1. PRICE FORECAST */}
            <SimplePriceForecast />

            {/* 2. SMART CALCULATOR (ID for scrolling) */}
            <div id="price-calculator">
                <PriceCalculator />
            </div>

            {/* 3. LOGISTICS SERVICES */}


            {/* 3. TRADER CONNECT (Unified List) */}


            {/* SCANNER MODAL */}
            <MoistureScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
            />
        </div>
    );
};

export default HarvestView;
