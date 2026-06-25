import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus, Trash2, Crown, Activity, CheckCircle } from 'lucide-react';
import api from '../../../api/axios';

const PlansManager = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<any>(null);
    const [popup, setPopup] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/public/plans');
            // Sort to ensure consistent order
            const sorted = res.data.sort((a: any, b: any) => a.id - b.id);
            setPlans(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/admin/plans/${editingPlan.type}`, editingPlan);
            setEditingPlan(null);
            fetchPlans();
            setPopup({ type: 'success', message: 'Plan modifié avec succès !' });
        } catch (err: any) {
            console.error("Error saving plan:", err);
            setPopup({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la sauvegarde du plan.' });
        }
    };

    const handleArrayChange = (field: 'features' | 'missingFeatures', index: number, value: string) => {
        const newArray = [...editingPlan[field]];
        newArray[index] = value;
        setEditingPlan({ ...editingPlan, [field]: newArray });
    };

    const addArrayItem = (field: 'features' | 'missingFeatures') => {
        setEditingPlan({ ...editingPlan, [field]: [...editingPlan[field], ''] });
    };

    const removeArrayItem = (field: 'features' | 'missingFeatures', index: number) => {
        const newArray = [...editingPlan[field]];
        newArray.splice(index, 1);
        setEditingPlan({ ...editingPlan, [field]: newArray });
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500 font-bold">Chargement des plans...</div>;
    }

    if (editingPlan) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-xl mt-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 uppercase">Éditer le plan : {editingPlan.title}</h3>
                    <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Titre du Plan</label>
                            <input 
                                required
                                value={editingPlan.title} 
                                onChange={(e) => setEditingPlan({...editingPlan, title: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Texte Mise en avant (ex: Populaire)</label>
                            <input 
                                value={editingPlan.highlight || ''} 
                                onChange={(e) => setEditingPlan({...editingPlan, highlight: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                placeholder="Laisser vide si aucun"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Prix Mensuel (FCFA)</label>
                            <input 
                                type="number"
                                required
                                value={editingPlan.monthlyPrice} 
                                onChange={(e) => setEditingPlan({...editingPlan, monthlyPrice: Number(e.target.value)})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Prix Annuel (FCFA)</label>
                            <input 
                                type="number"
                                required
                                value={editingPlan.yearlyPrice} 
                                onChange={(e) => setEditingPlan({...editingPlan, yearlyPrice: Number(e.target.value)})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">Texte Durée (Optionnel, ex: 3 Mois)</label>
                            <input 
                                value={editingPlan.duration || ''} 
                                onChange={(e) => setEditingPlan({...editingPlan, duration: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                                placeholder="Par défaut: / mois ou / an"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div>
                            <label className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    checked={editingPlan.featured} 
                                    onChange={(e) => setEditingPlan({...editingPlan, featured: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-bold text-slate-700">Mettre ce plan en évidence (Style Populaire)</span>
                            </label>
                        </div>
                        <div>
                            <label className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    checked={editingPlan.hasReportCards} 
                                    onChange={(e) => setEditingPlan({...editingPlan, hasReportCards: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-bold text-slate-700">Autoriser Génération de Bulletins</span>
                            </label>
                        </div>
                        <div>
                            <label className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    checked={editingPlan.hasOnlineExams} 
                                    onChange={(e) => setEditingPlan({...editingPlan, hasOnlineExams: e.target.checked})}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-bold text-slate-700">Autoriser Devoirs & Examens en ligne</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-black text-emerald-600 uppercase">Fonctionnalités Incluses</label>
                                <button type="button" onClick={() => addArrayItem('features')} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Plus size={14}/> Ajouter</button>
                            </div>
                            <div className="space-y-3">
                                {editingPlan.features.map((feat: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            value={feat}
                                            onChange={(e) => handleArrayChange('features', i, e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium"
                                        />
                                        <button type="button" onClick={() => removeArrayItem('features', i)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-sm font-black text-red-500 uppercase">Fonctionnalités Manquantes</label>
                                <button type="button" onClick={() => addArrayItem('missingFeatures')} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Plus size={14}/> Ajouter</button>
                            </div>
                            <div className="space-y-3">
                                {editingPlan.missingFeatures.map((feat: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input 
                                            value={feat}
                                            onChange={(e) => handleArrayChange('missingFeatures', i, e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm font-medium"
                                        />
                                        <button type="button" onClick={() => removeArrayItem('missingFeatures', i)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> Sauvegarder les modifications
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-2xl overflow-hidden mt-6 rounded-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Crown size={20} className="text-blue-500"/> Gestion des Plans d'Abonnement</h3>
                    <p className="text-sm font-medium text-slate-500">Modifiez les tarifs et les caractéristiques des offres de la plateforme.</p>
                </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`p-6 border-2 rounded-2xl ${plan.featured ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-black uppercase px-3 py-1 bg-slate-100 text-slate-500 rounded-full">{plan.type}</span>
                            <button onClick={() => setEditingPlan(plan)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 uppercase mb-2">{plan.title}</h4>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-xl font-black text-slate-900">{plan.monthlyPrice.toLocaleString()} F</span>
                            <span className="text-xs font-bold text-slate-400">/ mois</span>
                        </div>
                        
                        <div className="space-y-2 mt-4 text-xs font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className={plan.hasReportCards ? "text-emerald-500" : "text-red-400"} />
                                Bulletins: {plan.hasReportCards ? 'Oui' : 'Non'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Activity size={14} className={plan.hasOnlineExams ? "text-emerald-500" : "text-red-400"} />
                                Examens en ligne: {plan.hasOnlineExams ? 'Oui' : 'Non'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {popup && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setPopup(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            {popup.type === 'success' ? (
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={32} />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <X size={32} />
                                </div>
                            )}
                            <h3 className={`text-xl font-black uppercase mb-2 ${popup.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {popup.type === 'success' ? 'Succès !' : 'Erreur'}
                            </h3>
                            <p className="text-slate-600 font-medium">{popup.message}</p>
                            <button
                                onClick={() => setPopup(null)}
                                className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition-colors ${
                                    popup.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlansManager;
