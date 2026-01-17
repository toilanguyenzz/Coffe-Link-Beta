import React from 'react';
import { Bell, CheckCircle2, X, Leaf } from 'lucide-react';
import { useReminders } from '../../contexts/ReminderContext';

const ReminderToast: React.FC = () => {
    const { activeToast, dismissToast } = useReminders();

    if (!activeToast) return null;

    return (
        <div className="fixed top-4 left-4 right-4 z-[2000] animate-in slide-in-from-top fade-in duration-500">
            <div className="max-w-md mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl shadow-emerald-500/30 overflow-hidden">
                {/* Animated top border */}
                <div className="h-1 bg-gradient-to-r from-yellow-400 via-green-400 to-emerald-400 animate-pulse" />

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Bell className="h-6 w-6 text-white animate-bounce" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Leaf className="h-3 w-3 text-green-300" />
                                <span className="text-[10px] font-black text-green-300 uppercase tracking-widest">
                                    Nhắc nhở từ CoffeeLink
                                </span>
                            </div>
                            <p className="text-white font-bold text-sm leading-relaxed">
                                {activeToast.message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={dismissToast}
                            className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={dismissToast}
                            className="flex-1 py-2.5 rounded-xl bg-white/20 text-white text-xs font-bold uppercase tracking-wide hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Đã xong
                        </button>
                        <button
                            onClick={dismissToast}
                            className="py-2.5 px-4 rounded-xl bg-white text-emerald-700 text-xs font-bold uppercase tracking-wide hover:bg-white/90 transition-colors"
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderToast;
