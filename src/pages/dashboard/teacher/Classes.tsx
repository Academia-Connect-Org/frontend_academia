import React from 'react';
import { useLocation } from 'react-router-dom';
import {
    Users,
    Search,
    ChevronRight,
    Phone,
    Mail,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white ] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black">Diffuser une Alerte</h3>
                        <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mt-1">À la classe: {classe?.name}</p>
                    </div>
                </div>
                <div className="p-8">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Votre Message</label>
                    <textarea
                        autoFocus
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tapez votre message ici..."
                        className="w-full h-40 bg-slate-50    p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus: transition-all resize-none"
                    />
                    <div className="flex gap-4 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-50 text-slate-500  font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending || !message.trim()}
                            className="flex-1 py-4 bg-blue-600 text-white  font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
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
                // Nettoyer le state pour éviter la réouverture au rafraîchissement
                window.history.replaceState({}, document.title);
            }
        }
    }, [classes, location.state]);

    const fetchClasses = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/classes/teacher/${user.id}`);
            setClasses(res.data);
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
            setStudents(res.data);
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
            <>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="w-16 h-16     animate-spin mb-4"></div>
                </div>
            </>
        );
    }

    return (
        <>
            {isBulletinOpen && viewingStudent && (
                <BulletinModal
                    studentId={viewingStudent}
                    trimester={selectedTrimester}
                    academicYear={selectedAcademicYear}
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 uppercase">Gestion des Effectifs</h2>
                    <p className="text-slate-500 font-medium">Suivez l'évolution et les détails de chacun de vos groupes.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleDownloadList}
                        className="bg-white   px-6 py-3.5  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
                    >
                        <Download size={18} /> Télécharger Listes
                    </button>
                    <button
                        onClick={() => setIsBroadcastOpen(true)}
                        className="bg-slate-900 text-white px-5 py-3.5  font-extrabold flex items-center gap-3 shadow-xl shadow-slate-900/30 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
                    >
                        <MessageCircle size={15} /> Diffuser Alerte pour cette classe
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {classes.map((cls, idx) => {
                    const isSelected = selectedClass?.id === cls.id;
                    const colors = [
                        'from-blue-600 to-indigo-700',
                        'from-emerald-500 to-teal-700',
                        'from-purple-600 to-pink-700',
                        'from-amber-500 to-orange-700'
                    ];
                    const currentColor = colors[idx % colors.length];

                    return (
                        <div
                            key={cls.id}
                            onClick={() => handleClassSelect(cls)}
                            className={`group relative p-8 ] cursor-pointer transition-all duration-500 hover:-translate-y-3 overflow-hidden ${isSelected
                                ? 'bg-white shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10'
                                : 'bg-slate-50/50 hover:bg-white   hover: hover:shadow-xl'
                                }`}
                        >
                            {/* Decorative background gradient for selected or hover */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32  blur-3xl opacity-10 transition-all duration-700 ${isSelected ? 'bg-blue-600 opacity-20 scale-150' : 'bg-slate-400 group-hover:bg-blue-400 group-hover:opacity-20'}`}></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`w-16 h-16 ] flex items-center justify-center font-black text-2xl shadow-2xl transition-all duration-500 group-hover:rotate-6 ${isSelected
                                    ? `bg-gradient-to-br ${currentColor} text-white shadow-blue-500/40`
                                    : 'bg-white text-slate-400 group-hover:text-blue-600 shadow-slate-200'
                                    }`}>
                                    {cls.name.substring(0, 2)}
                                </div>
                                <div className={`px-4 py-1.5  text-[10px] font-black uppercase tracking-widest ${isSelected ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                    {isSelected ? 'Actif' : 'Sélectionner'}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className={`text-2xl font-black mb-1 transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700 group-hover:text-blue-700'}`}>{cls.name}</h3>
                                <div className="flex flex-col gap-2 mb-8">
                                    <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest leading-none">{cls.cycle?.name || 'Cycle'}</p>
                                    {cls.mainTeacher?.id === user?.id && (
                                        <div className="flex items-center gap-1.5 text-amber-500">
                                            <Star size={12} className="fill-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Enseignant Principal</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3 mb-8">
                                    <StatLine label="Effectif Total" value={cls.boysCount + cls.girlsCount} icon={Users} highlight={isSelected} />
                                    <div className="flex gap-3">
                                        <div className="flex-1 bg-blue-50/50 p-3   ">
                                            <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter mb-1">Garçons</p>
                                            <p className="text-sm font-black text-blue-700">{cls.boysCount}</p>
                                        </div>
                                        <div className="flex-1 bg-pink-50/50 p-3   ">
                                            <p className="text-[8px] font-black text-pink-400 uppercase tracking-tighter mb-1">Filles</p>
                                            <p className="text-sm font-black text-pink-700">{cls.girlsCount}</p>
                                        </div>
                                    </div>
                                </div>

                                <button className={`w-full py-4  font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${isSelected
                                    ? `bg-gradient-to-r ${currentColor} text-white shadow-lg`
                                    : 'bg-white   text-slate-400 group-hover: group-hover:text-blue-600 group-hover:shadow-md'
                                    }`}>
                                    {isSelected ? 'En Edition' : 'Voir Effectif'} <ChevronRight size={14} className={isSelected ? 'translate-x-1' : 'group-hover:translate-x-1 transition-transform'} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isClassModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-6xl max-h-[95vh] flex flex-col rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
                        <button onClick={() => setIsClassModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full flex items-center justify-center transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="flex-1 overflow-y-auto">
                            <div className="bg-white">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
                                    <div className="flex items-center gap-4 pr-12">
                                        <h3 className="text-xl font-black text-slate-800">Liste des élèves - {selectedClass?.name}</h3>
                                        <div className="px-3 py-1 bg-slate-50  text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{students.length} Élèves</div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2   ">
                                            <span className="text-[9px] font-black uppercase text-slate-400">Période:</span>
                                            <select
                                                value={selectedTrimester}
                                                onChange={e => setSelectedTrimester(e.target.value)}
                                                className="text-[10px] font-black text-slate-600 bg-transparent border-none outline-none uppercase"
                                            >
                                                <option value="1er Trimestre">1er Trimestre</option>
                                                <option value="2ème Trimestre">2ème Trimestre</option>
                                                <option value="3ème Trimestre">3ème Trimestre</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2   ">
                                            <span className="text-[9px] font-black uppercase text-slate-400">Année:</span>
                                            <select
                                                value={selectedAcademicYear}
                                                onChange={e => setSelectedAcademicYear(e.target.value)}
                                                className="text-[10px] font-black text-slate-600 bg-transparent border-none outline-none"
                                            >
                                                <option value="2025-2026">2025-2026</option>
                                                <option value="2024-2025">2024-2025</option>
                                            </select>
                                        </div>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Chercher un élève..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="bg-slate-50 border-none  pl-11 pr-4 py-2.5 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all w-40"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400  ">
                                                <th className="px-6 py-4">Élève</th>
                                                <th className="px-6 py-4">Matricule</th>
                                                <th className="px-6 py-4">Genre</th>
                                                <th className="px-6 py-4">Informations Parents</th>
                                                <th className="px-6 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 group transition-all cursor-pointer">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10  bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm">
                                                                {s.firstName[0]}{s.lastName[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{s.lastName} {s.firstName}</p>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{s.birthDate ? new Date(s.birthDate).toLocaleDateString() : 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.studentIdNumber || 'N/A'}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1  text-[9px] font-black uppercase tracking-widest ${s.gender === 'Masculin' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                            {s.gender}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1.5">
                                                            {(s.fatherFirstName || s.fatherLastName) && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-4 h-4  bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-black shrink-0">P</span>
                                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{s.fatherLastName} {s.fatherFirstName}</span>
                                                                    <span className="text-[10px] font-medium text-slate-400">{s.fatherPhone}</span>
                                                                </div>
                                                            )}
                                                            {(s.motherFirstName || s.motherLastName) && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-4 h-4  bg-pink-50 text-pink-500 flex items-center justify-center text-[8px] font-black shrink-0">M</span>
                                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{s.motherLastName} {s.motherFirstName}</span>
                                                                    <span className="text-[10px] font-medium text-slate-400">{s.motherPhone}</span>
                                                                </div>
                                                            )}
                                                            {!s.fatherFirstName && !s.motherFirstName && (
                                                                <span className="text-xs font-medium text-slate-400 italic">Non renseigné</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setViewingStudent(s.id);
                                                                    setIsBulletinOpen(true);
                                                                }}
                                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm rounded-lg flex items-center justify-center"
                                                                title="Voir Bulletin"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">Aucun élève trouvé dans cette classe.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Affichage de {filteredStudents.length} sur {students.length} élèves</p>
                                    <button
                                        onClick={handleDownloadList}
                                        className="px-6 py-3 bg-white font-black text-xs uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 transition-all outline-none rounded-2xl"
                                    >
                                        Exporter Rapport de Classe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Sub-components
const StatLine = ({ label, value, icon: Icon, highlight }: { label: string, value: string | number, icon: any, highlight?: boolean }) => (
    <div className={`flex justify-between items-center p-3   transition-all duration-300 ${highlight ? 'bg-blue-50/20 ' : 'bg-white  shadow-sm'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9  flex items-center justify-center transition-colors ${highlight ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-400'}`}>
                <Icon size={16} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-600' : 'text-slate-400'}`}>{label}</span>
        </div>
        <span className="text-sm font-black text-slate-800 tracking-tight">{value}</span>
    </div>
);

export default Classes;
