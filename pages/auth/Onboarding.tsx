
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sprout, Loader2, ArrowRight } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { updateFarmingMethod, currentUser } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleStart = async () => {
    try {
      setProcessing(true);
      // Default to 'organic' to enable all unified features internally
      await updateFarmingMethod('organic'); 
      navigate('/');
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-8">
      <div className="w-full max-w-md text-center">
        
        <div className="mb-8 flex justify-center">
            <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-green-200 opacity-50 blur-lg animate-pulse"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-700 shadow-xl">
                    <Sprout className="h-12 w-12 text-white" />
                </div>
            </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">
          Chào mừng, {currentUser?.displayName}!
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed px-4">
          Hệ thống <b>Agri-OS</b> đã sẵn sàng. <br/>
          Quản lý vườn, theo dõi giá cả và kết nối tài chính - tất cả trong một ứng dụng duy nhất.
        </p>

        <button
            onClick={handleStart}
            disabled={processing}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-700 py-4 text-white shadow-xl shadow-green-200 transition-all active:scale-95 disabled:opacity-70"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0"></div>
            <div className="relative flex items-center justify-center gap-2">
                {processing ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-bold">Đang khởi tạo dữ liệu...</span>
                    </>
                ) : (
                    <>
                        <span className="text-sm font-black uppercase tracking-widest">Bắt đầu ngay</span>
                        <ArrowRight className="h-5 w-5" />
                    </>
                )}
            </div>
        </button>
        
        <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Phiên bản Super App 2.1
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
