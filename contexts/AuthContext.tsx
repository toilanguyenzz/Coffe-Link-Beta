
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;

  logout: () => Promise<void>;
  updateFarmingMethod: (type: 'organic' | 'traditional') => Promise<void>;
  refreshProfile: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile from Firestore
  // Hàm lấy thông tin user từ Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        console.log("No user profile found in Firestore yet.");
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  // Logic cập nhật phương pháp canh tác và tạo FarmerID (nếu chưa có)
  const updateFarmingMethod = async (type: 'organic' | 'traditional') => {
    if (!currentUser) throw new Error("No user logged in");

    const docRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);

    // Kiểm tra xem đã có ID chưa, nếu chưa thì mới tạo (Fallback)
    let finalFarmerId = '';

    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      if (data.farmerId) {
        finalFarmerId = data.farmerId;
      } else {
        // Fallback gen ID nếu user cũ chưa có
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(10000 + Math.random() * 90000);
        finalFarmerId = `VN-${year}-${random}`;
      }

      // Document exists, update it normally
      const updates = {
        farmingType: type,
        farmerId: finalFarmerId, // Giữ nguyên ID cũ hoặc dùng ID mới tạo
        traceabilityEnabled: type === 'organic', // Chỉ bật truy xuất nguồn gốc nếu là Hữu cơ
        updatedAt: serverTimestamp()
      };
      await updateDoc(docRef, updates);
    } else {
      // Document does NOT exist (Recovery Mode). 
      const year = new Date().getFullYear().toString().slice(-2);
      const random = Math.floor(10000 + Math.random() * 90000);
      finalFarmerId = `VN-${year}-${random}`;

      const newProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Nông dân',
        farmerId: finalFarmerId,
        farmingType: type,
        role: 'farmer',
        traceabilityEnabled: type === 'organic',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(docRef, newProfile);
    }

    // Refresh local state immediately
    await fetchUserProfile(currentUser.uid);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser.uid);
    }
  }

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user profile exists
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create basic profile for new Google user
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(10000 + Math.random() * 90000);
        const generatedFarmerId = `VN-${year}-${random}`;

        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Nông dân',
          farmerId: generatedFarmerId,
          // We intentionally leave farmingType undefined so they are forced to Onboarding
          farmingType: null,
          role: 'farmer',
          traceabilityEnabled: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(docRef, newProfile);
        // Update local state
        setUserProfile(newProfile);
      } else {
        // Existing user, just fetch profile
        await fetchUserProfile(result.user.uid);
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    updateFarmingMethod,
    refreshProfile,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
