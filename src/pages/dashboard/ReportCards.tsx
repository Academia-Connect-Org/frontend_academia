import React from 'react';
import {
    Search,
    GraduationCap,
    FileText,
    CheckCircle2,
    AlertCircle,
    Printer,
    Users,
    Eye,
    ShieldCheck,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { exportToPDF } from '../../utils/export';
import { motion, AnimatePresence } from 'framer-motion';
import ReportCardPreview from './report-cards/ReportCardPreview';

interface ReportCardsProps {
    role: string;
}

const ReportCards: React.FC<ReportCardsProps> = ({ role: initialRole }) => {
    const { user } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [selectedClass, setSelectedClass] = React.useState<any>(null);
    const [students, setStudents] = React.useState<any[]>([]);
    const [trimester, setTrimester] = React.useState('1er Trimestre');
    const [academicYear] = React.useState('2025-2026');
    const [reportData, setReportData] = React.useState<any>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [submissionStatus, setSubmissionStatus] = React.useState<any[]>([]);
    const [subjectResults, setSubjectResults] = React.useState<any[]>([]);
    const [classSubjects, setClassSubjects] = React.useState<any[]>([]);
    const [previewData, setPreviewData] = React.useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [allTrimestersResults, setAllTrimestersResults] = React.useState<any[]>([]);
    const [studentRanks, setStudentRanks] = React.useState<Record<number, number>>({});
    const [historicalStats, setHistoricalStats] = React.useState<Record<string, Record<number, { avg: string, rank: number }>>>({});
    const [showToast, setShowToast] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');
    const [showOrderModal, setShowOrderModal] = React.useState(false);
    const [fullInstitution, setFullInstitution] = React.useState<any>(null);

    React.useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const isTeacher = user?.role.toUpperCase() === 'ENSEIGNANT';
    const isEcole = user?.institution?.type === 'ECOLE';

    React.useEffect(() => {
        fetchInitialData();
        if (user?.institution?.id) {
            fetchFullInstitution(user.institution.id);
        }
    }, [user?.id, user?.institution?.id]);

    const fetchFullInstitution = async (id: number) => {
        try {
            const res = await api.get(`/institutions/${id}`);
            setFullInstitution(res.data);
        } catch (err) {
            console.error("Error fetching full institution details:", err);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            if (isTeacher) {
                const res = await api.get(`/report-cards/teacher/${user?.id}/managed-classes`);
                setClasses(res.data || []);
                if (res.data.length > 0) {
                    handleClassChange(res.data[0]);
                }
            } else {
                const res = await api.get('/classes', {
                    params: { institutionId: user?.institution?.id }
                });
                setClasses(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching classes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = async (cls: any) => {
        setSelectedClass(cls);
        try {
            const res = await api.get(`/students/classe/${cls.id}`);
            setStudents(res.data || []);
            setReportData(null);
        } catch (err) {
            console.error("Error fetching students:", err);
        }
    };

    const loadReportData = async () => {
        if (!selectedClass) return;
        setIsGenerating(true);
        try {
            const [reportRes, statusRes, resultsRes, subjectsRes, allRes] = await Promise.all([
                api.get(`/report-cards/classe/${selectedClass.id}/data`, {
                    params: { trimester, academicYear }
                }),
                api.get(`/report-cards/classe/${selectedClass.id}/status`, {
                    params: { trimester, academicYear }
                }),
                api.get(`/report-cards/classe/${selectedClass.id}/results`, {
                    params: { trimester, academicYear }
                }),
                api.get(`/report-cards/classe/${selectedClass.id}/subjects`),
                api.get(`/report-cards/classe/${selectedClass.id}/all-results`, {
                    params: { academicYear }
                })
            ]);
            setReportData(reportRes.data);
            setSubmissionStatus(statusRes.data || []);
            setSubjectResults(resultsRes.data || []);
            setClassSubjects(subjectsRes.data || []);
            setAllTrimestersResults(allRes.data || []);
        } catch (err) {
            console.error("Error loading report data:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    React.useEffect(() => {
        if (!reportData || students.length === 0) return;

        const averages = students.map(student => {
            const subjectsGrades = reportData[student.id] || {};
            let totalW = 0; 
            let totalC = 0;

            // In ECOLE, we divide by the total number of subjects in the class
            // In secondary, we divide by the sum of coefficients of SUBMITTED subjects
            const relevantSubjects = isEcole 
                ? classSubjects 
                : classSubjects.filter(subj => submissionStatus.some((s: any) => s.subject.id === subj.id));

            for (const subj of relevantSubjects) {
                const grades = subjectsGrades[subj.id] || [];
                let coef = isEcole ? 1 : (grades[0]?.coefficient || 1);
                let subjectAvg = 0;

                const savedRes = subjectResults.find(r => r.student.id === student.id && r.subject.id === subj.id);
                if (savedRes) {
                    subjectAvg = savedRes.moyenneTrimestrielle || 0;
                    coef = isEcole ? 1 : (savedRes.coefficient || coef);
                } else if (grades.length > 0) {
                    coef = isEcole ? 1 : (grades[0].coefficient || coef);
                    if (isEcole) {
                        const totalPoints = grades.reduce((acc: number, g: any) => acc + (g.value / g.maxPoints) * 10, 0);
                        subjectAvg = totalPoints / grades.length;
                    } else {
                        const devoirs = grades.filter((g: any) => ['DEVOIR_1', 'DEVOIR_2', 'DEVOIR_3', 'TEST', 'DEVOIR'].includes(g.type));
                        const exam = grades.find((g: any) => g.type === 'EXAM' || g.type === 'EXAMEN');
                        const devAvg = devoirs.length > 0 ? devoirs.reduce((acc: number, g: any) => acc + (g.value / g.maxPoints) * 20, 0) / devoirs.length : 0;
                        const examNote = exam ? (exam.value / exam.maxPoints) * 20 : 0;
                    subjectAvg = exam ? (devAvg + examNote) / 2 : devAvg;
                    }
                }

                const hasData = grades.length > 0 || savedRes;
                if (hasData || !isEcole) {
                    totalW += subjectAvg * coef;
                    totalC += coef;
                }
            }

            // Divisor is the sum of coefficients of subjects with at least one grade (totalC)
            const finalDivisor = totalC || 1; 

            return { 
                id: student.id, 
                avg: totalW / finalDivisor,
                lastName: student.lastName,
                firstName: student.firstName
            };
        }).sort((a, b) => {
            if (!a || !b) return 0;
            if (b.avg !== a.avg) return b.avg - a.avg;
            return (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || '');
        });

        console.log("DEBUG [ReportCards] Calculated and sorted averages:", averages);
        const ranks: Record<number, number> = {};
        let currentRank = 1;
        averages.forEach((s, idx) => {
            if (idx > 0 && s.avg === averages[idx - 1].avg) {
                ranks[s.id] = currentRank;
            } else {
                currentRank = idx + 1;
                ranks[s.id] = currentRank;
            }
            console.log(`DEBUG [ReportCards] Rank for ${s.lastName}: ${ranks[s.id]} (avg: ${s.avg.toFixed(2)})`);
        });
        setStudentRanks(ranks);

        const hStats: Record<string, Record<number, { avg: string, rank: number }>> = {
            "1er Trimestre": {},
            "2ème Trimestre": {},
            "3ème Trimestre": {}
        };
        const trimesters = ["1er Trimestre", "2ème Trimestre", "3ème Trimestre"];
        trimesters.forEach(trim => {
            const trimsAverages = students.map(st => {
                if (trim === trimester) {
                    const currentAvg = averages.find(a => a.id === st.id)?.avg;
                    return { id: st.id, avg: currentAvg !== undefined ? currentAvg : null };
                }
                const results = allTrimestersResults.filter((r: any) => r.student.id === st.id && r.trimester === trim);
                if (results.length === 0) return { id: st.id, avg: null };
                let totalW = 0; let totalC = 0;
                results.forEach((r: any) => {
                    const c = isEcole ? 1 : (r.coefficient || 1);
                    totalW += (r.moyenneTrimestrielle || 0) * c;
                    totalC += c;
                });
                return { id: st.id, avg: totalC > 0 ? (totalW / totalC) : null };
            });
            const validTrims = trimsAverages.filter(s => s.avg !== null).sort((a, b) => (b.avg as number) - (a.avg as number));
            const trimRanks: Record<number, number> = {};
            let cRank = 1;
            validTrims.forEach((s, idx) => {
                if (idx > 0 && s.avg === validTrims[idx - 1].avg) {
                    trimRanks[s.id] = cRank;
                } else {
                    cRank = idx + 1;
                    trimRanks[s.id] = cRank;
                }
            });
            trimesters.forEach(t => { 
                // just loop once to fill correctly
            });
            trimsAverages.forEach(s => {
                if (s.avg !== null) {
                    hStats[trim][s.id] = { avg: (s.avg as number).toFixed(2), rank: trimRanks[s.id] };
                }
            });
        });
        setHistoricalStats(hStats);
    }, [reportData, subjectResults, submissionStatus, classSubjects, students, allTrimestersResults, trimester, isEcole]);

    const calculateStudentStats = (studentId: number) => {
        if (!reportData) return null;
        const subjectsGrades = reportData[studentId] || {};
        let totalWeightedPoints = 0;
        let totalCoefficients = 0;
        const details = [];

        const filteredSubjects = classSubjects.filter((subj, index, self) => {
            const instId = user?.institution?.id;
            const subjectInstId = subj.institution?.id || subj.institutionId;
            if (!subjectInstId || subjectInstId !== instId) return false;
            
            // For ETABLISSEMENT, we only include subjects that have been submitted/finalized
            if (!isEcole && !submissionStatus.some((s: any) => s.subject.id === subj.id)) return false;

            const firstIndex = self.findIndex(s => s.name === subj.name);
            return index === firstIndex;
        });

        for (const subj of filteredSubjects) {
            const subjectId = subj.id;
            const isSubmitted = submissionStatus.some((s: any) => s.subject.id === subjectId);
            const grades = subjectsGrades[subjectId] || [];
            const subjectName = subj.name;
            let coef = isEcole ? 1 : (subj.coefficient || grades[0]?.coefficient || 1);
            let subjectAverage = 0;
            let devAvg = 0;
            let examNote = 0;
            let teacherName = 'N/A';

            const savedRes = subjectResults.find(r => r.student.id === studentId && r.subject.id === subjectId);
            if (savedRes) {
                devAvg = savedRes.moyenneDevoirs || 0;
                examNote = savedRes.noteExamen || 0;
                subjectAverage = savedRes.moyenneTrimestrielle || 0;
                teacherName = savedRes.teacher ? `${savedRes.teacher.lastName} ${savedRes.teacher.firstName}` : 'N/A';
                coef = isEcole ? 1 : (savedRes.coefficient || coef);
            } else if (grades.length > 0) {
                teacherName = grades[0].teacher ? `${grades[0].teacher.lastName} ${grades[0].teacher.firstName}` : 'N/A';
                coef = isEcole ? 1 : (grades[0].coefficient || coef);
                if (isEcole) {
                    // Average of all grades for the subject, normalized to 10
                    const totalPoints = grades.reduce((acc: number, g: any) => acc + (g.value / g.maxPoints) * 10, 0);
                    examNote = totalPoints / grades.length;
                    subjectAverage = examNote;
                } else {
                    const devoirs = grades.filter((g: any) => ['DEVOIR_1', 'DEVOIR_2', 'DEVOIR_3', 'TEST', 'DEVOIR'].includes(g.type));
                    const exam = grades.find((g: any) => g.type === 'EXAM' || g.type === 'EXAMEN');
                    devAvg = devoirs.length > 0 ? devoirs.reduce((acc: number, g: any) => acc + (g.value / g.maxPoints) * 20, 0) / devoirs.length : 0;
                    examNote = exam ? (exam.value / exam.maxPoints) * 20 : 0;
                    subjectAverage = exam ? (devAvg + examNote) / 2 : devAvg;
                }
            } else {
                const submission = submissionStatus.find((s: any) => s.subject.id === subjectId);
                if (submission && submission.teacher) {
                    teacherName = `${submission.teacher.lastName} ${submission.teacher.firstName}`;
                }
            }

            const hasData = isSubmitted || savedRes || grades.length > 0;
            if (hasData) {
                totalWeightedPoints += subjectAverage * coef;
                totalCoefficients += coef;
            }

            details.push({
                subjectName,
                devAvg: isSubmitted || savedRes || grades.length > 0 ? Number(devAvg).toFixed(2) : '-',
                examNote: isSubmitted || savedRes || grades.length > 0 ? Number(examNote).toFixed(2) : '-',
                average: isSubmitted || savedRes || grades.length > 0 ? Number(subjectAverage).toFixed(2) : '-',
                coef,
                weighted: (subjectAverage * coef).toFixed(2),
                teacherName,
                isSubmitted,
                category: subj.category || 'LITTERAIRE',
                orderIndex: subj.orderIndex || 0
            });
        }

        const generalAverageComputed = totalCoefficients > 0 ? (totalWeightedPoints / totalCoefficients) : 0;

        return {
            details,
            generalAverage: generalAverageComputed.toFixed(2),
            totalCoefficients,
            rank: studentRanks[studentId] || '?',
            trim1Stats: historicalStats["1er Trimestre"]?.[studentId] || null,
            trim2Stats: historicalStats["2ème Trimestre"]?.[studentId] || null,
            trim3Stats: historicalStats["3ème Trimestre"]?.[studentId] || null
        };
    };

    const generatePDF = (student: any) => {
        const statsArr = calculateStudentStats(student.id);
        if (!statsArr) return;

        const isEtablissement = !isEcole;
        const headers = isEtablissement
            ? ['MATIÈRES', 'MOY. DEV', 'EXAMEN', 'MOY. TRIM', 'COEF', 'POINTS', 'APPRÉCIATION', 'ENSEIGNANT']
            : ['MATIÈRES', 'NOTE COMPO', 'APPRÉCIATION'];

        const data = statsArr.details.map(d => {
            const mention = getGradeMention(Number(d.average), 20)?.label || '-';
            return isEtablissement
                ? [d.subjectName, d.devAvg, d.examNote, d.average, d.coef, d.weighted, mention, d.teacherName]
                : [d.subjectName, d.average, mention];
        });

        const totalPoints = statsArr.details.reduce((acc, d) => acc + Number(d.weighted), 0).toFixed(2);
        data.push(['TOTAL GÉNÉRAL', '', '', '', statsArr.totalCoefficients, totalPoints, '', '']);

        const title = `BULLETIN DE NOTES - ${trimester.toUpperCase()}`;
        const filename = `Bulletin_${student.lastName}_${student.firstName}_${trimester.replace(' ', '_')}`;
        const docTitle = `RÉPUBLIQUE DU TCHAD\nUNITE - TRAVAIL - PROGRES\n---\n${user?.institution?.name || 'ETABLISSEMENT'}\n\n${title}\nAnscolaire: ${academicYear}\n\nID ÉLÈVE: ${student.lastName} ${student.firstName}\nClasse: ${selectedClass.name}`;

        exportToPDF(headers, data, docTitle, filename);
    };

    const getGradeMention = (value: number, max: number) => {
        if (isNaN(value)) return null;
        const score = (value / max) * 20;
        
        if (score >= 18) return { label: 'Excellent', color: 'bg-emerald-600' };
        if (score >= 16) return { label: 'Très Bien', color: 'bg-blue-600' };
        if (score >= 14) return { label: 'Bien', color: 'bg-indigo-600' };
        if (score >= 12) return { label: 'Assez Bien', color: 'bg-amber-600' };
        if (score >= 10) return { label: 'Passable', color: 'bg-slate-500' };
        if (score >= 8) return { label: 'Insuffisant', color: 'bg-orange-500' };
        return { label: 'Médiocre', color: 'bg-red-600' };
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16     animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Gestion des Bulletins</h2>
                    <p className="text-slate-500 font-medium italic">Génération et impression des bulletins de notes trimestriels.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white    px-4 py-2 shadow-sm">
                        <Users size={18} className="text-slate-400" />
                        <select
                            className="bg-transparent border-none outline-none font-black text-slate-700 text-sm"
                            value={selectedClass?.id || ''}
                            onChange={(e) => {
                                const cls = classes.find(c => String(c.id) === e.target.value);
                                if (cls) handleClassChange(cls);
                            }}
                        >
                            {!selectedClass && <option value="">Choisir une classe</option>}
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        className="bg-white    px-4 py-2 font-black text-slate-700 text-sm outline-none shadow-sm"
                        value={trimester}
                        onChange={(e) => setTrimester(e.target.value)}
                    >
                        <option value="1er Trimestre">1er Trimestre</option>
                        <option value="2ème Trimestre">2ème Trimestre</option>
                        <option value="3ème Trimestre">3ème Trimestre</option>
                    </select>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadReportData}
                            disabled={!selectedClass || isGenerating}
                            className="bg-blue-600 text-white px-6 py-2  font-black flex items-center gap-3 shadow-xl shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            {isGenerating ? <div className="w-4 h-4     animate-spin"></div> : <Search size={18} />}
                            Calculer
                        </button>

                        <button
                            onClick={() => {
                                const allData = students.map(st => ({ 
                                    student: st, 
                                    stats: calculateStudentStats(st.id) 
                                }))
                                .sort((a, b) => {
                                    const avgA = Number(a.stats?.generalAverage || 0);
                                    const avgB = Number(b.stats?.generalAverage || 0);
                                    if (avgB !== avgA) return avgB - avgA;
                                    return (a.student.lastName || '').localeCompare(b.student.lastName || '') || (a.student.firstName || '').localeCompare(b.student.firstName || '');
                                });
                                
                                setPreviewData(allData);
                                setIsPreviewOpen(true);
                            }}
                            disabled={!selectedClass || students.length === 0}
                            className="bg-emerald-600 text-white px-6 py-2  font-black flex items-center gap-3 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700"
                        >
                            <Printer size={18} /> Tout Imprimer
                        </button>
                    </div>
                </div>
            </div>

            {selectedClass ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 bg-white ] shadow-2xl   overflow-hidden">
                        <div className="p-8   bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <GraduationCap className="text-blue-600" />
                                Liste des élèves - {selectedClass.name}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Élève</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Moyenne</th>
                                        <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center">Rang</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.map((student) => {
                                        const stats = calculateStudentStats(student.id);
                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-100  flex items-center justify-center font-black text-slate-400 text-xs">
                                                            {student.lastName[0]}{student.firstName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{student.lastName} {student.firstName}</p>
                                                            <p className="text-[10px] font-bold text-slate-400">ID: {student.studentIdNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`text-sm font-black ${Number(stats?.generalAverage) >= 10 ? 'text-blue-600' : 'text-rose-500'}`}>
                                                        {stats?.generalAverage || '--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-xs font-black text-slate-700">{stats?.rank || '?'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setPreviewData([{ student, stats }]);
                                                            setIsPreviewOpen(true);
                                                        }}
                                                        className="p-3 hover:bg-slate-100  text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <Eye size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => generatePDF(student)}
                                                        className="p-3 hover:bg-slate-100  text-slate-400 hover:text-emerald-600 transition-all"
                                                    >
                                                        <FileText size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        {isEcole && (
                            <div className="bg-white ] p-6 shadow-xl   italic">
                                <button 
                                    onClick={() => setShowOrderModal(true)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50    hover:bg-slate-100 transition-all font-black text-[10px] uppercase tracking-widest text-slate-600"
                                >
                                    <span className="flex items-center gap-3">
                                        <TrendingUp size={18} className="text-blue-500" />
                                        Ordonner les matières
                                    </span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        <div className="bg-white ] p-6 shadow-xl  ">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-blue-500" />
                                Suivi des Matières
                            </h4>
                            <div className="space-y-4">
                                {[...submissionStatus]
                                    .sort((a,b) => (a.subject.orderIndex || 0) - (b.subject.orderIndex || 0))
                                    .map((s) => (
                                        <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50   ">
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-black text-slate-700 truncate">{s.subject.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400">Index: {s.subject.orderIndex || 0}</p>
                                            </div>
                                            <div className="w-6 h-6  bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                         <div className="bg-blue-600 ] p-6 shadow-2xl shadow-blue-600/20 text-white">
                              <h4 className="text-xs font-black uppercase tracking-widest mb-3 opacity-60">Info {isEcole ? 'Direction' : 'PP'}</h4>
                              <p className="text-xs opacity-90 italic">
                                {isEcole 
                                    ? "Générez les bulletins dès que vous avez terminé de saisir toutes vos notes via l'onglet Grades."
                                    : "Générez les bulletins dès que tous les enseignants ont transmis leurs notes via l'onglet Grades."
                                }
                              </p>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-[400px] bg-slate-50 ]    flex flex-col items-center justify-center text-center p-12">
                    <Printer size={64} className="text-slate-300 mb-6" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">Aucune classe sélectionnée</h3>
                    <p className="text-slate-500 max-w-sm">Choisissez une classe pour commencer la gestion.</p>
                </div>
            )}

            {isPreviewOpen && (
                <ReportCardPreview 
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    data={previewData}
                    selectedClass={selectedClass}
                    trimester={trimester}
                    academicYear={academicYear}
                    institution={fullInstitution || (previewData.length === 1 ? previewData[0].student.institution : (selectedClass?.institution || user?.institution))}
                    isEcole={isEcole}
                />
            )}

            {showOrderModal && (
                <SubjectOrderModal 
                    subjects={classSubjects} 
                    onClose={() => setShowOrderModal(false)}
                    onUpdate={() => {
                        loadReportData();
                        setShowOrderModal(false);
                    }}
                />
            )}

            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{y:50}} animate={{y:0}} exit={{y:50}} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4  shadow-2xl">
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SubjectOrderModal = ({ subjects, onClose, onUpdate }: { subjects: any[], onClose: () => void, onUpdate: () => void }) => {
    const [localSubjects, setLocalSubjects] = React.useState([...subjects].sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all(localSubjects.map(s => api.put(`/subjects/${s.id}`, s)));
            onUpdate();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white ] w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-8   flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Ordre des Matières</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Définissez l'ordre numérique</p>
                    </div>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                    {localSubjects.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-4 p-4 bg-slate-50   ">
                             <div className="w-8 h-8 bg-blue-100 text-blue-600  flex items-center justify-center font-black text-xs">{idx + 1}</div>
                             <p className="flex-1 text-sm font-black text-slate-700">{s.name}</p>
                             <input 
                                type="number" 
                                className="w-16 p-2    text-center font-black"
                                value={s.orderIndex || 0}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setLocalSubjects(prev => prev.map(item => item.id === s.id ? {...item, orderIndex: val} : item));
                                }}
                             />
                        </div>
                    ))}
                </div>
                <div className="p-8 bg-slate-50 flex gap-4">
                    <button onClick={onClose} className="flex-1 font-black text-xs uppercase tracking-widest text-slate-400">Annuler</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-slate-900 text-white py-4  font-black text-xs uppercase tracking-widest shadow-xl">
                        {isSaving ? "Chargement..." : "Enregistrer"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportCards;
