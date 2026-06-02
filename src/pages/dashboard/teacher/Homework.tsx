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
        // Fallback to all fetched cycles if none derived from classes
        return fetchedCycles;
    }, [classes, allClasses, fetchedCycles]);

    // Derived subjects based on teacher specialties and selected cycle
    const filteredSubjectsForForm = React.useMemo(() => {
        let allPossible = subjects || [];

        // 1. Filter by Cycle (include subjects with no specific cycle or matching cycle)
        if (newHomework.cycleId) {
            allPossible = allPossible.filter(s => !s.cycle || String(s.cycle.id) === String(newHomework.cycleId));
        }

        // 2. Filter by teacher subjects (already pre-filtered by API, but keeping logic consistent)
        return allPossible;
    }, [subjects, newHomework.cycleId, user]);

    // Filter classes based on selected cycle AND selected subject
    const filteredClasses = React.useMemo(() => {
        if (!newHomework.cycleId) return [];
        const activeClasses = (classes && classes.length > 0) ? classes : allClasses;

        // Base filter by cycle
        let filtered = activeClasses.filter(c => c.cycle && String(c.cycle.id) === String(newHomework.cycleId));

        // Refined filter: if a subject is selected, only show classes that have this subject
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
    }, [homeworks, searchTerm, listFilterClasse, listFilterSubject, pendingDeleteIds]);

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


    // Auto-select first class when filteredClasses change
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

            // INSTANT UI: Close modal and reset form immediately
            setIsModalOpen(false);
            setEditingHomework(null);
            setNewHomework((prev: any) => ({ ...prev, title: '', description: '' }));

            // OPTIMISTIC UPDATE for Edit
            if (editingHomework) {
                setHomeworks(prev => prev.map(hw =>
                    hw.id === editingHomework.id
                        ? { ...hw, title: payload.title, description: payload.description }
                        : hw
                ));
            }

            // BACKGROUND ACTION: Call API and refresh list without blocking the UI
            (async () => {
                try {
                    if (editingHomework) {
                        await api.put(`/homeworks/${editingHomework.id}`, payload);
                    } else {
                        await api.post('/homeworks', payload);
                    }
                    fetchHomeworks(true); // Silent background refresh to get the full final state
                } catch (err) {
                    console.error("Erreur lors de l'enregistrement du devoir:", err);
                    fetchHomeworks(true); // Sync back if it failed
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
            // Update local submissions list
            setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, grade: parseFloat(gradeData.grade), status: 'GRADED', teacherFeedback: gradeData.teacherFeedback, teacherAnnotations: gradeData.teacherAnnotations } : s));
            setSelectedSubmission(null);
        } catch (err) {
            console.error("Erreur lors de la notation:", err);
        }
    };

    const deleteHomework = async (id: number) => {
        // INSTANT UI Blacklist: Hide immediately and forever until server refresh confirms
        setPendingDeleteIds(prev => new Set(prev).add(id));
        setIsDeletePopupOpen(false);
        setHomeworkToDelete(null);

        try {
            await api.delete(`/homeworks/${id}`);
            // Once confirmed, prune from main list and blacklist
            setHomeworks(prev => prev.filter(hw => hw.id !== id));
            setPendingDeleteIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            // On error, remove from blacklist to let it reappear, and refresh
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
            <>
                <div className="min-h-[60vh] flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Chargement des données...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 uppercase">Devoirs & Travaux</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Créez, publiez et corrigez les devoirs à la maison.</p>
                </div>
                <button
                    onClick={() => { setEditingHomework(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-10 py-5 rounded-[30px] font-black flex items-center gap-3 shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.03] active:scale-[0.97] transition-all uppercase text-xs tracking-widest whitespace-nowrap"
                >
                    <Plus size={20} /> Créer un Devoir
                </button>
            </div>

            {/* Global Filters bar for the list */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-50 mb-8 flex flex-wrap items-center gap-6">
                <div className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un devoir (titre, description)..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 min-w-[150px]">
                    <Filter className="text-blue-600" size={18} />
                    <select
                        className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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
                <div className="flex items-center gap-4 min-w-[150px]">
                    <select
                        className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        value={listFilterSubject}
                        onChange={e => setListFilterSubject(e.target.value)}
                    >
                        <option value="">Toutes les matières</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-4 min-w-[150px]">
                    <select
                        className="bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Stats Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] shadow-xl border border-blue-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Devoirs</p>
                        <h4 className="text-3xl font-black text-slate-800">{homeworks.length}</h4>
                    </div>
                    <div className="bg-blue-600 p-6 rounded-[32px] shadow-xl shadow-blue-600/20 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-100/60 mb-2">À corriger</p>
                        <h4 className="text-3xl font-black">{submissions.filter(s => s.status === 'PENDING').length}</h4>
                    </div>
                </div>

                {/* Homework List */}
                <div className="lg:col-span-3 space-y-6">
                    {homeworks.length === 0 ? (
                        <div className="bg-white p-20 rounded-[48px] text-center border-4 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ClipboardList size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Aucun devoir créé</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Commencez par créer votre premier devoir pour vos élèves.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {displayHomeworks.map((hw) => (
                                <div key={hw.id} className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-50 hover:border-blue-200 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${hw.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {hw.published ? 'Publié' : 'Non publié'}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${hw.type === 'EXAMEN' ? 'bg-rose-50 text-rose-600' : hw.type === 'TP' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {hw.type || 'DEVOIR'}
                                        </span>
                                        {hw.gradesPublished && (
                                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                                                Notes Publiées
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase leading-tight mb-1">{hw.title}</h4>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{hw.classe?.name} • {hw.cycle?.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                            <Calendar size={14} className="text-blue-500" />
                                            <span>Échéance: {new Date(hw.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 font-medium text-xs">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span>Barème: {hw.maxPoints} pts</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 relative z-10 transition-all opacity-100">
                                        <button
                                            onClick={() => handleViewSubmissions(hw)}
                                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                                        >
                                            <Eye size={14} /> Soumissions
                                        </button>
                                        <button
                                            onClick={() => { setEditingHomework(hw); setIsModalOpen(true); }}
                                            className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-md"
                                        >
                                            <FileEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setHomeworkToDelete(hw);
                                                setIsDeletePopupOpen(true);
                                            }}
                                            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 size={20} />
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setEditingHomework(null); }}></div>
                    <div className="bg-white rounded-[40px] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl border border-blue-50 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800">{editingHomework ? 'Modifier le Devoir' : 'Nouveau Devoir'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingHomework(null); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateHomework} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Titre du devoir</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Analyse de texte - L'Étranger"
                                    value={newHomework.title}
                                    onChange={e => setNewHomework({ ...newHomework, title: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Cycle</label>
                                    <select
                                        value={newHomework.cycleId}
                                        onChange={e => {
                                            const sel = teacherCycles.find((c: any) => String(c.id) === e.target.value);
                                            setNewHomework({ ...newHomework, cycleId: e.target.value, cycleName: sel?.name || '', subjectId: '' });
                                        }}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner un cycle...</option>
                                        {teacherCycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Matière</label>
                                    <select
                                        value={newHomework.subjectId}
                                        onChange={e => setNewHomework({ ...newHomework, subjectId: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Type d'évaluation</label>
                                <select
                                    value={newHomework.type}
                                    onChange={e => setNewHomework({ ...newHomework, type: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    required
                                >
                                    <option value="DEVOIR">Devoir Maison</option>
                                    <option value="EXAMEN">Examen / Contrôle</option>
                                    <option value="TP">Travaux Pratiques (TP)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Classe</label>
                                <select
                                    value={newHomework.classeId}
                                    onChange={e => setNewHomework({ ...newHomework, classeId: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none disabled:opacity-50"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Échéance</label>
                                    <input
                                        type="date"
                                        required
                                        value={newHomework.deadline}
                                        onChange={e => setNewHomework({ ...newHomework, deadline: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Heure Limite</label>
                                    <input
                                        type="time"
                                        required
                                        value={newHomework.deadlineTime}
                                        onChange={e => setNewHomework({ ...newHomework, deadlineTime: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Points Max</label>
                                <input
                                    type="number"
                                    required
                                    value={newHomework.maxPoints}
                                    onChange={e => setNewHomework({ ...newHomework, maxPoints: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Année Scolaire</label>
                                    <select
                                        value={newHomework.academicYear}
                                        onChange={e => setNewHomework({ ...newHomework, academicYear: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    >
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2026-2027">2026-2027</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Trimestre</label>
                                    <select
                                        value={newHomework.trimestre}
                                        onChange={e => setNewHomework({ ...newHomework, trimestre: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    >
                                        <option value="1er Trimestre">1er Trimestre</option>
                                        <option value="2ème Trimestre">2ème Trimestre</option>
                                        <option value="3ème Trimestre">3ème Trimestre</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Consignes</label>
                                <textarea
                                    rows={6}
                                    placeholder="Instructions détaillées pour les élèves..."
                                    value={newHomework.description}
                                    onChange={e => setNewHomework({ ...newHomework, description: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                ></textarea>
                            </div>


                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Documents joints (Images, PDF, Dossiers...)</label>

                                {newHomework.attachmentUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                        {newHomework.attachmentUrls.map((url, idx) => (
                                            <div key={idx} className="relative group p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText size={14} className="text-blue-600 shrink-0" />
                                                    <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-blue-900 truncate hover:underline">Doc {idx + 1}</a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setNewHomework(prev => ({ ...prev, attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== idx) }))}
                                                    className="p-1 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 relative">
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
                                            className="flex items-center justify-center gap-3 w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl px-6 py-8 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
                                        >
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Envoi en cours...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-600">
                                                    <Download size={32} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Cliquer pour ajouter des fichiers</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 px-4">
                                <input
                                    type="checkbox"
                                    checked={newHomework.published}
                                    onChange={e => setNewHomework({ ...newHomework, published: e.target.checked })}
                                    className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500/20"
                                />
                                <span className="text-sm font-bold text-slate-600">Publier immédiatement aux élèves</span>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase text-xs">
                                {editingHomework ? 'Mettre à jour le devoir' : 'Lancer le devoir'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal View Submissions */}
            {isSubmissionsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSubmissionsModalOpen(false)}></div>
                    <div className="bg-slate-50 rounded-[48px] w-full max-w-[95%] relative z-10 shadow-3xl flex flex-col h-[95vh] overflow-hidden border border-white">
                        <div className="p-10 bg-white border-b border-slate-100 flex justify-between items-center">
                            <div className="flex gap-10 items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedHomework?.title}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{submissions.length} / {studentsOfClass.length} Soumissions reçues</p>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-2xl">
                                    <button
                                        onClick={() => setActiveView('GRADE')}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'GRADE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Correction
                                    </button>
                                    <button
                                        onClick={() => setActiveView('SUMMARY')}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'SUMMARY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Tableau des Notes
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {activeView === 'SUMMARY' && (
                                    <>
                                        <button
                                            onClick={handlePublishGrades}
                                            className={`p-4 rounded-3xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${selectedHomework?.gradesPublished ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            <Send size={18} /> {selectedHomework?.gradesPublished ? 'Notes Publiées' : 'Publier les Notes'}
                                        </button>
                                        <button onClick={handleExportCSV} className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                            <Download size={18} /> Excel
                                        </button>
                                        <button onClick={handleExportPDF} className="p-4 bg-rose-50 text-rose-600 rounded-3xl hover:bg-rose-100 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest no-print">
                                            <Download size={18} /> PDF
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setIsSubmissionsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all no-print"><X size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden flex gap-0 p-0">
                            {activeView === 'GRADE' ? (
                                <>
                                    {/* List Students */}
                                    <div className="w-1/2 overflow-y-auto border-r border-slate-100 p-8 space-y-4">
                                        {submissions.length === 0 ? (
                                            <p className="text-slate-400 text-center py-20 font-medium">Aucune soumission pour le moment.</p>
                                        ) : (
                                            submissions.map(sub => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => { setSelectedSubmission(sub); setGradeData({ grade: sub.grade?.toString() || '', teacherFeedback: sub.teacherFeedback || '', teacherAnnotations: sub.teacherAnnotations || '' }); }}
                                                    className={`p-6 rounded-[32px] cursor-pointer transition-all border-2 ${selectedSubmission?.id === sub.id ? 'bg-white border-blue-600 shadow-xl shadow-blue-900/5 translate-x-3' : 'bg-white/50 border-transparent hover:bg-white hover:border-slate-100'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-black text-slate-800 uppercase tracking-tight text-sm">{sub.student?.firstName} {sub.student?.lastName}</h5>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {sub.status === 'GRADED' ? sub.grade + '/' + selectedHomework.maxPoints : 'À corriger'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                                                            <Clock size={10} /> {new Date(sub.submittedAt).toLocaleString()}
                                                        </p>
                                                        {new Date(sub.submittedAt) > new Date(selectedHomework.deadline) && (
                                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-tight">En retard</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Grading Panel */}
                                    <div className="w-1/2 p-10 bg-white overflow-y-auto">
                                        {selectedSubmission ? (
                                            <div className="flex flex-col">
                                                <div className="mb-10">
                                                    <h4 className="text-xl font-black text-slate-800 mb-6 uppercase">Travail de l'élève</h4>
                                                    <div className="bg-slate-50 p-6 rounded-3xl min-h-[150px] mb-6">
                                                        <p className="text-slate-600 text-sm italic">{selectedSubmission.content || "Contenu textuel non fourni."}</p>
                                                    </div>
                                                    {selectedSubmission.fileUrl && (
                                                        <div className="flex flex-wrap gap-3">
                                                            {(selectedSubmission.fileUrl as string).split(',').filter(Boolean).map((url, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setAnnotatingFileUrl(getFileUrl(url));
                                                                    }}
                                                                    href="#"
                                                                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-all text-blue-600 rounded-2xl w-fit group border border-blue-100/50 hover:shadow-lg"
                                                                    title={url.split('/').pop()}
                                                                >
                                                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                                        <FileEdit size={16} className="text-red-500" />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Corriger Fichier {idx + 1}</span>
                                                                        <span className="text-[9px] font-bold opacity-60 truncate max-w-[120px]">{url.split('/').pop()}</span>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <form onSubmit={handleGradeSubmission} className="space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Note / {selectedHomework.maxPoints}</label>
                                                            <input
                                                                type="number"
                                                                max={selectedHomework.maxPoints}
                                                                required
                                                                value={gradeData.grade}
                                                                onChange={e => setGradeData({ ...gradeData, grade: e.target.value })}
                                                                placeholder="Ex: 15"
                                                                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-black focus:border-blue-500 transition-all outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Feedback enseignant</label>
                                                        <textarea
                                                            rows={3}
                                                            value={gradeData.teacherFeedback}
                                                            onChange={e => setGradeData({ ...gradeData, teacherFeedback: e.target.value })}
                                                            placeholder="Bravo, excellent travail..."
                                                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-blue-500 transition-all outline-none"
                                                        ></textarea>
                                                    </div>
                                                    <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10">
                                                        Valider la correction
                                                    </button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                    <Check size={60} className="text-slate-200" />
                                                </div>
                                                <h4 className="text-xl font-black text-slate-800 mb-2">Sélectionnez une soumission</h4>
                                                <p className="text-slate-400 max-w-xs mx-auto">Cliquez sur un élève à gauche pour consulter son travail et lui attribuer une note.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-10 w-full overflow-y-auto print-section">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr>
                                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Eleve</th>
                                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Statut</th>
                                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Date de Rendu</th>
                                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Note</th>
                                                <th className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentsOfClass.map(student => {
                                                const sub = submissions.find(s => s.student?.id === student.id);
                                                return (
                                                    <tr key={student.id} className="bg-white shadow-sm rounded-3xl overflow-hidden">
                                                        <td className="px-6 py-6 first:rounded-l-3xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-xs">
                                                                    {student.firstName[0]}{student.lastName[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-800 uppercase">{student.lastName} {student.firstName}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.studentIdNumber || "Pas de matricule"}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-center ${sub ? (sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600') : 'bg-slate-100 text-slate-400'
                                                                    }`}>
                                                                    {sub ? (sub.status === 'GRADED' ? 'Rendu corrigé' : 'Rendu non corrigé') : 'Non rendu'}
                                                                </span>
                                                                {sub && (
                                                                    <span className={`px-4 py-1 text-[8px] font-black uppercase tracking-tighter text-center rounded-lg ${new Date(sub.submittedAt) <= new Date(selectedHomework.deadline) ? 'text-emerald-500 bg-emerald-50/30' : 'text-red-500 bg-red-50/30'}`}>
                                                                        {new Date(sub.submittedAt) <= new Date(selectedHomework.deadline) ? 'À TEMPS' : 'EN RETARD'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <span className="text-xs font-bold text-slate-500">
                                                                {sub ? new Date(sub.submittedAt).toLocaleDateString() : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-6">
                                                            <div className="flex items-center gap-1">
                                                                <span className={`text-lg font-black ${sub?.grade !== undefined ? 'text-slate-800' : 'text-slate-300'}`}>
                                                                    {sub?.grade !== undefined ? sub.grade : '-'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400">/ {selectedHomework.maxPoints}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 last:rounded-r-3xl">
                                                            {sub ? (
                                                                <button
                                                                    onClick={() => { setActiveView('GRADE'); setSelectedSubmission(sub); setGradeData({ grade: sub.grade?.toString() || '', teacherFeedback: sub.teacherFeedback || '', teacherAnnotations: sub.teacherAnnotations || '' }); }}
                                                                    className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
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
            {/* Modal de Confirmation de Suppression */}
            {isDeletePopupOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsDeletePopupOpen(false)}
                    ></div>
                    <div className="bg-white rounded-[40px] w-full max-w-md p-10 relative z-10 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 text-center mb-4 uppercase tracking-tighter">Supprimer le devoir ?</h3>
                        <p className="text-slate-500 text-center font-medium mb-10 leading-relaxed">
                            Voulez-vous vraiment supprimer ce devoir ? Cette action est irréversible et supprimera également toutes les soumissions des élèves.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => homeworkToDelete && deleteHomework(homeworkToDelete.id)}
                                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                            >
                                Oui, Supprimer Définitivement
                            </button>
                            <button
                                onClick={() => setIsDeletePopupOpen(false)}
                                className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                Annuler
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
        </>
    );
};

export default Homework;
