import React, { useEffect, useState } from 'react';
import {
    School,
    CheckCircle,
    Clock,
    Search,
    MoreVertical,
    Activity
} from 'lucide-react';
import api, { getFileUrl } from '../../api/axios';

const AdminDashboard: React.FC = () => {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const res = await api.get('/institutions');
            setInstitutions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (id: number) => {
        try {
            await api.patch(`/institutions/${id}/activate`);
            fetchInstitutions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeactivate = async (id: number) => {
        try {
            await api.patch(`/institutions/${id}/deactivate`);
            fetchInstitutions();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredInstitutions = institutions.filter(inst =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.uaiNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Établissements</h2>
                    <p className="text-slate-500 font-medium">Activez ou désactivez les écoles inscrites sur la plateforme.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou UAI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white pl-12 pr-6 py-4 rounded-[20px] border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none w-full md:w-[350px] font-bold text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <School size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Établissements</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.length}</h4>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Écoles Actives</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.filter(i => i.active).length}</h4>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">En attente</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.filter(i => !i.active).length}</h4>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement des données...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Établissement</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">CEO / PDG</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">UAI</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredInstitutions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Activity size={48} className="text-slate-200 mb-4" />
                                                <p className="text-slate-400 font-bold">Aucun établissement trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInstitutions.map((inst) => (
                                        <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                                                        {inst.logoUrl ? (
                                                            <img src={getFileUrl(inst.logoUrl)} alt={inst.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <School size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 uppercase leading-tight">{inst.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{inst.address || 'Adresse non spécifiée'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${inst.type === 'ECOLE' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600'}`}>
                                                    {inst.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-[10px] uppercase">
                                                        {inst.ceo?.firstName?.[0]}{inst.ceo?.lastName?.[0]}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{inst.ceo?.firstName} {inst.ceo?.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-mono font-bold text-slate-500">{inst.uaiNumber || '---'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${inst.active ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${inst.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                    {inst.active ? 'Actif' : 'En attente'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    {inst.active ? (
                                                        <button
                                                            onClick={() => handleDeactivate(inst.id)}
                                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Désactiver
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(inst.id)}
                                                            className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Activer
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;
