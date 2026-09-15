import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Calendar, CheckCircle2, Lock, Plus, AlertCircle, Loader2, Award, UserCheck, UserX, ArrowRight, ShieldCheck, RefreshCw, Search, Filter, X, ChevronDown, ChevronRight, GraduationCap, History, Edit3, Eye } from 'lucide-react';


const AcademicYears: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newYearForm, setNewYearForm] = useState({ name: '', startDate: '', endDate: '' });

    // State for editing academic year
    const [showEditModal, setShowEditModal] = useState(false);
    const [editYearForm, setEditYearForm] = useState<{ id: number | null, name: string, startDate: string, endDate: string, isCurrent?: boolean, isClosed?: boolean }>({
        id: null,
        name: '',
        startDate: '',
        endDate: ''
    });

    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'ACTIVATE' | 'CLOSE', id: number, message: string } | null>(null);

    // Promotion preview state & filter states
    const [promotionPreview, setPromotionPreview] = useState<any | null>(null);
    const [showPromotionModal, setShowPromotionModal] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedYearToClose, setSelectedYearToClose] = useState<number | null>(null);
    const [studentTargetClassOverrides, setStudentTargetClassOverrides] = useState<Record<number, number>>({});

    // Filters for promotion preview modal
    const [filterClasse, setFilterClasse] = useState<string>('ALL');
    const [filterDecision, setFilterDecision] = useState<string>('ALL');
    const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState<string>('ALL');
    const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');

    // Expanded student career timeline state
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

    const activeInstitutionId = user?.institution?.id || selectedInstitutionId;

    const handleEditOpen = (year: any) => {
        setEditYearForm({
            id: year.id,
            name: year.name || '',
            startDate: year.startDate || '',
            endDate: year.endDate || '',
            isCurrent: year.isActive || year.isCurrent || year.current,
            isClosed: year.isClosed
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editYearForm.id) return;
        setError(null);
        setActionLoading(editYearForm.id);
        try {
            await api.put(`/academic-years/${editYearForm.id}`, {
                name: editYearForm.name,
                startDate: editYearForm.startDate,
                endDate: editYearForm.endDate,
                isCurrent: editYearForm.isCurrent,
                isClosed: editYearForm.isClosed
            });
            setShowEditModal(false);
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la modification de l\'année scolaire.');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (user?.role === 'PDG' && user?.id) {
            api.get(`/institutions/ceo/${user.id}`).then(res => {
                const list = res.data || [];
                setInstitutions(list);
                if (list.length > 0 && !selectedInstitutionId) {
                    setSelectedInstitutionId(list[0].id);
                }
            }).catch(console.error);
        } else if (user?.institution?.id) {
            setSelectedInstitutionId(user.institution.id);
        }
    }, [user]);

    const fetchYears = async () => {
        if (!activeInstitutionId) return;
        setLoading(true);
        try {
            const res = await api.get(`/academic-years/institution/${activeInstitutionId}`);
            setYears(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des années scolaires');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeInstitutionId) {
            fetchYears();
        } else {
            setYears([]);
        }
    }, [activeInstitutionId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!activeInstitutionId) {
            setError("Veuillez sélectionner un établissement d'abord.");
            return;
        }
        try {
            await api.post('/academic-years', {
                ...newYearForm,
                institution: { id: activeInstitutionId }
            });
            setShowCreateModal(false);
            setNewYearForm({ name: '', startDate: '', endDate: '' });
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleActivate = (id: number) => {
        setConfirmModal({
            isOpen: true,
            type: 'ACTIVATE',
            id,
            message: "Voulez-vous vraiment activer cette année scolaire ? Les autres années actives seront désactivées."
        });
    };

    const executeActivate = async (id: number) => {
        setActionLoading(id);
        setError(null);
        try {
            await api.post(`/academic-years/${id}/activate`);
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'activation');
        } finally {
            setActionLoading(null);
            setConfirmModal(null);
        }
    };

    const handleOpenCloseModal = (id: number) => {
        let rolePath = 'direction';
        const role = user?.role?.toUpperCase();
        if (role === 'PDG') rolePath = 'pdg';
        else if (role === 'SECRETARIAT') rolePath = 'secretariat';
        else if (role === 'DIRECTION' || role === 'PROVISORIAT') rolePath = 'direction';
        navigate(`/dashboard/${rolePath}/academic-years/${id}/close`);
    };


    const availableClasses = React.useMemo(() => {
        if (!promotionPreview?.items) return [];
        const set = new Set<string>();
        promotionPreview.items.forEach((item: any) => {
            if (item.currentClasseName) set.add(item.currentClasseName);
        });
        return Array.from(set).sort();
    }, [promotionPreview]);

    const filteredItems = React.useMemo(() => {
        if (!promotionPreview?.items) return [];
        return promotionPreview.items.filter((item: any) => {
            const matchesClasse = filterClasse === 'ALL' || item.currentClasseName === filterClasse;
            const matchesDecision = filterDecision === 'ALL' || item.status === filterDecision;

            let matchesEnrollment = true;
            if (filterEnrollmentStatus === 'ENROLLED') {
                matchesEnrollment = item.isEnrolled === true || item.enrollmentStatus === 'ENROLLED';
            } else if (filterEnrollmentStatus === 'NOT_ENROLLED') {
                matchesEnrollment = item.isEnrolled === false || item.enrollmentStatus !== 'ENROLLED';
            }

            const matchesSearch = !searchStudentTerm ||
                (item.studentName && item.studentName.toLowerCase().includes(searchStudentTerm.toLowerCase())) ||
                (item.studentIdNumber && item.studentIdNumber.toLowerCase().includes(searchStudentTerm.toLowerCase()));

            return matchesClasse && matchesDecision && matchesEnrollment && matchesSearch;
        });
    }, [promotionPreview, filterClasse, filterDecision, filterEnrollmentStatus, searchStudentTerm]);

    const executeCloseWithPromotion = async () => {
        if (!selectedYearToClose) return;
        setActionLoading(selectedYearToClose);
        setError(null);
        try {
            await api.post(`/academic-years/${selectedYearToClose}/close`, {
                studentTargetClassOverrides
            });
            setShowPromotionModal(false);
            setPromotionPreview(null);
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la clôture de l\'année scolaire.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="w-full max-w-full space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Années Scolaires & Passage d'Année
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Gérez le calendrier académique, la clôture annuelle et la promotion automatique des élèves.
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (!activeInstitutionId) {
                            setError("Veuillez d'abord sélectionner un établissement pour y créer une année scolaire.");
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto"
                >
                    <Plus size={16} /> Nouvelle Année
                </button>
            </div>

            {!user?.institution?.id && user?.role === 'PDG' && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                    <label className="font-bold text-xs text-slate-700 dark:text-slate-200">Établissement :</label>
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-semibold text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedInstitutionId || ''}
                        onChange={(e) => setSelectedInstitutionId(Number(e.target.value) || null)}
                    >
                        <option value="">-- Sélectionner un établissement --</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-between gap-3 font-semibold text-xs border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="hover:opacity-75"><X size={16} /></button>
                </div>
            )}

            {/* Main Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                                <th className="px-6 py-3.5">Année Scolaire</th>
                                <th className="px-6 py-3.5">Période</th>
                                <th className="px-6 py-3.5 text-center">Statut</th>
                                <th className="px-6 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">
                                        <Loader2 className="animate-spin inline-block mr-2" size={18} /> Chargement...
                                    </td>
                                </tr>
                            ) : years.length > 0 ? (
                                years.map((year: any) => (
                                    <tr key={year.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${(year.isActive || year.current || year.isCurrent) ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : year.isClosed ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}`}>
                                                    {year.isClosed ? <Lock size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{year.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold text-xs">
                                            <span>{year.startDate}</span>
                                            <span className="mx-1.5 text-slate-300 dark:text-slate-600">→</span>
                                            <span>{year.endDate}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {year.isClosed ? (
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                                    <Lock size={12} /> Clôturée
                                                </span>
                                            ) : (year.isActive || year.current || year.isCurrent) ? (
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60">
                                                    En Attente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {year.isClosed ? (
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenCloseModal(year.id)}
                                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-xs transition-all inline-flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                                                        title="Consulter le contenu et le bilan de cette année clôturée"
                                                    >
                                                        <Eye size={14} /> Voir l'année
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOpen(year)}
                                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Edit3 size={13} /> Modifier
                                                    </button>
                                                    {!(year.isActive || year.current || year.isCurrent) && (
                                                        <button
                                                            onClick={() => handleActivate(year.id)}
                                                            disabled={actionLoading === year.id}
                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold rounded-lg text-xs hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                                                        >
                                                            {actionLoading === year.id ? 'Activation...' : 'Activer'}
                                                        </button>
                                                    )}
                                                    {(year.isActive || year.current || year.isCurrent) && (
                                                        <button
                                                            onClick={() => handleOpenCloseModal(year.id)}
                                                            disabled={previewLoading || actionLoading === year.id}
                                                            className="px-3.5 py-1.5 bg-red-600 text-white font-bold rounded-lg text-xs hover:bg-red-700 shadow-md shadow-red-600/20 transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            {previewLoading ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                                                            Clôturer & Basculer
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium italic">Aucune année scolaire trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Modification Année */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Modifier l'Année Scolaire</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Nom de l'année (ex: 2025-2026)</label>
                                <input
                                    type="text"
                                    required
                                    value={editYearForm.name}
                                    onChange={(e) => setEditYearForm({ ...editYearForm, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={editYearForm.startDate}
                                    onChange={(e) => setEditYearForm({ ...editYearForm, startDate: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Date de fin</label>
                                <input
                                    type="date"
                                    required
                                    value={editYearForm.endDate}
                                    onChange={(e) => setEditYearForm({ ...editYearForm, endDate: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" disabled={actionLoading === editYearForm.id} className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                    {actionLoading === editYearForm.id ? <Loader2 size={14} className="animate-spin" /> : null}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Création Année */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Nouvelle Année Scolaire</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Nom (ex: 2024-2025)</label>
                                <input
                                    type="text"
                                    required
                                    value={newYearForm.name}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={newYearForm.startDate}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Date de fin</label>
                                <input
                                    type="date"
                                    required
                                    value={newYearForm.endDate}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Clôture & Passage en Classe Supérieure */}
            {showPromotionModal && promotionPreview && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-[96vw] h-[94vh] max-h-[94vh] rounded-[32px] shadow-2xl p-4 sm:p-6 flex flex-col space-y-3.5">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between shrink-0 pb-1 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Bilan Prévisionnel d'Admission & Passage
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                    Clôture d'Année : {promotionPreview.academicYearName}
                                </h3>
                            </div>
                            <button onClick={() => setShowPromotionModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Compact Summary Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Élèves</p>
                                    <p className="text-base font-black text-slate-800 dark:text-white">{promotionPreview.totalStudents}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold">Enregistrés</span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <UserCheck size={13} />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Admis (Classe Sup.)</p>
                                    </div>
                                    <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{promotionPreview.passedCount}</p>
                                </div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">$\ge$ {promotionPreview.passingGrade}</span>
                            </div>
                            <div className="bg-red-50 dark:bg-red-950/40 px-3.5 py-2 rounded-xl border border-red-200/60 dark:border-red-800 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                        <UserX size={13} />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Redoublants</p>
                                    </div>
                                    <p className="text-base font-black text-red-700 dark:text-red-300">{promotionPreview.failedCount}</p>
                                </div>
                                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">&lt; {promotionPreview.passingGrade}</span>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                        <Award size={13} />
                                        <p className="text-[9px] font-black uppercase tracking-widest">Diplômés (Fin Cursus)</p>
                                    </div>
                                    <p className="text-base font-black text-indigo-700 dark:text-indigo-300">{promotionPreview.graduatedCount}</p>
                                </div>
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Terminale</span>
                            </div>
                        </div>

                        {/* Compact Filter Toolbar */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 shrink-0">
                            <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                    <Filter size={13} /> Filtres d'Analyse
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 font-extrabold">{filteredItems.length} sur {promotionPreview.items?.length || 0} Élèves affichés</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher élève / matricule..."
                                        value={searchStudentTerm}
                                        onChange={(e) => setSearchStudentTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                                    />
                                </div>

                                {/* Filter Classe */}
                                <div>
                                    <select
                                        value={filterClasse}
                                        onChange={(e) => setFilterClasse(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                                    >
                                        <option value="ALL">Toutes les Classes ({availableClasses.length})</option>
                                        {availableClasses.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filter Decision */}
                                <div>
                                    <select
                                        value={filterDecision}
                                        onChange={(e) => setFilterDecision(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                                    >
                                        <option value="ALL">Toutes les Décisions</option>
                                        <option value="PASSED">Admis (Passage Supérieur)</option>
                                        <option value="FAILED">Redoublants</option>
                                        <option value="GRADUATED">Diplômés (Fin de Cursus)</option>
                                    </select>
                                </div>

                                {/* Filter Current Enrollment */}
                                <div>
                                    <select
                                        value={filterEnrollmentStatus}
                                        onChange={(e) => setFilterEnrollmentStatus(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white"
                                    >
                                        <option value="ALL">Inscription Année en Cours (Tous)</option>
                                        <option value="ENROLLED">Élèves Inscrits</option>
                                        <option value="NOT_ENROLLED">Non Inscrits / Attente Frais</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Expansive Student List Table Viewport (Fills remaining height) */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 min-h-0 flex flex-col">
                            <div className="overflow-y-auto h-full flex-1">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold uppercase tracking-wider text-slate-500 z-10">
                                        <tr>
                                            <th className="p-3.5 w-10"></th>
                                            <th className="p-3.5">Élève</th>
                                            <th className="p-3.5">Classe Actuelle</th>
                                            <th className="p-3.5 text-center">Inscription Année en Cours</th>
                                            <th className="p-3.5 text-center">Moyenne Annuelle</th>
                                            <th className="p-3.5 text-center">Décision Conseil</th>
                                            <th className="p-3.5 text-right">Classe Année Suivante</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item: any) => {
                                                const isExpanded = expandedStudentId === item.studentId;
                                                const isGraduated = item.status === 'GRADUATED';
                                                return (
                                                    <React.Fragment key={item.studentId}>
                                                        <tr
                                                            onClick={() => setExpandedStudentId(isExpanded ? null : item.studentId)}
                                                            className={`hover:bg-white dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-100/70 dark:bg-slate-800/60' : ''}`}
                                                        >
                                                            <td className="p-3.5 text-slate-400 text-center">
                                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-slate-800 dark:text-white">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{item.studentName}</span>
                                                                    {isGraduated && (
                                                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-md text-[9px] font-black uppercase inline-flex items-center gap-1">
                                                                            <GraduationCap size={11} /> Diplômé ({item.arrivalYear} → {item.graduationOrDepartureYear})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {item.studentIdNumber && <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{item.studentIdNumber}</span>}
                                                            </td>
                                                            <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-300">{item.currentClasseName}</td>
                                                            <td className="p-3.5 text-center">
                                                                {(item.isEnrolled || item.enrollmentStatus === 'ENROLLED') ? (
                                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg text-[10px] font-extrabold border border-emerald-200/60 dark:border-emerald-800">
                                                                        INSCRIT
                                                                    </span>
                                                                ) : item.enrollmentStatus === 'PENDING_FEE' ? (
                                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg text-[10px] font-extrabold border border-amber-200/60 dark:border-amber-800">
                                                                        ATTENTE FRAIS
                                                                    </span>
                                                                ) : item.enrollmentStatus === 'DROPPED' ? (
                                                                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-lg text-[10px] font-extrabold border border-rose-200/60 dark:border-rose-800">
                                                                        ABANDONNÉ
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-[10px] font-extrabold">
                                                                        NON CONFIRMÉ
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-3.5 text-center font-black text-slate-800 dark:text-white text-sm">
                                                                {item.finalAverage !== null ? `${item.finalAverage}` : 'N/A'}
                                                                {(item.scientificAverage !== null && item.scientificAverage !== undefined) && (
                                                                    <div className="mt-1 text-[9px] font-bold text-slate-500">
                                                                        <span className="text-blue-600 dark:text-blue-400">Sci: {item.scientificAverage}</span> | <span className="text-amber-600 dark:text-amber-400">Lit: {item.literaryAverage}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-3.5 text-center">
                                                                {item.status === 'PASSED' && (
                                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-full font-extrabold text-[10px] tracking-wide inline-flex items-center gap-1">
                                                                        <UserCheck size={12} /> ADMIS
                                                                    </span>
                                                                )}
                                                                {item.status === 'FAILED' && (
                                                                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 rounded-full font-extrabold text-[10px] tracking-wide inline-flex items-center gap-1">
                                                                        <UserX size={12} /> REDOUBLE
                                                                    </span>
                                                                )}
                                                                {item.status === 'GRADUATED' && (
                                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 rounded-full font-extrabold text-[10px] tracking-wide inline-flex items-center gap-1">
                                                                        <Award size={12} /> DIPLÔMÉ
                                                                    </span>
                                                                )}
                                                                {item.suggestedOrientation && (
                                                                    <span className="block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 rounded text-[9px] font-bold">
                                                                        🎯 Orien: {item.suggestedOrientation}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-3.5 text-right font-bold text-slate-700 dark:text-slate-200" onClick={(e) => e.stopPropagation()}>
                                                                {item.status === 'GRADUATED' ? (
                                                                    <span className="inline-flex items-center gap-1.5 justify-end text-xs text-slate-400">
                                                                        <ArrowRight size={12} /> {item.targetClasseName}
                                                                    </span>
                                                                ) : item.availableTargetClasses && item.availableTargetClasses.length > 0 ? (
                                                                    <select
                                                                        value={studentTargetClassOverrides[item.studentId] ?? item.targetClasseId ?? ''}
                                                                        onChange={(e) => {
                                                                            const val = Number(e.target.value);
                                                                            if (val) {
                                                                                setStudentTargetClassOverrides(prev => ({ ...prev, [item.studentId]: val }));
                                                                            }
                                                                        }}
                                                                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                                    >
                                                                        {item.availableTargetClasses.map((cls: any) => (
                                                                            <option key={cls.id} value={cls.id}>
                                                                                {cls.name} {cls.degreeName ? `(${cls.degreeName})` : ''}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 justify-end">
                                                                        <ArrowRight size={12} className="text-slate-400" />
                                                                        {item.targetClasseName}
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>

                                                        {/* Animated School Career Timeline Sub-Row */}
                                                        {isExpanded && (
                                                            <tr className="bg-slate-100/60 dark:bg-slate-800/80">
                                                                <td colSpan={7} className="p-4 border-t border-slate-200/60 dark:border-slate-700">
                                                                    <div className="space-y-3 pl-4 border-l-2 border-indigo-500/40">
                                                                        {/* Diploma Header Badge */}
                                                                        {isGraduated && (
                                                                            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-md">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-2 bg-indigo-500/30 rounded-lg">
                                                                                        <GraduationCap size={20} className="text-indigo-300" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="font-extrabold text-sm tracking-wide uppercase">Diplôme de fin d'études délivré</p>
                                                                                        <p className="text-xs text-indigo-200 font-medium">Cursus accompli au sein de l'établissement</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-700/50">
                                                                                    Arrivée : {item.arrivalYear} → Diplôme : {item.graduationOrDepartureYear}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Animated Timeline Step Nodes */}
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                                                                <History size={14} className="text-indigo-600 dark:text-indigo-400" /> Parcours Scolaire de l'Élève :
                                                                            </div>
                                                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1">
                                                                                {(item.careerHistory && item.careerHistory.length > 0) ? (
                                                                                    item.careerHistory.map((step: any, sIdx: number) => {
                                                                                        const isStepPassed = step.status === 'PASSED' || step.statusLabel === 'Classe franchie';
                                                                                        const isStepFailed = step.status === 'FAILED' || step.statusLabel === 'Redoublé';
                                                                                        const isStepGraduated = step.status === 'GRADUATED' || step.statusLabel === 'Diplômé';
                                                                                        return (
                                                                                            <React.Fragment key={sIdx}>
                                                                                                {sIdx > 0 && <ArrowRight size={14} className="text-slate-400 shrink-0" />}
                                                                                                <div className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all shadow-sm ${isStepGraduated
                                                                                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                                                                                                    : isStepPassed
                                                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                                                                                        : isStepFailed
                                                                                                            ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                                                                                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                                                                                                    }`}>
                                                                                                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isStepGraduated ? 'bg-indigo-600' : isStepPassed ? 'bg-emerald-500' : isStepFailed ? 'bg-red-500' : 'bg-sky-500'
                                                                                                        }`} />
                                                                                                    <div>
                                                                                                        <span className="font-extrabold text-xs block">{step.academicYearName} — {step.classeName}</span>
                                                                                                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-semibold opacity-90">
                                                                                                            {step.finalAverage !== null && <span>Moyenne: {step.finalAverage}/20</span>}
                                                                                                            <span className="font-bold uppercase tracking-wider">({step.statusLabel || step.status})</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </React.Fragment>
                                                                                        );
                                                                                    })
                                                                                ) : (
                                                                                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl text-slate-500 text-xs font-semibold">
                                                                                        Année d'arrivée : {item.arrivalYear} — Classe actuelle : {item.currentClasseName}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-slate-400 font-bold text-sm">
                                                    Aucun élève ne correspond aux critères de recherche / filtrage sélectionnés.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Compact Modal Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="text-xs text-slate-500 font-medium">
                                Un email de bilan sera automatiquement envoyé aux parents des {promotionPreview.totalStudents} élèves lors de la confirmation.
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setShowPromotionModal(false)}
                                    className="w-full sm:w-auto px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={executeCloseWithPromotion}
                                    disabled={actionLoading === selectedYearToClose}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
                                >
                                    {actionLoading === selectedYearToClose ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                                    Valider la Clôture & Passer en {promotionPreview.nextAcademicYearName}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirmation simple (Activation) */}
            {confirmModal && confirmModal.type === 'ACTIVATE' && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">Confirmation</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-6 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2 font-bold text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => executeActivate(confirmModal.id)}
                                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Confirmer l'Activation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicYears;
