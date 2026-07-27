import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Calendar, CheckCircle2, Lock, Plus, AlertCircle, Loader2 } from 'lucide-react';

const AcademicYears: React.FC = () => {
    const { user } = useAuth();
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newYearForm, setNewYearForm] = useState({ name: '', startDate: '', endDate: '' });
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, type: 'ACTIVATE' | 'CLOSE', id: number, message: string } | null>(null);

    const activeInstitutionId = user?.institution?.id || selectedInstitutionId;

    useEffect(() => {
        if (!user?.institution?.id && user?.role === 'PDG') {
            api.get('/institutions').then(res => setInstitutions(res.data)).catch(console.error);
        }
    }, [user]);

    const fetchYears = async () => {
        if (!activeInstitutionId) return;
        setLoading(true);
        try {
            const res = await api.get(`/academic-years/institution/${activeInstitutionId}`);
            setYears(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des années scolaires');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeInstitutionId) {
            fetchYears();
        } else {
            setYears([]);
        }
    }, [activeInstitutionId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!activeInstitutionId) {
            setError("Veuillez sélectionner un établissement d'abord.");
            return;
        }
        try {
            await api.post('/academic-years', {
                ...newYearForm,
                institution: { id: activeInstitutionId }
            });
            setShowCreateModal(false);
            setNewYearForm({ name: '', startDate: '', endDate: '' });
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleActivate = (id: number) => {
        setConfirmModal({
            isOpen: true,
            type: 'ACTIVATE',
            id,
            message: "Voulez-vous vraiment activer cette année scolaire ? Les autres années actives seront désactivées."
        });
    };

    const executeActivate = async (id: number) => {
        setActionLoading(id);
        setError(null);
        try {
            await api.post(`/academic-years/${id}/activate`);
            fetchYears();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de l\'activation');
        } finally {
            setActionLoading(null);
            setConfirmModal(null);
        }
    };

    const handleClose = (id: number) => {
        setConfirmModal({
            isOpen: true,
            type: 'CLOSE',
            id,
            message: "ATTENTION : La clôture de l'année va calculer les moyennes de tous les élèves et statuer sur leur admission (Admis/Échoué). Cette action est IRREVERSIBLE. Voulez-vous continuer ?"
        });
    };

    const executeClose = async (id: number) => {
        setActionLoading(id);
        setError(null);
        try {
            await api.post(`/academic-years/${id}/close`);
            fetchYears();
            // Optional: You could show a success toast here instead of alert
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la clôture');
        } finally {
            setActionLoading(null);
            setConfirmModal(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Années Scolaires & Clôture</h2>
                    <p className="text-slate-500 font-medium">Gérez vos années scolaires, l'archivage annuel et le passage des élèves.</p>
                </div>
                <button
                    onClick={() => {
                        if (!activeInstitutionId) {
                            setError("Veuillez d'abord sélectionner un établissement pour y créer une année scolaire.");
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Nouvelle Année
                </button>
            </div>

            {!user?.institution?.id && user?.role === 'PDG' && (
                <div className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 flex items-center gap-4">
                    <label className="font-bold text-slate-700">Établissement :</label>
                    <select
                        className="bg-slate-50 border-none rounded-xl px-4 py-2 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedInstitutionId || ''}
                        onChange={(e) => setSelectedInstitutionId(Number(e.target.value) || null)}
                    >
                        <option value="">-- Sélectionner un établissement --</option>
                        {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-medium">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <th className="px-8 py-6">Année Scolaire</th>
                                <th className="px-8 py-6">Période</th>
                                <th className="px-8 py-6 text-center">Statut</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold"><Loader2 className="animate-spin inline-block mr-2" /> Chargement...</td></tr>
                            ) : years.length > 0 ? (
                                years.map((year: any) => (
                                    <tr key={year.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${(year.isActive || year.current || year.isCurrent) ? 'bg-emerald-50 text-emerald-600' : year.isClosed ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {year.isClosed ? <Lock size={18} /> : <Calendar size={18} />}
                                                </div>
                                                <span className="font-black text-slate-800 text-lg">{year.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-500 font-bold">
                                            {year.startDate} <span className="mx-2 text-slate-300">→</span> {year.endDate}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {year.isClosed ? (
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                                    <Lock size={12} /> Clôturée
                                                </span>
                                            ) : (year.isActive || year.current || year.isCurrent) ? (
                                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                                                    En Attente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            {!year.isClosed && !(year.isActive || year.current || year.isCurrent) && (
                                                <button
                                                    onClick={() => handleActivate(year.id)}
                                                    disabled={actionLoading === year.id}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-xs hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === year.id ? 'Activation...' : 'Activer'}
                                                </button>
                                            )}
                                            {(year.isActive || year.current || year.isCurrent) && !year.isClosed && (
                                                <button
                                                    onClick={() => handleClose(year.id)}
                                                    disabled={actionLoading === year.id}
                                                    className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === year.id ? 'Clôture...' : 'Clôturer l\'année'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">Aucune année scolaire trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Nouvelle Année Scolaire</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Nom (ex: 2024-2025)</label>
                                <input
                                    type="text"
                                    required
                                    value={newYearForm.name}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, name: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={newYearForm.startDate}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, startDate: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1 mb-2">Date de fin</label>
                                <input
                                    type="date"
                                    required
                                    value={newYearForm.endDate}
                                    onChange={(e) => setNewYearForm({ ...newYearForm, endDate: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-700"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all">
                                    Créer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {confirmModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 text-center">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${confirmModal.type === 'CLOSE' ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Confirmation</h3>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setConfirmModal(null)}
                                className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={() => confirmModal.type === 'ACTIVATE' ? executeActivate(confirmModal.id) : executeClose(confirmModal.id)}
                                className={`px-6 py-3 text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all ${confirmModal.type === 'CLOSE' ? 'bg-red-600 shadow-red-600/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicYears;
