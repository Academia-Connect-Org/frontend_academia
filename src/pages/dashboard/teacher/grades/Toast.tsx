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
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md ${toast.type === 'success'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                        }`}
                >
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                    <span className="font-bold text-xs">{toast.message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
