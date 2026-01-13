
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  ScanLine, 
  ArrowRight,
  RefreshCw,
  Sun,
  Zap,
  Maximize,
  ThermometerSun
} from 'lucide-react';
import { analyzeCoffeeMoisture, MoistureAnalysisResult } from '../../services/MoistureService';
import { useTools } from '../../contexts/ToolsContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MoistureScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setMoisture } = useTools();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'capture' | 'analyzing' | 'result'>('capture');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<MoistureAnalysisResult | null>(null);

  // Mock Animation States
  const [scanLinePos, setScanLinePos] = useState(0);

  if (!isOpen) return null;

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        runAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgData: string) => {
    setStep('analyzing');
    try {
      // Simulate scanning time for UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      const data = await analyzeCoffeeMoisture(imgData);
      setResult(data);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert("Lỗi phân tích. Vui lòng thử lại.");
      setStep('capture');
    }
  };

  const handleApply = () => {
    if (result) {
      setMoisture(result.moisture);
      onClose();
      const calculatorElement = document.getElementById('price-calculator');
      if (calculatorElement) {
          calculatorElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setStep('capture');
  };

  // --- LOGIC: PRICE IMPACT ---
  const calculateImpact = (m: number) => {
      const standard = 15.0; 
      if (m <= standard) return 0; 
      const lossPercent = (m - 15) * 1.1; 
      const price = 82500;
      return Math.round(price * (lossPercent / 100));
  };

  // --- SVG GAUGE COMPONENT ---
  const MoistureGauge = ({ value }: { value: number }) => {
    // Scale: 8% to 18%. Center is 13%.
    // Angle: -90 (Left) to 90 (Right).
    const min = 8;
    const max = 18;
    const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);
    const rotation = -90 + (normalized * 180);

    return (
      <div className="relative w-64 h-32 mx-auto overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background Arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="20" strokeLinecap="round" />
          
          {/* Colored Sections (Segments) */}
          {/* Dry (Left) */}
          <path d="M 20 100 A 80 80 0 0 1 65 35" fill="none" stroke="#fbbf24" strokeWidth="20" strokeDasharray="1000" strokeDashoffset="0" className="opacity-30" />
          {/* Standard (Top) */}
          <path d="M 65 35 A 80 80 0 0 1 135 35" fill="none" stroke="#22c55e" strokeWidth="20" className="opacity-80" />
          {/* Wet (Right) */}
          <path d="M 135 35 A 80 80 0 0 1 180 100" fill="none" stroke="#3b82f6" strokeWidth="20" className="opacity-80" />

          {/* Needle */}
          <g transform={`rotate(${rotation} 100 100)`} className="transition-transform duration-1000 ease-out">
             <path d="M 100 100 L 100 20" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
             <circle cx="100" cy="100" r="8" fill="#1f2937" />
          </g>
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-4 text-[10px] font-bold text-yellow-600">KHÔ (8%)</div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-600 bg-white px-2 py-0.5 rounded-full shadow-sm">CHUẨN (13%)</div>
        <div className="absolute bottom-0 right-4 text-[10px] font-bold text-blue-600">ƯỚT (18%)</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[1200] bg-black flex flex-col font-sans h-[100dvh]">
        
        {/* 1. HEADER (Floating Glass) */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4">
            <div className="flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-lg shadow-blue-500/30">
                        <Droplets className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-blue-200">Agri-OS</span>
                        <span className="block text-xs font-bold text-white tracking-wide">Moisture Vision</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 relative flex flex-col bg-[#0a0a0a]">
            
            {/* --- VIEW: CAPTURE --- */}
            {step === 'capture' && (
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleCapture}
                    />
                    
                    {/* HUD Overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {/* Grid Lines */}
                        <div className="w-full h-full opacity-10" 
                             style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
                        </div>
                        
                        {/* Corners */}
                        <div className="absolute top-24 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-400 rounded-tl-xl"></div>
                        <div className="absolute top-24 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-400 rounded-tr-xl"></div>
                        <div className="absolute bottom-32 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-400 rounded-bl-xl"></div>
                        <div className="absolute bottom-32 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-400 rounded-br-xl"></div>

                        {/* Center Target */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="w-64 h-64 border border-white/20 rounded-full flex items-center justify-center animate-[pulse_3s_infinite]">
                                <div className="w-60 h-60 border border-white/10 rounded-full border-dashed animate-[spin_10s_linear_infinite]"></div>
                                <div className="absolute w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
                            </div>
                        </div>

                        {/* Tech Labels */}
                        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full border border-blue-500/30 backdrop-blur-md">
                            <p className="text-[10px] font-mono text-blue-300 tracking-widest">AI TARGET LOCK</p>
                        </div>
                    </div>

                    {/* Bottom Control */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-8 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                        <p className="text-center text-white/60 text-xs mb-6 font-medium">
                            Giữ chắc tay. Căn hạt cà phê vào tâm.
                        </p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative w-full flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-blue-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
                            <div className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/10 backdrop-blur-md transition-transform group-active:scale-90">
                                <div className="w-16 h-16 bg-white rounded-full"></div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* --- VIEW: ANALYZING --- */}
            {step === 'analyzing' && image && (
                <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
                    <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-40 grayscale" />
                    
                    {/* Scanning Laser Beam */}
                    <div className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_#60a5fa,0_0_40px_#3b82f6] animate-[scan_2s_linear_infinite] z-20"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                        <div className="w-32 h-32 relative">
                             <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                             <div className="absolute inset-0 border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                             <div className="absolute inset-2 bg-black/60 rounded-full backdrop-blur-md flex items-center justify-center">
                                 <Zap className="h-10 w-10 text-blue-400 animate-pulse" />
                             </div>
                        </div>
                        <h3 className="mt-8 text-2xl font-black text-white tracking-widest uppercase animate-pulse">
                            Processing
                        </h3>
                        <div className="mt-2 flex gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                        </div>
                        <p className="mt-4 text-[10px] font-mono text-blue-300/70 border border-blue-500/20 px-4 py-1 rounded-full">
                            Analyzing Texture & Color Hex...
                        </p>
                    </div>
                </div>
            )}

            {/* --- VIEW: RESULT (The "Stitched" Ticket) --- */}
            {step === 'result' && result && (
                <div className="flex-1 bg-[#F0FDF4] flex flex-col relative">
                    {/* Top Image Preview */}
                    <div className="h-1/3 w-full relative">
                        <img src={image!} alt="Result" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F0FDF4] via-transparent to-transparent"></div>
                        <button onClick={reset} className="absolute top-24 right-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/20">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Ticket Content - Sliding Up */}
                    <div className="flex-1 px-5 -mt-10 pb-8 relative z-10 flex flex-col justify-end">
                        
                        {/* THE "STITCHED" CARD */}
                        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
                            {/* Decorative Stitch Line (Dashed Border Top) */}
                            <div className="absolute top-0 left-4 right-4 h-0.5 border-t-2 border-dashed border-gray-200 mt-2"></div>

                            <div className="p-6 text-center">
                                <div className="mb-4">
                                    <MoistureGauge value={result.moisture} />
                                </div>

                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
                                        {result.moisture}
                                        <span className="text-xl text-gray-400 align-top">%</span>
                                    </h2>
                                </div>

                                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    result.status === 'STANDARD' ? 'bg-green-100 text-green-700 border-green-200' :
                                    result.status === 'WET' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                    {result.status === 'STANDARD' ? <CheckCircle2 className="h-3 w-3" /> :
                                     result.status === 'WET' ? <Droplets className="h-3 w-3" /> :
                                     <Sun className="h-3 w-3" />}
                                    {result.status === 'STANDARD' ? 'Đạt Chuẩn Xuất Khẩu' :
                                     result.status === 'WET' ? 'Còn Ẩm (Cần Phơi)' : 'Quá Khô (Mất Ký)'}
                                </div>
                            </div>

                            {/* Info Section with "Stitch" Divider */}
                            <div className="relative bg-gray-50 p-5">
                                {/* Zigzag/Stitch Divider SVG */}
                                <div className="absolute -top-3 left-0 w-full h-3 overflow-hidden">
                                    <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full text-gray-50 fill-current">
                                        <path d="M0 10 L5 0 L10 10 L15 0 L20 10 L25 0 L30 10 L35 0 L40 10 L45 0 L50 10 L55 0 L60 10 L65 0 L70 10 L75 0 L80 10 L85 0 L90 10 L95 0 L100 10 V10 H0 Z" />
                                    </svg>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <Maximize className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Phân tích AI</p>
                                            <p className="text-xs font-medium text-gray-700 leading-tight">
                                                {result.color_analysis}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price Impact Box */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl border border-dashed ${
                                        result.status === 'STANDARD' 
                                        ? 'bg-green-50 border-green-300' 
                                        : 'bg-red-50 border-red-300'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            {result.status === 'STANDARD' ? (
                                                <div className="p-1.5 bg-green-200 rounded-full text-green-700"><CheckCircle2 className="h-3.5 w-3.5"/></div>
                                            ) : (
                                                <div className="p-1.5 bg-red-200 rounded-full text-red-700"><AlertTriangle className="h-3.5 w-3.5"/></div>
                                            )}
                                            <div>
                                                <p className={`text-[10px] font-black uppercase ${result.status === 'STANDARD' ? 'text-green-700' : 'text-red-700'}`}>
                                                    {result.status === 'STANDARD' ? 'Giá tốt nhất' : 'Trừ lùi dự kiến'}
                                                </p>
                                                {result.status !== 'STANDARD' && (
                                                    <p className="text-[10px] font-medium text-red-600">
                                                        -{calculateImpact(result.moisture).toLocaleString()}đ / kg
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-500">Lời khuyên</p>
                                            <p className="text-[10px] font-bold text-gray-800 max-w-[120px] truncate">{result.advice}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={reset}
                                className="flex-1 py-4 rounded-2xl bg-white border border-gray-200 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm"
                            >
                                Chụp lại
                            </button>
                            <button 
                                onClick={handleApply}
                                className="flex-[2] group py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-800 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                            >
                                <span>Áp dụng ngay</span>
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        <style>{`
            @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
        `}</style>
    </div>
  );
};

export default MoistureScannerModal;
