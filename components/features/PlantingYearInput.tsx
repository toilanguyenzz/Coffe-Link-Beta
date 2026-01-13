import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Sprout, CheckCircle2, AlertTriangle, Calendar, Loader2, Info, Sparkles, Map, ShieldCheck, ShieldAlert } from 'lucide-react';
import { analyzeEUDR, EUDRAnalysisResult } from '../../utils/eudrService';

const PlantingYearInput: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  
  // State quản lý
  const [yearInput, setYearInput] = useState<string>(userProfile?.plantingYear?.toString() || '');
  const [status, setStatus] = useState<'idle' | 'valid' | 'warning' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // State cho AI Check
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<EUDRAnalysisResult | null>(null);

  const currentYear = new Date().getFullYear();

  // Logic Validate & EUDR Check (Real-time) - Client Side Basic Check
  useEffect(() => {
    if (!yearInput) {
      setStatus('idle');
      setMessage('');
      return;
    }

    const year = parseInt(yearInput);

    if (isNaN(year)) {
      setStatus('error');
      setMessage('Vui lòng nhập số năm hợp lệ.');
      return;
    }

    if (year < 1980 || year > currentYear) {
      setStatus('error');
      setMessage(`Năm trồng phải từ 1980 đến ${currentYear}.`);
      return;
    }

    if (year <= 2020) {
      setStatus('valid');
      setMessage('✅ Hợp lệ sơ bộ: Trồng trước 2020.');
    } else {
      setStatus('warning');
      setMessage('⚠️ Cảnh báo sơ bộ: Trồng sau 2020.');
    }
  }, [yearInput, currentYear]);

  // Xử lý gọi AI Service
  const handleAICheck = async () => {
    if (!userProfile?.gardenLocation) {
      alert("Vui lòng lấy tọa độ vườn (ở mục trên) trước khi thẩm định.");
      return;
    }

    const year = parseInt(yearInput);
    if (isNaN(year)) return;

    setAiLoading(true);
    setAiResult(null); // Reset kết quả cũ

    try {
      const result = await analyzeEUDR(year, userProfile.gardenLocation.lat, userProfile.gardenLocation.lng);
      if (result) {
        setAiResult(result);
      } else {
        alert("Không thể kết nối với hệ thống thẩm định AI. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  // Xử lý lưu vào Firestore
  const handleSave = async () => {
    if (!currentUser || status === 'error' || status === 'idle') return;

    setLoading(true);
    try {
      const year = parseInt(yearInput);
      // Nếu đã có kết quả AI, ưu tiên dùng status của AI, nếu không dùng logic cơ bản
      const eudrStatus = aiResult 
        ? (aiResult.eudr_status === 'APPROVED' ? 'passed' : 'needs_review')
        : (year <= 2020 ? 'passed' : 'needs_review');

      const userRef = doc(db, 'users', currentUser.uid);

      await setDoc(userRef, {
        plantingYear: year,
        eudrStatus: eudrStatus,
        updatedAt: serverTimestamp(),
        // Lưu thêm kết quả AI nếu có để làm bằng chứng
        lastAiAnalysis: aiResult ? {
            ...aiResult,
            analyzedAt: serverTimestamp()
        } : null
      }, { merge: true });

      await refreshProfile();
      alert("Đã lưu hồ sơ thành công!");
    } catch (err) {
      console.error("Error saving planting year:", err);
      alert("Lỗi khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'valid': return 'border-green-500 bg-green-50 text-green-700';
      case 'warning': return 'border-orange-500 bg-orange-50 text-orange-700';
      case 'error': return 'border-red-300 bg-red-50 text-red-600';
      default: return 'border-gray-200 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="w-full rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
          <Sprout className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Thời gian canh tác</h3>
          <p className="text-[10px] font-medium text-gray-400">Xác minh nguồn gốc đất trồng (EUDR)</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="relative">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                Năm trồng cà phê
            </label>
            <div className="relative">
                <input
                    type="number"
                    value={yearInput}
                    onChange={(e) => {
                        setYearInput(e.target.value);
                        setAiResult(null); // Reset AI result khi sửa năm
                    }}
                    placeholder="Ví dụ: 2015"
                    className={`block w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                        status === 'error' ? 'border-red-300 focus:border-red-500 focus:ring-red-200' :
                        status === 'warning' ? 'border-orange-300 focus:border-orange-500 focus:ring-orange-200' :
                        status === 'valid' ? 'border-green-300 focus:border-green-500 focus:ring-green-200' :
                        'border-gray-100 focus:border-green-500 focus:ring-green-100'
                    }`}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                </div>
            </div>
        </div>

        {/* Nút Thẩm Định AI */}
        {status !== 'error' && status !== 'idle' && !aiResult && (
             <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-1.5">
                        <Sparkles className="h-4 w-4 text-blue-600 fill-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide">Thẩm định AI Chuyên sâu</h4>
                        <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
                            Sử dụng AI để đối chiếu tọa độ vườn với dữ liệu vệ tinh & quy định EUDR.
                        </p>
                        
                        <button 
                            onClick={handleAICheck}
                            disabled={aiLoading}
                            className="mt-3 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-md active:scale-95 hover:bg-blue-700 transition-all disabled:opacity-70"
                        >
                            {aiLoading ? (
                                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Đang phân tích...</>
                            ) : (
                                "Chạy Thẩm Định Ngay"
                            )}
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Kết quả AI Analysis */}
        {aiResult && (
            <div className={`animate-in fade-in slide-in-from-top-4 rounded-xl border-l-4 p-4 shadow-sm ${
                aiResult.eudr_status === 'APPROVED' 
                ? 'border-l-green-500 bg-green-50/50 border-t border-r border-b border-green-100' 
                : 'border-l-red-500 bg-red-50/50 border-t border-r border-b border-red-100'
            }`}>
                <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${
                        aiResult.eudr_status === 'APPROVED' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                        {aiResult.eudr_status === 'APPROVED' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {aiResult.eudr_status === 'APPROVED' ? 'Đạt Chuẩn EUDR' : 'Cảnh Báo Rủi Ro'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">AI Verified</span>
                </div>
                
                <h4 className={`text-sm font-bold ${aiResult.eudr_status === 'APPROVED' ? 'text-green-800' : 'text-red-800'}`}>
                    {aiResult.compliance_message}
                </h4>

                <div className="mt-3 flex items-start gap-2 text-[11px] text-gray-600 bg-white/60 p-2 rounded-lg">
                    <Map className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                    <span>{aiResult.geo_verification}</span>
                </div>
            </div>
        )}

        {/* Nút Lưu Cuối Cùng */}
        <button
          onClick={handleSave}
          disabled={loading || status === 'error' || status === 'idle' || !yearInput}
          className={`flex w-full items-center justify-center rounded-xl py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            aiResult?.eudr_status === 'WARNING' 
                ? 'bg-orange-600 shadow-orange-200 hover:bg-orange-700' 
                : 'bg-green-700 shadow-green-200 hover:bg-green-800'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu hồ sơ...
            </>
          ) : (
            'Lưu Hồ Sơ Canh Tác'
          )}
        </button>
      </div>
    </div>
  );
};

export default PlantingYearInput;