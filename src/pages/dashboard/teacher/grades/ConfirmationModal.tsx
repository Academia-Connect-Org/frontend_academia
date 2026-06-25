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
            case 'danger': return 'bg-rose-600 shadow-rose-600/30';
            case 'success': return 'bg-emerald-600 shadow-emerald-600/30';
            default: return 'bg-indigo-600 shadow-indigo-600/30';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger': return <Trash2 size={40} className="text-rose-600" />;
            case 'success': return <Send size={40} className="text-emerald-600" />;
            default: return <AlertCircle size={40} className="text-indigo-600" />;
        }
    };

    const getBgIconClass = () => {
        switch (type) {
            case 'danger': return 'bg-rose-50';
            case 'success': return 'bg-emerald-50';
            default: return 'bg-indigo-50';
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
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white ] p-10 w-full max-w-md shadow-2xl relative z-10   text-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className={`w-20 h-20 ${getBgIconClass()}  flex items-center justify-center mx-auto mb-6`}>
                            {getIcon()}
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2">{title}</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">{message}</p>

                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-slate-100 text-slate-600 py-4  font-black hover:bg-slate-200 transition-all active:scale-95"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 text-white py-4  font-black shadow-xl transition-all hover:scale-105 active:scale-95 ${getColorClass()}`}
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
