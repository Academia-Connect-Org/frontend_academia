import React from 'react';
import { useLocation } from 'react-router-dom';
import {
    Users,
    Search,
    ChevronRight,
    MessageCircle,
    FileText,
    X,
    Download,
    Star
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import BulletinModal from '../../../components/dashboard/shared/BulletinModal';
import { toast } from 'react-hot-toast';

const BroadcastModal: React.FC<{
    classe: any;
    onClose: () => void;
    onSend: (message: string) => void;
}> = ({ classe, onClose, onSend }) => {
    const [message, setMessage] = React.useState('');
    const [sending, setSending] = React.useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSend(message);
            toast.success("Alerte diffusée avec succès!");
            onClose();
        } catch (err) {
            toast.error("Erreur lors de la diffusion.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold">Diffuser une Alerte</h3>
                        <p className="text-blue-200 text-xs mt-0.5">À la classe: {classe?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Votre Message</label>
                    <textarea
                        autoFocus
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tapez votre message ici..."
                        className="w-full h-36 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-medium text-slate-900 dark:text-white outline-none resize-none"
                    />
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending || !message.trim()}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                        >
                            {sending ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Classes: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = React.useState<any[]>([]);
    const [selectedClass, setSelectedClass] = React.useState<any>(null);
    const [students, setStudents] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isBulletinOpen, setIsBulletinOpen] = React.useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = React.useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = React.useState(false);
    const [viewingStudent, setViewingStudent] = React.useState<number | null>(null);
    const [selectedTrimester, setSelectedTrimester] = React.useState('1er Trimestre');
    const [selectedAcademicYear, setSelectedAcademicYear] = React.useState('2025-2026');
    const location = useLocation();

    React.useEffect(() => {
        fetchClasses();
    }, [user?.id]);

    React.useEffect(() => {
        if (classes.length > 0 && location.state?.openClassId) {
            const cls = classes.find((c: any) => c.id === location.state.openClassId);
            if (cls) {
                handleClassSelect(cls);
                window.history.replaceState({}, document.title);
            }
        }
    }, [classes, location.state]);

    const fetchClasses = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/classes/teacher/${user.id}`);
            setClasses(res.data || []);
        } catch (err) {
            console.error("Erreur classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelect = async (cls: any) => {
        setSelectedClass(cls);
        setIsClassModalOpen(true);
        try {
            const res = await api.get(`/students/classe/${cls.id}`);
            setStudents(res.data || []);
        } catch (err) {
            console.error("Erreur students:", err);
        }
    };

    const handleDownloadList = async () => {
        if (!selectedClass) return;
        try {
            const response = await api.get(`/students/export/classe/${selectedClass.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `liste_${selectedClass.name}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Erreur lors du téléchargement");
        }
    };

    const handleSendAlert = async (message: string) => {
        if (!selectedClass || !user) return;
        await api.post(`/chat/broadcast/classe/${selectedClass.id}?senderId=${user.id}&content=${encodeURIComponent(message)}`);
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des effectifs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isBulletinOpen && viewingStudent && (
                <BulletinModal
                    studentId={viewingStudent}
                    trimester={selectedTrimester}
                    academicYear={selectedAcademicYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Gestion des Effectifs</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Suivez l'évolution et les détails de chacun de vos groupes.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleDownloadList}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Télécharger Listes
                    </button>
                    <button
                        onClick={() => setIsBroadcastOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                    >
                        <MessageCircle size={16} /> Diffuser Alerte
                    </button>
                </div>
            </div>

            {isBroadcastOpen && (
                <BroadcastModal
                    classe={selectedClass}
                    onClose={() => setIsBroadcastOpen(false)}
                    onSend={handleSendAlert}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {classes.map((cls, idx) => {
                    const isSelected = selectedClass?.id === cls.id;
                    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600'];
                    const currentColor = colors[idx % colors.length];

                    return (
                        <div
                            key={cls.id}
                            onClick={() => handleClassSelect(cls)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${isSelected
                                ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${currentColor}`}>
                                    {cls.name.substring(0, 2)}
                                </div>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md ${isSelected ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                    {isSelected ? 'Actif' : 'Sélectionner'}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 uppercase">{cls.name}</h3>
                                <div className="space-y-1 mb-4">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">{cls.cycle?.name || 'Cycle'}</p>
                                    {cls.mainTeacher?.id === user?.id && (
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star size={12} className="fill-amber-500" />
                                            <span className="text-[10px] font-bold uppercase">Enseignant Principal</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <StatLine label="Effectif Total" value={(cls.boysCount || 0) + (cls.girlsCount || 0)} icon={Users} highlight={isSelected} />
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                        <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                            <p className="text-[9px] uppercase">Garçons</p>
                                            <p className="text-sm font-bold">{cls.boysCount || 0}</p>
                                        </div>
                                        <div className="bg-pink-50 dark:bg-pink-950/40 p-2 rounded-lg text-pink-600 dark:text-pink-400">
                                            <p className="text-[9px] uppercase">Filles</p>
                                            <p className="text-sm font-bold">{cls.girlsCount || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-600 hover:text-white transition-colors">
                                    {isSelected ? 'En Édition' : 'Voir Effectif'} <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isClassModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden relative">
                        <button onClick={() => setIsClassModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10">
                            <X size={18} />
                        </button>
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Liste des élèves - {selectedClass?.name}</h3>
                                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase">{students.length} Élèves</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={selectedTrimester}
                                        onChange={e => setSelectedTrimester(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="1er Trimestre">1er Trimestre</option>
                                        <option value="2ème Trimestre">2ème Trimestre</option>
                                        <option value="3ème Trimestre">3ème Trimestre</option>
                                    </select>
                                    <select
                                        value={selectedAcademicYear}
                                        onChange={e => setSelectedAcademicYear(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2024-2025">2024-2025</option>
                                    </select>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Chercher..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-36 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <th className="pb-2">Élève</th>
                                            <th className="pb-2">Matricule</th>
                                            <th className="pb-2">Genre</th>
                                            <th className="pb-2">Informations Parents</th>
                                            <th className="pb-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                                            <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                                            {s.firstName?.[0]}{s.lastName?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white uppercase">{s.lastName} {s.firstName}</p>
                                                            <p className="text-[10px] text-slate-400 italic">{s.birthDate ? new Date(s.birthDate).toLocaleDateString('fr-FR') : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">{s.studentIdNumber || 'N/A'}</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${s.gender === 'Masculin' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400'}`}>
                                                        {s.gender}
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                                                        {(s.fatherFirstName || s.fatherLastName) && (
                                                            <div>P: <strong className="text-slate-800 dark:text-slate-200">{s.fatherLastName} {s.fatherFirstName}</strong> ({s.fatherPhone})</div>
                                                        )}
                                                        {(s.motherFirstName || s.motherLastName) && (
                                                            <div>M: <strong className="text-slate-800 dark:text-slate-200">{s.motherLastName} {s.motherFirstName}</strong> ({s.motherPhone})</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setViewingStudent(s.id);
                                                            setIsBulletinOpen(true);
                                                        }}
                                                        className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors rounded-lg"
                                                        title="Voir Bulletin"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-slate-400 italic">Aucun élève trouvé dans cette classe.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatLine = ({ label, value, icon: Icon, highlight }: { label: string, value: string | number, icon: any, highlight?: boolean }) => (
    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
            <Icon size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
);

export default Classes;
