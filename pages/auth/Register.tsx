
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile } from '../../types';
import { Sprout, User, Lock, Mail, Loader2, ArrowRight, Leaf } from 'lucide-react';

const Register: React.FC = () => {
  const { currentUser } = useAuth();
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
