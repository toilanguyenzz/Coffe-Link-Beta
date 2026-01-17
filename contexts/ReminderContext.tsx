import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Reminder {
    id: string;
    date: Date;
    message: string;
    type: 'fertilizer' | 'spray' | 'harvest' | 'general';
    isCompleted: boolean;
    createdAt: Date;
}

interface ReminderContextType {
    reminders: Reminder[];
    addReminder: (date: Date, message: string, type?: Reminder['type']) => void;
    removeReminder: (id: string) => void;
    markComplete: (id: string) => void;
    activeToast: Reminder | null;
    dismissToast: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

const STORAGE_KEY = 'coffeelink_reminders';

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [activeToast, setActiveToast] = useState<Reminder | null>(null);

    // Load dari localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setReminders(parsed.map((r: any) => ({
                    ...r,
                    date: new Date(r.date),
                    createdAt: new Date(r.createdAt)
                })));
            }
        } catch (e) {
            console.error('Failed to load reminders:', e);
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
        } catch (e) {
            console.error('Failed to save reminders:', e);
        }
    }, [reminders]);

    // Check for due reminders every minute
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const dueReminder = reminders.find(r => {
                if (r.isCompleted) return false;
                const reminderTime = new Date(r.date);
                // Check if within 1 minute of reminder time
                const diff = Math.abs(now.getTime() - reminderTime.getTime());
                return diff < 60000; // 1 minute
            });

            if (dueReminder && !activeToast) {
                setActiveToast(dueReminder);
                // Auto dismiss after 30 seconds
                setTimeout(() => {
                    setActiveToast(null);
                }, 30000);
            }
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        checkReminders(); // Initial check

        return () => clearInterval(interval);
    }, [reminders, activeToast]);

    const addReminder = useCallback((date: Date, message: string, type: Reminder['type'] = 'general') => {
        const newReminder: Reminder = {
            id: `reminder_${Date.now()}`,
            date,
            message,
            type,
            isCompleted: false,
            createdAt: new Date()
        };
        setReminders(prev => [...prev, newReminder]);
    }, []);

    const removeReminder = useCallback((id: string) => {
        setReminders(prev => prev.filter(r => r.id !== id));
    }, []);

    const markComplete = useCallback((id: string) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, isCompleted: true } : r
        ));
    }, []);

    const dismissToast = useCallback(() => {
        if (activeToast) {
            markComplete(activeToast.id);
            setActiveToast(null);
        }
    }, [activeToast, markComplete]);

    return (
        <ReminderContext.Provider value={{
            reminders,
            addReminder,
            removeReminder,
            markComplete,
            activeToast,
            dismissToast
        }}>
            {children}
        </ReminderContext.Provider>
    );
};

export const useReminders = () => {
    const context = useContext(ReminderContext);
    if (!context) {
        throw new Error('useReminders must be used within a ReminderProvider');
    }
    return context;
};

export default ReminderContext;
