import React from 'react';
import { X, Clock, MapPin, Users, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface TimetableEntry {
    id: number;
    classeId: number;
    classeName: string;
    subjectId: number;
    subjectName: string;
    subjectColor: string;
    teacherId: number;
    teacherName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    cycle: string;
}

interface TimetableEntryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: TimetableEntry | null;
    onAttendanceClick?: () => void;
}

const TimetableEntryDetailsModal: React.FC<TimetableEntryDetailsModalProps> = ({ isOpen, onClose, entry, onAttendanceClick }) => {
    const { user } = useAuth();

    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                onClick={onClose}
            />
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start" style={{ backgroundColor: `${entry.subjectColor || '#3b82f6'}15` }}>
                    <div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm uppercase tracking-wider mb-2 inline-block">
                            {entry.dayOfWeek}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight" style={{ color: entry.subjectColor || '#3b82f6' }}>
                            {entry.subjectName}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Horaire</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.startTime} - {entry.endTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Salle</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.room || 'Non définie'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Classe & Enseignant</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{entry.classeName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{entry.teacherName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    {user?.role === 'ENSEIGNANT' && onAttendanceClick && (
                        <button
                            onClick={() => {
                                onClose();
                                onAttendanceClick();
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                            <ClipboardCheck size={16} /> Faire l'appel
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs transition-all"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimetableEntryDetailsModal;
