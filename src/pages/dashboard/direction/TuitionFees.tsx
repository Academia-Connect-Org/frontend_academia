import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Layers, School, Trash2, CheckCircle2, AlertCircle, X, Save, Loader2, Copy, Calendar, History, RefreshCw } from 'lucide-react';
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
    const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
    const [institution, setInstitution] = useState<any>(null);
    const [isSavingFee, setIsSavingFee] = useState(false);
    const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
    const [confirmDeleteFeeType, setConfirmDeleteFeeType] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

    // State for Duplication Modal
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [sourceYearId, setSourceYearId] = useState<string>('');
    const [isDuplicating, setIsDuplicating] = useState(false);

    const [feeTypes, setFeeTypes] = useState<any[]>([]);
    const [feeTypeForm, setFeeTypeForm] = useState<{ id: number | null, name: string, description: string }>({ id: null, name: '', description: '' });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        totalAmount: 0,
        targetType: 'CLASSE',
        cycleId: '',
        classeId: '',
        targetStudentCategory: 'ALL',
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
            setFeeTypes(res.data || []);
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
            const years = yearsRes.data || [];
            const activeYear = years.find((y: any) => y.isActive || y.isCurrent || y.current) || years[0];
            setCurrentYear(activeYear);
            if (activeYear) {
                setSelectedYearId(activeYear.id);
            }
            setAcademicYears(years);
            setCycles(cyclesRes.data || []);
            setClasses(classesRes.data || []);
            setFeeTypes(feeTypesRes.data || []);

            // Default source year for duplication modal (first year that is not current)
            const previousYear = years.find((y: any) => y.id !== activeYear?.id);
            if (previousYear) {
                setSourceYearId(String(previousYear.id));
            }

            if (activeYear) {
                fetchPlans(activeYear.id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicatePlans = async () => {
        const targetId = selectedYearId || currentYear?.id;
        if (!sourceYearId || !targetId) return;
        
        setIsDuplicating(true);
        try {
            const res = await api.post('/finance/plans/duplicate', null, {
                params: {
                    institutionId: activeInstitutionId,
                    sourceAcademicYearId: sourceYearId,
                    targetAcademicYearId: targetId
                }
            });
            const count = res.data?.length || 0;
            if (count > 0) {
                setMessage({ type: 'success', text: `${count} plan(s) de paiement ont été dupliqués avec succès pour l'année sélectionnée.` });
            } else {
                setMessage({ type: 'error', text: "Tous les plans de l'année sélectionnée existent déjà ou l'année source ne contient aucun plan." });
            }
            setIsDuplicateModalOpen(false);
            fetchPlans(targetId);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la duplication des plans.' });
        } finally {
            setIsDuplicating(false);
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
            setPlans(res.data || []);
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
            totalAmount: plan.totalAmount || 0,
            targetType: plan.classe ? 'CLASSE' : 'CYCLE',
            cycleId: plan.cycle?.id || '',
            classeId: plan.classe?.id || '',
            targetStudentCategory: plan.targetStudentCategory || 'ALL',
            fees: plan.fees?.map((f: any) => ({
                feeTypeId: f.feeType?.id || '',
                amount: f.amount || 0,
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
                targetStudentCategory: formData.targetStudentCategory || 'ALL',
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
                name: '', description: '', totalAmount: 0, targetType: 'CLASSE', cycleId: '', classeId: '', targetStudentCategory: 'ALL',
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
            name: '', description: '', totalAmount: 0, targetType: 'CLASSE', cycleId: '', classeId: '', targetStudentCategory: 'ALL',
            fees: [{ feeTypeId: '', amount: 0, startDate: '', dueDate: '' }]
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {!hideLayout ? (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Frais de scolarité</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gérez les plans de paiement et les tranches par classe.</p>
                    </div>
                ) : <div />}
                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                    {academicYears.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm">
                            <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Année :</span>
                            <select
                                value={selectedYearId || currentYear?.id || ''}
                                onChange={(e) => {
                                    const yearId = Number(e.target.value);
                                    setSelectedYearId(yearId);
                                    fetchPlans(yearId);
                                }}
                                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                            >
                                {academicYears.map((ay: any) => (
                                    <option key={ay.id} value={ay.id} className="dark:bg-slate-900">
                                        {ay.name} {ay.isCurrent || ay.isActive ? '(En cours)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {academicYears.length > 1 && (
                        <button
                            onClick={() => {
                                const targetId = selectedYearId || currentYear?.id;
                                const otherYear = academicYears.find((y: any) => y.id !== targetId);
                                if (otherYear) setSourceYearId(String(otherYear.id));
                                setIsDuplicateModalOpen(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Copy size={15} className="text-blue-600 dark:text-blue-400" /> Dupliquer d'une année
                        </button>
                    )}
                    <button
                        onClick={handleOpenNewPlan}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                        <Plus size={16} /> Nouveau Plan
                    </button>
                </div>
            </div>

            {/* Fee Types Management */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layers size={20} className="text-blue-600 dark:text-blue-400" />
                        Types de Frais
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Définissez les différents types de frais (ex: Frais d'inscription, Frais de scolarité, Tenue de sport).
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                            {feeTypeForm.id ? <><CreditCard size={14} /> Modifier le type</> : <><Plus size={14} /> Nouveau type</>}
                        </h4>
                        <form onSubmit={handleSaveFeeType} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom du frais</label>
                                <input type="text" required value={feeTypeForm.name} onChange={e => setFeeTypeForm({ ...feeTypeForm, name: e.target.value })}
                                    placeholder="ex: Frais d'inscription" className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Optionnel)</label>
                                <textarea rows={2} value={feeTypeForm.description} onChange={e => setFeeTypeForm({ ...feeTypeForm, description: e.target.value })}
                                    placeholder="Courte description" className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none resize-none" />
                            </div>
                            <div className="flex gap-2 pt-1">
                                {feeTypeForm.id && (
                                    <button type="button" onClick={() => setFeeTypeForm({ id: null, name: '', description: '' })} className="flex-1 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 transition-colors">
                                        Annuler
                                    </button>
                                )}
                                <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md">
                                    <Save size={14} /> {feeTypeForm.id ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {feeTypes.map(ft => (
                                <div key={ft.id} className="bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-xl flex flex-col justify-between group">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-xs text-slate-900 dark:text-white">{ft.name}</div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setFeeTypeForm(ft)} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded text-xs font-bold">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDeleteFeeType(ft.id)} className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {ft.description && (
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">
                                            {ft.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {feeTypes.length === 0 && (
                                <div className="col-span-full py-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                    <Layers size={28} className="mx-auto mb-2 opacity-50" />
                                    <span className="text-xs font-semibold">Aucun type de frais configuré.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl font-bold text-xs flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={16} /></button>
                </div>
            )}

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des plans...</p>
                </div>
            ) : plans.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CreditCard size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucun plan de paiement</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Configurez les frais de scolarité pour permettre l'inscription des élèves.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                    {plan.description && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            {plan.classe ? <><School size={12} /> Classe: {plan.classe.name}</> : <><Layers size={12} /> Cycle: {plan.cycle?.name}</>}
                                        </div>
                                        {plan.targetStudentCategory === 'NEW_STUDENT' && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">Nouveaux élèves</span>
                                        )}
                                        {plan.targetStudentCategory === 'RETURNING_STUDENT' && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">Anciens élèves</span>
                                        )}
                                        {(!plan.targetStudentCategory || plan.targetStudentCategory === 'ALL') && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Tous les élèves</span>
                                        )}
                                    </div>
                                </div>
                                <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 text-xs font-bold rounded-lg uppercase">
                                    {(plan.totalAmount || 0).toLocaleString()} FCFA
                                </span>
                            </div>

                            <div className="space-y-2 mt-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tranches ({plan.fees?.length || 0})</h4>
                                <div className="space-y-1.5">
                                    {plan.fees?.map((f: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                                            <span className="text-slate-600 dark:text-slate-400">Tranche {idx + 1}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{(f.amount || 0).toLocaleString()} FCFA</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                <button
                                    onClick={() => handleEditPlan(plan)}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => setConfirmDelete({ isOpen: true, id: plan.id })}
                                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-2 py-1 flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Supprimer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white dark:bg-slate-900 z-20 border-b border-slate-100 dark:border-slate-800 p-5 flex justify-between items-center">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingPlanId ? 'Modifier le Plan de Paiement' : 'Nouveau Plan de Paiement'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom du plan / type de frais</label>
                                        <select required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                            <option value="">Sélectionner le type de frais principal</option>
                                            {feeTypes.map(ft => (
                                                <option key={ft.id} value={ft.name}>{ft.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Optionnel)</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="ex: Concerne les frais pour la tenue de sport..." rows={2} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none resize-none" />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Appliquer à</label>
                                        <select value={formData.targetType} onChange={e => setFormData({ ...formData, targetType: e.target.value, cycleId: '', classeId: '' })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                            <option value="CLASSE">Une Classe spécifique</option>
                                            <option value="CYCLE">Tout un Cycle</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catégorie d'élève</label>
                                        <select value={formData.targetStudentCategory} onChange={e => setFormData({ ...formData, targetStudentCategory: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                            <option value="ALL">Tous les élèves (Nouveaux & Anciens)</option>
                                            <option value="NEW_STUDENT">Nouveaux élèves uniquement</option>
                                            <option value="RETURNING_STUDENT">Anciens élèves uniquement</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        {formData.targetType === 'CLASSE' ? (
                                            <>
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe</label>
                                                <select required value={formData.classeId} onChange={e => setFormData({ ...formData, classeId: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                                    <option value="">Sélectionner une classe</option>
                                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle</label>
                                                <select required value={formData.cycleId} onChange={e => setFormData({ ...formData, cycleId: e.target.value })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none">
                                                    <option value="">Sélectionner un cycle</option>
                                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Définition des Tranches</h4>
                                        <button type="button" onClick={handleAddFee} className="text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
                                            <Plus size={14} /> Ajouter une tranche
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.fees.map((inst, index) => (
                                            <div key={index} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <div className="flex-1 min-w-[120px]">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Montant (FCFA)</label>
                                                    <input type="number" required min="0" value={inst.amount} onChange={e => handleFeeChange(index, 'amount', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                                </div>
                                                <div className="flex-1 min-w-[120px]">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date début</label>
                                                    <input type="date" value={inst.startDate} onChange={e => handleFeeChange(index, 'startDate', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                                </div>
                                                <div className="flex-1 min-w-[120px]">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date limite</label>
                                                    <input type="date" value={inst.dueDate} onChange={e => handleFeeChange(index, 'dueDate', e.target.value)}
                                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none" />
                                                </div>
                                                {formData.fees.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveFee(index)} className="mt-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-900/50">
                                    <span className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase">Montant Total :</span>
                                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">{formData.totalAmount.toLocaleString()} FCFA</span>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmittingPlan} className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50">
                                        Annuler
                                    </button>
                                    <button type="submit" disabled={isSubmittingPlan} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50">
                                        {isSubmittingPlan ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer le plan ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                Cette action est irréversible. Les tranches associées aux élèves seront également affectées.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                                    className="flex-1 py-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button onClick={handleDeletePlan}
                                    className="flex-1 py-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors">
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {confirmDeleteFeeType.isOpen && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer le type de frais ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce type de frais ? S'il est déjà utilisé dans des plans de paiement, la suppression pourrait échouer.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmDeleteFeeType({ isOpen: false, id: null })}
                                    className="flex-1 py-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button onClick={executeDeleteFeeType}
                                    className="flex-1 py-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors">
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isDuplicateModalOpen && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Copy className="text-blue-600 dark:text-blue-400" size={20} />
                                    Dupliquer les plans de paiement
                                </h3>
                                <button onClick={() => setIsDuplicateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                Copiez l'ensemble des plans de paiement (et leurs tranches) d'une année scolaire précédente vers l'année scolaire sélectionnée. Les types de frais seront réutilisés et les dates d'échéance réajustées automatiquement.
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Année d'origine (Source) :</label>
                                    <select
                                        value={sourceYearId}
                                        onChange={(e) => setSourceYearId(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    >
                                        {academicYears
                                            .filter((ay: any) => ay.id !== (selectedYearId || currentYear?.id))
                                            .map((ay: any) => (
                                                <option key={ay.id} value={ay.id}>
                                                    {ay.name} {ay.isClosed ? '(Clôturée)' : ''}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                                    <Calendar size={16} className="shrink-0 mt-0.5" />
                                    <div>
                                        <strong>Année de destination :</strong>{' '}
                                        {academicYears.find((y: any) => y.id === (selectedYearId || currentYear?.id))?.name || 'Sélectionnée'}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsDuplicateModalOpen(false)}
                                    disabled={isDuplicating}
                                    className="px-4 py-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDuplicatePlans}
                                    disabled={isDuplicating || !sourceYearId}
                                    className="px-4 py-2 font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isDuplicating ? <Loader2 className="animate-spin" size={16} /> : <Copy size={16} />}
                                    {isDuplicating ? 'Duplication...' : 'Dupliquer les plans'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TuitionFees;
