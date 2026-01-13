
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CloudRain, 
  Droplets, 
  UserCheck, 
  Bug, 
  X, 
  Loader2, 
  Zap,
  ChevronRight,
  CloudSun,
  CheckCircle2,
  AlertTriangle,
  ScanLine,
  Wind,
  Users,
  Timer,
  FlaskConical,
  ShieldAlert,
  Sprout
} from 'lucide-react';
import { useTools } from '../../contexts/ToolsContext';
import { analyzePlantDisease, PlantAnalysisResult, PlantDoctorError } from '../../services/PlantDoctorService';

const CareView: React.FC = () => {
  const navigate = useNavigate();
  const { setMoisture } = useTools();
  const [rainProbability] = useState<number>(30); 
  const isTrafficLightGreen = rainProbability < 60;

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'analyzing' | 'result' | 'error'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // AI Result State
  const [aiResult, setAiResult] = useState<PlantAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vivid Services List
  const services = [
    {
      id: 'pest',
      title: 'Soi Sâu Bệnh',
      desc: 'AI chẩn đoán bệnh',
      image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=400&auto=format&fit=crop',
      icon: Bug,
      color: 'from-purple-500 to-indigo-600',
      action: () => fileInputRef.current?.click()
    },
    {
      id: 'drone',
      title: 'Drone Bay',
      desc: 'Phun thuốc tự động',
      image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?q=80&w=400&auto=format&fit=crop',
      icon: ScanLine,
      color: 'from-orange-500 to-amber-500',
    },
    {
      id: 'labor',
      title: 'Nhân Công',
      desc: 'Tìm đội khoán',
      image: 'https://images.unsplash.com/photo-1634626033333-5c829987c699?q=80&w=400&auto=format&fit=crop',
      icon: UserCheck,
      color: 'from-green-500 to-emerald-600',
    }
  ];

  // HANDLERS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation
      if (file.size > 5 * 1024 * 1024) {
          alert("Ảnh quá lớn (Max 5MB). Vui lòng chọn ảnh khác.");
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setShowScanner(true);
        setScanStep('idle');
        setAiResult(null);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setScanStep('analyzing');
    setErrorMessage('');

    try {
      // Call the Enterprise Service
      const result = await analyzePlantDisease(capturedImage);
      setAiResult(result);
      setScanStep('result');
    } catch (error: any) {
      setScanStep('error');
      if (error instanceof PlantDoctorError) {
          setErrorMessage(error.message);
      } else {
          setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  const handleCloseScanner = () => {
      setShowScanner(false);
      setCapturedImage(null);
      setAiResult(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-10">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* 1. GLASS WEATHER WIDGET */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-6 text-white shadow-2xl transition-all duration-500 ${
        isTrafficLightGreen 
          ? 'bg-gradient-to-br from-[#059669] to-[#047857]' 
          : 'bg-gradient-to-br from-red-600 to-red-800'
      }`}>
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
             <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md border border-white/20">
                   {isTrafficLightGreen ? <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> : <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />}
                   <span className="uppercase tracking-wide">{isTrafficLightGreen ? 'Thời Tiết Tốt' : 'Cảnh Báo Mưa'}</span>
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-tighter">28°C</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-white/80 mt-1">
                   <Wind className="h-3.5 w-3.5" /> Gió nhẹ • Độ ẩm 72%
                </div>
             </div>
             
             <div className="h-16 w-16">
                 {isTrafficLightGreen 
                    ? <CloudSun className="h-full w-full text-yellow-300 drop-shadow-lg" /> 
                    : <Zap className="h-full w-full text-yellow-300 drop-shadow-lg" />}
             </div>
          </div>

          <div className="mt-6 rounded-2xl bg-black/20 p-4 backdrop-blur-md border border-white/10">
             <div className="flex gap-3">
                 {isTrafficLightGreen 
                    ? <CheckCircle2 className="h-5 w-5 text-green-300 shrink-0 mt-0.5" /> 
                    : <AlertTriangle className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5" />}
                 <div>
                     <p className="text-sm font-bold leading-tight">
                         {isTrafficLightGreen ? 'Nên bón phân ngay hôm nay' : 'Hoãn bón phân, trời sắp mưa lớn'}
                     </p>
                     <p className="text-[10px] text-white/70 mt-1">
                         {isTrafficLightGreen ? 'Đất đủ ẩm, rễ hấp thu tốt nhất.' : 'Nguy cơ rửa trôi cao.'}
                     </p>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. SERVICES SCROLLER */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Công nghệ hỗ trợ</h3>
            <ChevronRight className="h-4 w-4 text-gray-300" />
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-4 px-2 no-scrollbar snap-x snap-mandatory">
            {services.map((s) => (
                <button 
                    key={s.id}
                    onClick={s.action}
                    className="snap-center group relative h-48 w-36 shrink-0 overflow-hidden rounded-[2rem] shadow-lg transition-all active:scale-95"
                >
                    <img 
                        src={s.image} 
                        alt={s.title} 
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-left">
                        <div className={`mb-auto self-start rounded-xl bg-gradient-to-br ${s.color} p-2 text-white shadow-md transform group-hover:-translate-y-1 transition-transform`}>
                            <s.icon className="h-4 w-4" />
                        </div>
                        
                        <div>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-wide mb-0.5">{s.desc}</p>
                            <h4 className="text-sm font-black leading-tight text-white shadow-black drop-shadow-md">
                                {s.title}
                            </h4>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* 3. AI SCANNER MODAL */}
      {showScanner && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95 animate-in fade-in duration-300">
             {/* Header */}
             <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-white">
                    <div className="p-1.5 rounded-full bg-purple-500/20 border border-purple-500/50">
                        <Bug className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Agri-Doctor</span>
                </div>
                <button onClick={handleCloseScanner} className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md">
                    <X className="h-6 w-6" />
                </button>
             </div>

             {/* Image Area */}
             <div className={`relative flex-1 bg-black flex flex-col items-center justify-center p-6 transition-all duration-500 ${scanStep === 'result' ? 'flex-[0.4]' : 'flex-1'}`}>
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl">
                    <img src={capturedImage!} alt="Scan" className="h-full w-full object-cover" />
                    
                    {/* Analyzing Overlay */}
                    {scanStep === 'analyzing' && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                             <div className="relative">
                                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl animate-pulse opacity-50"></div>
                                <Loader2 className="relative h-12 w-12 text-white animate-spin" />
                             </div>
                             <p className="text-white font-bold tracking-widest uppercase mt-4 animate-pulse text-xs">Đang chẩn đoán...</p>
                        </div>
                    )}

                    {/* Error Overlay */}
                    {scanStep === 'error' && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-red-900/80 backdrop-blur-md px-6 text-center">
                             <AlertTriangle className="h-12 w-12 text-white mb-4" />
                             <p className="text-white font-bold mb-2">Không thể phân tích</p>
                             <p className="text-white/80 text-xs mb-6">{errorMessage}</p>
                             <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 rounded-xl bg-white text-red-900 font-bold text-xs uppercase tracking-widest shadow-lg"
                             >
                                Chụp lại ảnh khác
                             </button>
                        </div>
                    )}
                </div>
             </div>

             {/* Result Area (Sliding Up) */}
             <div className={`bg-[#111] border-t border-white/10 transition-all duration-500 ${scanStep === 'result' ? 'flex-1 p-0 overflow-hidden' : 'p-8 min-h-[120px]'}`}>
                {scanStep === 'idle' ? (
                     <button 
                        onClick={handleAnalyze}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest shadow-lg shadow-purple-900/50 hover:scale-[1.02] transition-transform active:scale-95"
                     >
                        Bắt Đầu Chẩn Đoán
                     </button>
                ) : scanStep === 'result' && aiResult ? (
                     <div className="h-full overflow-y-auto p-6 space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                        {/* 1. Diagnosis Header */}
                        <div className="flex items-start gap-4">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
                                aiResult.severity === 'HIGH' ? 'bg-red-500 shadow-red-500/30' :
                                aiResult.severity === 'MEDIUM' ? 'bg-orange-500 shadow-orange-500/30' :
                                'bg-green-500 shadow-green-500/30'
                            }`}>
                                <Bug className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-white leading-tight">{aiResult.disease_name}</h3>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                        aiResult.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 
                                        aiResult.severity === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                                    }`}>
                                        Độ tin cậy: {aiResult.confidence}%
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-gray-400 mt-1 leading-relaxed">
                                    {aiResult.diagnosis}
                                </p>
                            </div>
                        </div>

                        {/* 2. Treatment Plan */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Phác đồ điều trị</h4>
                            
                            {/* Chemical */}
                            {aiResult.treatment.chemical && (
                                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FlaskConical className="h-4 w-4 text-purple-400" />
                                        <span className="text-xs font-bold text-purple-200 uppercase">Thuốc BVTV (Hoạt chất)</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{aiResult.treatment.chemical}</p>
                                </div>
                            )}

                            {/* Biological */}
                            {aiResult.treatment.biological && (
                                <div className="bg-green-900/20 rounded-xl p-4 border border-green-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sprout className="h-4 w-4 text-green-400" />
                                        <span className="text-xs font-bold text-green-200 uppercase">Biện pháp sinh học</span>
                                    </div>
                                    <p className="text-sm font-bold text-white">{aiResult.treatment.biological}</p>
                                </div>
                            )}
                        </div>

                        {/* 3. Procedure */}
                        <div className="bg-gray-900 rounded-xl p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Quy trình xử lý</h4>
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {aiResult.treatment.procedure}
                            </p>
                        </div>

                        {/* 4. Prevention */}
                        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800/30">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> Phòng ngừa lâu dài
                            </h4>
                            <p className="text-sm text-blue-100 leading-relaxed">
                                {aiResult.prevention}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 pb-8 flex gap-3">
                            <button 
                                onClick={handleCloseScanner}
                                className="flex-1 py-3.5 rounded-xl bg-gray-800 text-white text-xs font-bold uppercase hover:bg-gray-700 transition-colors"
                            >
                                Đóng
                            </button>
                            <button 
                                className="flex-[2] py-3.5 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-900/50 hover:bg-purple-700 transition-colors"
                            >
                                Lưu vào nhật ký
                            </button>
                        </div>
                     </div>
                ) : null}
             </div>
        </div>
      )}
    </div>
  );
};

export default CareView;
