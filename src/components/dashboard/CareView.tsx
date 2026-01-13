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
  Sprout,
  Calendar,
  Thermometer,
  MoreHorizontal
} from 'lucide-react';
import { useTools } from '../../contexts/ToolsContext';
import { analyzePlantDisease, PlantAnalysisResult, PlantDoctorError } from '../../services/PlantDoctorService';
import FarmHealthCard from './FarmHealthCard';
import { useAuth } from '../../contexts/AuthContext';

const CareView: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [rainProbability] = useState<number>(30); 
  const isTrafficLightGreen = rainProbability < 60;

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'analyzing' | 'result' | 'error'>('idle');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<PlantAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MOCK DATA FOR HORIZONTAL SCROLL ---
  const tasks = [
    { id: 1, title: 'Tưới nước', plot: 'Lô 3', status: 'Đang chạy', color: 'green', icon: Droplets, time: '7:30 AM' },
    { id: 2, title: 'Bón phân', plot: 'Lô 1', status: 'Chưa làm', color: 'gray', icon: Sprout, time: '8:00 AM' },
    { id: 3, title: 'Cắt tỉa', plot: 'Lô 5', status: 'Chưa làm', color: 'gray', icon: Zap, time: 'Chiều nay' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setShowScanner(true);
        setScanStep('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
      // Mock logic for UI demo
      if (!capturedImage) return;
      setScanStep('analyzing');
      try {
          const result = await analyzePlantDisease(capturedImage);
          setAiResult(result);
          setScanStep('result');
      } catch (e) {
          setScanStep('error');
      }
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* 1. WEATHER CARD (DARK THEME LIKE REFERENCE) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1C1C1E] p-8 text-white shadow-2xl">
         {/* Background Glow */}
         <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-green-500/20 blur-3xl"></div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-8">
                 <div>
                     <p className="text-lg font-medium text-gray-300">Chào buổi sáng...</p>
                     <h2 className="text-6xl font-black tracking-tighter mt-2">16°C</h2>
                     <div className="mt-3 flex items-center gap-4 text-sm font-medium text-gray-400">
                         <span className="flex items-center gap-1"><Wind className="h-4 w-4" /> 2.4 km/h</span>
                         <span className="flex items-center gap-1"><Droplets className="h-4 w-4" /> 72.5%</span>
                     </div>
                 </div>
                 <div className="flex flex-col items-end">
                     <CloudSun className="h-16 w-16 text-white mb-2" />
                     <p className="font-bold text-lg">Có mây</p>
                     <p className="text-sm text-gray-400">7:30 AM | Thg 12</p>
                 </div>
             </div>

             {/* Action Button inside Weather Card */}
             <div className="flex gap-3">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-bold backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                 >
                     <ScanLine className="h-4 w-4" /> Soi Sâu Bệnh
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 text-sm font-bold shadow-lg shadow-green-900/50 hover:bg-green-500 transition-all">
                     <CheckCircle2 className="h-4 w-4" /> Check-in Vườn
                 </button>
             </div>
         </div>
      </div>

      {/* 2. ACTIVITY HORIZONTAL SCROLL (MATCHING REFERENCE) */}
      <div>
         <div className="flex items-center justify-between mb-4 px-1">
             <h3 className="text-lg font-bold text-gray-800">Hoạt động hôm nay</h3>
             <span className="text-xs font-bold text-green-600">24/31 Xong</span>
         </div>
         
         <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             {tasks.map(task => (
                 <div key={task.id} className="min-w-[160px] p-5 rounded-[2rem] bg-white shadow-sm border border-gray-100 flex flex-col justify-between h-40">
                     <div className="flex justify-between items-start">
                         <div className={`h-10 w-10 rounded-full flex items-center justify-center ${task.status === 'Đang chạy' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                             <task.icon className="h-5 w-5" />
                         </div>
                         <p className="text-xs font-bold text-gray-400">{task.time}</p>
                     </div>
                     <div>
                         <h4 className="font-bold text-gray-900 text-lg leading-tight">{task.title}</h4>
                         <p className="text-xs font-medium text-gray-500 mt-1">{task.plot}</p>
                     </div>
                     <div className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${task.status === 'Đang chạy' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                         {task.status}
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* 3. FIELD CARD (THE PREMIUM CARD) */}
      <h3 className="text-lg font-bold text-gray-800 px-1">Vườn của tôi</h3>
      <div onClick={() => navigate('/profile')}>
        {userProfile?.gardenMetrics && <FarmHealthCard metrics={userProfile.gardenMetrics} />}
      </div>

      {/* SCANNER MODAL (Hidden logic kept for functionality) */}
      {showScanner && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">AI Doctor</h3>
                     <button onClick={() => setShowScanner(false)}><X/></button>
                 </div>
                 {scanStep === 'idle' && (
                     <div className="space-y-4">
                         <img src={capturedImage!} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                         <button onClick={handleAnalyze} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Phân tích ngay</button>
                     </div>
                 )}
                 {scanStep === 'analyzing' && (
                     <div className="flex flex-col items-center py-10">
                         <Loader2 className="h-10 w-10 animate-spin text-green-600 mb-4" />
                         <p className="text-gray-500">Đang chẩn đoán...</p>
                     </div>
                 )}
                 {scanStep === 'result' && aiResult && (
                     <div>
                         <h4 className="text-xl font-black text-red-600 mb-1">{aiResult.disease_name}</h4>
                         <p className="text-gray-600 text-sm mb-4">{aiResult.diagnosis}</p>
                         <div className="bg-gray-50 p-3 rounded-xl">
                             <p className="text-xs font-bold text-gray-400 uppercase">Cách xử lý</p>
                             <p className="text-sm font-medium mt-1">{aiResult.treatment.chemical}</p>
                         </div>
                     </div>
                 )}
             </div>
        </div>
      )}
    </div>
  );
};

export default CareView;