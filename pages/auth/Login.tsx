
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Sprout, Lock, Mail, Loader2, ArrowRight, Leaf, ShieldCheck, Database } from 'lucide-react';

const Login: React.FC = () => {
  const { currentUser } = useAuth();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      // Show specific error messages based on Firebase error codes
      const errorCode = err?.code || 'unknown';
      if (errorCode === 'auth/user-not-found') {
        setError('Tài khoản không tồn tại. Vui lòng đăng ký trước.');
      } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
      } else if (errorCode === 'auth/invalid-email') {
        setError('Email không hợp lệ.');
      } else if (errorCode === 'auth/network-request-failed') {
        setError('Lỗi mạng. Vui lòng kiểm tra kết nối Internet.');
      } else {
        setError(`Đăng nhập thất bại (${errorCode}). Vui lòng thử lại.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    setError('');

    // Optional: Auto-fill for quick testing based on mode
    if (newMode) {
      setEmail('admin@agrios.local');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  // Theme Config based on Mode
  const themeClasses = isAdminMode
    ? "from-slate-900 via-gray-900 to-slate-800"
    : "from-green-900 via-emerald-800 to-teal-900";

  const buttonClasses = isAdminMode
    ? "from-blue-600 to-indigo-700 shadow-blue-900/50"
    : "from-green-700 to-emerald-600 shadow-green-200";

  const iconColor = isAdminMode ? "text-blue-400" : "text-green-600";
  const focusRing = isAdminMode ? "focus:ring-blue-500" : "focus:ring-green-500";

  return (
    <div className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br ${themeClasses} px-4 py-8 transition-colors duration-700`}>

      {/* Decorative Background Elements */}
      <div className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] animate-pulse ${isAdminMode ? 'bg-blue-500/10' : 'bg-green-500/20'}`}></div>
      <div className={`absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] rounded-full blur-[120px] ${isAdminMode ? 'bg-indigo-500/10' : 'bg-emerald-400/10'}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-black/5">

          {/* Header Section */}
          <div className={`relative px-8 pt-12 pb-10 text-white overflow-hidden transition-colors duration-500 bg-gradient-to-br ${isAdminMode ? 'from-slate-800 to-gray-900' : 'from-green-600 to-emerald-700'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {isAdminMode ? (
                <Database className="h-40 w-40 rotate-12 -translate-y-10 translate-x-10" />
              ) : (
                <Leaf className="h-40 w-40 rotate-12 -translate-y-10 translate-x-10" />
              )}
            </div>
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="relative z-10 flex flex-col items-start">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
                {isAdminMode ? (
                  <ShieldCheck className="h-8 w-8 text-white fill-white/10" />
                ) : (
                  <Sprout className="h-8 w-8 text-white fill-white/20" />
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight">
                {isAdminMode ? 'Admin Portal' : 'Agri-OS'}
              </h1>
              <p className="text-green-50 font-medium text-sm mt-1 opacity-90">
                {isAdminMode ? 'Hệ thống quản trị tập trung' : 'Hệ điều hành Nông nghiệp 4.0'}
              </p>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5"></div>
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="group">
                <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:${iconColor} transition-colors`}>
                  Email đăng nhập
                </label>
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className={`h-5 w-5 text-gray-400 group-focus-within:${iconColor} transition-colors`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-inner ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset ${focusRing} transition-all`}
                    placeholder={isAdminMode ? "admin@agrios.local" : "nongdan@example.com"}
                  />
                </div>
              </div>

              <div className="group">
                <label className={`mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:${iconColor} transition-colors`}>
                  Mật khẩu
                </label>
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className={`h-5 w-5 text-gray-400 group-focus-within:${iconColor} transition-colors`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-inner ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset ${focusRing} transition-all`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r ${buttonClasses} py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0"></div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 relative z-10">
                    <span>{isAdminMode ? 'Truy cập Admin' : 'Truy cập Vườn'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>
            </form>

            {/* Toggle Admin / User Mode */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex flex-col items-center gap-4">
                {!isAdminMode && (
                  <p className="text-xs font-medium text-gray-500">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold text-green-700 hover:text-green-800 hover:underline transition-colors">
                      Đăng ký miễn phí
                    </Link>
                  </p>
                )}

                <button
                  onClick={toggleAdminMode}
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2"
                >
                  {isAdminMode ? (
                    <>
                      <Sprout className="h-3 w-3" /> Quay lại giao diện Nông dân
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-3 w-3" /> Đăng nhập Quản trị viên
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-center opacity-60">
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${isAdminMode ? 'bg-blue-400' : 'bg-green-400'}`}></div>
            <p className="text-[9px] font-bold text-white uppercase tracking-widest">
              Super App v2.1 {isAdminMode ? '(Admin)' : '(Farmer)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
