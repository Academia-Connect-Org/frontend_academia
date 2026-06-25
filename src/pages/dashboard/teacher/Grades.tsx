import React from 'react';
import {
    Plus,
    Calculator,
    TrendingUp,
    History
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../../utils/export';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

// Sub-components
// MatrixCard is now used in HistoryView
import HistoryView from './grades/HistoryView';
import CreateView from './grades/CreateView';
import AveragesView from './grades/AveragesView';
import AverageHistoryView from './grades/AverageHistoryView';
import Toast from './grades/Toast';
import type { ToastData } from './grades/Toast';
import { getGradeMention } from './grades/utils';
import ConfirmationModal from './grades/ConfirmationModal';

const Grades: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = React.useState<'HISTORY' | 'CREATE' | 'AVERAGES' | 'AVERAGE_HISTORY'>('HISTORY');
    const [loading, setLoading] = React.useState(true);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [history, setHistory] = React.useState<any[]>([]);
    const [selectedHistorySubject, setSelectedHistorySubject] = React.useState<string>('ALL');
    const [selectedHistoryYear, setSelectedHistoryYear] = React.useState<string>('2025-2026');
    const [showExportMenu, setShowExportMenu] = React.useState(false);

    // Form State
    const [selectedClass, setSelectedClass] = React.useState<any>(null);
    const [selectedSubject, setSelectedSubject] = React.useState<any>(null);
    const [evalType, setEvalType] = React.useState('TEST');
    const [trimester, setTrimester] = React.useState('1er Trimestre');
    const [academicYear, setAcademicYear] = React.useState('2025-2026');
    const [maxPoints, setMaxPoints] = React.useState(user?.institution?.type === 'ECOLE' ? 10 : 20);
    const [coefficient, setCoefficient] = React.useState(1);
    const [studentGrades, setStudentGrades] = React.useState<Record<number, string>>({});
    const [studentComments, setStudentComments] = React.useState<Record<number, string>>({});
    const [students, setStudents] = React.useState<any[]>([]);
    const [existingGrades, setExistingGrades] = React.useState<Record<number, number>>({});
    const [isSaving, setIsSaving] = React.useState(false);
    const [isPublished, setIsPublished] = React.useState(false);
    const [calculatedResults, setCalculatedResults] = React.useState<any[]>([]);
    const [allEvaluations, setAllEvaluations] = React.useState<any[]>([]);
    const [selectedEvalIds, setSelectedEvalIds] = React.useState<Set<string>>(new Set());
    const [averageHistory, setAverageHistory] = React.useState<any[]>([]);
    const [toast, setToast] = React.useState<ToastData | null>(null);
    const [confirmModal, setConfirmModal] = React.useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        type: 'danger' | 'info' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const triggerConfirm = (config: { title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' | 'success'; confirmText?: string; cancelText?: string }) => {
        setConfirmModal({
            isOpen: true,
            title: config.title,
            message: config.message,
            onConfirm: config.onConfirm,
            confirmText: config.confirmText,
            cancelText: config.cancelText,
            type: config.type || 'info'
        });
    };

    React.useEffect(() => {
        if (view !== 'AVERAGE_HISTORY' && view !== 'AVERAGES') {
            setAllEvaluations([]);
            setSelectedEvalIds(new Set());
            setCalculatedResults([]);
        }
    }, [
        typeof selectedClass === 'object' ? selectedClass?.id : selectedClass,
        typeof selectedSubject === 'object' ? selectedSubject?.id : selectedSubject,
        trimester,
        academicYear,
        view
    ]);

    React.useEffect(() => {
        fetchInitialData();
        // Set default maxPoints based on institution type
        if (user?.institution?.type === 'ECOLE') {
            setMaxPoints(10);
        } else {
            setMaxPoints(20);
        }
    }, [user?.id, user?.institution?.type]);

    React.useEffect(() => {
        if (view === 'AVERAGE_HISTORY') fetchAverageHistory();
    }, [view]);

    const switchToCreate = () => {
        // Reset to defaults but try to keep the first available class
        if (user?.institution?.type === 'ECOLE') {
            setMaxPoints(10);
        } else {
            setMaxPoints(20);
        }
        setEvalType('TEST');
        
        if (classes.length > 0) {
            handleClassChange(classes[0].id.toString());
        } else {
            setSelectedClass(null);
            setSelectedSubject(null);
        }
        
        setStudentGrades({});
        setStudentComments({});
        setExistingGrades({});
        setView('CREATE');
    };

    const fetchAverageHistory = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/report-cards/teacher/${user.id}/results`);
            const results = res.data || [];

            const sessionsMap = results.reduce((acc: any, curr: any) => {
                const key = `${curr.classe?.id}-${curr.subject?.id}-${curr.trimester}-${curr.academicYear}`;
                if (!acc[key]) {
                    acc[key] = {
                        key,
                        classe: curr.classe,
                        subject: curr.subject,
                        trimester: curr.trimester,
                        academicYear: curr.academicYear,
                        coefficient: curr.coefficient,
                        studentCount: 0,
                        results: []
                    };
                }
                acc[key].studentCount++;
                acc[key].results.push(curr);
                return acc;
            }, {});

            setAverageHistory(Object.values(sessionsMap));
        } catch (err) {
            console.error("Error fetching average history:", err);
        }
    };

    const handleDeleteSession = async (session: any) => {
        triggerConfirm({
            title: 'Supprimer l\'historique ?',
            message: `Voulez-vous vraiment supprimer l'historique des moyennes pour ${session.classe.name} - ${session.subject.name} ?`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete('/report-cards/session', {
                        params: {
                            classeId: session.classe.id,
                            subjectId: session.subject.id,
                            trimester: session.trimester,
                            academicYear: session.academicYear
                        }
                    });
                    showToast("Historique supprimé avec succès");
                    fetchAverageHistory();
                } catch (err) {
                    console.error("Error deleting session:", err);
                    showToast("Erreur lors de la suppression", "error");
                }
            }
        });
    };

    const handleLoadSession = (session: any) => {
        setSelectedClass(session.classe);
        setSelectedSubject(session.subject);
        setTrimester(session.trimester);
        setAcademicYear(session.academicYear);
        setCoefficient(session.coefficient);
        setCalculatedResults(session.results);
        setView('AVERAGES');
    };

    const handlePublishSession = async (session: any) => {
        const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';
        triggerConfirm({
            title: 'Envoyer les moyennes ?',
            message: `Voulez-vous vraiment envoyer ces moyennes ${dest} ?`,
            type: 'success',
            onConfirm: async () => {
                try {
                    await api.post('/report-cards/publish', null, {
                        params: {
                            teacherId: user?.id,
                            classeId: session.classe.id,
                            subjectId: session.subject.id,
                            trimester: session.trimester,
                            academicYear: session.academicYear
                        }
                    });
                    const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';
                    showToast(`Moyennes envoyées ${dest}`);
                } catch (err) {
                    console.error("Error publishing session:", err);
                    showToast("Erreur lors de l'envoi", "error");
                }
            }
        });
    };

    const fetchInitialData = async () => {
        if (!user?.id) {
            console.error("fetchInitialData: NO USER ID found in context");
            return;
        }
        setLoading(true);
        console.log("fetchInitialData: Starting for user", user.id, "Institution type:", user?.institution?.type);
        try {
            const instId = typeof user.institution === 'object' ? user.institution.id : (user.institution || 1);
            const classesUrl = `/classes/teacher/${user.id}`;
            console.log("fetchInitialData: Calling URL:", classesUrl);

            const [classesRes, subjectsRes, historyRes, teacherRes] = await Promise.all([
                api.get(classesUrl),
                api.get(`/subjects?institutionId=${instId}`),
                api.get(`/grades/teacher/${user.id}`),
                api.get(`/teachers/${user.id}`).catch(() => ({ data: {} }))
            ]);

            const teacherClasses = classesRes.data || [];
            console.log("fetchInitialData: SUCCESS. Classes found:", teacherClasses.length, teacherClasses);
            const allSubjects = subjectsRes.data || [];
            console.log("fetchInitialData: Subjects found:", allSubjects.length);
            const teacherDetails = teacherRes.data || {};
            const specialties = teacherDetails.specialties || (user as any)?.specialties || [];

            setClasses(teacherClasses);
            setHistory(historyRes.data || []);

            let filteredSubjects = allSubjects;
            if (specialties.length > 0) {
                const specMatches = allSubjects.filter((s: any) =>
                    specialties.some((spec: string) =>
                        s.name.toLowerCase().includes(spec.toLowerCase().trim()) ||
                        spec.toLowerCase().includes(s.name.toLowerCase().trim())
                    )
                );
                if (specMatches.length > 0) filteredSubjects = specMatches;
            }
            setSubjects(filteredSubjects);

            if (teacherClasses.length > 0) {
                const firstClass = teacherClasses[0];
                setSelectedClass(firstClass);

                const firstClsid = typeof firstClass === 'object' ? firstClass.id : firstClass;
                const studentsRes = await api.get(`/students/classe/${firstClsid}`);
                setStudents(studentsRes.data || []);

                const initial: Record<number, string> = {};
                (studentsRes.data || []).forEach((s: any) => { initial[s.id] = ''; });
                setStudentGrades(initial);

                const classCycleId = firstClass.cycle?.id;
                let cycleSubjects = filteredSubjects;
                if (classCycleId) {
                    const matched = filteredSubjects.filter((s: any) => !s.cycle || String(s.cycle.id) === String(classCycleId));
                    if (matched.length > 0) cycleSubjects = matched;
                }
                if (cycleSubjects.length > 0) setSelectedSubject(cycleSubjects[0]);
            }
        } catch (err) {
            console.error("Error fetching grades data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (clsId: string) => {
        console.log("DEBUG: handleClassChange called with ID:", clsId, "Available classes:", classes.length, classes);
        const cls = classes.find((c: any) => String(typeof c === 'object' ? c.id : c) === String(clsId));
        console.log("DEBUG: found class:", cls);
        setSelectedClass(cls);
        if (cls) {
            const actualId = typeof cls === 'object' ? cls.id : cls;
            try {
                const res = await api.get(`/students/classe/${actualId}`);
                setStudents(res.data || []);
                const initial: Record<number, string> = {};
                const initialComments: Record<number, string> = {};
                (res.data || []).forEach((s: any) => {
                    initial[s.id] = '';
                    initialComments[s.id] = '';
                });
                setStudentGrades(initial);
                setStudentComments(initialComments);
                setExistingGrades({});
            } catch (err) {
                console.error("Error fetching students:", err);
            }
        }
    };

    const handleSaveGrades = async () => {
        console.log("DEBUG [handleSaveGrades] State:", { 
            selectedClass: selectedClass?.id || selectedClass, 
            classType: typeof selectedClass,
            selectedSubject: selectedSubject?.id || selectedSubject,
            subjectType: typeof selectedSubject,
            userId: user?.id 
        });

        if (!selectedClass) {
            showToast("Veuillez sélectionner une classe", "error");
            return;
        }
        if (!selectedSubject) {
            showToast("Veuillez sélectionner une matière", "error");
            return;
        }
        if (!user?.id) {
            showToast("Session expirée (ID utilisateur introuvable)", "error");
            return;
        }
        setIsSaving(true);
        try {
            const gradesPayload = Object.entries(studentGrades)
                .filter(([_, val]) => val !== '' && val !== undefined && val !== null)
                .map(([studentId, val]) => {
                    const studentIdNum = parseInt(studentId);
                    const markValue = parseFloat(val.toString().replace(',', '.'));
                    
                    return {
                        id: existingGrades[studentIdNum] || null,
                        student: { id: studentIdNum },
                        subject: { id: typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject },
                        teacher: { id: user?.id },
                        classe: { id: typeof selectedClass === 'object' ? selectedClass.id : selectedClass },
                        value: isNaN(markValue) ? 0 : markValue,
                        comment: studentComments[studentIdNum] || '',
                        maxPoints: Number(maxPoints),
                        coefficient: Number(coefficient),
                        trimester,
                        academicYear,
                        type: evalType
                    };
                });

            console.log("Saving grades payload:", gradesPayload);
            if (gradesPayload.length === 0) {
                showToast("Veuillez saisir au moins une note", "error");
                setIsSaving(false);
                return;
            }

            const response = await api.post('/grades/batch', gradesPayload);
            console.log("Save response:", response.data);

            showToast("Notes enregistrées avec succès");
            setView('HISTORY');
            fetchInitialData();
            setStudentGrades({});
            setStudentComments({});
            setExistingGrades({});
        } catch (err: any) {
            console.error("Error saving grades:", err);
            const errorMsg = err.response?.data?.message || err.message || "Erreur lors de l'enregistrement";
            showToast(errorMsg, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteGrade = async (gradeId: number) => {
        triggerConfirm({
            title: 'Supprimer l\'évaluation ?',
            message: "Êtes-vous sûr de vouloir supprimer cette évaluation ? Cette action est irréversible.",
            type: 'danger',
            confirmText: 'Supprimer',
            onConfirm: async () => {
                try {
                    await api.delete(`/grades/${gradeId}`);
                    setHistory(prev => prev.filter(g => g.id !== gradeId));
                    showToast("Évaluation supprimée");
                } catch (err) {
                    console.error("Error deleting grade:", err);
                    showToast("Erreur lors de la suppression", "error");
                }
            }
        });
    };

    const handleEditGrade = async (grade: any) => {
        setLoading(true);
        try {
            setSelectedClass(grade.classe);
            setSelectedSubject(grade.subject);
            setTrimester(grade.trimester);
            setEvalType(grade.type);
            setCoefficient(Number(grade.coefficient));
            setMaxPoints(Number(grade.maxPoints));
            setAcademicYear(grade.academicYear);

            const classId = grade.classe.id;
            const subjectId = grade.subject.id;

            const studentsRes = await api.get(`/students/classe/${classId}`);
            const allStudents = studentsRes.data || [];
            setStudents(allStudents);

            const gradesRes = await api.get(`/grades/classe/${classId}/subject/${subjectId}?trimester=${grade.trimester}`);
            const existing = (gradesRes.data || []).filter((g: any) =>
                g.type === grade.type && g.academicYear === grade.academicYear
            );

            const initialGrades: Record<number, string> = {};
            const initialComments: Record<number, string> = {};
            const gradeIds: Record<number, number> = {};

            allStudents.forEach((s: any) => {
                initialGrades[s.id] = '';
                initialComments[s.id] = '';
            });

            existing.forEach((g: any) => {
                if (g.student?.id) {
                    initialGrades[g.student.id] = String(g.value);
                    initialComments[g.student.id] = g.comment || '';
                    gradeIds[g.student.id] = g.id;
                }
            });

            setStudentGrades(initialGrades);
            setStudentComments(initialComments);
            setExistingGrades(gradeIds);
            setView('CREATE');
            checkPublicationStatus(grade.classe.id, grade.subject.id, grade.trimester, grade.academicYear);
        } catch (err) {
            console.error("Error loading for edit:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkPublicationStatus = async (clsId: number, subId: number, trim: string, year: string) => {
        try {
            const res = await api.get(`/report-cards/classe/${clsId}/status`, {
                params: { trimester: trim, academicYear: year }
            });
            const isSubmissions = res.data || [];
            const published = isSubmissions.some((p: any) => p.subject.id === subId && p.teacher.id === user?.id);
            setIsPublished(published);
        } catch (err) {
            console.error("Error checking publication:", err);
        }
    };

    const handleCalculateAverages = async () => {
        if (!selectedClass || (!selectedSubject && user?.institution?.type !== 'ECOLE')) return;
        setView('AVERAGES');
        try {
            const isEcole = user?.institution?.type === 'ECOLE';
            const clsId = typeof selectedClass === 'object' ? selectedClass.id : selectedClass;
            const subId = typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject;

            // For ECOLE, we fetch ALL subject grades for the class
            const [gradesRes, hwSubRes] = await Promise.all([
                isEcole 
                    ? api.get(`/grades/classe/${clsId}`, { params: { trimester, academicYear } })
                    : api.get(`/grades/classe/${clsId}/subject/${subId}`, { params: { trimester, academicYear } }),
                isEcole
                    ? api.get(`/submissions/classe/${clsId}`, { params: { trimester, academicYear } })
                    : api.get(`/submissions/classe/${clsId}/subject/${subId}`, { params: { trimester, academicYear } })
            ]);

            const gradesData = gradesRes.data || [];
            const hwSubmissions = hwSubRes.data || [];

            const normalizedHws = hwSubmissions.map((s: any) => ({
                id: `hw-${s.id}`,
                evaluationId: `homework-${s.homework.id}`,
                student: s.student,
                subject: s.homework.subject,
                value: s.grade,
                maxPoints: s.homework.maxPoints || 20,
                coefficient: 1,
                type: s.homework.type,
                title: s.homework.title,
                isHomework: true,
                createdAt: s.createdAt,
                deadline: s.homework.deadline
            }));

            const normalizedGrades = gradesData.map((g: any) => ({
                ...g,
                id: `grade-${g.id}`,
                evaluationId: `direct-${g.type}-${new Date(g.createdAt).setSeconds(0, 0)}`,
                isHomework: false
            }));

            const allPossibleGrades = [...normalizedGrades, ...normalizedHws];
            const activeEvalIds = new Set(allPossibleGrades.map((g: any) => g.evaluationId));
            setSelectedEvalIds(activeEvalIds as any);

            const evalGroups: any[] = [];
            const seenEvals = new Set();
            allPossibleGrades.forEach((g: any) => {
                if (!seenEvals.has(g.evaluationId)) {
                    seenEvals.add(g.evaluationId);
                    evalGroups.push({
                        id: g.evaluationId,
                        type: g.type,
                        title: g.title || g.type,
                        date: g.createdAt || g.deadline,
                        isHomework: g.isHomework,
                        subject: g.subject
                    });
                }
            });
            setAllEvaluations(evalGroups);

            const finalResults: any[] = [];
            
            // Loop through students
            students.forEach(student => {
                // Determine which subjects to calculate for this student
                const studentSubjects = isEcole 
                    ? subjects 
                    : subjects.filter(s => String(s.id) === String(subId));

                studentSubjects.forEach(subject => {
                    const sGrades = allPossibleGrades.filter((g: any) =>
                        g.student.id === student.id &&
                        String(g.subject?.id) === String(subject.id)
                    );

                    if (sGrades.length === 0) return;

                    let moyTrim = 0;
                    let moyDev = 0;
                    let noteExam = 0;

                    if (isEcole) {
                        // In primary school (ECOLE), it's simpler: Average of all grades for the subject
                        // (Usually only composition, but let's be safe and average everything for that subject)
                        const totalPoints = sGrades.reduce((acc, g) => acc + (g.value / g.maxPoints) * 10, 0);
                        moyTrim = totalPoints / sGrades.length; // Normalized to 10 for ECOLE
                    } else {
                        // In secondary school (ETABLISSEMENT), (Homework + Exam) / 2
                        const devoirs = sGrades.filter((g: any) => g.type !== 'EXAM' && g.type !== 'EXAMEN');
                        const exam = sGrades.find((g: any) => g.type === 'EXAM' || g.type === 'EXAMEN');

                        moyDev = devoirs.length > 0
                            ? devoirs.reduce((acc: number, g: any) => acc + (g.value / g.maxPoints) * 20, 0) / devoirs.length
                            : 0;

                        noteExam = exam ? (exam.value / exam.maxPoints) * 20 : 0;
                        moyTrim = exam ? (moyDev + noteExam) / 2 : moyDev;
                    }

                    const mention = getGradeMention(moyTrim, isEcole ? 10 : 20);

                    finalResults.push({
                        student,
                        subject,
                        moyenneDevoirs: moyDev,
                        noteExamen: noteExam,
                        moyenneTrimestrielle: moyTrim,
                        coefficient: subject.coefficient || 1,
                        points: moyTrim * (subject.coefficient || 1),
                        observation: mention?.label || '-'
                    });
                });
            });

            setCalculatedResults(finalResults);
        } catch (err) {
            console.error("Error calculating averages:", err);
            showToast("Erreur lors du calcul des moyennes", "error");
        }
    };

    const handleSaveAverages = async () => {
        try {
            const payload = calculatedResults.map(r => ({
                student: { id: r.student.id },
                subject: { id: r.subject?.id || (typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject) },
                classe: { id: typeof selectedClass === 'object' ? selectedClass.id : selectedClass },
                teacher: { id: user?.id },
                trimester,
                academicYear,
                moyenneDevoirs: r.moyenneDevoirs,
                noteExamen: r.noteExamen,
                moyenneTrimestrielle: r.moyenneTrimestrielle,
                coefficient: r.coefficient,
                points: r.points,
                observation: r.observation
            }));

            await api.post('/report-cards/subject-results', payload);
            showToast("Moyennes enregistrées avec succès");
        } catch (err) {
            console.error("Error saving subject results:", err);
            showToast("Erreur lors de l'enregistrement", "error");
        }
    };

    const handlePublishGrades = async () => {
        if (!selectedClass || !selectedSubject) return;
        const clsId = typeof selectedClass === 'object' ? selectedClass.id : selectedClass;
        const subId = typeof selectedSubject === 'object' ? selectedSubject.id : selectedSubject;

        const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';
        triggerConfirm({
            title: 'Confirmer l\'envoi ?',
            message: `Voulez-vous vraiment envoyer les notes de cette classe ${dest} ? Cette action confirme que vos saisies sont terminées pour ce trimestre.`,
            type: 'success',
            confirmText: `Finaliser et Envoyer ${dest}`,
            onConfirm: async () => {
                try {
                    await api.post('/report-cards/publish', null, {
                        params: {
                            teacherId: user?.id,
                            classeId: clsId,
                            subjectId: subId,
                            trimester,
                            academicYear
                        }
                    });
                    setIsPublished(true);
                    const dest = user?.institution?.type === 'ECOLE' ? 'à la Direction' : 'au Provisoriat';
                    showToast(`Notes envoyées ${dest}`);
                } catch (err) {
                    console.error("Error publishing grades:", err);
                    showToast("Erreur lors de l'envoi", "error");
                }
            }
        });
    };

    const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
        const displayHistory = history.filter(g => {
            const matchSubject = selectedHistorySubject === 'ALL' || String(g.subject.id) === selectedHistorySubject;
            const matchYear = selectedHistoryYear === 'ALL' || g.academicYear === selectedHistoryYear;
            return matchSubject && matchYear;
        });

        const exportData = displayHistory.map(g => ({
            'Élève': g.student ? `${g.student.lastName} ${g.student.firstName}` : 'N/A',
            'Sujet': g.subject.name,
            'Type': g.type,
            'Classe': g.classe?.name || 'N/A',
            'Période': g.trimester,
            'Année': g.academicYear,
            'Note': g.value,
            'Max': g.maxPoints,
            'Coeff': g.coefficient,
            'Observation': g.comment || ''
        }));

        const filename = `Notes_${user?.lastName}_${new Date().toLocaleDateString()}`;

        if (format === 'CSV') {
            exportToCSV(exportData, filename);
        } else if (format === 'EXCEL') {
            exportToExcel(exportData, filename);
        } else if (format === 'PDF') {
            const headers = ['Élève', 'Sujet', 'Type', 'Classe', 'Note', 'Max', 'Coeff'];
            const pdfData = displayHistory.map(g => [
                g.student ? `${g.student.lastName} ${g.student.firstName}` : 'N/A',
                g.subject.name,
                g.type,
                g.classe?.name || 'N/A',
                g.value,
                g.maxPoints,
                g.coefficient
            ]);
            exportToPDF(headers, pdfData, 'Relevé des Notes - Enseignant', filename);
        }
        setShowExportMenu(false);
    };

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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-3">Gestion des Notes</h2>
                    <p className="text-slate-500 font-medium">Saisissez les notes, calculez les moyennes et exportez les résultats.</p>
                </div>
                <div className="flex bg-slate-100 p-2 ] shadow-inner">
                    <button
                        onClick={() => setView('HISTORY')}
                        className={`flex items-center gap-3 px-6 py-4 ] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'HISTORY' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <History size={20} /> Hist. Notes
                    </button>
                    <button
                        onClick={() => setView('AVERAGE_HISTORY')}
                        className={`flex items-center gap-3 px-6 py-4 ] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'AVERAGE_HISTORY' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Calculator size={20} /> Hist. Moyennes
                    </button>
                    <button
                        onClick={switchToCreate}
                        className={`flex items-center gap-3 px-6 py-4 ] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'CREATE' ? 'bg-white text-emerald-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Plus size={20} /> Saisie Notes
                    </button>
                    <button
                        onClick={() => handleCalculateAverages()}
                        className={`flex items-center gap-3 px-6 py-4 ] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'AVERAGES' ? 'bg-white text-amber-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <TrendingUp size={20} /> Calcul Moyennes
                    </button>
                </div>
            </div>

            {view === 'HISTORY' && (
                <HistoryView
                    history={history}
                    selectedHistorySubject={selectedHistorySubject}
                    setSelectedHistorySubject={setSelectedHistorySubject}
                    subjects={subjects}
                    selectedHistoryYear={selectedHistoryYear}
                    setSelectedHistoryYear={setSelectedHistoryYear}
                    showExportMenu={showExportMenu}
                    setShowExportMenu={setShowExportMenu}
                    handleExport={handleExport}
                    displayHistory={history.filter(g => {
                        const matchSubject = selectedHistorySubject === 'ALL' || String(g.subject.id) === selectedHistorySubject;
                        const matchYear = selectedHistoryYear === 'ALL' || g.academicYear === selectedHistoryYear;
                        return matchSubject && matchYear;
                    })}
                    handleEditGrade={handleEditGrade}
                    handleDeleteGrade={handleDeleteGrade}
                />
            )}

            {view === 'CREATE' && (
                <CreateView
                    classes={classes}
                    selectedClass={selectedClass}
                    handleClassChange={handleClassChange}
                    subjects={subjects}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    isPublished={isPublished}
                    evalType={evalType}
                    setEvalType={setEvalType}
                    trimester={trimester}
                    setTrimester={setTrimester}
                    academicYear={academicYear}
                    setAcademicYear={setAcademicYear}
                    maxPoints={maxPoints}
                    setMaxPoints={setMaxPoints}
                    coefficient={coefficient}
                    setCoefficient={setCoefficient}
                    students={students}
                    studentGrades={studentGrades}
                    setStudentGrades={setStudentGrades}
                    studentComments={studentComments}
                    setStudentComments={setStudentComments}
                    handlePublishGrades={handlePublishGrades}
                    handleSaveGrades={handleSaveGrades}
                    isSaving={isSaving}
                />
            )}

            {view === 'AVERAGES' && (
                <AveragesView
                    selectedClass={selectedClass}
                    selectedSubject={selectedSubject}
                    trimester={trimester}
                    coefficient={coefficient}
                    setCoefficient={setCoefficient}
                    setView={setView}
                    allEvaluations={allEvaluations}
                    selectedEvalIds={selectedEvalIds}
                    setSelectedEvalIds={setSelectedEvalIds}
                    handleCalculateAverages={handleCalculateAverages}
                    calculatedResults={calculatedResults}
                    setCalculatedResults={setCalculatedResults}
                    handleSaveAverages={handleSaveAverages}
                    handlePublishGrades={handlePublishGrades}
                />
            )}

            {view === 'AVERAGE_HISTORY' && (
                <AverageHistoryView
                    averageHistory={averageHistory}
                    handleDeleteSession={handleDeleteSession}
                    handleLoadSession={handleLoadSession}
                    handlePublishSession={handlePublishSession}
                />
            )}

            <Toast toast={toast} onClose={() => setToast(null)} />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                type={confirmModal.type}
            />
        </>
    );
};

export default Grades;
