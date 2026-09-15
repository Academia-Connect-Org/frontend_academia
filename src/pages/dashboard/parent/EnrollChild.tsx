import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../api/axios';
import { Building2, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
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
    }, []);

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
            setCycles(res.data || []);
        } catch (err) {
            console.error("Error fetching cycles", err);
        }
    };

    const fetchClasses = async (cycleId: string) => {
        try {
            const res = await api.get(`/classes/cycle/${cycleId}`);
            setClasses(res.data || []);
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
            <div className="p-8 max-w-2xl mx-auto text-center mt-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-3xl space-y-5">
                <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inscription Transmise avec Succès !</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Votre demande d'inscription a été transmise à l'établissement <strong>{school?.name}</strong>. Rendez-vous au secrétariat de l'école ou réglez les frais pour la validation définitive.
                </p>
                <button
                    onClick={() => navigate('/dashboard/parent')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all uppercase tracking-wider"
                >
                    Retour au tableau de bord
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inscrire un Enfant</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Remplissez le formulaire ci-dessous pour inscrire votre enfant dans un établissement partenaire.</p>
            </div>

            {/* Étape 1 : Trouver l'école */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Étape 1 : L'établissement</h3>

                <form onSubmit={handleSearchSchool} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Code de l'école</label>
                        <input
                            type="text"
                            placeholder="Ex: AC00001"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={schoolCode}
                            onChange={(e) => setSchoolCode(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loadingSchool || !schoolCode} className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50">
                        {loadingSchool ? 'Recherche...' : 'Rechercher'}
                    </button>
                </form>

                {errorSchool && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 rounded-2xl text-xs font-bold border border-rose-200 dark:border-rose-900">
                        <XCircle size={16} /> {errorSchool}
                    </div>
                )}

                {school && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">{school.name}</h4>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                    {school.type === 'ECOLE' ? 'Primaire/Maternelle' : 'Collège/Lycée'} - {school.country}
                                </p>
                            </div>
                        </div>
                        <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                )}
            </div>

            {/* Étape 2 : Formulaire d'inscription */}
            {school && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Étape 2 : Informations de l'enfant</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prénom *</label>
                                <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom *</label>
                                <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Genre *</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                    <option value="Masculin">Masculin</option>
                                    <option value="Féminin">Féminin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date de naissance *</label>
                                <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle *</label>
                                <select name="cycleId" required value={formData.cycleId} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                    <option value="">Sélectionner</option>
                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe *</label>
                                <select name="classeId" required disabled={!formData.cycleId} value={formData.classeId} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                    <option value="">Sélectionner</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Adresse</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Informations Mère (Optionnel)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input type="text" name="motherFirstName" placeholder="Prénom mère" value={formData.motherFirstName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="text" name="motherLastName" placeholder="Nom mère" value={formData.motherLastName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="text" name="motherPhone" placeholder="Téléphone" value={formData.motherPhone} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="email" name="motherEmail" placeholder="Email" value={formData.motherEmail} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-2">Informations Père (Optionnel)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input type="text" name="fatherFirstName" placeholder="Prénom père" value={formData.fatherFirstName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="text" name="fatherLastName" placeholder="Nom père" value={formData.fatherLastName} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="text" name="fatherPhone" placeholder="Téléphone" value={formData.fatherPhone} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                <input type="email" name="fatherEmail" placeholder="Email" value={formData.fatherEmail} onChange={handleChange} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !formData.classeId}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider disabled:opacity-50"
                            >
                                {submitting ? 'Inscription...' : 'Valider l\'inscription'} <ChevronRight size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EnrollChild;
