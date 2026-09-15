import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    Users,
    TrendingUp,
    Search,
    Filter,
    ShieldAlert,
    Check,
    X,
    Loader2,
    Calendar,
    Award,
    Sparkles,
    ChevronRight,
    HelpCircle,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const AcademicYearClosurePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClasse, setSelectedClasse] = useState('ALL');
    const [selectedDecision, setSelectedDecision] = useState('ALL');

    // Administrative Overrides state
    // studentStatusOverrides: studentId -> "PASSED" | "FAILED" | "GRADUATED" | "AUTOMATIC"
    const [statusOverrides, setStatusOverrides] = useState<Record<number, string>>({});
    // studentTargetClassOverrides: studentId -> targetClasseId
    const [targetClassOverrides, setTargetClassOverrides] = useState<Record<number, number>>({});

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchPreview();
        }
    }, [id]);

    const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/academic-years/${id}/promotion-preview`);
            setPreviewData(res.data);

            // Initialize target class overrides from server recommendations
            if (res.data?.items) {
                const initialClasses: Record<number, number> = {};
                res.data.items.forEach((item: any) => {
                    if (item.targetClasseId) {
                        initialClasses[item.studentId] = item.targetClasseId;
                    }
                });
                setTargetClassOverrides(initialClasses);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors du chargement des données de prévisualisation de clôture.");
        } finally {
            setLoading(false);
        }
    };

    const passingGrade = previewData?.passingGrade ?? (previewData?.institutionType === 'ECOLE' ? 5.0 : 10.0);
    const isBase10 = previewData?.institutionType === 'ECOLE' || passingGrade <= 5.0;
    const maxGradeStr = isBase10 ? '/ 10' : '/ 20';
    const closeThreshold = isBase10 ? passingGrade - 0.5 : passingGrade - 1.0;


    // Available classes for filtering
    const availableClasses = useMemo(() => {
        if (!previewData?.items) return [];
        const set = new Set<string>();
        previewData.items.forEach((item: any) => {
            if (item.currentClasseName) set.add(item.currentClasseName);
        });
        return Array.from(set).sort();
    }, [previewData]);

    // Computed Stats with Overrides
    const stats = useMemo(() => {
        if (!previewData?.items) return { total: 0, passed: 0, failed: 0, graduated: 0, closeCandidates: 0 };
        let passed = 0;
        let failed = 0;
        let graduated = 0;
        let closeCandidates = 0;

        previewData.items.forEach((item: any) => {
            const overrideStatus = statusOverrides[item.studentId];
            const effectiveStatus = overrideStatus && overrideStatus !== 'AUTOMATIC' ? overrideStatus : item.status;
            const avg = item.finalAverage || 0;

            if (avg < passingGrade && avg >= closeThreshold) {
                closeCandidates++;
            }

            if (effectiveStatus === 'PASSED') passed++;
            else if (effectiveStatus === 'FAILED') failed++;
            else if (effectiveStatus === 'GRADUATED') graduated++;
        });

        return {
            total: previewData.items.length,
            passed,
            failed,
            graduated,
            closeCandidates
        };
    }, [previewData, statusOverrides, passingGrade, closeThreshold]);

    // Filtered Items
    const filteredItems = useMemo(() => {
        if (!previewData?.items) return [];
        return previewData.items.filter((item: any) => {
            const matchesSearch = !searchTerm ||
                (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (item.studentIdNumber && item.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesClasse = selectedClasse === 'ALL' || item.currentClasseName === selectedClasse;

            const overrideStatus = statusOverrides[item.studentId];
            const effectiveStatus = overrideStatus && overrideStatus !== 'AUTOMATIC' ? overrideStatus : item.status;
            const avg = item.finalAverage || 0;

            let matchesDecision = true;
            if (selectedDecision === 'CLOSE_AVERAGE') {
                matchesDecision = avg < passingGrade && avg >= closeThreshold;
            } else if (selectedDecision === 'OVERRIDDEN') {
                matchesDecision = Boolean(overrideStatus && overrideStatus !== 'AUTOMATIC');
            } else if (selectedDecision !== 'ALL') {
                matchesDecision = effectiveStatus === selectedDecision;
            }

            return matchesSearch && matchesClasse && matchesDecision;
        });
    }, [previewData, searchTerm, selectedClasse, selectedDecision, statusOverrides, passingGrade, closeThreshold]);

    const handleStatusOverride = (studentId: number, newStatus: string) => {
        setStatusOverrides(prev => ({
            ...prev,
            [studentId]: newStatus
        }));
    };

    const handleTargetClassOverride = (studentId: number, targetId: number) => {
        setTargetClassOverrides(prev => ({
            ...prev,
            [studentId]: targetId
        }));
    };

    const executeFinalClose = async () => {
        if (!id) return;
        setActionLoading(true);
        setError(null);

        // Prepare request body
        const studentStatusOverridesMap: Record<number, string> = {};
        Object.entries(statusOverrides).forEach(([stId, statusVal]) => {
            if (statusVal && statusVal !== 'AUTOMATIC') {
                studentStatusOverridesMap[Number(stId)] = statusVal;
            }
        });

        const payload = {
            studentTargetClassOverrides: targetClassOverrides,
            studentStatusOverrides: studentStatusOverridesMap
        };

        try {
            await api.post(`/academic-years/${id}/close`, payload);
            setSuccessMessage("L'année scolaire a été clôturée avec succès et les promotions ont été exécutées.");
            setShowConfirmModal(false);
            setTimeout(() => {
                navigate(getRolePath());
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la clôture de l'année scolaire.");
            setShowConfirmModal(false);
        } finally {
            setActionLoading(false);
        }
    };

    const getRolePath = () => {
        const role = user?.role?.toLowerCase();
        if (role === 'pdg') return '/dashboard/pdg/academic-years';
        if (role === 'secretariat') return '/dashboard/secretariat/academic-years';
        return '/dashboard/direction/academic-years';
    };

    return (
        <div className="p-2 sm:p-6 md:p-4 w-full max-w-full min-h-screen space-y-8 animate-in fade-in duration-300">
            {/* Top Navigation */}
            <div className="flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate(getRolePath())}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                    <ArrowLeft size={16} />
                    <span>Retour aux Années Scolaires</span>
                </button>

                {!loading && previewData && (
                    previewData.isClosed ? (
                        <div className="bg-slate-800 text-slate-300 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm border border-slate-700">
                            <Lock size={16} className="text-amber-400" />
                            <span>Année Clôturée & Archivée (Mode Lecture Seule)</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={actionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs md:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            <span>Clôturer Définitivement & Valider les Promotions</span>
                        </button>
                    )
                )}

            </div>

            {/* Header Title Banner */}
            <div className="bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/80 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-8 rounded-3xl text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                            Clôture de l'Année Scolaire {previewData?.academicYearName || ''}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mt-2 max-w-4xl">
                            Passez en revue les décisions de passage, effectuez les repêchages manuels pour les élèves proches de la moyenne, puis validez la transition vers l'année scolaire suivante.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white dark:bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
                        <Calendar size={28} className="text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <p className="text-[10px] uppercase font-extrabold text-indigo-600 dark:text-indigo-300 tracking-wider">Année Prochaine</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{previewData?.nextAcademicYearName || '2026-2027'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)}><X size={18} /></button>
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-3">
                    <CheckCircle2 size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Analyse des moyennes et calcul des orientations en cours...</p>
                </div>
            ) : (
                <>
                    {/* KPI Statistics Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Élèves</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Admis (Pas de dérogation)</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.passed}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">À Repêcher (Proches)</p>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.closeCandidates}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Diplômés (Fin de Cycle)</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.graduated}</h3>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Redoublants</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.failed}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Toolbar */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-72">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou matricule..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Filter size={14} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Classe :</span>
                                <select
                                    value={selectedClasse}
                                    onChange={(e) => setSelectedClasse(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="ALL" className="dark:bg-slate-900">Toutes les classes</option>
                                    {availableClasses.map(cls => (
                                        <option key={cls} value={cls} className="dark:bg-slate-900">{cls}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Décision :</span>
                                <select
                                    value={selectedDecision}
                                    onChange={(e) => setSelectedDecision(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="ALL" className="dark:bg-slate-900">Tous les statuts</option>
                                    <option value="CLOSE_AVERAGE" className="dark:bg-slate-900">À Repêcher (Moyenne proche)</option>
                                    <option value="PASSED" className="dark:bg-slate-900">Admis</option>
                                    <option value="FAILED" className="dark:bg-slate-900">Redoublants</option>
                                    <option value="GRADUATED" className="dark:bg-slate-900">Diplômés</option>
                                    <option value="OVERRIDDEN" className="dark:bg-slate-900">Dérogations Manuelles</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Main Interactive Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Liste des Élèves & Décisions de Promotion</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Ajustez la décision administrative et la classe d'affectation pour chaque élève</p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                {filteredItems.length} élève(s) affiché(s)
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1100px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/70 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <th className="p-4">Élève</th>
                                        <th className="p-4">Classe Actuelle</th>
                                        <th className="p-4">Moyenne Générale</th>
                                        <th className="p-4">Détails Orientation (Sci vs Litt)</th>
                                        <th className="p-4">Décision Système</th>
                                        <th className="p-4">Décision Administrative (Repêchage)</th>
                                        <th className="p-4">Classe Cible (Année Suivante)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map((item: any) => {
                                        const avg = item.finalAverage || 0;
                                        const isClose = avg < passingGrade && avg >= closeThreshold;
                                        const overrideVal = statusOverrides[item.studentId] || 'AUTOMATIC';
                                        const effectiveStatus = overrideVal !== 'AUTOMATIC' ? overrideVal : item.status;
                                        const currentTargetId = targetClassOverrides[item.studentId] || item.targetClasseId;

                                        return (
                                            <tr
                                                key={item.studentId}
                                                className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${overrideVal !== 'AUTOMATIC' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                                                    }`}
                                            >
                                                {/* Student Identity */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center justify-center">
                                                            {item.studentName ? item.studentName.charAt(0).toUpperCase() : 'E'}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.studentName}</p>
                                                            <p className="text-[10px] font-semibold text-slate-400">{item.studentIdNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Current Class */}
                                                <td className="p-4 font-bold text-xs text-slate-700 dark:text-slate-300">
                                                    {item.currentClasseName}
                                                </td>

                                                {/* Annual Average */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${avg >= passingGrade
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                            : isClose
                                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                                                : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                                                            }`}>
                                                            {avg.toFixed(2)} {isBase10 ? '/ 10' : '/ 20'}
                                                        </span>
                                                        {isClose && (
                                                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md">
                                                                Proche !
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Orientation / Category Averages */}
                                                <td className="p-4">
                                                    {item.scientificAverage !== undefined && item.literaryAverage !== undefined ? (
                                                        <div className="space-y-1 text-[11px]">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-slate-500 font-semibold">Moy. Sci. :</span>
                                                                <span className="font-bold text-blue-600 dark:text-blue-400">{item.scientificAverage}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-slate-500 font-semibold">Moy. Litt. :</span>
                                                                <span className="font-bold text-purple-600 dark:text-purple-400">{item.literaryAverage}</span>
                                                            </div>
                                                            {item.suggestedOrientation && (
                                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                                                    Rec. : {item.suggestedOrientation}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-xs font-semibold">—</span>
                                                    )}
                                                </td>

                                                {/* System Status */}
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold ${item.status === 'PASSED'
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                                        : item.status === 'GRADUATED'
                                                            ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                                                            : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {item.status === 'PASSED' ? 'ADMIS' : item.status === 'GRADUATED' ? 'DIPLÔMÉ' : 'REDOUBLANT'}
                                                    </span>
                                                </td>

                                                {/* Administrative Repêchage Override */}
                                                <td className="p-4">
                                                    <select
                                                        value={overrideVal}
                                                        disabled={previewData?.isClosed}
                                                        onChange={(e) => handleStatusOverride(item.studentId, e.target.value)}
                                                        className={`p-2 rounded-xl text-xs font-bold outline-none border ${previewData?.isClosed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'} ${overrideVal !== 'AUTOMATIC'
                                                            ? 'bg-amber-500 text-white border-amber-600'
                                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700'
                                                            }`}
                                                    >
                                                        <option value="AUTOMATIC" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                                                            Automatique (Selon moyenne)
                                                        </option>
                                                        <option value="PASSED" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold">
                                                            ✓ Repêcher / Passer (ADMIS)
                                                        </option>
                                                        <option value="FAILED" className="bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-bold">
                                                            ✗ Forcer Redoublement
                                                        </option>
                                                        <option value="GRADUATED" className="bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 font-bold">
                                                            🎓 Forcer Diplômé (Fin de cycle)
                                                        </option>
                                                    </select>
                                                </td>

                                                {/* Target Class Selection */}
                                                <td className="p-4">
                                                    {effectiveStatus === 'GRADUATED' ? (
                                                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl inline-block">
                                                            🎓 Diplômé de l'école
                                                        </span>
                                                    ) : (
                                                        <select
                                                            value={currentTargetId || ''}
                                                            disabled={previewData?.isClosed}
                                                            onChange={(e) => handleTargetClassOverride(item.studentId, Number(e.target.value))}
                                                            className={`p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none w-full max-w-[350px] ${previewData?.isClosed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                        >

                                                            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">
                                                                -- Sélectionner la classe --
                                                            </option>
                                                            {item.availableTargetClasses?.map((tc: any) => (
                                                                <option key={tc.id} value={tc.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                                                                    {tc.name} {tc.degreeName ? `(${tc.degreeName})` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center text-slate-400 font-bold text-xs">
                                                Aucun élève ne correspond aux critères de recherche actuels.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Final Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 text-left"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                                    <ShieldAlert size={28} />
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        Confirmation Finale de Clôture
                                    </h3>
                                </div>
                                <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                Vous êtes sur le point de clôturer définitivement l'année scolaire <strong>{previewData?.academicYearName}</strong>.
                                Les décisions de passage (y compris les repêchages manuels et affectations de classes) seront appliquées et la nouvelle année <strong>{previewData?.nextAcademicYearName}</strong> recevra les inscriptions correspondantes.
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-6">
                                <div className="flex justify-between">
                                    <span>Total Élèves Evalués :</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Admis (avec repêchages) :</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.passed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Redoublants :</span>
                                    <span className="font-bold text-red-500 dark:text-red-400">{stats.failed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Diplômés du Cycle :</span>
                                    <span className="font-bold text-purple-600 dark:text-purple-400">{stats.graduated}</span>
                                </div>
                                {Object.keys(statusOverrides).length > 0 && (
                                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold">
                                        <span>Dérogations Manuelles Appliquées :</span>
                                        <span>{Object.keys(statusOverrides).length}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={actionLoading}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={executeFinalClose}
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    <span>Confirmer la Clôture Finale</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AcademicYearClosurePage;
