import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, Send, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'info'
}) => {
    const getColorClass = () => {
        switch (type) {
            case 'danger': return 'bg-rose-600 hover:bg-rose-700';
            case 'success': return 'bg-emerald-600 hover:bg-emerald-700';
            default: return 'bg-indigo-600 hover:bg-indigo-700';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return <Trash2 size={24} className="text-rose-600 dark:text-rose-400" />;
            case 'success': return <Send size={24} className="text-emerald-600 dark:text-emerald-400" />;
            default: return <AlertCircle size={24} className="text-indigo-600 dark:text-indigo-400" />;
        }
    };

    const getBgIconClass = () => {
        switch (type) {
            case 'danger': return 'bg-rose-50 dark:bg-rose-950/40';
            case 'success': return 'bg-emerald-50 dark:bg-emerald-950/40';
            default: return 'bg-indigo-50 dark:bg-indigo-950/40';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm rounded-2xl shadow-2xl relative z-10 text-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className={`w-12 h-12 rounded-xl ${getBgIconClass()} flex items-center justify-center mx-auto mb-3`}>
                            {getIcon()}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{message}</p>

                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 text-white py-2 font-bold text-xs rounded-xl shadow-md transition-colors ${getColorClass()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
