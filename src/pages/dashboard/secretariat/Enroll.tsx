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

    const handleValidateEnrollment = async (studentId: number) => {
        try {
            setLoading(true);
            await api.put(`/students/${studentId}/validate-enrollment`);
            setMessage({ type: 'success', text: 'Inscription validée avec succès ! Le reçu a été généré.' });
            fetchPendingStudents();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la validation.' });
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

            // Show popup with generated credentials
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

            const messageText = `Bonjour${nameGreeting},\n\nL'établissement${schoolName} vous invite à télécharger l'application ACADEMIA CONNECT pour procéder à l'inscription de votre enfant.\n\n📱 Lien de téléchargement :\nhttps://school.nb-mind.com/downloads/academia-connect-android.apk\n\n🔑 Code de l'établissement :\n${schoolCode}\n\nAprès avoir créé votre compte, utilisez ce code depuis votre tableau de bord pour retrouver notre établissement et procéder à l'inscription de votre enfant. Merci.`;

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
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                {user?.role === 'PDG' && (
                    <div className="mb-6 bg-white p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Établissement :</label>
                        <select
                            value={selectedInstitutionId || ''}
                            onChange={(e) => {
                                const newId = Number(e.target.value);
                                setSelectedInstitutionId(newId);
                                localStorage.setItem('selectedInstitutionId', newId.toString());
                            }}
                            className="flex-1 w-full bg-slate-50 border border-slate-200 p-2 text-slate-700 font-bold focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Sélectionnez un établissement...</option>
                            {pdgInstitutions.map((inst: any) => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex bg-white p-2 shadow-sm mb-8 w-fit flex-wrap">
                    <button
                        onClick={() => { setEnrollType('LIEN_PARENT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${enrollType === 'LIEN_PARENT' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <MessageCircle size={20} /> Inviter un parent
                    </button>
                    <button
                        onClick={() => { setEnrollType('ATTENTE'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${enrollType === 'ATTENTE' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Clock size={20} /> Inscriptions en attente
                    </button>
                    <button
                        onClick={() => { setEnrollType('ENSEIGNANT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${enrollType === 'ENSEIGNANT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <BookOpen size={20} /> Nouvel Enseignant
                    </button>
                    <button
                        onClick={() => { setEnrollType('ELEVE_DIRECT'); setMessage({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-6 py-3 font-bold transition-all ${enrollType === 'ELEVE_DIRECT' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UserCheck size={20} /> Inscription Directe (Élève)
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 mb-6 font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                {/* ENVOI DE LIEN PARENT FORM */}
                {enrollType === 'LIEN_PARENT' && (
                    <div className="bg-white p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 relative z-10">Inviter un parent à inscrire son enfant</h3>
                        <p className="text-sm text-slate-500 mb-8 relative z-10">Prenez les informations du parent et envoyez-lui le lien de téléchargement et le code de l'école.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            <FormInput label="Prénom du parent" value={parentData.firstName} onChange={(e) => setParentData({ ...parentData, firstName: e.target.value })} />
                            <FormInput label="Nom du parent" value={parentData.lastName} onChange={(e) => setParentData({ ...parentData, lastName: e.target.value })} />

                            <div className="md:col-span-2 mt-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Méthode d'envoi</label>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setParentData({ ...parentData, method: 'WHATSAPP' })} className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all ${parentData.method === 'WHATSAPP' ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>WhatsApp</button>
                                    <button type="button" onClick={() => setParentData({ ...parentData, method: 'EMAIL' })} className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all ${parentData.method === 'EMAIL' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}>Email (Arrière-plan)</button>
                                </div>
                            </div>

                            {parentData.method === 'WHATSAPP' ? (
                                <div className="md:col-span-2">
                                    <FormInput label="Numéro WhatsApp (avec indicatif, ex: +2250102030405)" value={parentData.phone} onChange={(e) => setParentData({ ...parentData, phone: e.target.value })} />
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <FormInput type="email" label="Adresse Email" placeholder="parent@email.com" value={parentData.email} onChange={(e) => setParentData({ ...parentData, email: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end relative z-10">
                            <button onClick={handleSendLink} disabled={loading} className={`inline-flex items-center gap-2 px-8 py-3 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 ${parentData.method === 'WHATSAPP' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
                                {loading ? 'Traitement...' : (parentData.method === 'WHATSAPP' ? 'Générer l\'invitation WhatsApp' : 'Envoyer l\'email')}
                                {!loading && <MessageCircle size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* WHATSAPP POPUP MODAL */}
                {whatsappPopupData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-full">
                                        <MessageCircle size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-black">Invitation WhatsApp</h3>
                                </div>
                                <button onClick={() => setWhatsappPopupData(null)} className="text-white/70 hover:text-white transition-colors">
                                    ×
                                </button>
                            </div>

                            <div className="p-6">
                                <p className="text-sm text-slate-500 mb-4">Voici le message généré. Vous pouvez l'envoyer directement ou le copier.</p>

                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto mb-6 font-medium">
                                    {whatsappPopupData.message}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(whatsappPopupData.message);
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        }}
                                        className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isCopied ? 'bg-emerald-100 text-emerald-700 scale-[1.02]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                    >
                                        {isCopied ? <Check size={18} className="animate-in zoom-in duration-300" /> : <Copy size={18} />}
                                        {isCopied ? 'Copié !' : 'Copier le texte'}
                                    </button>

                                    <button
                                        onClick={() => {
                                            window.open(whatsappPopupData.link, '_blank');
                                            setWhatsappPopupData(null);
                                            setParentData({ firstName: '', lastName: '', phone: '', email: '', method: 'WHATSAPP' });
                                            setMessage({ type: 'success', text: 'Redirection vers WhatsApp...' });
                                        }}
                                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={18} /> Envoyer via WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* INSCRIPTIONS EN ATTENTE */}
                {enrollType === 'ATTENTE' && (
                    <div className="bg-white p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
                        <h3 className="text-xl font-black text-slate-800 mb-4">Validations de paiement (Frais d'inscription)</h3>
                        <p className="text-sm text-slate-500 mb-6">Validez les inscriptions des élèves dont les parents ont déjà effectué le processus via l'application mobile et qui viennent payer physiquement.</p>

                        <div className="mb-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher par nom de l'élève..."
                                value={pendingSearchQuery}
                                onChange={(e) => {
                                    setPendingSearchQuery(e.target.value);
                                    setPendingCurrentPage(1); // Reset page on search
                                }}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
                            />
                        </div>

                        {loading && pendingStudents.length === 0 ? (
                            <p className="text-center text-slate-400 py-8">Chargement...</p>
                        ) : pendingStudents.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <Clock size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">Aucune inscription en attente de paiement.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
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
                                                <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all rounded-xl gap-4">
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{student.firstName} {student.lastName}</h4>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3">
                                                            <div className="text-xs text-slate-600 flex flex-col gap-1">
                                                                <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Informations Élève</span>
                                                                <span>Classe demandée: <strong className="text-slate-800">{student.classe?.name || 'Non assignée'}</strong></span>
                                                                <span>Demande soumise le: <strong className="text-slate-800">{student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</strong></span>
                                                            </div>

                                                            <div className="text-xs text-slate-600 flex flex-col gap-1">
                                                                <span className="font-black text-slate-400 uppercase tracking-widest text-[9px]">Contacts Parents</span>
                                                                {student.motherFirstName ? (
                                                                    <span>Mère: <strong className="text-slate-800">{student.motherFirstName} {student.motherLastName}</strong> {student.motherPhone ? `(${student.motherPhone})` : ''}</span>
                                                                ) : null}
                                                                {student.fatherFirstName ? (
                                                                    <span>Père: <strong className="text-slate-800">{student.fatherFirstName} {student.fatherLastName}</strong> {student.fatherPhone ? `(${student.fatherPhone})` : ''}</span>
                                                                ) : null}
                                                                {(!student.motherFirstName && !student.fatherFirstName) && (
                                                                    <span className="italic text-slate-400">Aucun parent renseigné</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const rolePath = user?.role === 'PDG' ? 'pdg' : (user?.role === 'DIRECTION' || user?.role === 'PROVISORIAT') ? 'direction' : 'secretariat';
                                                            window.location.href = `/dashboard/${rolePath}/students?studentId=${student.id}&tab=finance`;
                                                        }}
                                                        className="px-6 py-3 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                                                    >
                                                        <UserCheck size={18} /> Valider
                                                    </button>
                                                </div>
                                            ))}

                                            {filteredPendingStudents.length === 0 && pendingStudents.length > 0 && (
                                                <p className="text-center text-slate-400 py-8">Aucun élève trouvé avec ce nom.</p>
                                            )}

                                            {totalPendingPages > 1 && (
                                                <div className="flex justify-center items-center gap-4 mt-8">
                                                    <button
                                                        disabled={pendingCurrentPage === 1}
                                                        onClick={() => setPendingCurrentPage(p => Math.max(1, p - 1))}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
                                                    >Précédent</button>
                                                    <span className="text-xs font-bold text-slate-500">Page {pendingCurrentPage} sur {totalPendingPages}</span>
                                                    <button
                                                        disabled={pendingCurrentPage === totalPendingPages}
                                                        onClick={() => setPendingCurrentPage(p => Math.min(totalPendingPages, p + 1))}
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs transition-colors"
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
                    <div className="bg-white p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
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
                                <div className="flex flex-wrap gap-2 p-2 bg-slate-50">
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
                                                className={`px-3 py-1.5 text-xs font-bold transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {cycle.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécialités / Matières</label>
                                <div className="flex flex-wrap gap-2 p-2 bg-slate-50">
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
                                                className={`px-3 py-1.5 text-xs font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                {subj.name}
                                            </button>
                                        )
                                    })}
                                    {availableSubjects.length === 0 && teacherData.cycleIds.length > 0 && (
                                        <p className="text-[10px] text-slate-400 italic p-1">Aucune matière trouvée</p>
                                    )}
                                    {teacherData.cycleIds.length === 0 && (
                                        <p className="text-[10px] text-slate-400 italic p-1">Choisissez d'abord un cycle</p>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="Ajouter manuellement..."
                                        value={teacherData.specialties}
                                        onChange={(e) => setTeacherData({ ...teacherData, specialties: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 text-xs font-bold text-slate-700 focus:bg-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Classes attribuées</label>
                                <div className="min-h-[54px] w-full px-5 py-3 bg-slate-50 flex flex-wrap gap-2 items-center">
                                    {teacherData.classes ? (
                                        teacherData.classes.split(',').map((s: string) => s.trim()).filter(Boolean).map((cls: string, idx: number) => (
                                            <span key={idx} className="bg-indigo-600 text-white px-3 py-1 text-xs font-bold flex items-center gap-2">
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
                                        <span className="text-slate-400 text-sm">Sélectionnez les classes ci-dessous...</span>
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
                                                className={`px-3 py-1.5 text-xs font-bold transition-all border ${isSelected ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:border-indigo-600'}`}
                                            >
                                                + {c.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <FormInput label="Mot de passe temporaire" value={teacherData.password} onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 flex justify-end">
                            <button onClick={handleTeacherSubmit} disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100">
                                {loading ? 'Traitement...' : 'Enregistrer l\'enseignant'}
                                {!loading && <CheckCircle2 size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* INSCRIPTION DIRECTE ELEVE */}
                {enrollType === 'ELEVE_DIRECT' && (
                    <div className="bg-white p-8 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/50 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h3 className="text-xl font-black text-slate-800 mb-4 relative z-10">Inscription Directe par l'Administration</h3>
                        <p className="text-sm text-slate-500 mb-8 relative z-10">Inscrivez directement un élève. Un compte parent sera automatiquement créé si nécessaire.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                                <h4 className="font-bold text-slate-700">Informations de l'Élève</h4>
                            </div>
                            <FormInput label="Prénom(s)" value={directStudentData.firstName} onChange={(e) => setDirectStudentData({ ...directStudentData, firstName: e.target.value })} />
                            <FormInput label="Nom" value={directStudentData.lastName} onChange={(e) => setDirectStudentData({ ...directStudentData, lastName: e.target.value })} />
                            <FormSelect label="Genre" options={['Masculin', 'Féminin']} value={directStudentData.gender} onChange={(e) => setDirectStudentData({ ...directStudentData, gender: e.target.value })} />
                            <FormInput label="Date de naissance" type="date" value={directStudentData.birthDate} onChange={(e) => setDirectStudentData({ ...directStudentData, birthDate: e.target.value })} />

                            <div className="md:col-span-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe demandée</label>
                                    <select
                                        value={directStudentData.classeId}
                                        onChange={(e) => setDirectStudentData({ ...directStudentData, classeId: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-purple-600/5 transition-all outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Sélectionner une classe...</option>
                                        {allClasses.map((cls: any) => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                                <h4 className="font-bold text-slate-700">Informations du Père (Optionnel si mère renseignée)</h4>
                            </div>
                            <FormInput label="Prénom du père" value={directStudentData.fatherFirstName} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherFirstName: e.target.value })} />
                            <FormInput label="Nom du père" value={directStudentData.fatherLastName} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherLastName: e.target.value })} />
                            <FormInput label="Contact (Téléphone)" value={directStudentData.fatherPhone} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherPhone: e.target.value })} />
                            <FormInput label="Email (Facultatif)" type="email" value={directStudentData.fatherEmail} onChange={(e) => setDirectStudentData({ ...directStudentData, fatherEmail: e.target.value })} />

                            <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                                <h4 className="font-bold text-slate-700">Informations de la Mère (Optionnel si père renseigné)</h4>
                            </div>
                            <FormInput label="Prénom de la mère" value={directStudentData.motherFirstName} onChange={(e) => setDirectStudentData({ ...directStudentData, motherFirstName: e.target.value })} />
                            <FormInput label="Nom de la mère" value={directStudentData.motherLastName} onChange={(e) => setDirectStudentData({ ...directStudentData, motherLastName: e.target.value })} />
                            <FormInput label="Contact (Téléphone)" value={directStudentData.motherPhone} onChange={(e) => setDirectStudentData({ ...directStudentData, motherPhone: e.target.value })} />
                            <FormInput label="Email (Facultatif)" type="email" value={directStudentData.motherEmail} onChange={(e) => setDirectStudentData({ ...directStudentData, motherEmail: e.target.value })} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end relative z-10">
                            <button onClick={handleDirectStudentSubmit} disabled={loading} className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 shadow-purple-600/20 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:scale-100">
                                {loading ? 'Inscription en cours...' : 'Inscrire l\'élève'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* POPUP GENERATED CREDENTIALS */}
            {generatedCredentials && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserCheck size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black">Inscription Réussie</h3>
                            <p className="text-purple-100 mt-1 opacity-90">Voici les identifiants générés à remettre aux parents.</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">Compte Élève</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Email:</span>
                                        <strong className="text-slate-800 font-mono">{generatedCredentials.email}</strong>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-slate-500">Mot de passe:</span>
                                        <strong className="text-slate-800 font-mono">Pass1234</strong>
                                    </div>
                                </div>

                                {generatedCredentials.fatherAccount && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">Compte Père</h4>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Email:</span>
                                            <strong className="text-slate-800 font-mono">{generatedCredentials.fatherAccount.email}</strong>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-slate-500">Mot de passe:</span>
                                            <strong className="text-slate-800 font-mono">Parent123</strong>
                                        </div>
                                    </div>
                                )}

                                {generatedCredentials.motherAccount && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wide">Compte Mère</h4>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Email:</span>
                                            <strong className="text-slate-800 font-mono">{generatedCredentials.motherAccount.email}</strong>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-slate-500">Mot de passe:</span>
                                            <strong className="text-slate-800 font-mono">Parent123</strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        let textToCopy = `IDENTIFIANTS ACADEMIA CONNECT\n\n`;
                                        textToCopy += `--- ÉLÈVE ---\nEmail: ${generatedCredentials.email}\nMot de passe: Pass1234\n\n`;
                                        if (generatedCredentials.fatherAccount) {
                                            textToCopy += `--- PÈRE ---\nEmail: ${generatedCredentials.fatherAccount.email}\nMot de passe: Parent123\n\n`;
                                        }
                                        if (generatedCredentials.motherAccount) {
                                            textToCopy += `--- MÈRE ---\nEmail: ${generatedCredentials.motherAccount.email}\nMot de passe: Parent123\n\n`;
                                        }
                                        textToCopy += `Connectez-vous sur l'application mobile ou sur school.nb-mind.com`;
                                        navigator.clipboard.writeText(textToCopy);
                                        const btn = document.getElementById('copy-credentials-btn');
                                        if (btn) {
                                            const originalText = btn.innerText;
                                            btn.innerText = "Copié avec succès !";
                                            btn.classList.add('bg-emerald-600');
                                            btn.classList.remove('bg-slate-800', 'hover:bg-slate-900');
                                            setTimeout(() => {
                                                btn.innerText = originalText;
                                                btn.classList.remove('bg-emerald-600');
                                                btn.classList.add('bg-slate-800', 'hover:bg-slate-900');
                                            }, 2000);
                                        }
                                    }}
                                    id="copy-credentials-btn"
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md"
                                >
                                    Copier tout
                                </button>
                                <button
                                    onClick={() => setGeneratedCredentials(null)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:w-80 space-y-6">
                <div className="bg-slate-900 p-8 text-white shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl"></div>
                    <h4 className="text-lg font-black mb-4 flex items-center gap-2 relative z-10">
                        <Info size={18} className="text-blue-400" /> Processus d'inscription
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
                        <strong>1.</strong> Prenez le nom et prénom du parent, puis envoyez-lui le lien de l'application mobile via WhatsApp.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
                        <strong>2.</strong> Le parent installe l'application, crée son compte, puis inscrit lui-même ses enfants.
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                        <strong>3.</strong> Retrouvez les enfants inscrits dans "Inscriptions en attente" et validez leur paiement lorsqu'ils paient physiquement.
                    </p>
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, type = "text", placeholder, value, onChange }: { label: string, type?: string, placeholder?: string, value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
        />
    </div>
);

const FormSelect = ({ label, options, value, onChange }: { label: string, options: string[], value?: string, onChange?: (e: any) => void }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full px-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all outline-none appearance-none cursor-pointer">
            {(!value || value === "") && <option value="" disabled>Sélectionner...</option>}
            {options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

export default Enroll;
