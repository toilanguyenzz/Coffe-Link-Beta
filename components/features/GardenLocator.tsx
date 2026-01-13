
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { MapPin, CheckCircle2, AlertTriangle, Loader2, Navigation, Scan, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GardenLocator: React.FC = () => {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra xem đã có tọa độ chưa
  const location = userProfile?.gardenLocation;
  const isVerified = !!location?.lat && !!location?.lng;
  const hasSurveyData = !!userProfile?.surveyData;

  const handleGetLocation = () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);

    // Kiểm tra trình duyệt hỗ trợ
    if (!navigator.geolocation) {
      setError("Trình duyệt của bạn không hỗ trợ định vị GPS.");
      setLoading(false);
      return;
    }

    // Gọi API Geolocation
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          // Lưu vào Firestore theo yêu cầu: users/{uid} -> gardenLocation
          const userRef = doc(db, 'users', currentUser.uid);
          
          await updateDoc(userRef, {
            gardenLocation: {
              lat: latitude,
              lng: longitude,
              accuracy: accuracy, // Lưu thêm độ chính xác để tham khảo
              verifiedAt: serverTimestamp() // Thời gian xác thực từ server
            }
          });

          // Cập nhật lại context để UI hiển thị ngay lập tức
          await refreshProfile();
        } catch (err) {
          console.error("Firebase Error:", err);
          setError("Lỗi khi lưu tọa độ vào hệ thống. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation Error:", err);
        let msg = "Không thể lấy vị trí.";
        if (err.code === 1) msg = "Vui lòng cho phép ứng dụng truy cập vị trí trong cài đặt.";
        else if (err.code === 2) msg = "Vị trí không khả dụng (mất tín hiệu GPS).";
        else if (err.code === 3) msg = "Quá thời gian chờ lấy tọa độ.";
        setError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full">
        {/* Error Notification */}
        {error && (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-red-700">Không thể lấy tọa độ</h4>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
            </div>
        )}

        {isVerified ? (
            /* --- STATE 1: ĐÃ CÓ TỌA ĐỘ (SUCCESS) --- */
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-green-200">
                 <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-green-50 blur-2xl"></div>
                 
                 <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-lg font-black text-green-700">Đã xác định vị trí</h3>
                    <p className="text-xs font-medium text-gray-500 mt-1">Vườn của bạn đã sẵn sàng cho EUDR</p>

                    <div className="mt-6 w-full grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="text-[10px] font-black uppercase text-gray-400">Vĩ độ (Lat)</p>
                            <p className="text-sm font-mono font-bold text-gray-800">{location.lat.toFixed(6)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="text-[10px] font-black uppercase text-gray-400">Kinh độ (Long)</p>
                            <p className="text-sm font-mono font-bold text-gray-800">{location.lng.toFixed(6)}</p>
                        </div>
                    </div>

                    {/* NEW: Button to Advanced Survey */}
                    <button 
                        onClick={() => navigate('/survey')}
                        className="mt-6 w-full group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-white shadow-lg shadow-blue-200 transition-all active:scale-95 hover:shadow-xl"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <div className="relative flex items-center gap-2">
                             <Scan className="h-4 w-4" />
                             <span className="text-xs font-black uppercase tracking-widest">
                                 {hasSurveyData ? 'Xem bản đồ đo đạc' : 'Đo Diện Tích Chính Xác'}
                             </span>
                             <ArrowRight className="h-4 w-4" />
                        </div>
                    </button>

                    <button 
                        onClick={handleGetLocation}
                        className="mt-4 flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-green-700 hover:underline"
                    >
                        <Navigation className="h-3 w-3" /> Cập nhật lại GPS cơ bản
                    </button>
                 </div>
            </div>
        ) : (
            /* --- STATE 2: CHƯA CÓ TỌA ĐỘ (ACTION REQUIRED) --- */
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">Định vị vườn EUDR</h3>
                        <p className="text-[11px] text-gray-500">Bắt buộc để truy xuất nguồn gốc</p>
                    </div>
                </div>

                <button
                    onClick={handleGetLocation}
                    disabled={loading}
                    className={`group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-green-600 py-4 text-white shadow-lg shadow-green-200 transition-all active:scale-95 ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-green-700'}`}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-wider">Đang lấy tín hiệu vệ tinh...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 animate-bounce" />
                            <span className="text-xs font-black uppercase tracking-widest">📍 Lấy Tọa Độ Vườn Hiện Tại</span>
                        </div>
                    )}
                </button>
                
                <p className="mt-3 text-center text-[10px] text-gray-400 italic">
                    *Vui lòng đứng tại giữa vườn để có độ chính xác cao nhất
                </p>
            </div>
        )}
    </div>
  );
};

export default GardenLocator;
