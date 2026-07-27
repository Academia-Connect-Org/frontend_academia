import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../../api/axios';

interface StudentEnrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: any;
    setFormData: (data: any) => void;
    handleCreateOrUpdate: () => void;
    loading: boolean;
    cycles: any[];
    formFilteredClasses: any[];
    studentId?: number | null;
}

const StudentEnrollModal: React.FC<StudentEnrollModalProps> = ({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    handleCreateOrUpdate,
    loading,
    cycles,
    formFilteredClasses,
    studentId
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'finance'>('info');

    // Missing state for finance tab
    const [loadingInstallments, setLoadingInstallments] = useState(false);
    const [studentInstallments, setStudentInstallments] = useState<any[]>([]);
    const [payingInstallmentId, setPayingInstallmentId] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('ESPÈCES');
    const [isProcessingAction, setIsProcessingAction] = useState(false);


    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: () => void;
        onCancel?: () => void;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const showDialog = (type: 'confirm' | 'success' | 'error' | 'warning', title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
        setDialogState({ isOpen: true, type, title, message, onConfirm, onCancel });
    };

    const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }));

    const fetchInstallments = async () => {
        if (!studentId) return;
        setLoadingInstallments(true);
        try {
            const res = await api.get(`/finance/students/${studentId}/installments`);
            setStudentInstallments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingInstallments(false);
        }
    };

    // Simulate fetching installments when switching to finance tab or editing
    useEffect(() => {
        if (isEditing && activeTab === 'finance') {
            fetchInstallments();
        }
    }, [isEditing, activeTab, studentId]);

    const handleGenerateInstallments = async () => {
        if (!studentId) return;
        try {
            setLoadingInstallments(true);
            await api.post(`/finance/students/${studentId}/assign-plan`);
            showDialog('success', 'Succès', "Tranches générées avec succès.");
            fetchInstallments();
        } catch (error: any) {
            showDialog('error', 'Erreur', error.response?.data?.message || "Erreur lors de la génération");
        } finally {
            setLoadingInstallments(false);
        }
    };

    const handlePayInstallment = async (id: number, due: number, paid: number) => {
        const amountToPay = parseFloat(paymentAmount);
        if (isNaN(amountToPay) || amountToPay <= 0) {
            showDialog('error', 'Erreur', 'Montant invalide');
            return;
        }
        if (amountToPay > (due - paid)) {
            showDialog('error', 'Erreur', 'Le montant dépasse le reste à payer');
            return;
        }

        try {
            setPayingInstallmentId(id);
            setIsProcessingAction(true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            await api.post(`/finance/installments/${id}/pay`, null, {
                params: { amount: amountToPay, paymentMethod: paymentMode }
            });
            showDialog('success', 'Succès', 'Paiement enregistré.');
            setPaymentAmount('');
            fetchInstallments();
        } catch (error: any) {
            showDialog('error', 'Erreur', error.response?.data?.message || 'Erreur lors du paiement.');
        } finally {
            setPayingInstallmentId(null);
            setIsProcessingAction(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-7xl flex flex-col max-h-[95vh] shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                {isProcessingAction && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-indigo-600/20"></div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest animate-pulse">Traitement en cours...</p>
                    </div>
                )}
                <div className="p-8 pb-4 shrink-0 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{isEditing ? "Mise à jour Dossier" : "Fiche d'Inscription"}</h3>
                            <p className="text-slate-400 text-sm mt-1 font-medium italic">Les champs avec * sont recommandés pour le suivi administratif.</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all hover:bg-red-50"><X size={24} /></button>
                    </div>

                    {isEditing && (
                        <div className="flex bg-slate-100 border-slate-200">
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>Informations & Scolarité</button>
                            <button onClick={() => setActiveTab('finance')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'finance' ? 'bg-white text-indigo-600 border-t-2 border-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>Finances & Frais</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeTab === 'info' || !isEditing ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <SectionTitle title="État Civil de l'Élève" />
                                <Input label="Prénom" value={formData.firstName} onChange={(v: string) => setFormData({ ...formData, firstName: v })} />
                                <Input label="Nom de famille" value={formData.lastName} onChange={(v: string) => setFormData({ ...formData, lastName: v })} />
                                <Input label="Email de l'élève (Si applicable)" type="email" placeholder="élève@école.com" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                                <Input label="Matricule / ID École" placeholder="MAT-2024-XXX" value={formData.studentIdNumber} onChange={(v: string) => setFormData({ ...formData, studentIdNumber: v })} />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sexe</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Masculin', 'Féminin'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`py-3.5 font-black text-xs transition-all ${formData.gender === g ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-400 hover:'}`}
                                            >
                                                {g.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Input label="Date de Naissance" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({ ...formData, birthDate: v })} />
                                <div className="col-span-full">
                                    <Input label="Adresse Résidentielle" placeholder="Quartier, Rue, Porte..." value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} />
                                </div>

                                <SectionTitle title="Parcours Scolaire" />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle d'affectation</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:"
                                        value={formData.cycleId}
                                        onChange={(e) => setFormData({ ...formData, cycleId: e.target.value, classeId: '' })}
                                    >
                                        <option value="">Choisir un cycle...</option>
                                        {cycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Niveau / Classe précis</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus: disabled:opacity-50"
                                        value={formData.classeId}
                                        disabled={!formData.cycleId}
                                        onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                                    >
                                        <option value="">Choisir une classe...</option>
                                        {formFilteredClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <SectionTitle title="Contacts Parents (Optionnels - Recommandés)" />
                                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6">
                                    <div className="space-y-4">
                                        <h5 className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">
                                            <span className="w-1.5 h-1.5 bg-rose-500"></span> Dossier Mère
                                        </h5>
                                        <Input label="Prénom" value={formData.motherFirstName} onChange={(v: string) => setFormData({ ...formData, motherFirstName: v })} />
                                        <Input label="Nom" value={formData.motherLastName} onChange={(v: string) => setFormData({ ...formData, motherLastName: v })} />
                                        <Input label="Email *" type="email" placeholder="mère@email.com" value={formData.motherEmail} onChange={(v: string) => setFormData({ ...formData, motherEmail: v })} />
                                        <Input label="Téléphone *" placeholder="+235 ..." value={formData.motherPhone} onChange={(v: string) => setFormData({ ...formData, motherPhone: v })} />
                                    </div>
                                    <div className="space-y-4 pl-8">
                                        <h5 className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">
                                            <span className="w-1.5 h-1.5 bg-blue-500"></span> Dossier Père
                                        </h5>
                                        <Input label="Prénom" value={formData.fatherFirstName} onChange={(v: string) => setFormData({ ...formData, fatherFirstName: v })} />
                                        <Input label="Nom" value={formData.fatherLastName} onChange={(v: string) => setFormData({ ...formData, fatherLastName: v })} />
                                        <Input label="Email *" type="email" placeholder="père@email.com" value={formData.fatherEmail} onChange={(v: string) => setFormData({ ...formData, fatherEmail: v })} />
                                        <Input label="Téléphone *" placeholder="+235 ..." value={formData.fatherPhone} onChange={(v: string) => setFormData({ ...formData, fatherPhone: v })} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button onClick={onClose} className="flex-1 py-5 font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all">Abandonner</button>
                                <button
                                    onClick={handleCreateOrUpdate}
                                    disabled={loading || !formData.firstName || !formData.lastName || !formData.classeId}
                                    className="flex-[2] py-5 bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 tracking-tight"
                                >
                                    {loading ? 'Enregistrement en cours...' : isEditing ? 'Appliquer les modifications' : 'Finaliser l\'inscription'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-50/20 rounded-xl">
                            {loadingInstallments ? (
                                <div className="py-20 text-center animate-pulse">
                                    <div className="w-12 h-12 bg-indigo-100 mx-auto mb-4 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Chargement des données financières...</p>
                                </div>
                            ) : studentInstallments.length === 0 ? (
                                <div className="py-20 text-center">
                                    <AlertCircle size={48} className="mx-auto text-slate-300 mb-4 stroke-[1]" />
                                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucune donnée financière</p>
                                    <p className="text-slate-400 text-sm mt-2 mb-6">L'élève n'est lié à aucun plan de paiement.</p>
                                    <button
                                        onClick={handleGenerateInstallments}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all text-sm"
                                    >
                                        Générer les tranches
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {studentInstallments.map((inst: any) => {
                                        const feeName = inst.feeType?.name || 'Autres';
                                        const isEnrollmentFee = feeName.toLowerCase().includes('inscription');
                                        const remaining = inst.dueAmount - inst.paidAmount;
                                        const isFullyPaid = remaining <= 0;
                                        const progress = Math.min(100, Math.max(0, (inst.paidAmount / inst.dueAmount) * 100)) || 0;

                                        return (
                                            <div key={inst.id} className="bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
                                                {isFullyPaid && (
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 pointer-events-none">
                                                        <CheckCircle2 size={80} className="text-emerald-500" />
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start z-10">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h5 className="font-black text-slate-800 uppercase tracking-tight text-lg">{feeName}</h5>
                                                            {isEnrollmentFee && <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">Frais unique</span>}
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            Échéance : {new Date(inst.dueDate).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-slate-800 tracking-tighter">{inst.dueAmount.toLocaleString()} <span className="text-sm text-slate-400">FCFA</span></p>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isFullyPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {isFullyPaid ? 'Soldé' : `Reste : ${remaining.toLocaleString()} FCFA`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="z-10">
                                                    <div className="w-full bg-slate-100 h-2 mt-2 overflow-hidden">
                                                        <div className={`h-full transition-all duration-1000 ${isFullyPaid ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>

                                                {!isFullyPaid && !isEnrollmentFee && (
                                                    <div className="pt-4 mt-2 border-t border-slate-100 z-10">
                                                        {payingInstallmentId === inst.id ? (
                                                            <div className="bg-slate-50 p-4 flex flex-col gap-4 animate-in fade-in zoom-in-95">
                                                                <div className="flex gap-4">
                                                                    <div className="flex-1 space-y-1.5">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Montant à encaisser (Max {remaining})</label>
                                                                        <input
                                                                            type="number"
                                                                            value={paymentAmount}
                                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                                            className="w-full px-4 py-3 bg-white text-sm font-bold text-slate-700 outline-none border border-slate-200 focus:border-indigo-500"
                                                                            placeholder={remaining.toString()}
                                                                            max={remaining}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 space-y-1.5">
                                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode de paiement</label>
                                                                        <select
                                                                            value={paymentMode}
                                                                            onChange={(e) => setPaymentMode(e.target.value)}
                                                                            className="w-full px-4 py-3 bg-white text-sm font-bold text-slate-700 outline-none border border-slate-200 focus:border-indigo-500 appearance-none"
                                                                        >
                                                                            <option value="ESPÈCES">Espèces</option>
                                                                            <option value="VIREMENT">Virement Bancaire</option>
                                                                            <option value="CHÈQUE">Chèque</option>
                                                                            <option value="MOBILE_MONEY">Mobile Money</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setPayingInstallmentId(null)} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all">Annuler</button>
                                                                    <button onClick={() => handlePayInstallment(inst.id, inst.dueAmount, inst.paidAmount)} className="flex-[2] py-3 text-xs font-black bg-indigo-600 text-white uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all">Valider l'encaissement</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setPayingInstallmentId(inst.id);
                                                                    setPaymentAmount(remaining.toString());
                                                                    setPaymentMode('ESPÈCES');
                                                                }}
                                                                className="w-full py-3 bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                                            >
                                                                Encaisser un paiement
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {dialogState.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
                    <div className="bg-white max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                            dialogState.type === 'confirm' ? 'bg-amber-100 text-amber-600' :
                            dialogState.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            dialogState.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                            'bg-rose-100 text-rose-600'
                        }`}>
                            {dialogState.type === 'confirm' && <AlertCircle size={24} />}
                            {dialogState.type === 'success' && <CheckCircle2 size={24} />}
                            {dialogState.type === 'warning' && <AlertCircle size={24} />}
                            {dialogState.type === 'error' && <X size={24} />}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-2">{dialogState.title}</h3>
                        <p className="text-sm text-slate-500 mb-6">{dialogState.message}</p>
                        <div className="flex gap-3 justify-end">
                            {dialogState.onCancel && (
                                <button onClick={dialogState.onCancel} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest transition-colors">
                                    Annuler
                                </button>
                            )}
                            {dialogState.onConfirm && (
                                <button onClick={dialogState.onConfirm} className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors ${
                                    dialogState.type === 'confirm' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                    dialogState.type === 'error' ? 'bg-rose-600 hover:bg-rose-700' :
                                    dialogState.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                                    'bg-emerald-600 hover:bg-emerald-700'
                                }`}>
                                    Confirmer
                                </button>
                            )}
                            {!dialogState.onConfirm && !dialogState.onCancel && (
                                <button onClick={closeDialog} className={`px-4 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors ${
                                    dialogState.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                    'bg-rose-600 hover:bg-rose-700'
                                }`}>
                                    Fermer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// UI Helpers
const SectionTitle = ({ title }: { title: string }) => (
    <div className="col-span-full mt-6 first:mt-0 flex items-center gap-4">
        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">
            {title}
        </h4>
        <div className="h-px bg-slate-100 flex-1"></div>
    </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder = '' }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-6 py-4 bg-slate-50 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300 shadow-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default StudentEnrollModal;
