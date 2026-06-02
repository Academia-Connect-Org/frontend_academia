import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastData {
    message: string;
    type: 'success' | 'error';
}

interface ToastProps {
    toast: ToastData | null;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    React.useEffect(() => {
        if (toast) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${toast.type === 'success'
                        ? 'bg-emerald-500/90 border-emerald-400 text-white'
                        : 'bg-rose-500/90 border-rose-400 text-white'
                        }`}
                >
                    {toast.type === 'success' ? <CheckCircle2 size={20} /> : <X size={20} />}
                    <span className="font-black text-sm">{toast.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
