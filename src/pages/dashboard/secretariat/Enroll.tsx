import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Enroll: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const institutionId = searchParams.get('institutionId')
        ? Number(searchParams.get('institutionId'))
        : user?.institution?.id;
    const userRole = user?.role || 'Secretariat';

    const [enrollType, setEnrollType] = useState<'ELEVE' | 'ENSEIGNANT'>('ELEVE');
    const [step, setStep] = useState(1);

    // Student State
    const [studentData, setStudentData] = useState<any>({
        firstName: '', lastName: '', email: '', phone: '', birthDate: '', gender: 'Masculin', address: '', password: 'password123',
        motherFirstName: '', motherLastName: '', motherEmail: '', motherPhone: '',
        fatherFirstName: '', fatherLastName: '', fatherEmail: '', fatherPhone: '',
        cycleId: '', classeName: '', classeId: null
    });

    // Teacher State
    const [teacherData, setTeacherData] = useState<any>({
        firstName: '', lastName: '', email: '', phone: '', gender: 'Masculin', specialties: '', cycleIds: [] as number[], classes: '', password: 'password123'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);

    useEffect(() => {
        api.get('/cycles', { params: { institutionId } })
            .then(res => setCycles(res.data || []))
            .catch(() => console.error("Erreur cycle"));
    }, [institutionId]);

    // Fetch Classes and Subjects
    useEffect(() => {
        const fetchData = async () => {
            if (enrollType === 'ELEVE') {
                if (studentData.cycleId) {
                    try {
                        const res = await api.get(`/classes/cycle/${studentData.cycleId}`);
                        setAvailableClasses(res.data || []);
                    } catch (err) {
                        setAvailableClasses([]);
                    }
                } else {
                    setAvailableClasses([]);
                }
                setAvailableSubjects([]);
            } else {
                // Teacher: Fetch classes and subjects for all selected cycles
                if (teacherData.cycleIds.length > 0) {
                    try {
                        // Classes
                        const classesPromises = teacherData.cycleIds.map((id: number) => api.get(`/classes/cycle/${id}`));
                        const classesResults = await Promise.all(classesPromises);
                        const allAvailableClasses = classesResults.flatMap(res => res.data || []);
                        setAvailableClasses(allAvailableClasses);

                        // Subjects
                        const subjectsPromises = teacherData.cycleIds.map((id: number) => api.get(`/subjects/cycle/${id}`));
                        const subjectsResults = await Promise.all(subjectsPromises);
                        const allAvailableSubjects = subjectsResults.flatMap(res => res.data || []);
                        // Filter unique by name
                        const uniqueSubjects = allAvailableSubjects.filter((subj: any, index: number, self: any[]) =>
                            index === self.findIndex((t: any) => t.name === subj.name)
                        );
                        setAvailableSubjects(uniqueSubjects);
                    } catch (err) {
                        setAvailableClasses([]);
                        setAvailableSubjects([]);
                    }
                } else {
                    setAvailableClasses([]);
                    setAvailableSubjects([]);
                }
            }
        };
        fetchData();
    }, [enrollType === 'ELEVE' ? studentData.cycleId : teacherData.cycleIds, enrollType]);

    const handleStudentSubmit = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            const instId = institutionId ? Number(institutionId) : (user?.institution?.id || 0);
            const payload = {
                ...studentData,
                institutionId: instId,
                cycleId: studentData.cycleId ? Number(studentData.cycleId) : null,
                classeId: studentData.classeId ? Number(studentData.classeId) : null
            };
            await api.post('/students/enroll', payload);
            setMessage({ type: 'success', text: 'Élève inscrit avec succès. Un email contenant les identifiants sera envoyé.' });
            setStep(1); // Reset
            setStudentData({
                firstName: '', lastName: '', email: '', phone: '', birthDate: '', gender: 'Masculin', address: '', password: 'password123',
                motherFirstName: '', motherLastName: '', motherEmail: '', motherPhone: '',
                fatherFirstName: '', fatherLastName: '', fatherEmail: '', fatherPhone: '',
                cycleId: '', classeName: '', classeId: null
            });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'inscription.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherSubmit = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const instId = institutionId ? Number(institutionId) : (user?.institution?.id || 0);
            const payload = {
                ...teacherData,
                institutionId: instId,
                cycleIds: teacherData.cycleIds.map(Number),
                specialties: teacherData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean),
                classes: teacherData.classes.split(',').map((s: string) => s.trim()).filter(Boolean)
            };

            await api.post('/teachers/enroll', payload);
            setMessage({ type: 'success', text: 'Enseignant enregistré avec succès. Un email lui sera envoyé.' });
            setTeacherData({ firstName: '', lastName: '', email: '', phone: '', gender: 'Masculin', specialties: '', cycleIds: [], classes: '', password: 'password123' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'enregistrement.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Toggle Type */}
                    <div className="flex bg-white rounded-3xl p-2 shadow-sm border border-slate-100 mb-8 w-fit">
                        <button
                            onClick={() => { setEnrollType('ELEVE'); setStep(1); setMessage({ type: '', text: '' }); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${enrollType === 'ELEVE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <GraduationCap size={20} /> Nouvel Élève
                        </button>
                        <button
                            onClick={() => { setEnrollType('ENSEIGNANT'); setMessage({ type: '', text: '' }); }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${enrollType === 'ENSEIGNANT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <BookOpen size={20} /> Nouvel Enseignant
                        </button>
                    </div>

                    {message.text && (
                        <div className={`p-4 rounded-2xl mb-6 font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}

                    {/* ELEVE FORM */}
                    {enrollType === 'ELEVE' && (
                        <>
                            {/* Stepper Header */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
                                <div className="flex items-center justify-between relative px-4">
                                    <StepIndicator active={step >= 1} current={step === 1} number={1} label="Élève" />
                                    <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                                    <StepIndicator active={step >= 2} current={step === 2} number={2} label="Parents" />
                                    <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                                    <StepIndicator active={step >= 3} current={step === 3} number={3} label="Validation" />
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                {step === 1 && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <h3 className="text-xl font-black text-slate-800">Identité de l'élève</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput label="Prénom" value={studentData.firstName} onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })} />
                                            <FormInput label="Nom" value={studentData.lastName} onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })} />
                                            <FormInput label="Date de naissance" type="date" value={studentData.birthDate} onChange={(e) => setStudentData({ ...studentData, birthDate: e.target.value })} />
                                            <FormSelect label="Genre" options={['Masculin', 'Féminin']} value={studentData.gender} onChange={(e) => setStudentData({ ...studentData, gender: e.target.value as any })} />

                                            <div className="space-y-1.5 flex flex-col">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-0.5">Cycle</label>
                                                <select
                                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none cursor-pointer"
                                                    value={studentData.cycleId}
                                                    onChange={(e) => setStudentData({ ...studentData, cycleId: e.target.value, classeId: null, classeName: '' })}
                                                >
                                                    <option value="" disabled>Sélectionner un cycle...</option>
                                                    {cycles.map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex flex-col">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Classe principale</label>
                                                <select
                                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none cursor-pointer"
                                                    value={studentData.classeId || ''}
                                                    onChange={(e) => {
                                                        const sel = availableClasses.find((c: any) => String(c.id) === e.target.value);
                                                        setStudentData({ ...studentData, classeId: e.target.value, classeName: sel?.name || '' });
                                                    }}
                                                >
                                                    <option value="" disabled>Sélectionner une classe...</option>
                                                    {availableClasses.map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                    {availableClasses.length === 0 && studentData.cycleId && (
                                                        <option disabled>Aucune classe trouvée pour ce cycle</option>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <FormInput label="Adresse géographique" value={studentData.address} onChange={(e) => setStudentData({ ...studentData, address: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <h3 className="text-xl font-black text-slate-800">Compte & Contact de l'élève</h3>
                                        <p className="text-sm text-slate-500 mb-4">L'email institutionnel sera utilisé pour la connexion.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <FormInput label="Email institutionnel" type="email" placeholder="prenom.nom@academia.com" value={studentData.email} onChange={(e) => setStudentData({ ...studentData, email: e.target.value })} />
                                            </div>
                                            <FormInput label="Téléphone personnel (optionnel)" placeholder="+225 00 00 00 00" value={studentData.phone} onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })} />
                                        </div>

                                        <div className="border-t border-slate-100 pt-6 mt-6">
                                            <h3 className="text-xl font-black text-slate-800 mb-4">Informations de la Mère</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput label="Prénom" value={studentData.motherFirstName} onChange={(e) => setStudentData({ ...studentData, motherFirstName: e.target.value })} />
                                                <FormInput label="Nom" value={studentData.motherLastName} onChange={(e) => setStudentData({ ...studentData, motherLastName: e.target.value })} />
                                                <FormInput label="Email" type="email" value={studentData.motherEmail} onChange={(e) => setStudentData({ ...studentData, motherEmail: e.target.value })} />
                                                <FormInput label="Téléphone" value={studentData.motherPhone} onChange={(e) => setStudentData({ ...studentData, motherPhone: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-6 mt-6">
                                            <h3 className="text-xl font-black text-slate-800 mb-4">Informations du Père</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput label="Prénom" value={studentData.fatherFirstName} onChange={(e) => setStudentData({ ...studentData, fatherFirstName: e.target.value })} />
                                                <FormInput label="Nom" value={studentData.fatherLastName} onChange={(e) => setStudentData({ ...studentData, fatherLastName: e.target.value })} />
                                                <FormInput label="Email" type="email" value={studentData.fatherEmail} onChange={(e) => setStudentData({ ...studentData, fatherEmail: e.target.value })} />
                                                <FormInput label="Téléphone" value={studentData.fatherPhone} onChange={(e) => setStudentData({ ...studentData, fatherPhone: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in duration-500">
                                        <h3 className="text-xl font-black text-slate-800">Création du compte</h3>
                                        <p className="text-sm text-slate-500 mb-4">Les accès seront générés et envoyés à l'élève.</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <FormInput label="Mot de passe temporaire" value={studentData.password} onChange={(e) => setStudentData({ ...studentData, password: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <button onClick={() => step > 1 && setStep(step - 1)} className={`px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                                        Retour
                                    </button>
                                    <button onClick={() => step < 3 ? setStep(step + 1) : handleStudentSubmit()} disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100">
                                        {loading ? 'Traitement...' : step === 3 ? 'Inscrire l\'élève' : 'Continuer'}
                                        {!loading && <ArrowRight size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ENSEIGNANT FORM */}
                    {enrollType === 'ENSEIGNANT' && (
                        <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 relative overflow-hidden animate-in fade-in duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <h3 className="text-xl font-black text-slate-800 mb-6">Ajouter un enseignant</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Prénom" value={teacherData.firstName} onChange={(e) => setTeacherData({ ...teacherData, firstName: e.target.value })} />
                                <FormInput label="Nom" value={teacherData.lastName} onChange={(e) => setTeacherData({ ...teacherData, lastName: e.target.value })} />
                                <div className="md:col-span-2">
                                    <FormInput label="Email institutionnel" type="email" placeholder="professeur@ecole.com" value={teacherData.email} onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })} />
                                </div>
                                <FormInput label="Téléphone" placeholder="+225 00 00 00 00" value={teacherData.phone} onChange={(e) => setTeacherData({ ...teacherData, phone: e.target.value })} />

                                <FormSelect label="Genre" options={['Masculin', 'Féminin']} value={teacherData.gender} onChange={(e) => setTeacherData({ ...teacherData, gender: e.target.value as any })} />

                                <div className="space-y-1.5 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycles d'enseignement</label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                        {cycles.map((cycle: any) => {
                                            const isSelected = teacherData.cycleIds.includes(Number(cycle.id));
                                            return (
                                                <button
                                                    key={cycle.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const id = Number(cycle.id);
                                                        const newIds = isSelected
                                                            ? teacherData.cycleIds.filter((cid: number) => cid !== id)
                                                            : [...teacherData.cycleIds, id];
                                                        setTeacherData({ ...teacherData, cycleIds: newIds });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                        ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                                                >
                                                    {cycle.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécialités / Matières</label>
                                    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                        {availableSubjects.map((subj: any) => {
                                            const currentSpecs = teacherData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
                                            const isSelected = currentSpecs.includes(subj.name);
                                            return (
                                                <button
                                                    key={subj.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const newSpecs = isSelected
                                                            ? currentSpecs.filter((s: string) => s !== subj.name)
                                                            : [...currentSpecs, subj.name];
                                                        setTeacherData({ ...teacherData, specialties: newSpecs.join(', ') });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                        ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    {subj.name}
                                                </button>
                                            )
                                        })}
                                        {availableSubjects.length === 0 && teacherData.cycleIds.length > 0 && (
                                            <p className="text-[10px] text-slate-400 italic p-1">Aucune matière trouvée pour ces cycles</p>
                                        )}
                                        {teacherData.cycleIds.length === 0 && (
                                            <p className="text-[10px] text-slate-400 italic p-1">Choisissez d'abord un cycle</p>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Ou ajouter manuellement (ex: Sport, Musique...)"
                                            value={teacherData.specialties}
                                            onChange={(e) => setTeacherData({ ...teacherData, specialties: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 focus:bg-white outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Classes attribuées (Sélectionnez parmis les classes disponibles)</label>
                                    <div className="min-h-[54px] w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap gap-2 items-center">
                                        {teacherData.classes ? (
                                            teacherData.classes.split(',').map((s: string) => s.trim()).filter(Boolean).map((cls: string, idx: number) => (
                                                <span key={idx} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                                                    {cls}
                                                    <button
                                                        onClick={() => {
                                                            const current = teacherData.classes.split(',').map((c: string) => c.trim()).filter(Boolean);
                                                            setTeacherData({ ...teacherData, classes: current.filter((c: string) => c !== cls).join(', ') });
                                                        }}
                                                        className="hover:text-red-200"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-sm">Cliquez sur les classes ci-dessous pour les ajouter...</span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {availableClasses.map((c: any) => {
                                            const isSelected = teacherData.classes.split(',').map((s: string) => s.trim()).includes(c.name);
                                            return (
                                                <button
                                                    key={c.id}
                                                    disabled={isSelected}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const current = teacherData.classes ? teacherData.classes.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                                                        if (!current.includes(c.name)) {
                                                            setTeacherData({ ...teacherData, classes: [...current, c.name].join(', ') });
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                        ${isSelected ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50'}`}
                                                >
                                                    + {c.name}
                                                </button>
                                            );
                                        })}
                                        {availableClasses.length === 0 && teacherData.cycleIds.length > 0 && (
                                            <p className="text-xs text-slate-400 italic">Aucune classe disponible pour les cycles sélectionnés</p>
                                        )}
                                        {teacherData.cycleIds.length === 0 && (
                                            <p className="text-xs text-slate-400 italic">Veuillez d'abord sélectionner au moins un cycle</p>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <FormInput label="Mot de passe temporaire" value={teacherData.password} onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })} />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                                <button onClick={handleTeacherSubmit} disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100">
                                    {loading ? 'Traitement...' : 'Enregistrer l\'enseignant'}
                                    {!loading && <CheckCircle2 size={18} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:w-80 space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                        <h4 className="text-lg font-black mb-4 flex items-center gap-2 relative z-10">
                            <Info size={18} className="text-blue-400" /> Information
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
                            La création d'un compte élève ou enseignant génère automatiquement un email contenant les accès (Email + Mot de passe temporaire).
                        </p>
                        <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                            L'utilisateur devra obligatoirement changer son mot de passe lors de sa première connexion.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

// Internal Components
const StepIndicator = ({ number, label, active, current }: { number: number, label: string, active: boolean, current: boolean }) => (
    <div className="flex flex-col items-center gap-2 relative z-10 transition-all duration-500">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500
            ${current ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' :
                active ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
            {active && !current ? <CheckCircle2 size={20} /> : number}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${current ? 'text-blue-600' : 'text-slate-400'}`}>
            {label}
        </span>
    </div>
);

const FormInput = ({ label, type = "text", placeholder, value, onChange }: { label: string, type?: string, placeholder?: string, value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
        />
    </div>
);

const FormSelect = ({ label, options, value, onChange }: { label: string, options: string[], value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none cursor-pointer">
            {/* Blank Option if value is empty */}
            {(!value || value === "") && <option value="" disabled>Sélectionner...</option>}
            {options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

export default Enroll;
