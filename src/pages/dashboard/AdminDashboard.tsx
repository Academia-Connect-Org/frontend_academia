import React, { useEffect, useState } from 'react';
import {
    School,
    CheckCircle,
    Clock,
    Search,
    MoreVertical,
    Activity,
    Mail,
    Users,
    Crown
} from 'lucide-react';
import api, { getFileUrl } from '../../api/axios';
import PlansManager from '../../components/dashboard/admin/PlansManager';

const AdminDashboard: React.FC = () => {
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'institutions' | 'subscribers' | 'plans'>('institutions');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInstitutions();
        fetchSubscribers();
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

    const fetchSubscribers = async () => {
        try {
            const res = await api.get('/newsletter/subscribers');
            setSubscribers(res.data);
        } catch (err) {
            console.error(err);
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
                            className="bg-white pl-12 pr-6 py-4 ]   focus:ring-4 focus:ring-blue-500/10 focus: transition-all outline-none w-full md:w-[350px] font-bold text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto custom-scrollbar pb-1">
                <button 
                    onClick={() => setActiveTab('institutions')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-2 font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'institutions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <School size={18} /> Établissements
                </button>
                <button 
                    onClick={() => setActiveTab('subscribers')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-2 font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'subscribers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Mail size={18} /> Abonnés Newsletter
                </button>
                <button 
                    onClick={() => setActiveTab('plans')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-2 font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'plans' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Crown size={18} /> Plans d'Abonnement
                </button>
            </div>

            {activeTab === 'institutions' && (
                <>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-8 ] shadow-xl  ">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600  flex items-center justify-center mb-4">
                        <School size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Établissements</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.length}</h4>
                </div>
                <div className="bg-white p-8 ] shadow-xl  ">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600  flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Écoles Actives</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.filter(i => i.active).length}</h4>
                </div>
                <div className="bg-white p-8 ] shadow-xl  ">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600  flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">En attente</p>
                    <h4 className="text-3xl font-black text-slate-800">{institutions.filter(i => !i.active).length}</h4>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12     animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement des données...</p>
                </div>
            ) : (
                <div className="bg-white ] shadow-2xl   overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50  ">
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
                                                    <div className="w-12 h-12 bg-slate-100  overflow-hidden shadow-inner flex items-center justify-center">
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
                                                <span className={`px-4 py-1.5  text-[9px] font-black uppercase tracking-widest ${inst.type === 'ECOLE' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600'}`}>
                                                    {inst.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8  bg-slate-200 flex items-center justify-center font-black text-slate-500 text-[10px] uppercase">
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
                                                    <span className={`w-2 h-2  ${inst.active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                    {inst.active ? 'Actif' : 'En attente'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    {inst.active ? (
                                                        <button
                                                            onClick={() => handleDeactivate(inst.id)}
                                                            className="px-4 py-2 bg-red-50 text-red-600  text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Désactiver
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(inst.id)}
                                                            className="px-4 py-2 bg-emerald-50 text-emerald-600  text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Activer
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-400 hover:bg-slate-100  transition-all">
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
            )}

            {activeTab === 'subscribers' && (
                <div className="bg-white shadow-2xl overflow-hidden mt-6">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><Mail size={20} className="text-blue-500"/> Liste des Abonnés</h3>
                            <p className="text-sm font-medium text-slate-500">Personnes ayant souscrit à la newsletter (distinct des utilisateurs inscrits).</p>
                        </div>
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg">
                            {subscribers.length} Abonné(s)
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date d'inscription</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Mail size={48} className="text-slate-200 mb-4" />
                                                <p className="text-slate-400 font-bold">Aucun abonné pour le moment</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub: any) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6 text-sm font-bold text-slate-500">#{sub.id}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-800">{sub.email}</td>
                                            <td className="px-8 py-6 text-sm font-medium text-slate-500">{new Date(sub.subscribedAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'plans' && (
                <PlansManager />
            )}
        </>
    );
};

export default AdminDashboard;
