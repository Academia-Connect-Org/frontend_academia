import { encodeSchoolId } from "../../../utils/schoolCode";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight,
    BookOpen,
    MessageCircle,
    Clock,
    UserCheck,
    Search,
    Copy,
    Check
} from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Enroll: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [pdgInstitutions, setPdgInstitutions] = useState<any[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | undefined>(
        searchParams.get('institutionId') ? Number(searchParams.get('institutionId')) :
            (localStorage.getItem('selectedInstitutionId') ? Number(localStorage.getItem('selectedInstitutionId')) : undefined)
    );

    const getInstitutionId = () => {
        if (user?.role === 'PDG' && selectedInstitutionId) return selectedInstitutionId;
        if (searchParams.get('institutionId')) return Number(searchParams.get('institutionId'));
        if (user?.institution?.id) return user.institution.id;
        return 0;
    };

    const institutionId = getInstitutionId();

    const [enrollType, setEnrollType] = useState<'LIEN_PARENT' | 'ATTENTE' | 'ENSEIGNANT' | 'ELEVE_DIRECT'>('LIEN_PARENT');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Parent Invite State
    const [parentData, setParentData] = useState({ firstName: '', lastName: '', phone: '', email: '', method: 'WHATSAPP' });

    // Pending Enrollments State
    const [pendingStudents, setPendingStudents] = useState<any[]>([]);
    const [pendingSearchQuery, setPendingSearchQuery] = useState('');
    const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    // Teacher State
    const [teacherData, setTeacherData] = useState<any>({
        firstName: '', lastName: '', email: '', phone: '', gender: 'Masculin', specialties: '', cycleIds: [] as number[], classes: '', password: 'password123'
    });
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);

    // Direct Student State
    const [directStudentData, setDirectStudentData] = useState({
        firstName: '', lastName: '', gender: 'Masculin', birthDate: '', classeId: '',
        fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherEmail: '',
        motherFirstName: '', motherLastName: '', motherPhone: '', motherEmail: ''
    });
    const [allClasses, setAllClasses] = useState<any[]>([]);

    // Popup state for generated credentials
    const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);

    // WhatsApp popup state
    const [whatsappPopupData, setWhatsappPopupData] = useState<{ link: string, message: string } | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (user?.role === 'PDG') {
            api.get(`/institutions/ceo/${user.id}`)
                .then(res => {
                    setPdgInstitutions(res.data || []);
                    if (!selectedInstitutionId && res.data?.length > 0) {
                        setSelectedInstitutionId(res.data[0].id);
                        localStorage.setItem('selectedInstitutionId', res.data[0].id.toString());
                    }
                })
                .catch(console.error);
        }
    }, [user?.id, user?.role]);

    useEffect(() => {
        api.get('/cycles', { params: { institutionId } })
            .then(res => setCycles(res.data || []))
            .catch(() => console.error("Erreur cycle"));

        if (institutionId) {
            api.get('/classes', { params: { institutionId } })
                .then(res => setAllClasses(res.data || []))
                .catch(err => console.error(err));
        }
    }, [institutionId]);

    // Fetch Pending Students
    useEffect(() => {
        if (enrollType === 'ATTENTE') {
            fetchPendingStudents();
        }
    }, [enrollType]);

    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/students');
            const pending = (res.data || []).filter((s: any) => s.enrollmentStatus === 'PENDING_FEE');
            setPendingStudents(pending);
        } catch (error) {
            console.error("Erreur lors de la récupération des inscriptions en attente", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Classes and Subjects for Teachers
    useEffect(() => {
        const fetchData = async () => {
            if (enrollType === 'ENSEIGNANT') {
                if (teacherData.cycleIds.length > 0) {
                    try {
                        const classesPromises = teacherData.cycleIds.map((id: number) => api.get(`/classes/cycle/${id}`));
                        const classesResults = await Promise.all(classesPromises);
                        const allAvailableClasses = classesResults.flatMap(res => res.data || []);
                        setAvailableClasses(allAvailableClasses);

                        const subjectsPromises = teacherData.cycleIds.map((id: number) => api.get(`/subjects/cycle/${id}`));
                        const subjectsResults = await Promise.all(subjectsPromises);
                        const allAvailableSubjects = subjectsResults.flatMap(res => res.data || []);
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
    }, [teacherData.cycleIds, enrollType]);

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

    const handleDirectStudentSubmit = async () => {
        const hasFather = directStudentData.fatherFirstName && directStudentData.fatherPhone;
        const hasMother = directStudentData.motherFirstName && directStudentData.motherPhone;

        if (!hasFather && !hasMother) {
            setMessage({ type: 'error', text: 'Veuillez renseigner les informations (prénom et téléphone) d\'au moins un parent (Père ou Mère).' });
            return;
        }
        if (!directStudentData.classeId) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner une classe.' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });
            const payload = {
                firstName: directStudentData.firstName,
                lastName: directStudentData.lastName,
                gender: directStudentData.gender,
                birthDate: directStudentData.birthDate,
                classeId: Number(directStudentData.classeId),
                institutionId: institutionId ? Number(institutionId) : undefined,
                fatherFirstName: directStudentData.fatherFirstName,
                fatherLastName: directStudentData.fatherLastName,
                fatherPhone: directStudentData.fatherPhone,
                fatherEmail: directStudentData.fatherEmail,
                motherFirstName: directStudentData.motherFirstName,
                motherLastName: directStudentData.motherLastName,
                motherPhone: directStudentData.motherPhone,
                motherEmail: directStudentData.motherEmail
            };
            const res = await api.post('/students/enroll', payload);
            setMessage({ type: 'success', text: 'Élève inscrit avec succès et mis en attente de paiement !' });
            setDirectStudentData({
                firstName: '', lastName: '', gender: 'Masculin', birthDate: '', classeId: '',
                fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherEmail: '',
                motherFirstName: '', motherLastName: '', motherPhone: '', motherEmail: ''
            });

            setGeneratedCredentials(res.data);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'inscription.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendLink = async () => {
        const instId = institutionId;

        if (!instId || instId === 0) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner un établissement pour envoyer l\'invitation.' });
            return;
        }

        if (parentData.method === 'WHATSAPP') {
            if (!parentData.phone) {
                setMessage({ type: 'error', text: 'Veuillez renseigner le numéro WhatsApp du parent.' });
                return;
            }
            const schoolCode = encodeSchoolId(Number(instId));
            const nameGreeting = parentData.firstName ? ` ${parentData.firstName}` : '';

            const institution = user?.role === 'PDG' ? pdgInstitutions.find(inst => inst.id === Number(instId)) : user?.institution;
            const schoolName = institution?.name ? ` ${institution.name}` : '';

            const apkFilename = import.meta.env.VITE_APK_FILENAME || 'academia-connect-android.apk';
            const messageText = `Bonjour${nameGreeting},\n\nL'établissement${schoolName} vous invite à télécharger l'application ACADEMIA CONNECT pour procéder à l'inscription de votre enfant.\n\n📱 Lien de téléchargement :\nhttps://school.nb-mind.com/downloads/${apkFilename}\n\n🔑 Code de l'établissement :\n${schoolCode}\n\nAprès avoir créé votre compte, utilisez ce code depuis votre tableau de bord pour retrouver notre établissement et procéder à l'inscription de votre enfant. Merci.`;

            const waLink = `https://wa.me/${parentData.phone.replace(/\+/g, '')}?text=${encodeURIComponent(messageText)}`;

            setWhatsappPopupData({ link: waLink, message: messageText });
        } else {
            if (!parentData.email) {
                setMessage({ type: 'error', text: 'Veuillez renseigner l\'adresse email du parent.' });
                return;
            }
            try {
                setLoading(true);
                await api.post(`/institutions/${instId}/invite-parent`, {
                    firstName: parentData.firstName,
                    lastName: parentData.lastName,
                    email: parentData.email
                });
                setMessage({ type: 'success', text: 'Email d\'invitation envoyé avec succès en arrière-plan !' });
                setParentData({ firstName: '', lastName: '', phone: '', email: '', method: 'EMAIL' });
            } catch (error: any) {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email.' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-6">
                {user?.role === 'PDG' && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">Établissement :</label>
                        <select
                            value={selectedInstitutionId || ''}
                            onChange={(e) => {
                                const newId = Number(e.target.value);
                                setSelectedInstitutionId(newId);
                                localStorage.setItem('selectedInstitutionId', newId.toString());
                            }}
                            className="flex-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        >
                            <option value="" disabled>Sélectionnez un établissement...</option>
                            {pdgInstitutions.map((inst: any) => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex-wrap gap-1">
                    <button
                        onClick={() => { setEnrollType('LIEN_PARENT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${enrollType === 'LIEN_PARENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <MessageCircle size={16} /> Inviter un parent
                    </button>
                    <button
                        onClick={() => { setEnrollType('ATTENTE'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${enrollType === 'ATTENTE' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Clock size={16} /> Inscriptions en attente
                    </button>
                    <button
                        onClick={() => { setEnrollType('ENSEIGNANT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${enrollType === 'ENSEIGNANT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <BookOpen size={16} /> Nouvel Enseignant
                    </button>
                    <button
                        onClick={() => { setEnrollType('ELEVE_DIRECT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${enrollType === 'ELEVE_DIRECT' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <UserCheck size={16} /> Inscription Directe
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl font-bold text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}

                {/* ENVOI DE LIEN PARENT FORM */}
                {enrollType === 'LIEN_PARENT' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Inviter un parent à inscrire son enfant</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Prenez les informations du parent et envoyez-lui le lien de téléchargement et le code de l'école.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Prénom du parent" value={parentData.firstName} onChange={(e) => setParentData({ ...parentData, firstName: e.target.value })} />
                            <FormInput label="Nom du parent" value={parentData.lastName} onChange={(e) => setParentData({ ...parentData, lastName: e.target.value })} />

                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Méthode d'envoi</label>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setParentData({ ...parentData, method: 'WHATSAPP' })} className={`flex-1 py-2.5 font-bold text-xs rounded-xl border transition-all ${parentData.method === 'WHATSAPP' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}>WhatsApp</button>
                                    <button type="button" onClick={() => setParentData({ ...parentData, method: 'EMAIL' })} className={`flex-1 py-2.5 font-bold text-xs rounded-xl border transition-all ${parentData.method === 'EMAIL' ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}>Email</button>
                                </div>
                            </div>

                            {parentData.method === 'WHATSAPP' ? (
                                <div className="md:col-span-2">
                                    <FormInput label="Numéro WhatsApp (ex: +2250102030405)" value={parentData.phone} onChange={(e) => setParentData({ ...parentData, phone: e.target.value })} />
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <FormInput type="email" label="Adresse Email" placeholder="parent@email.com" value={parentData.email} onChange={(e) => setParentData({ ...parentData, email: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={handleSendLink} disabled={loading} className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 ${parentData.method === 'WHATSAPP' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {loading ? 'Traitement...' : (parentData.method === 'WHATSAPP' ? 'Générer l\'invitation WhatsApp' : 'Envoyer l\'email')}
                                {!loading && <MessageCircle size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* WHATSAPP POPUP MODAL */}
                {whatsappPopupData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <MessageCircle size={20} /> Invitation WhatsApp
                                </h3>
                                <button onClick={() => setWhatsappPopupData(null)} className="text-white/80 hover:text-white font-bold text-lg">×</button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                                    {whatsappPopupData.message}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(whatsappPopupData.message);
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                        className="flex-1 py-2.5 font-bold text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                        {isCopied ? 'Copié !' : 'Copier'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.open(whatsappPopupData.link, '_blank');
                                            setWhatsappPopupData(null);
                                            setParentData({ firstName: '', lastName: '', phone: '', email: '', method: 'WHATSAPP' });
                                            setMessage({ type: 'success', text: 'Redirection vers WhatsApp...' });
                                        }}
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* INSCRIPTIONS EN ATTENTE */}
                {enrollType === 'ATTENTE' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Validations de paiement</h3>

                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom..."
                                value={pendingSearchQuery}
                                onChange={(e) => {
                                    setPendingSearchQuery(e.target.value);
                                    setPendingCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white outline-none"
                            />
                        </div>

                        {loading && pendingStudents.length === 0 ? (
                            <p className="text-center text-slate-400 py-8 text-xs">Chargement...</p>
                        ) : pendingStudents.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic">Aucune inscription en attente de paiement.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(() => {
                                    const filteredPendingStudents = pendingStudents.filter(student => {
                                        const searchLower = pendingSearchQuery.toLowerCase();
                                        return (student.firstName?.toLowerCase() + ' ' + student.lastName?.toLowerCase()).includes(searchLower) ||
                                            (student.studentIdNumber && student.studentIdNumber.toLowerCase().includes(searchLower));
                                    });

                                    const totalPendingPages = Math.ceil(filteredPendingStudents.length / ITEMS_PER_PAGE);
                                    const paginatedPendingStudents = filteredPendingStudents.slice((pendingCurrentPage - 1) * ITEMS_PER_PAGE, pendingCurrentPage * ITEMS_PER_PAGE);

                                    return (
                                        <>
                                            {paginatedPendingStudents.map(student => (
                                                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl gap-3">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase">{student.firstName} {student.lastName}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Classe: {student.classe?.name || 'Non assignée'}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const rolePath = user?.role === 'PDG' ? 'pdg' : (user?.role === 'DIRECTION' || user?.role === 'PROVISORIAT') ? 'direction' : 'secretariat';
                                                            window.location.href = `/dashboard/${rolePath}/students?studentId=${student.id}&tab=finance`;
                                                        }}
                                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0"
                                                    >
                                                        <UserCheck size={16} /> Valider
                                                    </button>
                                                </div>
                                            ))}

                                            {totalPendingPages > 1 && (
                                                <div className="flex justify-center items-center gap-3 pt-4">
                                                    <button
                                                        disabled={pendingCurrentPage === 1}
                                                        onClick={() => setPendingCurrentPage(p => Math.max(1, p - 1))}
                                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >Précédent</button>
                                                    <span className="text-xs font-bold text-slate-500">Page {pendingCurrentPage} / {totalPendingPages}</span>
                                                    <button
                                                        disabled={pendingCurrentPage === totalPendingPages}
                                                        onClick={() => setPendingCurrentPage(p => Math.min(totalPendingPages, p + 1))}
                                                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold disabled:opacity-50"
                                                    >Suivant</button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* ENSEIGNANT FORM */}
                {enrollType === 'ENSEIGNANT' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Ajouter un enseignant</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Prénom" value={teacherData.firstName} onChange={(e) => setTeacherData({ ...teacherData, firstName: e.target.value })} />
                            <FormInput label="Nom" value={teacherData.lastName} onChange={(e) => setTeacherData({ ...teacherData, lastName: e.target.value })} />
                            <div className="md:col-span-2">
                                <FormInput label="Email institutionnel" type="email" placeholder="professeur@ecole.com" value={teacherData.email} onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })} />
                            </div>
                            <FormInput label="Téléphone" placeholder="+225 00 00 00 00" value={teacherData.phone} onChange={(e) => setTeacherData({ ...teacherData, phone: e.target.value })} />
                            <FormSelect label="Genre" options={['Masculin', 'Féminin']} value={teacherData.gender} onChange={(e) => setTeacherData({ ...teacherData, gender: e.target.value as any })} />

                            <div className="md:col-span-2">
                                <FormInput label="Mot de passe temporaire" value={teacherData.password} onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={handleTeacherSubmit} disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                                {loading ? 'Traitement...' : 'Enregistrer l\'enseignant'}
                                {!loading && <CheckCircle2 size={16} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* INSCRIPTION DIRECTE ELEVE */}
                {enrollType === 'ELEVE_DIRECT' && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Inscription Directe</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Prénom(s)" value={directStudentData.firstName} onChange={(e) => setDirectStudentData({ ...directStudentData, firstName: e.target.value })} />
                            <FormInput label="Nom" value={directStudentData.lastName} onChange={(e) => setDirectStudentData({ ...directStudentData, lastName: e.target.value })} />
                            <FormSelect label="Genre" options={['Masculin', 'Féminin']} value={directStudentData.gender} onChange={(e) => setDirectStudentData({ ...directStudentData, gender: e.target.value })} />
                            <FormInput label="Date de naissance" type="date" value={directStudentData.birthDate} onChange={(e) => setDirectStudentData({ ...directStudentData, birthDate: e.target.value })} />

                            <div className="md:col-span-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe demandée</label>
                                    <select
                                        value={directStudentData.classeId}
                                        onChange={(e) => setDirectStudentData({ ...directStudentData, classeId: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="" disabled>Sélectionner une classe...</option>
                                        {allClasses.map((cls: any) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <FormInput label="Prénom du père" value={directStudentData.fatherFirstName} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherFirstName: e.target.value })} />
                            <FormInput label="Nom du père" value={directStudentData.fatherLastName} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherLastName: e.target.value })} />
                            <FormInput label="Contact Père" value={directStudentData.fatherPhone} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherPhone: e.target.value })} />
                            <FormInput label="Email Père" type="email" value={directStudentData.fatherEmail} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherEmail: e.target.value })} />

                            <FormInput label="Prénom de la mère" value={directStudentData.motherFirstName} onChange={(e) => setDirectStudentData({ ...directStudentData, motherFirstName: e.target.value })} />
                            <FormInput label="Nom de la mère" value={directStudentData.motherLastName} onChange={(e) => setDirectStudentData({ ...directStudentData, motherLastName: e.target.value })} />
                            <FormInput label="Contact Mère" value={directStudentData.motherPhone} onChange={(e) => setDirectStudentData({ ...directStudentData, motherPhone: e.target.value })} />
                            <FormInput label="Email Mère" type="email" value={directStudentData.motherEmail} onChange={(e) => setDirectStudentData({ ...directStudentData, motherEmail: e.target.value })} />
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={handleDirectStudentSubmit} disabled={loading} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                                {loading ? 'Inscription en cours...' : 'Inscrire l\'élève'}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP GENERATED CREDENTIALS */}
            {generatedCredentials && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-5 space-y-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <UserCheck size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Inscription Réussie</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Identifiants générés à remettre aux parents.</p>
                        </div>

                        <div className="space-y-2 text-xs font-semibold">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                <p className="text-slate-400 uppercase text-[10px]">Compte Élève</p>
                                <p className="text-slate-800 dark:text-slate-200">Email: {generatedCredentials.email}</p>
                                <p className="text-slate-800 dark:text-slate-200">Mot de passe: Pass1234</p>
                            </div>

                            {generatedCredentials.fatherAccount && (
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                    <p className="text-slate-400 uppercase text-[10px]">Compte Père</p>
                                    <p className="text-slate-800 dark:text-slate-200">Email: {generatedCredentials.fatherAccount.email}</p>
                                    <p className="text-slate-800 dark:text-slate-200">Mot de passe: Parent123</p>
                                </div>
                            )}

                            {generatedCredentials.motherAccount && (
                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                                    <p className="text-slate-400 uppercase text-[10px]">Compte Mère</p>
                                    <p className="text-slate-800 dark:text-slate-200">Email: {generatedCredentials.motherAccount.email}</p>
                                    <p className="text-slate-800 dark:text-slate-200">Mot de passe: Parent123</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setGeneratedCredentials(null)}
                                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:w-80 space-y-4">
                <div className="bg-slate-900 p-5 rounded-2xl text-white border border-slate-800 shadow-sm space-y-3">
                    <h4 className="text-base font-bold flex items-center gap-2">
                        <Info size={18} className="text-blue-400" /> Processus d'inscription
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>1.</strong> Prenez le nom et prénom du parent, puis envoyez-lui le lien via WhatsApp.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>2.</strong> Le parent crée son compte et inscrit lui-même ses enfants.
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        <strong>3.</strong> Retrouvez les demandes dans "Inscriptions en attente" pour valider le paiement.
                    </p>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, type = "text", placeholder, value, onChange }: { label: string, type?: string, placeholder?: string, value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
        />
    </div>
);

const FormSelect = ({ label, options, value, onChange }: { label: string, options: string[], value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <select value={value} onChange={onChange} className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
            {(!value || value === "") && <option value="" disabled>Sélectionner...</option>}
            {options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

export default Enroll;
