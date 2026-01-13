import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  runTransaction, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Deal } from '../types';

export const useMarketplace = () => {
  const { currentUser } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Logic Query
  useEffect(() => {
    setLoading(true);
    
    // Query chỉ sắp xếp theo thời gian tạo để tránh lỗi Index phức tạp lúc đầu
    const q = query(
      collection(db, 'deals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDeals: Deal[] = [];
      snapshot.forEach((doc) => {
        // Map data Firestore sang interface Deal
        fetchedDeals.push({ id: doc.id, ...doc.data() } as Deal);
      });

      // Sắp xếp Client-side: Promoted lên đầu
      fetchedDeals.sort((a, b) => {
        const p1 = a.isPromoted ? 1 : 0;
        const p2 = b.isPromoted ? 1 : 0;
        return p2 - p1; // Promoted lên đầu
      });

      setDeals(fetchedDeals);
      setLoading(false);
    }, (err) => {
      console.error("Lỗi tải Deals:", err);
      setError("Không thể tải danh sách sản phẩm.");
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  // 2. Logic Transaction: Giữ suất (Atomic Operation)
  const reserveSlot = async (dealId: string) => {
    if (!currentUser) throw new Error("Vui lòng đăng nhập để giữ suất.");

    try {
      await runTransaction(db, async (transaction) => {
        // A. Read Operation
        const dealRef = doc(db, 'deals', dealId);
        const dealSnap = await transaction.get(dealRef);

        if (!dealSnap.exists()) {
          throw "Sản phẩm không tồn tại!";
        }

        const data = dealSnap.data();
        const currentQuantity = data.currentQuantity || 0;
        const maxQuantity = data.maxQuantity || 0;

        // B. Logic Check
        if (currentQuantity >= maxQuantity) {
          throw "Rất tiếc, suất gom đơn này đã hết!";
        }

        // C. Write Operations
        
        // 1. Tăng số lượng (currentQuantity)
        transaction.update(dealRef, { 
            currentQuantity: currentQuantity + 1 
        });

        // 2. Tạo Order mới
        const newOrderRef = doc(collection(db, 'orders'));
        transaction.set(newOrderRef, {
            dealId: dealId,
            userId: currentUser.uid,
            productName: data.title, // Sử dụng field 'title' mới
            price: data.price,       // Sử dụng field 'price' mới
            status: 'reserved',
            createdAt: serverTimestamp()
        });
      });

      return true; // Success
    } catch (e: any) {
      console.error("Transaction failed: ", e);
      throw typeof e === 'string' ? new Error(e) : e;
    }
  };

  return { deals, loading, error, reserveSlot };
};
