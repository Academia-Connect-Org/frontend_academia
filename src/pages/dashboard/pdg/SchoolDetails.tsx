import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    School as SchoolIcon,
    Users,
    Layers,
    Info,
    ArrowLeft,
    Plus,
    Mail,
    Phone,
    MapPin,
    Shield,
    Trash2,
    X,
    UserCircle,
    CheckCircle,
    AlertCircle,
    GraduationCap,
    Crown,
    CreditCard
} from 'lucide-react';
import api, { getFileUrl } from '../../../api/axios';
import Cycles from '../direction/Cycles';
import TuitionFees from '../direction/TuitionFees';
import SchoolSubscription from '../../../components/dashboard/pdg/SchoolSubscription';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../../constants/routes';

const SchoolDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [institution, setInstitution] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'cycles' | 'finance' | 'subscriptions'>('overview');
    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [editingStaff, setEditingStaff] = useState<any | null>(null);
    const [showDeleteStaffModal, setShowDeleteStaffModal] = useState<{ isOpen: boolean, staffId: number | null }>({ isOpen: false, staffId: null });

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const [staffForm, setStaffForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'DIRECTION',
        phone: ''
    });
    const [staffError, setStaffError] = useState<string | null>(null);

    useEffect(() => {
        if (editingStaff) {
            setStaffForm({
                firstName: editingStaff.firstName,
                lastName: editingStaff.lastName,
                email: editingStaff.email,
                password: '',
                role: editingStaff.role,
                phone: editingStaff.phone || ''
            });
            setShowAddStaffModal(true);
        } else {
            setStaffForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: institution?.type === 'ECOLE' ? 'DIRECTION' : 'PROVISORIAT',
                phone: ''
            });
        }
    }, [editingStaff, institution?.type]);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [instRes, staffRes, statsRes] = await Promise.all([
                api.get(`/institutions/${id}`),
                api.get(`/institutions/${id}/staff`),
                api.get(`/institutions/${id}/stats`).catch(() => ({ data: null }))
            ]);
            setInstitution(instRes.data);
            setStaff(staffRes.data || []);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffError(null);
        try {
            if (editingStaff) {
                await api.put(`/institutions/${id}/staff/${editingStaff.id}`, staffForm);
                setFeedback({ type: 'success', message: 'Responsable mis à jour avec succès' });
            } else {
                await api.post(`/institutions/${id}/staff`, staffForm);
                setFeedback({ type: 'success', message: 'Responsable ajouté avec succès' });
            }
            setShowAddStaffModal(false);
            setEditingStaff(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            const msg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || "Erreur lors de l'opération";
            setStaffError(msg);
        }
    };

    const handleDeleteStaff = async (staffId: number) => {
        try {
            await api.delete(`/institutions/${id}/staff/${staffId}`);
            setFeedback({ type: 'success', message: 'Responsable supprimé avec succès' });
            fetchData();
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', message: 'Erreur lors de la suppression du responsable' });
        } finally {
            setShowDeleteStaffModal({ isOpen: false, staffId: null });
        }
    };

    const handleDeleteInstitution = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/institutions/${id}`);
            navigate(ROUTES.DASHBOARD.PDG.SCHOOLS);
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: "Erreur lors de la suppression de l'établissement."
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Chargement de l'établissement...</p>
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-8">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Établissement non trouvé.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-2 mx-auto">
                    <ArrowLeft size={16} /> Retour
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Profile Card */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs transition-colors"
                >
                    <ArrowLeft size={16} /> Retour à la liste
                </button>

                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                        {institution.logoUrl ? (
                            <img src={getFileUrl(institution.logoUrl)} alt={institution.name} className="w-full h-full object-cover" />
                        ) : (
                            <SchoolIcon size={40} className="text-slate-400 dark:text-slate-600" />
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{institution.name}</h2>
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider self-center md:self-auto">
                                {institution.type}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>{institution.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>UAI: {institution.uaiNumber || 'Non défini'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all font-bold text-xs flex items-center gap-2"
                            title="Supprimer l'établissement"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Supprimer</span>
                        </button>
                        <div className={`px-4 py-2 rounded-xl font-bold text-xs ${institution.active ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                            {institution.active ? 'Actif' : 'Inactif'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800">
                {[
                    { id: 'overview', label: 'Aperçu', icon: Info },
                    { id: 'staff', label: 'Responsables', icon: Users },
                    { id: 'cycles', label: 'Gestion Cycles', icon: Layers },
                    { id: 'finance', label: 'Frais & Paiements', icon: CreditCard },
                    { id: 'subscriptions', label: 'Abonnement', icon: Crown }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Informations de Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{institution.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{institution.phone || 'Non défini'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Statistiques Rapides</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.studentCount ?? 0}</span>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Élèves</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.teacherCount ?? 0}</span>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Enseignants</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.classCount ?? 0}</span>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Classes</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-center">
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats?.staffCount ?? 0}</span>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Admin / Staff</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'staff' && (
                    <motion.div
                        key="staff"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Responsables & Effectifs</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Gestion du personnel administratif et accès aux effectifs.</p>
                            </div>
                            <button
                                onClick={() => setShowAddStaffModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all whitespace-nowrap"
                            >
                                <Plus size={16} /> Ajouter un responsable
                            </button>
                        </div>

                        {/* Administrative Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {(() => {
                                const mainAdmin = staff.find(s => s.role === 'DIRECTION' || s.role === 'PROVISORIAT');
                                const roleLabel = institution.type === 'ECOLE' ? 'Directeur / Direction' : 'Proviseur / Provisoriat';
                                if (mainAdmin) {
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                                                    <Shield size={28} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditingStaff(mainAdmin)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Info size={16} /></button>
                                                    <button onClick={() => setShowDeleteStaffModal({ isOpen: true, staffId: mainAdmin.id })} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{roleLabel}</p>
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{mainAdmin.firstName} {mainAdmin.lastName}</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                                    <Mail size={14} className="text-blue-600 dark:text-blue-400 shrink-0" /> {mainAdmin.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                                    <Phone size={14} className="text-blue-600 dark:text-blue-400 shrink-0" /> {institution.phone || 'Non renseigné'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                        <Shield size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Aucun {roleLabel} défini</p>
                                    </div>
                                );
                            })()}

                            {(() => {
                                const secretary = staff.find(s => s.role === 'SECRETARIAT');
                                if (secretary) {
                                    return (
                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                                                    <UserCircle size={28} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditingStaff(secretary)} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Info size={16} /></button>
                                                    <button onClick={() => setShowDeleteStaffModal({ isOpen: true, staffId: secretary.id })} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Secrétariat</p>
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{secretary.firstName} {secretary.lastName}</h4>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                                    <Mail size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> {secretary.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                                    <Phone size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> {institution.phone || 'Non renseigné'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                        <UserCircle size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Aucun Secrétariat défini</p>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Navigation Links */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.TEACHERS}?institutionId=${id}`)}
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 text-left hover:border-blue-500/50 transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Corps Enseignant</h4>
                                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">{stats?.teacherCount || 0}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Consultez la liste et les spécialités des enseignants.</p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.STUDENTS}?institutionId=${id}`)}
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 text-left hover:border-emerald-500/50 transition-all"
                            >
                                <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Effectif Élèves</h4>
                                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">{stats?.studentCount || 0}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Accédez aux dossiers et aux effectifs par classes.</p>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cycles' && (
                    <motion.div
                        key="cycles"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <Cycles institutionId={Number(id)} hideLayout />
                    </motion.div>
                )}

                {activeTab === 'finance' && (
                    <motion.div
                        key="finance"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <TuitionFees institutionId={Number(id)} hideLayout />
                    </motion.div>
                )}

                {activeTab === 'subscriptions' && (
                    <motion.div
                        key="subscriptions"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        <SchoolSubscription 
                            institution={institution} 
                            onRefresh={fetchData} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/50 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl relative"
                    >
                        <button onClick={() => { setShowAddStaffModal(false); setEditingStaff(null); setStaffError(null); }} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={18} />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {editingStaff ? 'Modifier le Responsable' : 'Nouveau Responsable'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            {editingStaff ? 'Mettez à jour les informations du compte.' : 'Créez un compte pour un membre de la direction.'}
                        </p>

                        {staffError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                                <Info size={16} />
                                {staffError}
                            </div>
                        )}

                        <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Prénom</label>
                                    <input
                                        required
                                        type="text"
                                        value={staffForm.firstName}
                                        onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                                    <input
                                        required
                                        type="text"
                                        value={staffForm.lastName}
                                        onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">Email de connexion</label>
                                <input
                                    required
                                    type="email"
                                    value={staffForm.email}
                                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">
                                    {editingStaff ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe provisoire'}
                                </label>
                                <input
                                    required={!editingStaff}
                                    type="password"
                                    value={staffForm.password}
                                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">Rôle Académique</label>
                                <select
                                    value={staffForm.role}
                                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                                >
                                    {institution.type === 'ECOLE' ? (
                                        <>
                                            <option value="DIRECTION">Direction (Jardin/Primaire)</option>
                                            <option value="SECRETARIAT">Secrétariat (École)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="PROVISORIAT">Provisoriat (Collège/Lycée)</option>
                                            <option value="SECRETARIAT">Secrétariat (Établissement)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md transition-all mt-4 text-xs"
                            >
                                {editingStaff ? 'Sauvegarder les modifications' : 'Créer le compte'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/50 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center"
                    >
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Supprimer l'établissement ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Cette action est irréversible. Toutes les données associées seront supprimées.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteInstitution}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Confirmer"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Staff Confirmation Modal */}
            {showDeleteStaffModal.isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/50 animate-in fade-in duration-200">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center"
                    >
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Supprimer ce responsable ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                            Cette action révoquera l'accès de cet utilisateur.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteStaffModal({ isOpen: false, staffId: null })}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => showDeleteStaffModal.staffId && handleDeleteStaff(showDeleteStaffModal.staffId)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Feedback Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[400] max-w-sm"
                    >
                        <div className={`p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md ${feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                            {feedback.type === 'success' ? <CheckCircle size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                            <p className="text-xs font-bold flex-1">{feedback.message}</p>
                            <button onClick={() => setFeedback(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SchoolDetails;
