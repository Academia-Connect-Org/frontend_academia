import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import {
    Plus,
    MoreVertical,
    MapPin,
    Users,
    ChevronRight,
    School as SchoolIcon,
    Upload,
    Trash2,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';
import api, { getFileUrl } from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES } from '../../../constants/countries';

const Schools: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        uaiNumber: '',
        type: 'ECOLE',
        logoUrl: '',
        country: '',
        motto: '',
        ministry: '',
        description: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    useEffect(() => {
        fetchInstitutions();
    }, [user?.id]);

    const fetchInstitutions = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/institutions/ceo/${user.id}`);
            setInstitutions(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEdit = (school: any) => {
        setEditingId(school.id);
        setFormData({
            name: school.name || '',
            address: school.address || '',
            email: school.email || '',
            phone: school.phone || '',
            uaiNumber: school.uaiNumber || '',
            type: school.type || 'ECOLE',
            logoUrl: school.logoUrl || '',
            country: school.country || '',
            motto: school.motto || '',
            ministry: school.ministry || '',
            description: school.description || ''
        });
        setLogoPreview(school.logoUrl ? getFileUrl(school.logoUrl) : null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            name: '',
            address: '',
            email: '',
            phone: '',
            uaiNumber: '',
            type: 'ECOLE',
            logoUrl: '',
            country: '',
            motto: '',
            ministry: '',
            description: ''
        });
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formDataToSubmit = new FormData();

            const institutionData = {
                ...formData,
                id: editingId,
                ceo: { id: user?.id }
            };

            formDataToSubmit.append('institution', JSON.stringify(institutionData));
            if (logoFile) {
                formDataToSubmit.append('logo', logoFile);
            }

            let res = await api.post('/institutions/create-with-logo', formDataToSubmit);

            closeModal();
            fetchInstitutions();
            if (!editingId && res?.data?.id) {
                navigate(`/dashboard/pdg/select-plan/${res.data.id}?isNew=true`);
            }
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'Erreur lors de la sauvegarde de l\'établissement.';
            setFeedback({ type: 'error', message: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await api.delete(`/institutions/${deletingId}`);
            fetchInstitutions();
            setShowDeleteModal(false);
            setDeletingId(null);
        } catch (err) {
            console.error(err);
            setFeedback({
                type: 'error',
                message: "Erreur lors de la suppression de l'établissement. Vérifiez les données liées."
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestion du Réseau</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Supervisez et gérez tous vos établissements scolaires</p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    Nouvel Établissement
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Récupération du réseau...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {institutions.map((school) => (
                        <div key={school.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:w-1/3 h-44 sm:h-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {school.logoUrl ? (
                                        <img src={getFileUrl(school.logoUrl)} alt={school.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <SchoolIcon size={40} className="text-slate-400 dark:text-slate-600" />
                                    )}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${school.active ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                            {school.active ? 'Actif' : 'En attente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6 sm:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{school.type}</p>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{school.name}</h3>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(school)}
                                                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Modifier"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeletingId(school.id);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4 text-xs">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{school.address || 'Adresse non spécifiée'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Users size={14} className="text-slate-400 shrink-0" />
                                                <span className="font-semibold">UAI: {school.uaiNumber || '---'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 uppercase shrink-0">
                                                {school.email?.[0] || school.name?.[0]}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[9px] font-semibold text-slate-400 uppercase">Contact</p>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{school.phone || school.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (school.subscriptionType === 'NONE' || !school.active) {
                                                    navigate(`/dashboard/pdg/select-plan/${school.id}`);
                                                } else {
                                                    navigate(ROUTES.DASHBOARD.PDG.SCHOOL_DETAILS.replace(':id', school.id.toString()));
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                                                school.subscriptionType === 'NONE' || !school.active
                                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                                                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white'
                                            }`}
                                        >
                                            {school.subscriptionType === 'NONE' || !school.active ? 'Activer' : 'Gérer'} <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {institutions.length === 0 && (
                        <div className="col-span-full py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6">
                            <SchoolIcon size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Aucun établissement enregistré</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Commencez par ajouter votre premier établissement scolaire au réseau.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                            >
                                Ajouter maintenant
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-950/50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                                    <SchoolIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {editingId ? 'Modifier l\'Établissement' : 'Nouvel Établissement'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {editingId ? 'Mise à jour des informations' : 'Configuration initiale'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="schoolForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de l'établissement</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Ex: Groupe Scolaire Excellence"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type d'entité</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="ECOLE">École</option>
                                            <option value="ETABLISSEMENT">Établissement</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Numéro UAI (Optionnel)</label>
                                        <input
                                            type="text"
                                            value={formData.uaiNumber}
                                            onChange={(e) => setFormData({ ...formData, uaiNumber: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Ex: 0751234A"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="+225 0102030405"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email professionnel</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="contact@nom-etablissement.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adresse Géographique</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Ex: Toukra, N'Djaména, Tchad"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pays</label>
                                        <select
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">Sélectionnez un pays</option>
                                            {COUNTRIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Devise / Devise</label>
                                        <input
                                            type="text"
                                            value={formData.motto}
                                            onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Ex: Unité - Travail - Progrès"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ministère de Tutelle</label>
                                    <input
                                        type="text"
                                        value={formData.ministry}
                                        onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Ex: Ministère de l'Éducation Nationale..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description de l'établissement</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Ex: Une description détaillée de votre école..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Logo de l'établissement</label>
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl relative overflow-hidden">
                                        {logoPreview ? (
                                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-sm shrink-0">
                                                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                                <Upload size={20} />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Télécharger le logo</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">PNG, JPG, WEBP (Max 10MB)</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="schoolForm"
                                disabled={isSubmitting}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Mise à jour...
                                    </>
                                ) : (
                                    editingId ? 'Mettre à jour' : 'Confirmer la création'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-2xl text-center">
                        <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Supprimer l'établissement ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Cette action est irréversible. L'établissement et ses données associées seront supprimés.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Supprimer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-[200] max-w-sm"
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

export default Schools;
