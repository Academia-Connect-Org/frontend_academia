import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../api/axios';
import { Building2, CheckCircle2, ChevronRight, GraduationCap, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const EnrollChild: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [schoolCode, setSchoolCode] = useState(searchParams.get('schoolCode') || '');
    const [school, setSchool] = useState<any>(null);
    const [loadingSchool, setLoadingSchool] = useState(false);
    const [errorSchool, setErrorSchool] = useState('');

    const [cycles, setCycles] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'Masculin',
        birthDate: '',
        address: '',
        cycleId: '',
        classeId: '',
        motherFirstName: '',
        motherLastName: '',
        motherPhone: '',
        motherEmail: '',
        fatherFirstName: '',
        fatherLastName: '',
        fatherPhone: '',
        fatherEmail: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (schoolCode) {
            handleSearchSchool();
        }
    }, []); // Run once if schoolCode is provided via URL

    const handleSearchSchool = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!schoolCode) return;

        setLoadingSchool(true);
        setErrorSchool('');
        setSchool(null);

        try {
            const res = await api.get(`/public/institutions/by-code/${schoolCode}`);
            setSchool(res.data);
            fetchCycles(res.data.id);
        } catch (err) {
            setErrorSchool("Aucun établissement trouvé avec ce code.");
        } finally {
            setLoadingSchool(false);
        }
    };

    const fetchCycles = async (institutionId: number) => {
        try {
            const res = await api.get(`/cycles?institutionId=${institutionId}`);
            setCycles(res.data);
        } catch (err) {
            console.error("Error fetching cycles", err);
        }
    };

    const fetchClasses = async (cycleId: string) => {
        try {
            const res = await api.get(`/classes/cycle/${cycleId}`);
            setClasses(res.data);
        } catch (err) {
            console.error("Error fetching classes", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'cycleId') {
            fetchClasses(value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!school || !user) return;

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                parentId: user.id,
                institutionId: school.id
            };
            await api.post('/students/enroll', payload);
            setSuccess(true);
        } catch (err) {
            console.error("Enrollment failed", err);
            alert("Erreur lors de l'inscription.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="p-8 max-w-3xl mx-auto text-center mt-20 bg-white shadow-xl rounded-xl">
                <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
                <h2 className="text-3xl font-black text-slate-800 mb-4">Inscription Réussie !</h2>
                <p className="text-slate-500 mb-8">Votre demande d'inscription a été bien envoyée à <strong>{school?.name}</strong>. Le dossier est en attente de validation par l'établissement. Veillez passer payer les frais d'inscription au secrétariat de l'école pour valider définitivement l'inscription.</p>
                <button
                    onClick={() => navigate('/dashboard/parent')}
                    className="px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors rounded shadow-lg"
                >
                    Retour au tableau de bord
                </button>
            </div>
        );
    }

    return (
        <div className="px-2 py-4 sm:p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 sm:mb-8 tracking-tight text-center sm:text-left px-2">Inscrire un enfant</h1>

            {/* Étape 1 : Trouver l'école */}
            <div className="bg-white p-3 sm:p-8 shadow-lg sm:shadow-xl rounded-xl mb-4 sm:mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 text-center sm:text-left">Étape 1 : L'établissement</h3>

                <form onSubmit={handleSearchSchool} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Code de l'école</label>
                        <input
                            type="text"
                            placeholder="Ex: AC00001"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-md outline-none transition-all"
                            value={schoolCode}
                            onChange={(e) => setSchoolCode(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loadingSchool || !schoolCode} className="w-full md:w-auto px-8 py-3 bg-slate-800 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-colors rounded-md shadow-lg disabled:opacity-50">
                        {loadingSchool ? 'Recherche...' : 'Rechercher'}
                    </button>
                </form>

                {errorSchool && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 flex items-center gap-2 rounded-md font-medium text-sm">
                        <XCircle size={18} /> {errorSchool}
                    </div>
                )}

                {school && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-6 border-2 border-emerald-100 bg-emerald-50 rounded-xl flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 sm:gap-6 relative">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Building2 size={24} className="text-emerald-600 sm:w-8 sm:h-8" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg sm:text-xl text-emerald-900">{school.name}</h4>
                            <p className="text-emerald-700 font-medium text-xs sm:text-sm">
                                {school.type === 'ECOLE' ? 'Primaire/Maternelle' : 'Collège/Lycée'} - {school.country}
                            </p>
                        </div>
                        <div className="sm:ml-auto absolute top-3 right-3 sm:relative sm:top-0 sm:right-0">
                            <CheckCircle2 size={20} className="text-emerald-500 sm:w-8 sm:h-8" />
                        </div>
                    </div>
                )}
            </div>

            {/* Étape 2 : Formulaire d'inscription */}
            {school && (
                <div className="bg-white p-3 sm:p-8 shadow-lg sm:shadow-xl rounded-xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 sm:mb-6 text-center sm:text-left">Étape 2 : Informations de l'enfant</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Prénom *</label>
                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Nom *</label>
                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Genre *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md">
                                    <option value="Masculin">Masculin</option>
                                    <option value="Féminin">Féminin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Date de naissance *</label>
                                <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Cycle *</label>
                                <select name="cycleId" required value={formData.cycleId} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md">
                                    <option value="">Sélectionner</option>
                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Classe *</label>
                                <select name="classeId" required disabled={!formData.cycleId} value={formData.classeId} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md">
                                    <option value="">Sélectionner</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Adresse</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                            </div>
                        </div>

                        <div className="pt-4 sm:pt-8 mt-4 sm:mt-8 border-t border-slate-100">
                            <h4 className="text-md font-bold text-slate-800 mb-4 sm:mb-6 text-center sm:text-left">Informations de la Mère</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Prénom</label>
                                    <input type="text" name="motherFirstName" value={formData.motherFirstName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Nom</label>
                                    <input type="text" name="motherLastName" value={formData.motherLastName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Téléphone</label>
                                    <input type="text" name="motherPhone" value={formData.motherPhone} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Email</label>
                                    <input type="email" name="motherEmail" value={formData.motherEmail} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                            </div>

                            <h4 className="text-md font-bold text-slate-800 mb-4 sm:mb-6 text-center sm:text-left">Informations du Père</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Prénom</label>
                                    <input type="text" name="fatherFirstName" value={formData.fatherFirstName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Nom</label>
                                    <input type="text" name="fatherLastName" value={formData.fatherLastName} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Téléphone</label>
                                    <input type="text" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">Email</label>
                                    <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 sm:pt-6 mt-2 border-t border-slate-100 flex flex-col sm:flex-row justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !formData.classeId}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-blue-700 transition-colors rounded shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? 'Inscription...' : 'Valider l\'inscription'} <ChevronRight size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EnrollChild;
