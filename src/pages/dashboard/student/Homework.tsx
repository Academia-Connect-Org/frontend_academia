import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    Download,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    SearchX,
    X,
    Send,
    FileText,
    Upload,
    Eye,
    PenTool,
    Trash2,
    Check,
    Award
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import HomeworkAnnotationViewer from '../../../components/HomeworkAnnotationViewer';

const StudentHomework: React.FC = () => {
    const { user } = useAuth();
    const [homeworks, setHomeworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('ALL');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<any>(null);
    
    // Submission Form States
    const [submissionContent, setSubmissionContent] = useState('');
    const [submissionFileUrls, setSubmissionFileUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [mySubmission, setMySubmission] = useState<any>(null);
    const [mySubmissionsMap, setMySubmissionsMap] = useState<Record<number, any>>({});
    const [annotatingFileUrl, setAnnotatingFileUrl] = useState<string | null>(null);

    // Multi-file upload handler
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
                if (res.data?.url) {
                    uploadedUrls.push(res.data.url);
                }
            }
            setSubmissionFileUrls(prev => [...prev, ...uploadedUrls]);
        } catch (err) {
            console.error("Erreur d'upload:", err);
            alert("Erreur lors de l'envoi des fichiers.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeUploadedFile = (index: number) => {
        setSubmissionFileUrls(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (user?.classe?.id) {
            fetchHomeworks();
        }
    }, [user?.classe?.id]);

    const fetchHomeworks = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/homeworks/classe/${user?.classe?.id}`);
            const fetchedHomeworks = (res.data || []).filter((h: any) => h.published);
            setHomeworks(fetchedHomeworks);

            const submissionsRes = await api.get(`/submissions/student/${user?.id}`).catch(() => ({ data: [] }));
            const submissionsMap: Record<number, any> = {};
            (submissionsRes.data || []).forEach((sub: any) => {
                if (sub.homework?.id) {
                    submissionsMap[sub.homework.id] = sub;
                }
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
            if (res.status === 200 && res.data) {
                setMySubmission(res.data);
            }
            setIsModalOpen(true);
        } catch (err) {
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
            fetchHomeworks();
        } catch (err) {
            console.error("Erreur lors de l'envoi du devoir:", err);
        }
    };

    const uniqueSubjects = Array.from(new Set(homeworks.map(hw => hw.subject?.name || 'Matière'))).sort();

    const filteredHomeworks = homeworks.filter(hw => {
        if (searchQuery && !hw.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedSubject !== 'ALL' && (hw.subject?.name || 'Matière') !== selectedSubject) return false;

        if (selectedStatus !== 'ALL') {
            const isLate = new Date() > new Date(hw.deadline);
            const submission = mySubmissionsMap[hw.id];

            if (selectedStatus === 'PENDING' && (submission || isLate)) return false;
            if (selectedStatus === 'LATE' && (submission || !isLate)) return false;
            if (selectedStatus === 'SUBMITTED' && (!submission || (submission.status === 'GRADED' && hw.gradesPublished))) return false;
            if (selectedStatus === 'GRADED' && (!submission || submission.status !== 'GRADED' || !hw.gradesPublished)) return false;
        }

        return true;
    });

    // Helper to get array of submitted file URLs
    const getSubmissionFiles = (sub: any): string[] => {
        if (!sub?.fileUrl) return [];
        return sub.fileUrl.split(',').map((s: string) => s.trim()).filter(Boolean);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Mes Devoirs & Travaux</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consulte tes devoirs, dépose tes fichiers de réponses et consulte les corrections annotées par tes professeurs.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
                <div className="w-full sm:w-1/3 relative">
                    <SearchX size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un devoir..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                </div>
                <div className="w-full sm:w-1/3">
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="ALL">Toutes les matières</option>
                        {uniqueSubjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-1/3">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="PENDING">À rendre</option>
                        <option value="SUBMITTED">Rendu - En attente</option>
                        <option value="GRADED">Corrigé & Annoté</option>
                        <option value="LATE">En retard</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Liste des devoirs</h3>
                        <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold">{filteredHomeworks.length} Devoir(s)</span>
                    </div>

                    <div className="p-4 space-y-3">
                        {loading ? (
                            <div className="py-16 text-center">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                <p className="text-xs text-slate-400 font-bold uppercase">Chargement des devoirs...</p>
                            </div>
                        ) : filteredHomeworks.length === 0 ? (
                            <div className="text-center py-12">
                                <SearchX className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={36} />
                                <p className="text-xs text-slate-400 font-bold italic">Aucun devoir trouvé.</p>
                            </div>
                        ) : (
                            filteredHomeworks.map((hw) => {
                                const isLate = new Date() > new Date(hw.deadline);
                                const sub = mySubmissionsMap[hw.id];
                                const isGraded = sub?.status === 'GRADED' && hw.gradesPublished;

                                return (
                                    <div key={hw.id} onClick={() => handleOpenHomework(hw)} className="cursor-pointer">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex gap-3 items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[9px] font-bold uppercase">{hw.subject?.name || 'Matière'}</span>
                                                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                                                <Clock size={10} /> À rendre le {new Date(hw.deadline).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{hw.title}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px]">
                                                <span className={`px-2 py-0.5 rounded font-bold uppercase ${isGraded
                                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                                    : sub
                                                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                                        : (isLate ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400')
                                                    }`}>
                                                    {isGraded
                                                        ? `Corrigé & Annoté (${sub.grade}/${hw.maxPoints})`
                                                        : (sub ? 'Rendu (En attente)' : (isLate ? 'Non rendu (En retard)' : 'À rendre'))}
                                                </span>
                                                <span className="text-slate-400 font-bold">{hw.maxPoints} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-900 p-5 rounded-2xl text-white border border-slate-800 shadow-sm space-y-3">
                        <h3 className="text-base font-bold flex items-center gap-2">Focus & Suivi</h3>
                        <div className="space-y-3">
                            <LegendItem label="Missions Rendues" value={`${Object.keys(mySubmissionsMap).length} / ${homeworks.length}`} color="bg-emerald-500" percent={homeworks.length > 0 ? (Object.keys(mySubmissionsMap).length / homeworks.length) * 100 : 0} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Homework Details & Submission */}
            {isModalOpen && selectedHomework && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-start relative shrink-0">
                            <div>
                                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase backdrop-blur-md">{selectedHomework.subject?.name || 'Devoir'}</span>
                                <h3 className="text-lg font-bold mt-1 uppercase tracking-tight">{selectedHomework.title}</h3>
                                <p className="text-xs text-blue-100 font-medium flex items-center gap-1 mt-0.5">
                                    <Calendar size={12} /> Échéance : {new Date(selectedHomework.deadline).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 dark:bg-slate-950/40">
                            {/* Consignes */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={14} className="text-blue-600 dark:text-blue-400" /> Consignes du Devoir
                                </h4>
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
                                    {selectedHomework.description || "Aucune consigne spécifique transmise par le professeur."}
                                </div>
                            </div>

                            {/* Documents Joints du Professeur */}
                            {(selectedHomework.attachmentUrl || selectedHomework.attachmentUrls) && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Download size={14} className="text-blue-600 dark:text-blue-400" /> Documents & Ressources du Professeur
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {((selectedHomework.attachmentUrls || selectedHomework.attachmentUrl || '') as string).split(',').filter(Boolean).map((url, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs">
                                                <span className="font-bold text-slate-900 dark:text-white truncate">Ressource {idx + 1}</span>
                                                <a href={getFileUrl(url, true)} download target="_blank" rel="noreferrer" className="p-1.5 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 transition-colors">
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Zone Déposée / Soumission */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Send size={14} className="text-emerald-600 dark:text-emerald-400" /> {mySubmission ? 'Mon Devoir Déposé & Corrections' : 'Déposer mon Devoir (Fichiers multiples)'}
                                </h4>

                                {mySubmission ? (
                                    <div className="space-y-4">
                                        {/* Status banner */}
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Statut du devoir :</span>
                                                <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${mySubmission.status === 'GRADED' && selectedHomework.gradesPublished
                                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                                    }`}>
                                                    {mySubmission.status === 'GRADED' && selectedHomework.gradesPublished ? 'Corrigé & Publié' : 'Rendu - En attente de correction'}
                                                </span>
                                            </div>

                                            {mySubmission.content && (
                                                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    "{mySubmission.content}"
                                                </p>
                                            )}

                                            {/* Note & Feedback si corrigé & publié */}
                                            {mySubmission.status === 'GRADED' && selectedHomework.gradesPublished && (
                                                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                            <Award size={16} className="text-yellow-400" /> Note Obtenue
                                                        </span>
                                                        <span className="text-xl font-black text-emerald-400">{mySubmission.grade} / {selectedHomework.maxPoints}</span>
                                                    </div>
                                                    {mySubmission.teacherFeedback && (
                                                        <p className="text-xs text-slate-300 font-medium pt-2 border-t border-slate-800 leading-relaxed">
                                                            <strong className="text-white">Appréciation : </strong> {mySubmission.teacherFeedback}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {mySubmission.status === 'GRADED' && !selectedHomework.gradesPublished && (
                                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                                    Devoir corrigé par l'enseignant. Les notes et appréciations annotées seront affichées dès la publication officielle par l'établissement.
                                                </div>
                                            )}
                                        </div>

                                        {/* Submitted Files list with Teacher Correction Annotation Buttons */}
                                        {getSubmissionFiles(mySubmission).length > 0 && (
                                            <div className="space-y-2">
                                                <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Fichiers Soumis ({getSubmissionFiles(mySubmission).length}) :
                                                </h5>
                                                <div className="space-y-2">
                                                    {getSubmissionFiles(mySubmission).map((fileUrl, idx) => (
                                                        <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <FileText size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Document rendu #{idx + 1}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                {/* Teacher Annotation Viewer Button */}
                                                                {mySubmission.status === 'GRADED' && selectedHomework.gradesPublished ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAnnotatingFileUrl(getFileUrl(fileUrl, true))}
                                                                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 uppercase"
                                                                    >
                                                                        <PenTool size={14} /> Voir les Traces du Professeur
                                                                    </button>
                                                                ) : (
                                                                    <a
                                                                        href={getFileUrl(fileUrl, true)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                                                                    >
                                                                        <Download size={14} /> Aperçu
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Multi-file Upload Form for Student */
                                    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message / Remarques (Optionnel)</label>
                                            <textarea
                                                rows={3}
                                                value={submissionContent}
                                                onChange={e => setSubmissionContent(e.target.value)}
                                                placeholder="Saisissez un commentaire ou des détails pour le professeur..."
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>

                                        {/* Uploaded files preview list */}
                                        {submissionFileUrls.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Fichiers joints à envoyer ({submissionFileUrls.length}) :
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {submissionFileUrls.map((url, idx) => (
                                                        <div key={idx} className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <FileText size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                                <span className="text-xs font-bold text-blue-900 dark:text-blue-300 truncate">Fichier {idx + 1}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeUploadedFile(idx)}
                                                                className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg transition-colors"
                                                                title="Supprimer ce fichier"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Multi-file selector button */}
                                        <div>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileUpload}
                                                id="student-multi-files"
                                                className="hidden"
                                                accept="image/*,.pdf,.doc,.docx,.zip"
                                            />
                                            <label
                                                htmlFor="student-multi-files"
                                                className="flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                            >
                                                <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {isUploading ? "Chargement des fichiers..." : "Ajouter un ou plusieurs fichiers (Photos, PDF, Docs)"}
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!submissionContent && submissionFileUrls.length === 0}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-colors uppercase flex items-center justify-center gap-2 tracking-wider disabled:opacity-50"
                                        >
                                            <Send size={16} /> Envoyer mon travail au professeur
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Annotation Fullscreen Viewer Modal */}
            {annotatingFileUrl && mySubmission && (
                <HomeworkAnnotationViewer
                    fileUrl={annotatingFileUrl}
                    initialAnnotations={mySubmission.teacherAnnotations}
                    readOnly={true}
                    onClose={() => setAnnotatingFileUrl(null)}
                />
            )}
        </div>
    );
};

const LegendItem = ({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) => (
    <div>
        <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="font-bold text-white">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

export default StudentHomework;
