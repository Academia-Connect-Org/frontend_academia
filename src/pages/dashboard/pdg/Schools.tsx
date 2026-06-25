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
        ministry: ''
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
            setInstitutions(res.data);
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
            ministry: school.ministry || ''
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
            ministry: ''
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

            let res;
            if (editingId) {
                res = await api.post('/institutions/create-with-logo', formDataToSubmit);
            } else {
                res = await api.post('/institutions/create-with-logo', formDataToSubmit);
            }

            closeModal();
            fetchInstitutions();
            if (!editingId && res?.data?.id) {
                navigate(`/dashboard/pdg/select-plan/${res.data.id}?isNew=true`);
            }
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', message: 'Erreur lors de la sauvegarde de l\'établissement.' });
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
        <>
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestion du Réseau</h2>
                    <p className="text-slate-500 font-medium">Supervisez et gérez tous vos établissements scolaires</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setEditingId(null); setShowModal(true); }}
                        className="bg-blue-600 text-white px-8 py-4 ] font-black flex items-center gap-3 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                        Nouvel Établissement
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12     animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Récupération du réseau...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {institutions.map((school) => (
                        <div key={school.id} className="bg-white ] overflow-hidden   shadow-xl shadow-slate-200/40 group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500">
                            <div className="flex flex-col md:flex-row">
                                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {school.logoUrl ? (
                                        <img src={getFileUrl(school.logoUrl)} alt={school.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    ) : (
                                        <SchoolIcon size={48} className="text-slate-200" />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5  text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${school.active ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                            {school.active ? 'Actif' : 'En attente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 md:w-2/3">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">{school.type}</p>
                                            <h3 className="text-xl font-black text-slate-800 leading-tight uppercase">{school.name}</h3>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(school)}
                                                className="text-slate-300 hover:text-blue-600 transition-colors bg-slate-50 p-2 "
                                                title="Modifier"
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingId(school.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-slate-300 hover:text-red-500 transition-colors bg-slate-50 p-2 "
                                                title="Supprimer"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span className="text-sm font-medium">{school.address || 'Adresse non spécifiée'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Users size={16} className="text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700">UAI: {school.uaiNumber || '---'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-6   flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10  bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 uppercase tracking-tighter overflow-hidden">
                                                {school.email?.[0] || school.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Contact</p>
                                                <p className="text-sm font-bold text-slate-700">{school.phone || school.email}</p>
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
                                            className={`px-6 py-2.5 font-black text-sm transition-all duration-300 shadow-sm flex items-center gap-2 ${
                                                school.subscriptionType === 'NONE' || !school.active
                                                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 shadow-amber-500/10'
                                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-blue-500/10'
                                            }`}
                                        >
                                            {school.subscriptionType === 'NONE' || !school.active ? 'Activer' : 'Gérer'} <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {institutions.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-50 ]    flex flex-col items-center justify-center text-center">
                            <SchoolIcon size={64} className="text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-slate-400 mb-2">Aucun établissement enregistré</h3>
                            <p className="text-slate-400 font-medium mb-8">Commencez par ajouter votre première école ou établissement.</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-white text-blue-600 px-8 py-3  font-black   shadow-lg hover:bg-blue-50 transition-all"
                            >
                                Ajouter maintenant
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Creation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl ] shadow-2xl overflow-hidden relative   animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8   bg-slate-50/10">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12  bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <SchoolIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                            {editingId ? 'Modifier l\'Établissement' : 'Nouvel Établissement'}
                                        </h3>
                                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none mt-1">
                                            {editingId ? 'Mise à jour des données' : 'Configuration initiale'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="p-3 bg-white text-slate-400  hover:text-red-500   shadow-sm transition-all hover:scale-105">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form id="schoolForm" onSubmit={handleSubmit} className="p-10 pb-32 space-y-10">
                                {/* Group: Identity */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px bg-slate-100 flex-1"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identité & Type</span>
                                        <div className="h-px bg-slate-100 flex-1"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom de l'établissement</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: Groupe Scolaire Excellence"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Type d'entité</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                        >
                                            <option value="ECOLE">École</option>
                                            <option value="ETABLISSEMENT">Établissement</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Numéro UAI (Optionnel)</label>
                                        <input
                                            type="text"
                                            value={formData.uaiNumber}
                                            onChange={(e) => setFormData({ ...formData, uaiNumber: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: 0751234A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Téléphone</label>
                                        <input
                                            required
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="+225 0102030405"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Adresse Géographique</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: Toukra, N'Djaména, Tchad"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Pays</label>
                                        <input
                                            type="text"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: République du Benin"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Devise</label>
                                        <input
                                            type="text"
                                            value={formData.motto}
                                            onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: Unité - Travail - Progrès"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Ministère de Tutelle</label>
                                        <input
                                            type="text"
                                            value={formData.ministry}
                                            onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                                            placeholder="Ex: Ministère de l'Éducation Nationale..."
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Logo de l'établissement</label>
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 ]    hover: transition-all group/upload relative overflow-hidden">
                                            {logoPreview ? (
                                                <div className="relative w-24 h-24  overflow-hidden shadow-lg">
                                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all text-white"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24  bg-white   flex items-center justify-center text-slate-300">
                                                    <Upload size={32} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-700 mb-1">Télécharger le logo</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">PNG, JPG, WEBP (Max 10MB)</p>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email de contact professionnel</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-50 border-none  px-6 py-4 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-extrabold text-slate-700 placeholder:text-slate-300"
                                            placeholder="contact@nom-etablissement.com"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Sticky Footer explicitly outside local-scroll for safety, or styled inside */}
                        <div className="p-8   bg-white/80 backdrop-blur-md flex gap-4 absolute bottom-0 left-0 right-0 z-10">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 py-4 ] font-black text-slate-400 hover:bg-slate-50 transition-all  "
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="schoolForm"
                                disabled={isSubmitting}
                                className={`flex-[2] text-white py-4 font-black shadow-xl transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        {editingId ? 'Mise à jour...' : 'Création en cours...'}
                                    </>
                                ) : (
                                    editingId ? 'Mettre à jour' : 'Confirmer la création'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md ] p-10 shadow-2xl text-center   animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500  flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Supprimer l'établissement ?</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Cette action est irréversible. L'établissement et toutes ses données associées seront supprimés.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}
                                className="flex-1 py-4 ] font-black bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-4 ] font-black bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="w-5 h-5     animate-spin"></div>
                                ) : (
                                    "Supprimer"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Feedback Popup */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] min-w-[320px]"
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

export default Schools;
