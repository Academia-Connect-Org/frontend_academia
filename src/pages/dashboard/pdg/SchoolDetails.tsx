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
    Calendar,
    Clock,
    CreditCard
} from 'lucide-react';
import api, { getFileUrl } from '../../../api/axios';
import Cycles from '../direction/Cycles';
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
    const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'cycles' | 'subscriptions'>('overview');
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

    // Staff Form State
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
                password: '', // Leave empty for updates
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
            setStaff(staffRes.data);
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
                message: "Erreur lors de la suppression de l'établissement. Assurez-vous qu'il ne contient pas de données liées."
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12     animate-spin"></div>
                </div>
            </>
        );
    }

    if (!institution) {
        return (
            <>
                <div className="text-center py-20">
                    <p className="text-slate-500 font-bold">Établissement non trouvé.</p>
                    <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-black flex items-center gap-2 mx-auto">
                        <ArrowLeft size={20} /> Retour
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Header / Profile */}
            <div className="relative mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black transition-colors"
                >
                    <ArrowLeft size={20} /> Retour à la liste
                </button>

                <div className="bg-white ] p-10 shadow-xl shadow-slate-200/40   flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 ] overflow-hidden bg-slate-50   shadow-inner flex-shrink-0">
                        {institution.logoUrl ? (
                            <img src={getFileUrl(institution.logoUrl)} alt={institution.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <SchoolIcon size={48} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{institution.name}</h2>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600  text-[10px] font-black uppercase tracking-widest self-center md:self-auto">
                                {institution.type}
                            </span>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-indigo-600" />
                                <span>{institution.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={16} className="text-indigo-600" />
                                <span>UAI: {institution.uaiNumber || 'Non défini'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="p-4 bg-red-50 text-red-600  hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-500/10 flex items-center gap-2 font-black text-sm"
                            title="Supprimer l'établissement"
                        >
                            <Trash2 size={20} />
                            <span className="hidden md:inline">Supprimer</span>
                        </button>
                        <div className={`px-6 py-3  font-black text-sm flex items-center ${institution.active ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {institution.active ? 'Actif' : 'Inactif'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
                {[
                    { id: 'overview', label: 'Aperçu', icon: Info },
                    { id: 'staff', label: 'Responsables', icon: Users },
                    { id: 'cycles', label: 'Gestion Cycles', icon: Layers },
                    { id: 'subscriptions', label: 'Abonnement', icon: Crown }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 ] font-black transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105'
                            : 'bg-white text-slate-400 hover:bg-slate-50  '
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <div className="bg-white ] p-10   shadow-lg">
                            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Informations de Contact</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12  bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                        <p className="text-lg font-black text-slate-700">{institution.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12  bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Téléphone</p>
                                        <p className="text-lg font-black text-slate-700">{institution.phone || 'Non défini'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white ] p-10   shadow-lg">
                            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Statistiques Rapides</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 ] p-6 text-center">
                                    <span className="text-3xl font-black text-indigo-600">{stats?.studentCount ?? '--'}</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Élèves</p>
                                </div>
                                <div className="bg-slate-50 ] p-6 text-center">
                                    <span className="text-3xl font-black text-indigo-600">{stats?.teacherCount ?? '--'}</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Enseignants</p>
                                </div>
                                <div className="bg-slate-50 ] p-6 text-center">
                                    <span className="text-3xl font-black text-indigo-600">{stats?.classCount ?? '--'}</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Classes</p>
                                </div>
                                <div className="bg-slate-50 ] p-6 text-center">
                                    <span className="text-3xl font-black text-indigo-600">{stats?.staffCount ?? '--'}</span>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Admin / Staff</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'staff' && (
                    <motion.div
                        key="staff"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Responsables & Effectifs</h3>
                                <p className="text-slate-500 font-medium">Gestion du personnel administratif et accès aux effectifs.</p>
                            </div>
                            <button
                                onClick={() => setShowAddStaffModal(true)}
                                className="bg-indigo-600 text-white px-6 py-3  font-black flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Plus size={20} /> Ajouter un responsable
                            </button>
                        </div>

                        {/* Administrative Section */}
                        <div className="mb-16">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Équipe de Direction</h4>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Admin Card (Direction/Provisoriat) */}
                                {(() => {
                                    const mainAdmin = staff.find(s => s.role === 'DIRECTION' || s.role === 'PROVISORIAT');
                                    const roleLabel = institution.type === 'ECOLE' ? 'Directeur / Direction' : 'Proviseur / Provisoriat';
                                    if (mainAdmin) {
                                        return (
                                            <div className="bg-white ] p-8   shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5  -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
                                                <div className="flex justify-between items-start mb-8 relative">
                                                    <div className="w-20 h-20 ] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/20 group-hover:rotate-6 transition-transform">
                                                        <Shield size={40} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingStaff(mainAdmin)} className="p-3 bg-slate-50 text-slate-400  hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"><Info size={20} /></button>
                                                        <button onClick={() => setShowDeleteStaffModal({ isOpen: true, staffId: mainAdmin.id })} className="p-3 bg-slate-50 text-slate-400  hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><Trash2 size={20} /></button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5  bg-indigo-500 animate-pulse"></div>
                                                    {roleLabel}
                                                </p>
                                                <h4 className="text-2xl font-black text-slate-800 mb-1">{mainAdmin.firstName} {mainAdmin.lastName}</h4>
                                                <div className="flex flex-col gap-3 mt-8">
                                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4   ">
                                                        <Mail size={16} className="text-indigo-400" /> {mainAdmin.email}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4   ">
                                                        <Phone size={16} className="text-indigo-400" /> {institution.phone || 'Non renseigné'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="bg-slate-50/50 ] p-10    flex flex-col items-center justify-center text-slate-400 min-h-[300px] group hover: hover:bg-white transition-all overflow-hidden lg:col-span-1">
                                            <div className="w-20 h-20  bg-white   shadow-sm flex items-center justify-center mb-6 text-slate-300 group-hover:text-indigo-300 group-hover:scale-110 transition-all">
                                                <Shield size={32} />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-[10px] text-center max-w-[200px] leading-relaxed">Aucun {roleLabel} défini pour le moment</p>
                                        </div>
                                    );
                                })()}

                                {/* Secretary Card */}
                                {(() => {
                                    const secretary = staff.find(s => s.role === 'SECRETARIAT');
                                    if (secretary) {
                                        return (
                                            <div className="bg-white ] p-8   shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5  -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
                                                <div className="flex justify-between items-start mb-8 relative">
                                                    <div className="w-20 h-20 ] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                                                        <UserCircle size={40} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setEditingStaff(secretary)} className="p-3 bg-slate-50 text-slate-400  hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"><Info size={20} /></button>
                                                        <button onClick={() => setShowDeleteStaffModal({ isOpen: true, staffId: secretary.id })} className="p-3 bg-slate-50 text-slate-400  hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><Trash2 size={20} /></button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5  bg-emerald-500 animate-pulse"></div>
                                                    Secrétariat
                                                </p>
                                                <h4 className="text-2xl font-black text-slate-800 mb-1">{secretary.firstName} {secretary.lastName}</h4>
                                                <div className="flex flex-col gap-3 mt-8">
                                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4   ">
                                                        <Mail size={16} className="text-emerald-400" /> {secretary.email}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm bg-slate-50 p-4   ">
                                                        <Phone size={16} className="text-emerald-400" /> {institution.phone || 'Non renseigné'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="bg-slate-50/50 ] p-10    flex flex-col items-center justify-center text-slate-400 min-h-[300px] group hover: hover:bg-white transition-all overflow-hidden lg:col-span-1">
                                            <div className="w-20 h-20  bg-white   shadow-sm flex items-center justify-center mb-6 text-slate-300 group-hover:text-emerald-300 group-hover:scale-110 transition-all">
                                                <UserCircle size={32} />
                                            </div>
                                            <p className="font-black uppercase tracking-widest text-[10px] text-center max-w-[200px] leading-relaxed">Aucun Secrétariat défini pour le moment</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Navigation Section */}
                        <div className="mt-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-slate-100 flex-1"></div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Accès Rapides Effectifs</h4>
                                <div className="h-px bg-slate-100 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Teachers Link Card */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.TEACHERS}?institutionId=${id}`)}
                                    className="bg-white ] p-10   shadow-xl flex items-center gap-8 text-left hover: transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-slate-900/5  -mr-16 -mt-16 group-hover:bg-indigo-500/5 transition-all"></div>
                                    <div className="w-20 h-20 ] bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-slate-900/20 group-hover:bg-indigo-600 transition-all">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Corps Enseignant</h4>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600  text-[10px] font-black shadow-sm  ">{stats?.teacherCount || 0}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Consultez la liste et les spécialités des enseignants.</p>
                                    </div>
                                </motion.button>

                                {/* Students Link Card */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.STUDENTS}?institutionId=${id}`)}
                                    className="bg-white ] p-10   shadow-xl flex items-center gap-8 text-left hover: transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5  -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-all"></div>
                                    <div className="w-20 h-20 ] bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-600/20 group-hover:bg-emerald-500 transition-all">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Effectif Élèves</h4>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600  text-[10px] font-black shadow-sm  ">{stats?.studentCount || 0}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Accédez aux dossiers et aux effectifs par classes.</p>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cycles' && (
                    <motion.div
                        key="cycles"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Cycles institutionId={Number(id)} hideLayout />
                    </motion.div>
                )}

                {activeTab === 'subscriptions' && (
                    <motion.div
                        key="subscriptions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-lg ] p-10 shadow-2xl relative"
                    >
                        <button onClick={() => { setShowAddStaffModal(false); setEditingStaff(null); setStaffError(null); }} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400  hover:bg-slate-100 transition-all">
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                            {editingStaff ? 'Modifier le Responsable' : 'Nouveau Responsable'}
                        </h3>
                        <p className="text-slate-500 font-medium mb-6">
                            {editingStaff ? 'Mettez à jour les informations du compte.' : 'Créez un compte pour un membre de la direction.'}
                        </p>

                        {staffError && (
                            <div className="mb-6 p-4 bg-red-50   text-red-600  text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                                <Info size={18} />
                                {staffError}
                            </div>
                        )}

                        <form onSubmit={handleAddStaff} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Prénom</label>
                                    <input
                                        required
                                        type="text"
                                        value={staffForm.firstName}
                                        onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                                        className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom</label>
                                    <input
                                        required
                                        type="text"
                                        value={staffForm.lastName}
                                        onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                                        className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email de connexion</label>
                                <input
                                    required
                                    type="email"
                                    value={staffForm.email}
                                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                    className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                    {editingStaff ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe provisoire'}
                                </label>
                                <input
                                    required={!editingStaff}
                                    type="password"
                                    value={staffForm.password}
                                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                                    className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Rôle Académique</label>
                                <select
                                    value={staffForm.role}
                                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                                    className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700"
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
                                className="w-full bg-indigo-600 text-white py-5 ] font-black shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                            >
                                {editingStaff ? 'Sauvegarder les modifications' : 'Créer le compte'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md ] p-10 shadow-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Supprimer l'établissement ?</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            Cette action est irréversible. Toutes les données associées (cycles, classes, personnels) seront définitivement supprimées ou désassociées.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-4 ] font-black bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteInstitution}
                                className="flex-1 py-4 ] font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5     animate-spin"></div>
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
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 animate-in fade-in duration-300">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md ] p-10 shadow-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Supprimer ce responsable ?</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            Cette action révoquera l'accès de cet utilisateur à l'application.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteStaffModal({ isOpen: false, staffId: null })}
                                className="flex-1 py-4 ] font-black bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => showDeleteStaffModal.staffId && handleDeleteStaff(showDeleteStaffModal.staffId)}
                                className="flex-1 py-4 ] font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
                            >
                                Supprimer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Feedback Popup */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] min-w-[320px]"
                    >
                        <div className={`p-6 ] shadow-2xl  flex items-center gap-4 backdrop-blur-xl ${feedback.type === 'success'
                            ? 'bg-emerald-500/90  text-white'
                            : 'bg-red-500/90  text-white'
                            }`}>
                            <div className="w-10 h-10  bg-white/20 flex items-center justify-center shrink-0">
                                {feedback.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-xs uppercase tracking-widest opacity-70 mb-0.5">
                                    {feedback.type === 'success' ? 'Succès' : 'Erreur'}
                                </p>
                                <p className="font-bold text-sm leading-tight">{feedback.message}</p>
                            </div>
                            <button onClick={() => setFeedback(null)} className="p-2 hover:bg-white/10  transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SchoolDetails;
