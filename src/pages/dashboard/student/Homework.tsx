import React from 'react';
import {
    Clock,
    Calendar,
    Download,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    ChevronRight,
    SearchX,
    X,
    Send,
    FileText,
    Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import HomeworkAnnotationViewer from '../../../components/HomeworkAnnotationViewer';

const StudentHomework: React.FC = () => {
    const { user } = useAuth();
    const [homeworks, setHomeworks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedHomework, setSelectedHomework] = React.useState<any>(null);
    const [submissionContent, setSubmissionContent] = React.useState('');
    const [submissionFileUrls, setSubmissionFileUrls] = React.useState<string[]>([]);
    const [isUploading, setIsUploading] = React.useState(false);
    const [mySubmission, setMySubmission] = React.useState<any>(null);
    const [mySubmissionsMap, setMySubmissionsMap] = React.useState<Record<number, any>>({});
    const [annotatingFileUrl, setAnnotatingFileUrl] = React.useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'submission');
                const res = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(res.data.url);
            }
            setSubmissionFileUrls(prev => [...prev, ...uploadedUrls]);
        } catch (err) {
            console.error("Erreur d'upload:", err);
            alert("Erreur lors de l'envoi du fichier.");
        } finally {
            setIsUploading(false);
        }
    };

    React.useEffect(() => {
        if (user?.classe?.id) {
            fetchHomeworks();
        }
    }, [user?.classe?.id]);

    const fetchHomeworks = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/homeworks/classe/${user?.classe?.id}`);
            const fetchedHomeworks = res.data.filter((h: any) => h.published);
            setHomeworks(fetchedHomeworks);

            // Fetch submissions for all homeworks to show status in the list
            const submissionsRes = await api.get(`/submissions/student/${user?.id}`);
            const submissionsMap: Record<number, any> = {};
            submissionsRes.data.forEach((sub: any) => {
                submissionsMap[sub.homework.id] = sub;
            });
            setMySubmissionsMap(submissionsMap);
        } catch (err) {
            console.error("Erreur lors du chargement des devoirs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenHomework = async (hw: any) => {
        setSelectedHomework(hw);
        setSubmissionContent('');
        setSubmissionFileUrls([]);
        setMySubmission(null);
        try {
            const res = await api.get(`/submissions/homework/${hw.id}/student/${user?.id}`);
            if (res.status === 200) {
                setMySubmission(res.data);
            }
            setIsModalOpen(true);
        } catch (err) {
            console.error("Erreur lors du chargement de la soumission:", err);
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                content: submissionContent,
                fileUrl: submissionFileUrls.join(','),
                homework: { id: selectedHomework.id },
                student: { id: user?.id }
            };
            const res = await api.post('/submissions', payload);
            setMySubmission(res.data);
            // Refresh homework list if needed (e.g. to update status icon)
            fetchHomeworks();
        } catch (err) {
            console.error("Erreur lors de l'envoi du devoir:", err);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 uppercase">Mes Missions</h2>
                    <p className="text-slate-500 font-medium">Consulte tes devoirs, télécharge les ressources et dépose ton travail.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white rounded-[48px] shadow-2xl border border-blue-50 overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">À Rendre</h3>
                            <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none shadow-sm">{homeworks.length} Devoirs</div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {loading ? (
                            <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Chargement des missions...</p>
                        ) : homeworks.length === 0 ? (
                            <div className="text-center py-20">
                                <SearchX className="mx-auto text-slate-200 mb-4" size={60} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Aucun devoir à rendre pour le moment !</p>
                            </div>
                        ) : (
                            homeworks.map((hw) => {
                                const isLate = new Date() > new Date(hw.deadline);
                                return (
                                    <div key={hw.id} onClick={() => handleOpenHomework(hw)} className="group cursor-pointer">
                                        <div className="p-6 rounded-[32px] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-transparent hover:border-blue-100 transition-all duration-300 relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform bg-blue-50 text-blue-600`}>
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{hw.subject?.name || 'Matière'}</span>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${hw.type === 'EXAMEN' ? 'bg-rose-100 text-rose-600' : hw.type === 'TP' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                                {hw.type || 'DEVOIR'}
                                                            </span>
                                                            <span className={`text-[10px] font-bold flex items-center gap-1 uppercase tracking-tighter ${isLate ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                <Clock size={12} /> {new Date(hw.deadline).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{hw.title}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Submission & Timing Status */}
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${mySubmissionsMap[hw.id]
                                                    ? (new Date(mySubmissionsMap[hw.id].submittedAt) <= new Date(hw.deadline) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100')
                                                    : (isLate ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100')
                                                    }`}>
                                                    {mySubmissionsMap[hw.id]
                                                        ? (new Date(mySubmissionsMap[hw.id].submittedAt) <= new Date(hw.deadline) ? 'Rendu à temps' : 'Rendu avec retard')
                                                        : (isLate ? 'Non rendu' : 'À rendre')}
                                                </span>

                                                {/* Correction Status */}
                                                {mySubmissionsMap[hw.id] && (
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${mySubmissionsMap[hw.id].status === 'GRADED' && hw.gradesPublished
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {mySubmissionsMap[hw.id].status === 'GRADED' && hw.gradesPublished ? 'Corrigé' : 'Rendu - En attente'}
                                                    </span>
                                                )}

                                                {/* Publication Points Barème */}
                                                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none rounded-full border border-slate-100">
                                                    <AlertCircle size={12} /> {hw.maxPoints} pts
                                                </div>
                                            </div>
                                            <ChevronRight className="absolute right-6 bottom-6 text-slate-200 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px]"></div>
                        <h3 className="text-2xl font-black mb-8 relative z-10 tracking-tight flex items-center gap-3 uppercase">
                            Focus du mois
                        </h3>
                        <div className="space-y-8 relative z-10">
                            <LegendItem label="Missions validées" value="0 / 0" color="bg-emerald-500" percent={0} />
                            <LegendItem label="Participation" value="100%" color="bg-blue-500" percent={100} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Homework Details & Submission */}
            {isModalOpen && selectedHomework && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[48px] w-full max-w-3xl relative z-10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex flex-col gap-2">
                                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest w-fit shadow-lg shadow-blue-600/20">{selectedHomework.subject?.name || 'Devoir'}</span>
                                <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">{selectedHomework.title}</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-500" /> À rendre avant le {new Date(selectedHomework.deadline).toLocaleString()}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-10">
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <FileText size={16} className="text-blue-600" /> Consignes de l'enseignant
                                </h4>
                                <div className="bg-white border-2 border-slate-50 p-8 rounded-[32px] shadow-sm">
                                    <p className="text-slate-600 leading-relaxed font-medium">{selectedHomework.description || "Aucune consigne spécifique n'a été fournie pour ce devoir."}</p>
                                </div>
                            </div>

                            {(selectedHomework.attachmentUrl || selectedHomework.attachmentUrls) && (
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Download size={16} className="text-blue-600" /> Documents ressources
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {((selectedHomework.attachmentUrls || selectedHomework.attachmentUrl || '') as string).split(',').filter(Boolean).map((url, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 group transition-all">
                                                <div className="flex items-center gap-4 truncate">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-md">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-xs font-black text-blue-700 uppercase tracking-widest truncate">Ressource {idx + 1}</p>
                                                        <p className="text-[9px] text-blue-500 font-bold uppercase truncate">{url.split('/').pop()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all no-underline">Voir</a>
                                                    <a href={getFileUrl(url, true)} download className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-blue-700 transition-all no-underline">
                                                        <Download size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Send size={16} className="text-emerald-600" /> {mySubmission ? 'Ton travail déposé' : 'Déposer ton travail'}
                                </h4>

                                {mySubmission ? (
                                    <div className="space-y-6">
                                        <div className="bg-emerald-50/50 border-2 border-emerald-100 p-8 rounded-[32px] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <CheckCircle2 size={32} className="text-emerald-200" />
                                            </div>
                                            <p className="text-emerald-700 font-medium leading-relaxed italic mb-4">{mySubmission.content || "Fichier déposé sans commentaire."}</p>

                                            {mySubmission.fileUrl && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {mySubmission.fileUrl.split(',').filter(Boolean).map((url: string, idx: number) => (
                                                        <div key={idx} className="flex flex-col gap-2 p-4 bg-white/50 rounded-2xl border border-emerald-100 min-w-[150px]">
                                                            <div className="flex items-center gap-3">
                                                                <Download size={18} className="text-emerald-600" />
                                                                <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="text-xs font-black text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">
                                                                    PJ {idx + 1}
                                                                </a>
                                                            </div>
                                                            {mySubmission.status === 'GRADED' && selectedHomework.gradesPublished && mySubmission.teacherAnnotations && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setAnnotatingFileUrl(getFileUrl(url));
                                                                    }}
                                                                    className="w-full mt-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
                                                                >
                                                                    <BookOpen size={12} /> Voir Correction
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <p className="text-[10px] text-emerald-600/60 font-black uppercase tracking-widest">Soumis le {new Date(mySubmission.submittedAt).toLocaleString()}</p>
                                        </div>

                                        {mySubmission.status === 'GRADED' && selectedHomework.gradesPublished && (
                                            <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Note obtenue</p>
                                                        <h5 className="text-5xl font-black tracking-tighter">{mySubmission.grade}<span className="text-2xl text-slate-500 font-bold"> / {selectedHomework.maxPoints}</span></h5>
                                                    </div>
                                                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                        <Check size={32} className="text-emerald-400" />
                                                    </div>
                                                </div>
                                                {mySubmission.teacherFeedback && (
                                                    <div className="border-t border-white/10 pt-6">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 italic">Commentaire de l'enseignant</p>
                                                        <p className="text-slate-300 font-medium leading-relaxed italic text-sm">{mySubmission.teacherFeedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Ton message ou réponse (optionnel)</label>
                                            <textarea
                                                rows={3}
                                                value={submissionContent}
                                                onChange={e => setSubmissionContent(e.target.value)}
                                                placeholder="Tape ta réponse ici ou décris ton travail..."
                                                className="w-full bg-white border-2 border-transparent rounded-[24px] px-8 py-6 text-sm font-medium shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                            ></textarea>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Déposer tes fichiers (Images, PDF, Documents...)</label>

                                            {submissionFileUrls.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                                    {submissionFileUrls.map((_url, idx) => (
                                                        <div key={idx} className="relative group p-3 bg-white rounded-2xl border border-blue-50 flex items-center justify-between">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText size={14} className="text-blue-600 shrink-0" />
                                                                <span className="text-[9px] font-bold text-blue-900 truncate">Doc {idx + 1}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSubmissionFileUrls(prev => prev.filter((_, i) => i !== idx))}
                                                                className="p-1 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    id="submission-files"
                                                    className="hidden"
                                                    accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                                                />
                                                <label
                                                    htmlFor="submission-files"
                                                    className="flex items-center justify-center gap-3 w-full bg-white border-2 border-dashed border-slate-200 rounded-[24px] px-8 py-8 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
                                                >
                                                    {isUploading ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Envoi en cours...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
                                                            <Download size={24} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Choisir des documents</span>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!submissionContent && submissionFileUrls.length === 0}
                                            className="w-full bg-blue-600 text-white py-6 rounded-[24px] font-black shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 transition-all tracking-widest uppercase text-xs flex items-center justify-center gap-3"
                                        >
                                            <Send size={18} /> Envoyer mon devoir
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {annotatingFileUrl && mySubmission && (
                <HomeworkAnnotationViewer
                    fileUrl={annotatingFileUrl}
                    initialAnnotations={mySubmission.teacherAnnotations}
                    readOnly={true}
                    onClose={() => setAnnotatingFileUrl(null)}
                />
            )}
        </>
    );
};

const LegendItem = ({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) => (
    <div className="group">
        <div className="flex justify-between items-end mb-4 group-hover:translate-x-1 transition-transform">
            <div>
                <span className="text-[10px] font-black text-blue-300/60 uppercase tracking-widest block mb-1 leading-none">{label}</span>
                <span className="text-xl font-black text-white leading-none tracking-tight">{value}</span>
            </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
                className={`h-full ${color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

export default StudentHomework;
