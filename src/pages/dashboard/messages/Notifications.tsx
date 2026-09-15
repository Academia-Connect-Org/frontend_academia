import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MessageCircle } from 'lucide-react';
import { useMessages } from './MessagesContext';

export const Notifications = () => {
    const { notification, setNotification } = useMessages();
    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] min-w-[300px]"
                >
                    <div className={`px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 border ${
                        notification.type === 'error'
                            ? 'bg-red-50/95 dark:bg-red-950/90 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                            : notification.type === 'success'
                            ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50/95 dark:bg-blue-950/90 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            notification.type === 'error' ? 'bg-red-600 text-white' :
                            notification.type === 'success' ? 'bg-emerald-600 text-white' :
                            'bg-blue-600 text-white'
                        }`}>
                            {notification.type === 'error' ? <X size={18} /> : notification.type === 'success' ? <Check size={18} /> : <MessageCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5">{notification.type}</p>
                            <p className="text-xs font-bold leading-snug truncate">{notification.message}</p>
                        </div>
                        <button onClick={() => setNotification(null)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
