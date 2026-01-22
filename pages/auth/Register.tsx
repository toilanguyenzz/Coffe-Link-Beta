
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types';
import { Sprout, User, Lock, Mail, Loader2, ArrowRight, Leaf } from 'lucide-react';

const Register: React.FC = () => {
  const { currentUser, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
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

  // Helper: Generate Unique Farmer ID
  // Format: VN-{YY}-{RANDOM 5 DIGIT} -> e.g., VN-24-59281
  const generateFarmerId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(10000 + Math.random() * 90000);
    return `VN-${year}-${random}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: name });

      // 3. Generate ID immediately
      const uniqueId = generateFarmerId();

      // 4. Create Base Firestore Profile with ID
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: name,
        farmerId: uniqueId, // ID được cấp ngay lập tức
        farmingType: null, // Set null to trigger Onboarding flow
        role: 'farmer',
        traceabilityEnabled: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);

      // 5. Redirect
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Đăng ký thất bại. Email có thể đã tồn tại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      if (loginWithGoogle) {
        await loginWithGoogle();
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 px-4 py-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-green-400/10 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-black/5">
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-teal-600 to-green-700 px-8 pt-10 pb-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Leaf className="h-32 w-32 -rotate-12 translate-x-5" />
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">Tạo Tài Khoản</h1>
                <p className="text-teal-50 font-medium text-xs opacity-90">Tham gia cộng đồng Agri-OS</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1.5"></div>
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="group">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  Họ và tên
                </label>
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-2xl border-0 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-inner ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="group">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  Email
                </label>
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border-0 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-inner ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all"
                    placeholder="email@vidu.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-teal-600 transition-colors">
                  Mật khẩu
                </label>
                <div className="relative transition-all duration-300 focus-within:scale-[1.02]">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border-0 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-bold text-gray-900 shadow-inner ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-green-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-teal-200 transition-all active:scale-95 hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0"></div>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang khởi tạo...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 relative z-10">
                    <span>Đăng Ký Ngay</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500 font-medium">Hoặc đăng ký bằng</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-4 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 hover:shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Google Icon SVG */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-medium text-gray-500">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800 hover:underline transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
