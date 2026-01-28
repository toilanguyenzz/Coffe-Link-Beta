
import React, { useState } from 'react';
import BottomNav from '../components/layout/BottomNav';
import { ShieldCheck, DollarSign, Loader2, RotateCcw, CheckCircle2, X, MapPin, Camera, Leaf, Building2, AlertTriangle, Sparkles, TrendingUp, Info } from 'lucide-react';
import DailyLedger, { Transaction } from '../components/finance/DailyLedger';
import TransactionHistory from '../components/finance/TransactionHistory';
import SeasonReport from '../components/finance/SeasonReport';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../contexts/DemoAuthContext';
import { useTrustScore } from '../hooks/useTrustScore';

const Finance: React.FC = () => {
    const { transactions, addTransaction, deleteTransaction, loading: financeLoading } = useFinance();
    const { userProfile } = useAuth();
    const { scoreData, loading: scoreLoading } = useTrustScore();

    // Undo State
    const [lastTxId, setLastTxId] = useState<string | null>(null);

    // Loan Application State
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [loanStep, setLoanStep] = useState<'form' | 'processing' | 'success'>('form');

    // Derive UI values from Score Data
    const trustScore = scoreData?.totalScore || 500;
    const tier = scoreData?.tier || 'BRONZE';
    const components = scoreData?.components || { base: 500, compliance: 0, frequency: 0, financial: 0, penalty: 0 };

    const gaugeColor = tier === 'DIAMOND' ? 'text-cyan-500' : tier === 'GOLD' ? 'text-yellow-500' : tier === 'SILVER' ? 'text-gray-400' : 'text-orange-500';

    // --- LOAN HANDLERS ---
    const handleLoanClick = () => {
        setShowLoanModal(true);
        setLoanStep('form');
    };

    const submitLoanApplication = () => {
        setLoanStep('processing');
        setTimeout(() => {
            setLoanStep('success');
        }, 2500);
    };

    // --- TRANSACTION HANDLERS ---
    const handleAddTransaction = async (newTx: Transaction) => {
        const newId = await addTransaction({
            amount: newTx.amount,
            type: newTx.type,
            category: newTx.category,
            note: newTx.note,
            date: newTx.date
        });
        if (newId) setLastTxId(newId);
    };

    const handleUndo = async () => {
        if (lastTxId) {
            const success = await deleteTransaction(lastTxId);
            if (success) setLastTxId(null);
        }
    };

    const handleDeleteTransaction = async (id: string | number) => {
        if (window.confirm("Bác có chắc chắn muốn xóa giao dịch này không?")) {
            await deleteTransaction(String(id));
        }
    };

    if (financeLoading || scoreLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-800 to-green-950 px-6 pt-12 pb-24 text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                {/* Centered Header Content */}
                <div className="mx-auto max-w-xl relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Tài Chính</h1>
                        <p className="text-sm font-medium text-green-100 opacity-90">Agri-Trust Score</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <DollarSign className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>

            {/* Main Content Centered */}
            <div className="mx-auto max-w-xl px-5 -mt-20 relative z-20 space-y-8">

                {/* SECTION A: AGRI-TRUST SCORE DASHBOARD */}
                <div className="rounded-[2.5rem] bg-white p-6 shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Penalty Alert Overlay */}
                    {components.penalty > 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest animate-pulse">
                            <AlertTriangle className="inline-block h-3 w-3 mr-1 mb-0.5" /> Phát hiện bất thường (-{components.penalty} điểm)
                        </div>
                    )}

                    <div className="text-center mb-6 mt-2">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Điểm Tín Nhiệm</p>
                            <Info className="h-3 w-3 text-gray-300" />
                        </div>

                        {/* GAUGE VISUAL */}
                        <div className="relative h-40 w-full flex items-end justify-center overflow-hidden">
                            <svg viewBox="0 0 200 110" className="w-64 h-auto">
                                {/* Background Arc */}
                                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f3f4f6" strokeWidth="15" strokeLinecap="round" />
                                {/* Active Arc (Dynamic) */}
                                <path
                                    d="M 20 100 A 80 80 0 0 1 180 100"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="15"
                                    strokeLinecap="round"
                                    className={`${gaugeColor} transition-all duration-1000 ease-out`}
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 - (251.2 * (trustScore / 1000))}
                                />
                            </svg>
                            <div className="absolute bottom-0 text-center">
                                <p className={`text-5xl font-black tracking-tighter ${gaugeColor} drop-shadow-sm`}>{trustScore}</p>
                                <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase mt-1 ${tier === 'DIAMOND' ? 'bg-cyan-50 text-cyan-600' :
                                        tier === 'GOLD' ? 'bg-yellow-50 text-yellow-600' :
                                            'bg-gray-100 text-gray-500'
                                    }`}>
                                    Hạng {tier === 'DIAMOND' ? 'Kim Cương' : tier === 'GOLD' ? 'Vàng' : tier === 'SILVER' ? 'Bạc' : 'Đồng'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FACTOR BREAKDOWN */}
                    <div className="space-y-3 mb-6">
                        {/* Factor A: Compliance */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tuân thủ quy trình</p>
                                    <p className="text-xs font-bold text-gray-800">
                                        {components.compliance}/200
                                    </p>
                                </div>
                            </div>
                            <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${(components.compliance / 200) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Factor B: Frequency */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-green-100 text-green-600">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tần suất thăm vườn</p>
                                    <p className="text-xs font-bold text-gray-800">
                                        {components.frequency}/100
                                    </p>
                                </div>
                            </div>
                            <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${(components.frequency / 100) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Factor C: Financial */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                                    <Leaf className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sức khỏe tài chính</p>
                                    <p className="text-xs font-bold text-gray-800">
                                        {components.financial}/200
                                    </p>
                                </div>
                            </div>
                            <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-500" style={{ width: `${(components.financial / 200) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* CALL TO ACTION (LOAN) */}
                    {trustScore >= 700 ? (
                        <button
                            onClick={handleLoanClick}
                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-white shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-widest">Kết nối gói vay Tín Dụng Xanh</span>
                            </div>
                        </button>
                    ) : (
                        <div className="text-center p-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-200 border-dashed">
                            Cần thêm <span className="font-bold text-gray-800">{700 - trustScore} điểm</span> để mở khóa gói vay ưu đãi.
                            <br />
                            <span className="text-[10px] text-gray-400">Gợi ý: Nhập thêm chi phí đầu vào Hữu cơ (+50 điểm)</span>
                        </div>
                    )}
                </div>

                {/* SECTION B: DAILY LEDGER */}
                <div>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Sổ Thu Chi Hàng Ngày</h3>
                    </div>
                    <DailyLedger onSave={handleAddTransaction} />
                </div>

                {/* SECTION C: SEASON REPORT */}
                <SeasonReport transactions={transactions as any} />

                {/* SECTION D: TRANSACTION HISTORY */}
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-gray-400 px-2">Dòng Thời Gian</h3>
                    <TransactionHistory transactions={transactions as any} onDelete={handleDeleteTransaction} />
                </div>

            </div>

            {/* LOAN APPLICATION MODAL */}
            {showLoanModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl">
                        {loanStep === 'form' && (
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-bold">NB</div>
                                        <h3 className="text-sm font-bold text-gray-800">Nam A Bank</h3>
                                    </div>
                                    <button onClick={() => setShowLoanModal(false)} className="bg-gray-100 p-2 rounded-full"><X className="h-4 w-4" /></button>
                                </div>

                                <h2 className="text-xl font-black text-gray-900 mb-2">Hồ sơ vay vốn</h2>
                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl mb-6">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-green-600 fill-green-600" />
                                        <span className="text-xs font-bold text-green-800">Agri-Trust: {trustScore}</span>
                                    </div>
                                    <span className="text-[10px] font-bold bg-white text-green-600 px-2 py-0.5 rounded shadow-sm">ĐỦ ĐIỀU KIỆN</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Họ và tên</label>
                                        <input type="text" value={userProfile?.displayName || ''} readOnly className="w-full mt-1 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed" />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Diện tích</label>
                                            <input type="text" value="1.5 Ha" readOnly className="w-full mt-1 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Sản lượng</label>
                                            <input type="text" value="5.2 Tấn" readOnly className="w-full mt-1 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Khoản vay đề nghị</label>
                                        <input type="text" value="50.000.000 VNĐ" readOnly className="w-full mt-1 bg-blue-50 border-blue-100 rounded-xl text-lg font-black text-blue-700 cursor-not-allowed" />
                                    </div>
                                </div>

                                <button
                                    onClick={submitLoanApplication}
                                    className="mt-8 w-full bg-green-700 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                                >
                                    Gửi Hồ Sơ Ngay
                                </button>
                            </div>
                        )}

                        {loanStep === 'processing' && (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">Đang mã hóa hồ sơ...</h3>
                                <p className="text-xs text-gray-500 mt-2">Đang gửi dữ liệu Agri-Trust Score đến ngân hàng đối tác.</p>
                            </div>
                        )}

                        {loanStep === 'success' && (
                            <div className="p-8 text-center bg-gradient-to-b from-green-50 to-white">
                                <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-black text-green-800 mb-2">Thành Công!</h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    Hồ sơ số <b>#AGRI-2026-X99</b> đã được gửi đi. Cán bộ tín dụng sẽ liên hệ bác trong 24h.
                                </p>
                                <button
                                    onClick={() => setShowLoanModal(false)}
                                    className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* UNDO TOAST */}
            {lastTxId && (
                <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="mx-auto max-w-xl flex items-center justify-between rounded-2xl bg-gray-900/95 p-4 shadow-2xl backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-500/20 p-1">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Đã lưu giao dịch</p>
                                <p className="text-[10px] text-gray-400">Nhập sai? Hoàn tác ngay</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleUndo}
                                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-yellow-400 hover:bg-white/20 active:scale-95 transition-all"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Hoàn tác
                            </button>
                            <button
                                onClick={() => setLastTxId(null)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/20 active:scale-95 transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    );
};
export default Finance;
