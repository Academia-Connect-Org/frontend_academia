import React from 'react';
import {
    Plus,
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    X,
    Download,
    Check,
    Eye,
    Trash2,
    ClipboardList,
    FileEdit,
    Send,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import HomeworkAnnotationViewer from '../../../components/HomeworkAnnotationViewer';

const Homework: React.FC = () => {
    const { user } = useAuth();
    const [homeworks, setHomeworks] = React.useState<any[]>([]);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = React.useState(false);
    const [selectedHomework, setSelectedHomework] = React.useState<any>(null);
    const [submissions, setSubmissions] = React.useState<any[]>([]);
    const [selectedSubmission, setSelectedSubmission] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [editingHomework, setEditingHomework] = React.useState<any>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [studentsOfClass, setStudentsOfClass] = React.useState<any[]>([]);
    const [activeView, setActiveView] = React.useState<'GRADE' | 'SUMMARY'>('GRADE');
    const [isDeletePopupOpen, setIsDeletePopupOpen] = React.useState(false);
    const [homeworkToDelete, setHomeworkToDelete] = React.useState<any>(null);
    const [pendingDeleteIds, setPendingDeleteIds] = React.useState<Set<number>>(new Set());

    // Form states
    const [newHomework, setNewHomework] = React.useState({
        title: '',
        description: '',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        maxPoints: 20,
        classeId: '',
        cycleId: '',
        cycleName: 'Lycée',
        published: true,
        gradesPublished: false,
        academicYear: '2025-2026',
        trimestre: '1er Trimestre',
        attachmentUrls: [] as string[],
        subjectId: '',
        type: 'DEVOIR',
        deadlineTime: '23:59'
    });

    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [fetchedCycles, setFetchedCycles] = React.useState<any[]>([]);
    const [allClasses, setAllClasses] = React.useState<any[]>([]);

    // List filters
    const [searchTerm, setSearchTerm] = React.useState('');
    const [listFilterClasse, setListFilterClasse] = React.useState('');
    const [listFilterSubject, setListFilterSubject] = React.useState('');
    const [listFilterType, setListFilterType] = React.useState('');

    React.useEffect(() => {
        const instId = user?.institution?.id || 1;
        api.get(`/cycles?institutionId=${instId}`)
            .then(res => setFetchedCycles(res.data || []))
            .catch(err => {
                console.error("Failed to fetch cycles", err);
                api.get('/cycles').then(r => setFetchedCycles(r.data || []));
            });
    }, [user?.institution?.id]);

    // Simplified cycles: we derive them from classes taught by the teacher
    const teacherCycles = React.useMemo(() => {
        const activeClasses = (classes && classes.length > 0) ? classes : allClasses;
        if (activeClasses && activeClasses.length > 0) {
            const unique = new Map();
            activeClasses.forEach(c => {
                if (c.cycle && c.cycle.id) {
                    unique.set(c.cycle.id.toString(), c.cycle);
                }
            });
            if (unique.size > 0) return Array.from(unique.values());
        }
        return fetchedCycles;
    }, [classes, allClasses, fetchedCycles]);

    // Derived subjects based on teacher specialties and selected cycle
    const filteredSubjectsForForm = React.useMemo(() => {
        let allPossible = subjects || [];
        if (newHomework.cycleId) {
            allPossible = allPossible.filter(s => !s.cycle || String(s.cycle.id) === String(newHomework.cycleId));
        }
        return allPossible;
    }, [subjects, newHomework.cycleId]);

    // Filter classes based on selected cycle AND selected subject
    const filteredClasses = React.useMemo(() => {
        if (!newHomework.cycleId) return [];
        const activeClasses = (classes && classes.length > 0) ? classes : allClasses;

        let filtered = activeClasses.filter(c => c.cycle && String(c.cycle.id) === String(newHomework.cycleId));

        if (newHomework.subjectId) {
            const selectedSubject = subjects.find(s => String(s.id) === String(newHomework.subjectId));
            if (selectedSubject && selectedSubject.classes) {
                const classIdsForSubject = new Set(selectedSubject.classes.map((c: any) => String(c.id)));
                filtered = filtered.filter(c => classIdsForSubject.has(String(c.id)));
            }
        }

        return filtered;
    }, [classes, allClasses, newHomework.cycleId, newHomework.subjectId, subjects]);

    // Derived homeworks for the list view based on filters
    const displayHomeworks = React.useMemo(() => {
        return homeworks.filter(hw => {
            if (pendingDeleteIds.has(hw.id)) return false;

            const matchesSearch = hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hw.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesClasse = !listFilterClasse || String(hw.classe?.id) === listFilterClasse;
            const matchesSubject = !listFilterSubject || String(hw.subject?.id) === listFilterSubject;
            const matchesType = !listFilterType || hw.type === listFilterType;
            return matchesSearch && matchesClasse && matchesSubject && matchesType;
        });
    }, [homeworks, searchTerm, listFilterClasse, listFilterSubject, listFilterType, pendingDeleteIds]);

    React.useEffect(() => {
        if (editingHomework) {
            setNewHomework({
                title: editingHomework.title || '',
                description: editingHomework.description || '',
                maxPoints: editingHomework.maxPoints || 20,
                classeId: editingHomework.classe?.id?.toString() || '',
                cycleId: editingHomework.cycle?.id?.toString() || '',
                cycleName: editingHomework.cycle?.name || 'Lycée',
                published: editingHomework.published ?? true,
                gradesPublished: editingHomework.gradesPublished ?? false,
                academicYear: editingHomework.academicYear || '2025-2026',
                trimestre: editingHomework.trimestre || '1er Trimestre',
                attachmentUrls: editingHomework.attachmentUrls ? editingHomework.attachmentUrls.split(',') : [],
                subjectId: editingHomework.subject?.id?.toString() || '',
                type: editingHomework.type || 'DEVOIR',
                deadlineTime: editingHomework.deadline ? editingHomework.deadline.split('T')[1]?.substring(0, 5) || '23:59' : '23:59',
                deadline: editingHomework.deadline ? editingHomework.deadline.split('T')[0] : new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
            });
        } else {
            setNewHomework({
                title: '',
                description: '',
                deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                maxPoints: 20,
                classeId: '',
                cycleId: '',
                cycleName: 'Lycée',
                published: true,
                gradesPublished: false,
                academicYear: '2025-2026',
                trimestre: '1er Trimestre',
                attachmentUrls: [],
                subjectId: '',
                type: 'DEVOIR',
                deadlineTime: '23:59'
            });
        }
    }, [editingHomework]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('type', 'homework');
                const res = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrls.push(res.data.url);
            }
            setNewHomework(prev => ({
                ...prev,
                attachmentUrls: [...prev.attachmentUrls, ...uploadedUrls]
            }));
        } catch (err) {
            console.error("Erreur d'upload:", err);
            alert("Erreur lors de l'envoi du fichier.");
        } finally {
            setIsUploading(false);
        }
    };

    React.useEffect(() => {
        if (filteredClasses.length > 0) {
            const currentIsValid = filteredClasses.some(c => String(c.id) === String(newHomework.classeId));
            if (!currentIsValid) {
                setNewHomework(prev => ({ ...prev, classeId: filteredClasses[0].id.toString() }));
            }
        } else if (newHomework.classeId !== '') {
            setNewHomework(prev => ({ ...prev, classeId: '' }));
        }
    }, [filteredClasses]);

    const [gradeData, setGradeData] = React.useState({
        grade: '',
        teacherFeedback: '',
        teacherAnnotations: ''
    });

    const [annotatingFileUrl, setAnnotatingFileUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetchMetadata();
        fetchHomeworks();
    }, [user?.id]);

    const fetchMetadata = async () => {
        if (!user?.id) return;
        try {
            const [classesRes, subjectsRes, allClassesRes] = await Promise.all([
                api.get(`/classes/teacher/${user.id}`),
                api.get(`/subjects/teacher/${user.id}`),
                api.get(`/classes?institutionId=${user.institution?.id || 1}`)
            ]);
            setClasses(classesRes.data);
            setSubjects(subjectsRes.data);
            setAllClasses(allClassesRes.data);
        } catch (err) {
            console.error("Erreur lors du chargement des préférences:", err);
        }
    };

    const fetchHomeworks = async (silent = false) => {
        if (!user?.id) return;
        if (!silent) setLoading(true);
        try {
            const homeworksRes = await api.get(`/homeworks/teacher/${user.id}`);
            setHomeworks(homeworksRes.data);
        } catch (err) {
            console.error("Erreur lors du chargement des devoirs:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleCreateHomework = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: newHomework.title,
                description: newHomework.description,
                deadline: `${newHomework.deadline}T${newHomework.deadlineTime}:00`,
                maxPoints: newHomework.maxPoints,
                cycle: { id: Number(newHomework.cycleId) },
                teacher: { id: user?.id },
                classe: { id: parseInt(newHomework.classeId) },
                published: newHomework.published,
                academicYear: newHomework.academicYear,
                trimestre: newHomework.trimestre,
                attachmentUrls: newHomework.attachmentUrls.join(','),
                subject: newHomework.subjectId ? { id: parseInt(newHomework.subjectId) } : null,
                type: newHomework.type
            };

            setIsModalOpen(false);
            setEditingHomework(null);
            setNewHomework((prev: any) => ({ ...prev, title: '', description: '' }));

            if (editingHomework) {
                setHomeworks(prev => prev.map(hw =>
                    hw.id === editingHomework.id
                        ? { ...hw, title: payload.title, description: payload.description }
                        : hw
                ));
            }

            (async () => {
                try {
                    if (editingHomework) {
                        await api.put(`/homeworks/${editingHomework.id}`, payload);
                    } else {
                        await api.post('/homeworks', payload);
                    }
                    fetchHomeworks(true);
                } catch (err) {
                    console.error("Erreur lors de l'enregistrement du devoir:", err);
                    fetchHomeworks(true);
                }
            })();
        } catch (err) {
            console.error("Erreur de préparation du payload:", err);
        }
    };

    const handleViewSubmissions = async (homework: any) => {
        setSelectedHomework(homework);
        try {
            const [subsRes, studentsRes] = await Promise.all([
                api.get(`/submissions/homework/${homework.id}`),
                api.get(`/students/classe/${homework.classe.id}`)
            ]);
            setSubmissions(subsRes.data);
            setStudentsOfClass(studentsRes.data);
            setActiveView('GRADE');
            setIsSubmissionsModalOpen(true);
        } catch (err) {
            console.error("Erreur lors du chargement des soumissions:", err);
        }
    };

    const handleExportCSV = () => {
        if (!selectedHomework) return;

        const headers = ["Matricule", "Nom", "Prénom", "Statut", "Date de rendu", "Note", "Commentaire"];
        const rows = studentsOfClass.map(student => {
            const sub = submissions.find(s => s.student?.id === student.id);
            return [
                student.studentIdNumber || "",
                student.lastName,
                student.firstName,
                sub ? (sub.status === 'GRADED' ? 'Noté' : 'Rendu') : 'Non rendu',
                sub ? new Date(sub.submittedAt).toLocaleDateString() : "",
                sub?.grade?.toString() || "",
                sub?.teacherFeedback || ""
            ];
        });

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `notes_${selectedHomework.title}_${selectedHomework.classe?.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handlePublishGrades = async () => {
        if (!selectedHomework) return;
        try {
            const newStatus = !selectedHomework.gradesPublished;
            await api.patch(`/homeworks/${selectedHomework.id}/publish-grades?published=${newStatus}`);
            setSelectedHomework((prev: any) => ({ ...prev, gradesPublished: newStatus }));
            setHomeworks(prev => prev.map(hw => hw.id === selectedHomework.id ? { ...hw, gradesPublished: newStatus } : hw));
        } catch (err) {
            console.error("Erreur lors de la publication des notes:", err);
        }
    };

    const handleGradeSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/submissions/${selectedSubmission.id}/grade`, {
                grade: parseFloat(gradeData.grade),
                teacherFeedback: gradeData.teacherFeedback,
                teacherAnnotations: gradeData.teacherAnnotations
            });
            setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, grade: parseFloat(gradeData.grade), status: 'GRADED', teacherFeedback: gradeData.teacherFeedback, teacherAnnotations: gradeData.teacherAnnotations } : s));
            setSelectedSubmission(null);
        } catch (err) {
            console.error("Erreur lors de la notation:", err);
        }
    };

    const deleteHomework = async (id: number) => {
        setPendingDeleteIds(prev => new Set(prev).add(id));
        setIsDeletePopupOpen(false);
        setHomeworkToDelete(null);

        try {
            await api.delete(`/homeworks/${id}`);
            setHomeworks(prev => prev.filter(hw => hw.id !== id));
            setPendingDeleteIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            setPendingDeleteIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            fetchHomeworks(true);
        }
    };

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des données...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Devoirs & Travaux</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Créez, publiez et corrigez les devoirs à la maison.</p>
                </div>
                <button
                    onClick={() => { setEditingHomework(null); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors uppercase flex items-center justify-center gap-2 tracking-wider"
                >
                    <Plus size={18} /> Créer un Devoir
                </button>
            </div>

            {/* Global Filters bar for the list */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder="Rechercher un devoir (titre, description)..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 min-w-[150px]">
                    <Filter className="text-blue-600 dark:text-blue-400 shrink-0" size={16} />
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={listFilterClasse}
                        onChange={e => setListFilterClasse(e.target.value)}
                    >
                        <option value="">Toutes les classes</option>
                        {teacherCycles.flatMap(cyc =>
                            allClasses.filter(cl => cl.cycle?.id === cyc.id).map(cl => (
                                <option key={cl.id} value={cl.id}>{cl.name} ({cyc.name})</option>
                            ))
                        )}
                    </select>
                </div>
                <div className="flex items-center gap-2 min-w-[150px]">
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={listFilterSubject}
                        onChange={e => setListFilterSubject(e.target.value)}
                    >
                        <option value="">Toutes les matières</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 min-w-[150px]">
                    <select
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={listFilterType}
                        onChange={e => setListFilterType(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="DEVOIR">Devoirs</option>
                        <option value="EXAMEN">Examens</option>
                        <option value="TP">Travaux Pratiques</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Devoirs</p>
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{homeworks.length}</h4>
                    </div>
                    <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-sm">
                        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">À corriger</p>
                        <h4 className="text-2xl font-bold">{submissions.filter(s => s.status === 'PENDING').length}</h4>
                    </div>
                </div>

                {/* Homework List */}
                <div className="lg:col-span-3 space-y-4">
                    {homeworks.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                            <ClipboardList size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucun devoir créé</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Commencez par créer votre premier devoir pour vos élèves.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {displayHomeworks.map((hw) => (
                                <div key={hw.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase line-clamp-1">{hw.title}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{hw.classe?.name} • {hw.cycle?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${hw.published ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                {hw.published ? 'Publié' : 'Non publié'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${hw.type === 'EXAMEN' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : hw.type === 'TP' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                                                {hw.type || 'DEVOIR'}
                                            </span>
                                            {hw.gradesPublished && (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                                    Notes Publiées
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-blue-500" />
                                            <span>Échéance: {new Date(hw.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            <span>Barème: {hw.maxPoints} pts</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => handleViewSubmissions(hw)}
                                            className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Eye size={12} /> Soumissions
                                        </button>
                                        <button
                                            onClick={() => { setEditingHomework(hw); setIsModalOpen(true); }}
                                            className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                                        >
                                            <FileEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setHomeworkToDelete(hw);
                                                setIsDeletePopupOpen(true);
                                            }}
                                            className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Create/Edit Homework */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingHomework ? 'Modifier le Devoir' : 'Nouveau Devoir'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingHomework(null); }} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateHomework} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Titre du devoir</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Analyse de texte - L'Étranger"
                                    value={newHomework.title}
                                    onChange={e => setNewHomework({ ...newHomework, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle</label>
                                    <select
                                        value={newHomework.cycleId}
                                        onChange={e => {
                                            const sel = teacherCycles.find((c: any) => String(c.id) === e.target.value);
                                            setNewHomework({ ...newHomework, cycleId: e.target.value, cycleName: sel?.name || '', subjectId: '' });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un cycle...</option>
                                        {teacherCycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Matière</label>
                                    <select
                                        value={newHomework.subjectId}
                                        onChange={e => setNewHomework({ ...newHomework, subjectId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        required
                                        disabled={!newHomework.cycleId}
                                    >
                                        <option value="">{newHomework.cycleId ? "Sélectionner une matière..." : "D'abord choisir un cycle"}</option>
                                        {filteredSubjectsForForm.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type d'évaluation</label>
                                <select
                                    value={newHomework.type}
                                    onChange={e => setNewHomework({ ...newHomework, type: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    required
                                >
                                    <option value="DEVOIR">Devoir Maison</option>
                                    <option value="EXAMEN">Examen / Contrôle</option>
                                    <option value="TP">Travaux Pratiques (TP)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe</label>
                                <select
                                    value={newHomework.classeId}
                                    onChange={e => setNewHomework({ ...newHomework, classeId: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none disabled:opacity-50"
                                    required
                                    disabled={!newHomework.cycleId || filteredClasses.length === 0}
                                >
                                    {filteredClasses.length === 0 ? (
                                        <option value="">Aucune classe disponible</option>
                                    ) : (
                                        filteredClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                    )}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Échéance</label>
                                    <input
                                        type="date"
                                        required
                                        value={newHomework.deadline}
                                        onChange={e => setNewHomework({ ...newHomework, deadline: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Heure Limite</label>
                                    <input
                                        type="time"
                                        required
                                        value={newHomework.deadlineTime}
                                        onChange={e => setNewHomework({ ...newHomework, deadlineTime: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Points Max</label>
                                <input
                                    type="number"
                                    required
                                    value={newHomework.maxPoints}
                                    onChange={e => setNewHomework({ ...newHomework, maxPoints: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Année Scolaire</label>
                                    <select
                                        value={newHomework.academicYear}
                                        onChange={e => setNewHomework({ ...newHomework, academicYear: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2026-2027">2026-2027</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trimestre</label>
                                    <select
                                        value={newHomework.trimestre}
                                        onChange={e => setNewHomework({ ...newHomework, trimestre: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="1er Trimestre">1er Trimestre</option>
                                        <option value="2ème Trimestre">2ème Trimestre</option>
                                        <option value="3ème Trimestre">3ème Trimestre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Consignes</label>
                                <textarea
                                    rows={4}
                                    placeholder="Instructions détaillées pour les élèves..."
                                    value={newHomework.description}
                                    onChange={e => setNewHomework({ ...newHomework, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Documents joints</label>

                                {newHomework.attachmentUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                                        {newHomework.attachmentUrls.map((url, idx) => (
                                            <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <FileText size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                    <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-900 dark:text-blue-300 truncate hover:underline">Doc {idx + 1}</a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewHomework(prev => ({ ...prev, attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== idx) }))}
                                                    className="p-0.5 text-red-500 hover:text-red-700 transition-colors"
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
                                        className="hidden"
                                        id="homework-files"
                                        accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                                    />
                                    <label
                                        htmlFor="homework-files"
                                        className="flex items-center justify-center gap-2 w-full bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                                    >
                                        {isUploading ? (
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Envoi en cours...</span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">Choisir des fichiers joints</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    checked={newHomework.published}
                                    onChange={e => setNewHomework({ ...newHomework, published: e.target.checked })}
                                    className="w-4 h-4 rounded text-blue-600"
                                />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Publier immédiatement aux élèves</span>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors uppercase tracking-wider">
                                {editingHomework ? 'Mettre à jour le devoir' : 'Lancer le devoir'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal View Submissions */}
            {isSubmissionsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase">{selectedHomework?.title}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold">{submissions.length} / {studentsOfClass.length} Soumissions reçues</p>
                                </div>
                                <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveView('GRADE')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${activeView === 'GRADE' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        Correction
                                    </button>
                                    <button
                                        onClick={() => setActiveView('SUMMARY')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${activeView === 'SUMMARY' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                                    >
                                        Tableau des Notes
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeView === 'SUMMARY' && (
                                    <>
                                        <button
                                            onClick={handlePublishGrades}
                                            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold uppercase ${selectedHomework?.gradesPublished ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}
                                        >
                                            <Send size={14} /> {selectedHomework?.gradesPublished ? 'Notes Publiées' : 'Publier les Notes'}
                                        </button>
                                        <button onClick={handleExportCSV} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1 uppercase">
                                            <Download size={14} /> Excel
                                        </button>
                                        <button onClick={handleExportPDF} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 uppercase">
                                            <Download size={14} /> PDF
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsSubmissionsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"><X size={18} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex">
                            {activeView === 'GRADE' ? (
                                <>
                                    {/* List Students */}
                                    <div className="w-1/2 overflow-y-auto p-4 space-y-2 border-r border-slate-100 dark:border-slate-800">
                                        {submissions.length === 0 ? (
                                            <p className="text-slate-400 text-center py-12 text-xs italic font-semibold">Aucune soumission pour le moment.</p>
                                        ) : (
                                            submissions.map(sub => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => { setSelectedSubmission(sub); setGradeData({ grade: sub.grade?.toString() || '', teacherFeedback: sub.teacherFeedback || '', teacherAnnotations: sub.teacherAnnotations || '' }); }}
                                                    className={`p-3 rounded-xl cursor-pointer border transition-colors ${selectedSubmission?.id === sub.id ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase">{sub.student?.firstName} {sub.student?.lastName}</h5>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${sub.status === 'GRADED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                                                            {sub.status === 'GRADED' ? `${sub.grade}/${selectedHomework.maxPoints}` : 'À corriger'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(sub.submittedAt).toLocaleString()}</span>
                                                        {new Date(sub.submittedAt) > new Date(selectedHomework.deadline) && (
                                                            <span className="text-red-500 font-bold">En retard</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Grading Panel */}
                                    <div className="w-1/2 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/30">
                                        {selectedSubmission ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-2">Travail de l'élève</h4>
                                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 italic min-h-[100px]">
                                                        {selectedSubmission.content || "Contenu textuel non fourni."}
                                                    </div>
                                                    {selectedSubmission.fileUrl && (
                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {(selectedSubmission.fileUrl as string).split(',').filter(Boolean).map((url, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setAnnotatingFileUrl(getFileUrl(url));
                                                                    }}
                                                                    className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs font-bold"
                                                                >
                                                                    <FileEdit size={14} className="text-red-500" />
                                                                    <span>Corriger Fichier {idx + 1}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <form onSubmit={handleGradeSubmission} className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Note / {selectedHomework.maxPoints}</label>
                                                        <input
                                                            type="number"
                                                            max={selectedHomework.maxPoints}
                                                            required
                                                            value={gradeData.grade}
                                                            onChange={e => setGradeData({ ...gradeData, grade: e.target.value })}
                                                            placeholder="Ex: 15"
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Feedback enseignant</label>
                                                        <textarea
                                                            rows={3}
                                                            value={gradeData.teacherFeedback}
                                                            onChange={e => setGradeData({ ...gradeData, teacherFeedback: e.target.value })}
                                                            placeholder="Bravo, excellent travail..."
                                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                        ></textarea>
                                                    </div>
                                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors uppercase tracking-wider">
                                                        Valider la correction
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <Check size={36} className="text-slate-300 dark:text-slate-600 mb-2" />
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Sélectionnez une soumission</h4>
                                                <p className="text-xs text-slate-400 max-w-xs">Cliquez sur un élève à gauche pour consulter son travail et lui attribuer une note.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 w-full overflow-y-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <th className="pb-2 font-bold">Élève</th>
                                                <th className="pb-2 font-bold">Statut</th>
                                                <th className="pb-2 font-bold">Date de Rendu</th>
                                                <th className="pb-2 font-bold">Note</th>
                                                <th className="pb-2 font-bold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                            {studentsOfClass.map(student => {
                                                const sub = submissions.find(s => s.student?.id === student.id);
                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                                                            {student.lastName} {student.firstName}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${sub ? (sub.status === 'GRADED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400') : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                                {sub ? (sub.status === 'GRADED' ? 'Rendu corrigé' : 'Rendu non corrigé') : 'Non rendu'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-slate-500">
                                                            {sub ? new Date(sub.submittedAt).toLocaleDateString() : '-'}
                                                        </td>
                                                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                                                            {sub?.grade !== undefined ? `${sub.grade} / ${selectedHomework.maxPoints}` : '-'}
                                                        </td>
                                                        <td className="py-3">
                                                            {sub ? (
                                                                <button
                                                                    onClick={() => { setActiveView('GRADE'); setSelectedSubmission(sub); setGradeData({ grade: sub.grade?.toString() || '', teacherFeedback: sub.teacherFeedback || '', teacherAnnotations: sub.teacherAnnotations || '' }); }}
                                                                    className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline"
                                                                >
                                                                    Voir / Noter
                                                                </button>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {isDeletePopupOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase">Supprimer le devoir ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Cette action est irréversible et supprimera également toutes les soumissions des élèves.
                        </p>
                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setIsDeletePopupOpen(false)}
                                className="flex-1 py-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">
                                Annuler
                            </button>
                            <button onClick={() => homeworkToDelete && deleteHomework(homeworkToDelete.id)}
                                className="flex-1 py-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {annotatingFileUrl && (
                <HomeworkAnnotationViewer
                    fileUrl={annotatingFileUrl}
                    initialAnnotations={gradeData.teacherAnnotations}
                    onSave={(annots) => {
                        setGradeData((prev: any) => ({ ...prev, teacherAnnotations: annots }));
                        setSelectedSubmission((prev: any) => ({ ...prev, teacherAnnotations: annots }));
                        setAnnotatingFileUrl(null);
                    }}
                    onClose={() => setAnnotatingFileUrl(null)}
                />
            )}
        </div>
    );
};

export default Homework;
