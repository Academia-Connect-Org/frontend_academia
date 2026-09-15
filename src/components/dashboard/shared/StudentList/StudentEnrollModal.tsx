import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Key, Eye, EyeOff, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
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

    const [loadingInstallments, setLoadingInstallments] = useState(false);
    const [studentInstallments, setStudentInstallments] = useState<any[]>([]);
    const [payingInstallmentId, setPayingInstallmentId] = useState<number | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('ESPÈCES');
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    // Password modification state
    const [newPasswordInput, setNewPasswordInput] = useState<string>('');
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [savingPassword, setSavingPassword] = useState<boolean>(false);
    const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
    const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setPasswordSuccessMsg(null);
            setPasswordErrorMsg(null);
            setNewPasswordInput('');
        }
    }, [isOpen]);

    const handleUpdateStudentPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;
        if (!newPasswordInput || newPasswordInput.trim().length < 4) {
            setPasswordErrorMsg("Le mot de passe doit comporter au moins 4 caractères.");
            return;
        }
        setPasswordErrorMsg(null);
        setPasswordSuccessMsg(null);
        setSavingPassword(true);
        try {
            await api.put(`/students/${studentId}/password`, { newPassword: newPasswordInput });
            setPasswordSuccessMsg("Mot de passe mis à jour avec succès !");
            setNewPasswordInput('');
        } catch (err: any) {
            setPasswordErrorMsg(err.response?.data?.message || err.response?.data || "Erreur lors de la modification du mot de passe.");
        } finally {
            setSavingPassword(false);
        }
    };

    const generateRandomPassword = () => {
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let pwd = "";
        for (let i = 0; i < 8; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPasswordInput(pwd);
        setShowNewPassword(true);
    };

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
            setStudentInstallments(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingInstallments(false);
        }
    };

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
            await new Promise(resolve => setTimeout(resolve, 1500));
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                {isProcessingAction && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md z-[200] flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Traitement en cours...</p>
                    </div>
                )}
                <div className="p-5 sm:p-6 shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing ? "Mise à jour Dossier" : "Fiche d'Inscription"}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Les champs avec * sont recommandés pour le suivi administratif.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {isEditing && (
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('info')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'info' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Informations & Scolarité</button>
                            <button onClick={() => setActiveTab('finance')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'finance' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Finances & Frais</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTab === 'info' || !isEditing ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SectionTitle title="État Civil de l'Élève" />
                                <Input label="Prénom" value={formData.firstName} onChange={(v: string) => setFormData({ ...formData, firstName: v })} />
                                <Input label="Nom de famille" value={formData.lastName} onChange={(v: string) => setFormData({ ...formData, lastName: v })} />
                                <Input label="Email de l'élève (Si applicable)" type="email" placeholder="élève@école.com" value={formData.email} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                                <Input label="Matricule / ID École" placeholder="MAT-2024-XXX" value={formData.studentIdNumber} onChange={(v: string) => setFormData({ ...formData, studentIdNumber: v })} />

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sexe</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Masculin', 'Féminin'].map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={`py-2.5 rounded-xl font-bold text-xs transition-colors ${formData.gender === g ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            >
                                                {g.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Input label="Date de Naissance" type="date" value={formData.birthDate} onChange={(v: string) => setFormData({ ...formData, birthDate: v })} />
                                <div className="sm:col-span-2">
                                    <Input label="Adresse Résidentielle" placeholder="Quartier, Rue, Porte..." value={formData.address} onChange={(v: string) => setFormData({ ...formData, address: v })} />
                                </div>

                                <SectionTitle title="Parcours Scolaire" />
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle d'affectation</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={formData.cycleId}
                                        onChange={(e) => setFormData({ ...formData, cycleId: e.target.value, classeId: '' })}
                                    >
                                        <option value="">Choisir un cycle...</option>
                                        {cycles.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Niveau / Classe précis</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                        value={formData.classeId}
                                        disabled={!formData.cycleId}
                                        onChange={(e) => setFormData({ ...formData, classeId: e.target.value })}
                                    >
                                        <option value="">Choisir une classe...</option>
                                        {formFilteredClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <SectionTitle title="Contacts Parents (Optionnels)" />
                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Dossier Mère</h5>
                                        <Input label="Prénom" value={formData.motherFirstName} onChange={(v: string) => setFormData({ ...formData, motherFirstName: v })} />
                                        <Input label="Nom" value={formData.motherLastName} onChange={(v: string) => setFormData({ ...formData, motherLastName: v })} />
                                        <Input label="Email *" type="email" placeholder="mère@email.com" value={formData.motherEmail} onChange={(v: string) => setFormData({ ...formData, motherEmail: v })} />
                                        <Input label="Téléphone *" placeholder="+235 ..." value={formData.motherPhone} onChange={(v: string) => setFormData({ ...formData, motherPhone: v })} />
                                    </div>
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Dossier Père</h5>
                                        <Input label="Prénom" value={formData.fatherFirstName} onChange={(v: string) => setFormData({ ...formData, fatherFirstName: v })} />
                                        <Input label="Nom" value={formData.fatherLastName} onChange={(v: string) => setFormData({ ...formData, fatherLastName: v })} />
                                        <Input label="Email *" type="email" placeholder="père@email.com" value={formData.fatherEmail} onChange={(v: string) => setFormData({ ...formData, fatherEmail: v })} />
                                        <Input label="Téléphone *" placeholder="+235 ..." value={formData.fatherPhone} onChange={(v: string) => setFormData({ ...formData, fatherPhone: v })} />
                                    </div>
                                </div>

                                {isEditing && studentId && (
                                    <>
                                        <SectionTitle title="Accès & Sécurité Élève" />
                                        <div className="sm:col-span-2">
                                            <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-indigo-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                        <Key size={16} />
                                                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                                            Modifier le Mot de Passe Élève
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={generateRandomPassword}
                                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 transition-all cursor-pointer"
                                                        title="Générer un mot de passe aléatoire sécurisé"
                                                    >
                                                        <RefreshCw size={12} /> Auto-générer
                                                    </button>
                                                </div>

                                                {passwordSuccessMsg && (
                                                    <div className="p-2.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                                        <div className="flex items-center gap-1.5">
                                                            <CheckCircle2 size={14} /> {passwordSuccessMsg}
                                                        </div>
                                                    </div>
                                                )}

                                                {passwordErrorMsg && (
                                                    <div className="p-2.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-red-200 dark:border-red-800">
                                                        <AlertCircle size={14} /> {passwordErrorMsg}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-1">
                                                        <input
                                                            type={showNewPassword ? "text" : "password"}
                                                            placeholder="Saisir un nouveau mot de passe..."
                                                            value={newPasswordInput}
                                                            onChange={(e) => setNewPasswordInput(e.target.value)}
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2.5 pr-16 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-white"
                                                        />
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                            {newPasswordInput && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(newPasswordInput);
                                                                        setCopiedPassword(true);
                                                                        setTimeout(() => setCopiedPassword(false), 2000);
                                                                    }}
                                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                                                    title="Copier le mot de passe"
                                                                >
                                                                    {copiedPassword ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                                                            >
                                                                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={handleUpdateStudentPassword}
                                                        disabled={savingPassword || !newPasswordInput}
                                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                                                    >
                                                        {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                                                        Changer le mot de passe
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Abandonner</button>
                                <button
                                    onClick={handleCreateOrUpdate}
                                    disabled={loading || !formData.firstName || !formData.lastName || !formData.classeId}
                                    className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Enregistrement...' : isEditing ? 'Appliquer les modifications' : 'Finaliser l\'inscription'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                            {loadingInstallments ? (
                                <div className="py-16 text-center">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">Chargement des données financières...</p>
                                </div>
                            ) : studentInstallments.length === 0 ? (
                                <div className="py-16 text-center">
                                    <AlertCircle size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <p className="text-slate-800 dark:text-white font-bold text-sm">Aucune donnée financière</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4">L'élève n'est lié à aucun plan de paiement.</p>
                                    <button
                                        onClick={handleGenerateInstallments}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                                    >
                                        Générer les tranches
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {studentInstallments.map((inst: any) => {
                                        const feeName = inst.feeType?.name || 'Autres';
                                        const remaining = inst.dueAmount - inst.paidAmount;
                                        const isFullyPaid = remaining <= 0;
                                        const progress = Math.min(100, Math.max(0, (inst.paidAmount / inst.dueAmount) * 100)) || 0;

                                        return (
                                            <div key={inst.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{feeName}</h5>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            Échéance : {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('fr-FR') : '—'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-black text-slate-900 dark:text-white">{(inst.dueAmount || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span></p>
                                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                            {isFullyPaid ? 'Soldé' : `Reste : ${(remaining || 0).toLocaleString()} FCFA`}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-700 ${isFullyPaid ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                                                </div>

                                                {!isFullyPaid && (
                                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                        {payingInstallmentId === inst.id ? (
                                                            <div className="flex flex-col gap-2">
                                                                <input
                                                                    type="number"
                                                                    value={paymentAmount}
                                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                                    placeholder={remaining.toString()}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => setPayingInstallmentId(null)} className="flex-1 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">Annuler</button>
                                                                    <button onClick={() => handlePayInstallment(inst.id, inst.dueAmount, inst.paidAmount)} className="flex-1 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">Valider</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setPayingInstallmentId(inst.id);
                                                                    setPaymentAmount(remaining.toString());
                                                                    setPaymentMode('ESPÈCES');
                                                                }}
                                                                className="w-full py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
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
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{dialogState.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{dialogState.message}</p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={closeDialog} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <div className="sm:col-span-2 mt-4 first:mt-0 flex items-center gap-2">
        <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider whitespace-nowrap">
            {title}
        </h4>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
    </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder = '' }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default StudentEnrollModal;
