import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Layers, School, Trash2, CheckCircle2, AlertCircle, X, Save, Loader2 } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TuitionFeesProps {
    institutionId?: number;
    hideLayout?: boolean;
}

const TuitionFees: React.FC<TuitionFeesProps> = ({ institutionId: propInstId, hideLayout }) => {
    const { user } = useAuth();
    const activeInstitutionId = propInstId || user?.institution?.id;
    const [plans, setPlans] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [currentYear, setCurrentYear] = useState<any>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [isSavingFee, setIsSavingFee] = useState(false);
    const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
    const [confirmDeleteFeeType, setConfirmDeleteFeeType] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

    const [feeTypes, setFeeTypes] = useState<any[]>([]);
    const [feeTypeForm, setFeeTypeForm] = useState<{ id: number | null, name: string, description: string }>({ id: null, name: '', description: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        totalAmount: 0,
        targetType: 'CLASSE', // 'CYCLE' or 'CLASSE'
        cycleId: '',
        classeId: '',
        fees: [{ feeTypeId: '', amount: 0, startDate: '', dueDate: '' }]
    });

    useEffect(() => {
        if (activeInstitutionId) {
            fetchInitialData();
        }
    }, [activeInstitutionId]);

    const fetchFeeTypes = async () => {
        try {
            const res = await api.get('/finance/fee-types', { params: { institutionId: activeInstitutionId } });
            setFeeTypes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [instRes, yearsRes, cyclesRes, classesRes, feeTypesRes] = await Promise.all([
                api.get(`/institutions/${activeInstitutionId}`),
                api.get(`/academic-years/institution/${activeInstitutionId}`),
                api.get('/cycles', { params: { institutionId: activeInstitutionId } }),
                api.get('/classes', { params: { institutionId: activeInstitutionId } }),
                api.get('/finance/fee-types', { params: { institutionId: activeInstitutionId } })
            ]);

            setInstitution(instRes.data);
            const activeYear = yearsRes.data.find((y: any) => y.isActive || y.isCurrent || y.current);
            setCurrentYear(activeYear);
            setAcademicYears(yearsRes.data);
            setCycles(cyclesRes.data);
            setClasses(classesRes.data);
            setFeeTypes(feeTypesRes.data);

            if (activeYear) {
                fetchPlans(activeYear.id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFeeType = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingFee(true);
        try {
            if (feeTypeForm.id) {
                await api.put(`/finance/fee-types/${feeTypeForm.id}`, feeTypeForm);
            } else {
                await api.post('/finance/fee-types', { ...feeTypeForm, institution: { id: activeInstitutionId } });
            }
            setMessage({ type: 'success', text: 'Type de frais enregistré.' });
            setFeeTypeForm({ id: null, name: '', description: '' });
            fetchFeeTypes();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        } finally {
            setIsSavingFee(false);
        }
    };

    const handleDeleteFeeType = (id: number) => {
        setConfirmDeleteFeeType({ isOpen: true, id });
    };

    const executeDeleteFeeType = async () => {
        if (!confirmDeleteFeeType.id) return;
        try {
            await api.delete(`/finance/fee-types/${confirmDeleteFeeType.id}`);
            setMessage({ type: 'success', text: 'Type de frais supprimé.' });
            fetchFeeTypes();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        } finally {
            setConfirmDeleteFeeType({ isOpen: false, id: null });
        }
    };

    const fetchPlans = async (yearId: number) => {
        try {
            const res = await api.get('/finance/plans', {
                params: { institutionId: activeInstitutionId, academicYearId: yearId }
            });
            setPlans(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddFee = () => {
        setFormData({ ...formData, fees: [...formData.fees, { feeTypeId: '', amount: 0, startDate: '', dueDate: '' }] });
    };

    const handleRemoveFee = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fees: prev.fees.filter((_, i) => i !== index)
        }));
    };

    const handleFeeChange = (index: number, field: string, value: any) => {
        const newFees = [...formData.fees];
        newFees[index] = { ...newFees[index], [field]: value };

        // Auto update total
        const newTotal = newFees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

        setFormData(prev => ({
            ...prev,
            fees: newFees,
            totalAmount: newTotal
        }));
    };

    const formatDateForInput = (date: any) => {
        if (!date) return '';
        if (Array.isArray(date)) {
            const [year, month, day] = date;
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (typeof date === 'string') {
            return date.split('T')[0];
        }
        return '';
    };

    const handleEditPlan = (plan: any) => {
        setMessage({ type: '', text: '' });
        setEditingPlanId(plan.id);
        setFormData({
            name: plan.name,
            description: plan.description || '',
            totalAmount: plan.totalAmount,
            targetType: plan.classe ? 'CLASSE' : 'CYCLE',
            cycleId: plan.cycle?.id || '',
            classeId: plan.classe?.id || '',
            fees: plan.fees?.map((f: any) => ({
                feeTypeId: f.feeType?.id || '',
                amount: f.amount,
                startDate: formatDateForInput(f.startDate),
                dueDate: formatDateForInput(f.dueDate)
            })) || []
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentYear) {
            setMessage({ type: 'error', text: 'Aucune année académique active.' });
            return;
        }

        const totalFees = formData.fees.reduce((sum, f) => sum + Number(f.amount), 0);
        if (totalFees !== Number(formData.totalAmount)) {
            setMessage({ type: 'error', text: 'La somme des tranches doit être égale au montant total.' });
            return;
        }

        for (let i = 0; i < formData.fees.length; i++) {
            const fee = formData.fees[i];
            
            if (fee.startDate && fee.dueDate) {
                if (fee.startDate > fee.dueDate) {
                    setMessage({ type: 'error', text: `Tranche ${i + 1} : la date de début ne peut pas être après la date de fin.` });
                    return;
                }
            }

            if (i > 0) {
                const prevFee = formData.fees[i - 1];
                if (fee.startDate && prevFee.startDate && prevFee.startDate > fee.startDate) {
                    setMessage({ type: 'error', text: `Tranche ${i + 1} : la date de début ne peut pas être avant celle de la tranche ${i}.` });
                    return;
                }
                if (fee.dueDate && prevFee.dueDate && prevFee.dueDate > fee.dueDate) {
                    setMessage({ type: 'error', text: `Tranche ${i + 1} : la date de fin ne peut pas être avant celle de la tranche ${i}.` });
                    return;
                }
            }
        }

        setIsSubmittingPlan(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                totalAmount: formData.totalAmount,
                institution: { id: activeInstitutionId },
                academicYear: { id: currentYear.id },
                cycle: formData.targetType === 'CYCLE' && formData.cycleId ? { id: formData.cycleId } : null,
                classe: formData.targetType === 'CLASSE' && formData.classeId ? { id: formData.classeId } : null,
                fees: formData.fees.map(f => {
                    const selectedFeeType = feeTypes.find(ft => ft.name === formData.name);
                    return {
                        feeType: { id: selectedFeeType ? selectedFeeType.id : null },
                        amount: Number(f.amount),
                        startDate: f.startDate || null,
                        dueDate: f.dueDate || null
                    };
                })
            };

            if (editingPlanId) {
                await api.put(`/finance/plans/${editingPlanId}`, payload);
                setMessage({ type: 'success', text: 'Plan de paiement mis à jour avec succès.' });
            } else {
                await api.post('/finance/plans', payload);
                setMessage({ type: 'success', text: 'Plan de paiement enregistré avec succès.' });
            }

            setIsModalOpen(false);
            setEditingPlanId(null);
            fetchPlans(currentYear.id);
            setFormData({
                name: '', description: '', totalAmount: 0, targetType: 'CLASSE', cycleId: '', classeId: '',
                fees: [{ feeTypeId: '', amount: 0, startDate: '', dueDate: '' }]
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        } finally {
            setIsSubmittingPlan(false);
        }
    };

    const handleDeletePlan = async () => {
        if (!confirmDelete.id) return;
        try {
            await api.delete(`/finance/plans/${confirmDelete.id}`);
            setMessage({ type: 'success', text: 'Plan de paiement supprimé avec succès.' });
            if (currentYear) {
                fetchPlans(currentYear.id);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression du plan.' });
        } finally {
            setConfirmDelete({ isOpen: false, id: null });
        }
    };

    const handleOpenNewPlan = () => {
        setMessage({ type: '', text: '' });
        setEditingPlanId(null);
        setFormData({
            name: '',
            description: '',
            totalAmount: 0,
            targetType: 'CLASSE',
            cycleId: '',
            classeId: '',
            fees: [{ feeTypeId: '', amount: 0, startDate: '', dueDate: '' }]
        });
        setIsModalOpen(true);
    };

    return (
        <>
            {!hideLayout && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Frais de scolarité</h2>
                        <p className="text-slate-500 font-medium mt-1">Gérez les plans de paiement et les tranches par classe.</p>
                    </div>
                    <button
                        onClick={handleOpenNewPlan}
                        className="bg-indigo-600 text-white px-6 py-3 font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} /> Nouveau Plan de Paiement
                    </button>
                </div>
            )}
            {hideLayout && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleOpenNewPlan}
                        className="bg-indigo-600 text-white px-6 py-3 font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} /> Nouveau Plan de Paiement
                    </button>
                </div>
            )}

            {/* Fee Types Management */}
            <div className="bg-white p-6 md:p-8 shadow-lg shadow-slate-200/50 mb-10 border-l-4 border-indigo-600">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Layers size={24} className="text-indigo-600" />
                        Types de Frais
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Définissez les différents types de frais (ex: Frais d'inscription, Frais de scolarité, Tenue de sport).
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            {feeTypeForm.id ? <><CreditCard size={18} /> Modifier le type</> : <><Plus size={18} /> Nouveau type</>}
                        </h4>
                        <form onSubmit={handleSaveFeeType} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nom du frais</label>
                                <input type="text" required value={feeTypeForm.name} onChange={e => setFeeTypeForm({ ...feeTypeForm, name: e.target.value })}
                                    placeholder="ex: Frais d'inscription" className="w-full p-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 transition-all text-sm font-bold text-slate-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Description (Optionnel)</label>
                                <textarea rows={3} value={feeTypeForm.description} onChange={e => setFeeTypeForm({ ...feeTypeForm, description: e.target.value })}
                                    placeholder="Courte description" className="w-full p-2.5 bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600 transition-all text-sm resize-none custom-scrollbar" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                {feeTypeForm.id && (
                                    <button type="button" onClick={() => setFeeTypeForm({ id: null, name: '', description: '' })} className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors">
                                        Annuler
                                    </button>
                                )}
                                <button type="submit" className="flex-1 px-4 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                                    <Save size={16} /> {feeTypeForm.id ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {feeTypes.map(ft => (
                                <div key={ft.id} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col hover:border-indigo-400 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="font-black text-slate-800 break-words flex-1 min-w-0 pr-2">{ft.name}</div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button onClick={() => setFeeTypeForm(ft)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-bold">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDeleteFeeType(ft.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    {ft.description && (
                                        <div className="text-slate-500 text-xs mt-2 font-medium leading-relaxed break-words break-all whitespace-pre-wrap">
                                            {ft.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {feeTypes.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                    <Layers size={32} className="mx-auto mb-3 text-slate-300" />
                                    <span className="font-medium text-sm">Aucun type de frais configuré.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-6 font-bold flex items-center justify-between shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                >
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={20} /></button>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>
            ) : plans.length === 0 ? (
                <div className="bg-white p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <CreditCard size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Aucun plan de paiement</h3>
                    <p className="text-slate-500">Configurez les frais de scolarité pour permettre l'inscription des élèves.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                                    {plan.description && (
                                        <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                                    )}
                                    <div className="text-sm font-medium text-indigo-600 flex items-center gap-1 mt-1">
                                        {plan.classe ? <><School size={14} /> Classe: {plan.classe.name}</> : <><Layers size={14} /> Cycle: {plan.cycle?.name}</>}
                                    </div>
                                </div>
                                <div className="bg-slate-100 text-slate-600 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                                    {plan.totalAmount.toLocaleString()} FCFA
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tranches ({plan.fees?.length || 0})</h4>
                                <div className="space-y-2">
                                    {plan.fees?.map((f: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm font-bold bg-slate-50 p-2 rounded">
                                            <span>Tranche {idx + 1}</span>
                                            <span className="font-bold text-slate-900">{f.amount.toLocaleString()} FCFA</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    onClick={() => handleEditPlan(plan)}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 transition-colors flex items-center gap-1"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, id: plan.id })}
                                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="sticky top-0 bg-white z-20 border-b border-slate-100 shadow-sm">
                                <div className="p-6 flex justify-between items-center">
                                    <h3 className="text-xl font-black text-slate-800">{editingPlanId ? 'Modifier le Plan de Paiement' : 'Nouveau Plan de Paiement'}</h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                                </div>
                                {message.text && message.type === 'error' && (
                                    <div className="bg-red-50 text-red-600 p-4 px-6 font-bold flex items-start gap-3 border-t border-red-100">
                                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                        <span>{message.text}</span>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nom du plan / type de frais</label>
                                        <select required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border-none font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all">
                                            <option value="">Sélectionner le type de frais principal</option>
                                            {feeTypes.map(ft => (
                                                <option key={ft.id} value={ft.name}>{ft.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Description (Optionnel)</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="ex: Concerne les frais pour la tenue de sport..." rows={2} className="w-full p-3 bg-slate-50 border-none font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Appliquer à</label>
                                        <select value={formData.targetType} onChange={e => setFormData({ ...formData, targetType: e.target.value, cycleId: '', classeId: '' })}
                                            className="w-full p-3 bg-slate-50 border-none font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all">
                                            <option value="CLASSE">Une Classe spécifique</option>
                                            <option value="CYCLE">Tout un Cycle</option>
                                        </select>
                                    </div>

                                    <div>
                                        {formData.targetType === 'CLASSE' ? (
                                            <>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Classe</label>
                                                <select required value={formData.classeId} onChange={e => setFormData({ ...formData, classeId: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 border-none font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all">
                                                    <option value="">Sélectionner une classe</option>
                                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Cycle</label>
                                                <select required value={formData.cycleId} onChange={e => setFormData({ ...formData, cycleId: e.target.value })}
                                                    className="w-full p-3 bg-slate-50 border-none font-medium focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-all">
                                                    <option value="">Sélectionner un cycle</option>
                                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-sm font-bold text-slate-800">Définition des Tranches</h4>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleAddFee} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline ml-4">
                                                <Plus size={16} /> Ajouter une tranche
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.fees.map((inst, index) => (
                                            <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 border border-slate-100">

                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Montant (FCFA)</label>
                                                    <input type="number" required min="0" value={inst.amount} onChange={e => handleFeeChange(index, 'amount', e.target.value)}
                                                        className="w-full p-2 bg-white border border-slate-200" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date de début (optionnel)</label>
                                                    <input type="date" value={inst.startDate} onChange={e => handleFeeChange(index, 'startDate', e.target.value)}
                                                        className="w-full p-2 bg-white border border-slate-200" />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">Date limite</label>
                                                    <input type="date" value={inst.dueDate} onChange={e => handleFeeChange(index, 'dueDate', e.target.value)}
                                                        className="w-full p-2 bg-white border border-slate-200" />
                                                </div>
                                                {formData.fees.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveFee(index)} className="mt-5 text-red-500 hover:bg-red-50 p-2 rounded">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-indigo-50 p-4 rounded flex justify-between items-center">
                                    <span className="font-bold text-indigo-900">Montant Total :</span>
                                    <span className="text-xl font-black text-indigo-700">{formData.totalAmount.toLocaleString()} FCFA</span>
                                </div>

                                <div className="pt-6 flex justify-end gap-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmittingPlan} className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={isSubmittingPlan} className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isSubmittingPlan ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {isSubmittingPlan ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmDelete.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Supprimer le plan ?</h3>
                            <p className="text-slate-500 font-medium mb-6">
                                Cette action est irréversible. Les tranches associées aux élèves seront également affectées.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={handleDeletePlan}
                                    className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modal Suppression Fee Type */}
                {confirmDeleteFeeType.isOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Supprimer le type de frais ?</h3>
                            <p className="text-slate-500 font-medium mb-6">
                                Êtes-vous sûr de vouloir supprimer ce type de frais ? S'il est déjà utilisé dans des plans de paiement, la suppression pourrait échouer.
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setConfirmDeleteFeeType({ isOpen: false, id: null })}
                                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={executeDeleteFeeType}
                                    className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TuitionFees;
