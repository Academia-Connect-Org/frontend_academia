import React from 'react';
import { X, Clock, MapPin, BookOpen, Users, Calendar, ClipboardCheck } from 'lucide-react';
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
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start" style={{ backgroundColor: `${entry.subjectColor || '#6366f1'}15` }}>
                    <div>
                        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-white text-slate-700 shadow-sm uppercase tracking-widest mb-3 inline-block">
                            {entry.dayOfWeek}
                        </span>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight" style={{ color: entry.subjectColor || '#6366f1' }}>
                            {entry.subjectName}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/50 text-slate-500 hover:bg-white hover:text-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Horaire</p>
                            <p className="text-lg font-bold text-slate-700">{entry.startTime} - {entry.endTime}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Salle</p>
                            <p className="text-lg font-bold text-slate-700">{entry.room || 'Non définie'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Classe & Enseignant</p>
                            <p className="text-sm font-bold text-slate-700">{entry.classeName}</p>
                            <p className="text-sm font-medium text-slate-500">{entry.teacherName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                    {user?.role === 'ENSEIGNANT' && onAttendanceClick && (
                        <button
                            onClick={() => {
                                onClose();
                                onAttendanceClick();
                            }}
                            className="flex-1 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <ClipboardCheck size={18} /> Faire l'appel
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimetableEntryDetailsModal;
