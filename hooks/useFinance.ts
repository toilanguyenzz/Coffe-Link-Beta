
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export interface TransactionData {
  id?: string;
  uid?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  note: string;
  date: string; // YYYY-MM-DD string from input
  createdAt?: any;
}

export const useFinance = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [financials, setFinancials] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  // 1. Hàm Thêm Giao Dịch - Trả về ID để dùng cho Undo
  const addTransaction = async (data: Omit<TransactionData, 'id' | 'uid' | 'createdAt'>) => {
    if (!currentUser) return null;

    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        uid: currentUser.uid,
        amount: Number(data.amount), // Đảm bảo lưu số
        type: data.type,
        category: data.category,
        note: data.note || '',
        date: data.date,
        createdAt: serverTimestamp() // Dùng server time để sort chuẩn xác
      });
      return docRef.id; // Trả về ID của doc vừa tạo
    } catch (err: any) {
      console.error("Lỗi thêm giao dịch:", err);
      setError(err.message);
      return null;
    }
  };

  // 2. Hàm Xóa Giao Dịch (Rollback)
  const deleteTransaction = async (transactionId: string) => {
    if (!currentUser) return false;
    try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        return true;
    } catch (err: any) {
        console.error("Lỗi xóa giao dịch:", err);
        return false;
    }
  };

  // 3. Realtime Listener
  useEffect(() => {
    if (!currentUser) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query: Lấy của user hiện tại, sắp xếp mới nhất lên đầu
    const q = query(
      collection(db, 'transactions'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: TransactionData[] = [];
      let income = 0;
      let expense = 0;

      snapshot.forEach((doc) => {
        const data = doc.data() as TransactionData;
        const item = { ...data, id: doc.id };
        docs.push(item);

        // Tính toán tổng
        const val = Number(data.amount) || 0;
        if (data.type === 'income') {
          income += val;
        } else if (data.type === 'expense') {
          expense += val;
        }
      });

      setTransactions(docs);
      setFinancials({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense
      });
      setLoading(false);
    }, (err) => {
      console.error("Lỗi lấy dữ liệu tài chính:", err);
      setError("Không thể tải dữ liệu giao dịch.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { 
    transactions, 
    financials, 
    addTransaction, 
    deleteTransaction,
    loading, 
    error 
  };
};
