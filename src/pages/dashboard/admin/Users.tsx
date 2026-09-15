import React, { useEffect, useState } from 'react';
import {
    Search,
    UserCheck,
    UserX,
    Trash2,
    Loader2,
    Users,
    KeyRound,
    Calendar,
    Unlock,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';
import api from '../../../api/axios';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [freedUsers, setFreedUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'freed'>('active');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [userToFree, setUserToFree] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchFreedUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFreedUsers = async () => {
        try {
            const res = await api.get('/admin/users/freed');
            setFreedUsers(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.patch(`/admin/users/${id}/status`, { active: !currentStatus });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFreeEmail = async () => {
        if (!userToFree) return;
        setIsProcessing(true);
        try {
            await api.post(`/admin/users/${userToFree.id}/free-email`);
            setUserToFree(null);
            fetchUsers();
            fetchFreedUsers();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la libération de l'adresse email.");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/admin/users/${userToDelete}`);
            setUserToDelete(null);
            fetchUsers();
            fetchFreedUsers();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression de l'utilisateur.");
        }
    };

    const filteredUsers = users.filter(user => {
        if (user.freedEmail) return false; // Hide freed users from active table
        const matchesSearch =
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterRole === 'ALL') return matchesSearch;
        return matchesSearch && user.role === filterRole;
    });

    const filteredFreedUsers = freedUsers.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.originalEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        const styles: any = {
            'APP_ADMIN': 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
            'PDG': 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
            'DIRECTION': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
            'PROVISORIAT': 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
            'SECRETARIAT': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
            'ENSEIGNANT': 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
            'ELEVE': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            'PARENT': 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400',
        };
        return styles[role] || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Annuaire du Réseau</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Gérez les accès, les dates d'inscription et la libération des adresses email.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nom, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white pl-12 pr-6 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none w-full md:w-[250px] font-bold text-sm shadow-sm"
                        />
                    </div>
                    {activeTab === 'active' && (
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3.5 rounded-2xl font-bold text-sm outline-none cursor-pointer shadow-sm"
                        >
                            <option value="ALL">Tous les rôles</option>
                            <option value="APP_ADMIN">Admin App</option>
                            <option value="PDG">PDG / Propriétaire</option>
                            <option value="DIRECTION">Direction</option>
                            <option value="PROVISORIAT">Provisoriat</option>
                            <option value="SECRETARIAT">Secrétariat</option>
                            <option value="ENSEIGNANT">Enseignant</option>
                            <option value="ELEVE">Élève</option>
                            <option value="PARENT">Parent</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar pb-1">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-3 font-bold transition-all border-b-2 flex items-center gap-2 text-sm ${activeTab === 'active' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Users size={18} /> Utilisateurs Réseau ({filteredUsers.length})
                </button>
                <button
                    onClick={() => setActiveTab('freed')}
                    className={`whitespace-nowrap shrink-0 pb-4 px-3 font-bold transition-all border-b-2 flex items-center gap-2 text-sm ${activeTab === 'freed' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <KeyRound size={18} /> Comptes Libérés / Anonymisés ({freedUsers.length})
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Chargement des utilisateurs...</p>
                </div>
            ) : activeTab === 'active' ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Utilisateur</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Email</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rôle</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Date de Création</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Statut</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <Users size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                                <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun utilisateur trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-sm uppercase shrink-0">
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{u.firstName || ''} {u.lastName || ''}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{u.phone || 'Pas de téléphone'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-slate-700 dark:text-slate-300">{u.email}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '---'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${u.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                    {u.active ? 'Actif' : 'Bloqué'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => setUserToFree(u)}
                                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                                        title="Libérer l'adresse Gmail"
                                                    >
                                                        <Unlock size={12} /> Libérer Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(u.id, u.active)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${u.active ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white'}`}
                                                    >
                                                        {u.active ? 'Bloquer' : 'Activer'}
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToDelete(u.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
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
            ) : (
                /* Tableau des Comptes Libérés */
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <KeyRound size={20} className="text-indigo-500" /> Comptes Libérés & Anonymisés
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Historique des comptes dont l'adresse Gmail a été détachée et remplacée par une adresse système anonymisée.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Utilisateur</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Email d'Origine (Libéré)</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Nouvel Email Système</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mot de Passe Système</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Date Libération</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Rôle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {filteredFreedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <KeyRound size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                                <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun compte libéré pour le moment</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFreedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">ID #{u.id}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl">
                                                    {u.originalEmail || u.email}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                                                    {u.email}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                                                    passwordsupprimeruser
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {u.freedAt ? new Date(u.freedAt).toLocaleString('fr-FR') : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${getRoleBadge(u.role)}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Libération Email */}
            {userToFree && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 text-center shadow-2xl space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                            <Unlock size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Libérer l'adresse Gmail ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                L'adresse email <strong className="text-slate-800 dark:text-slate-200">{userToFree.email}</strong> sera libérée pour une nouvelle inscription. Le compte sera réassigné à une adresse anonymisée <code className="text-indigo-600 dark:text-indigo-400">utilisateurXXXXXX.supprimer@academiaconnect</code> avec le mot de passe <code className="text-amber-600 dark:text-amber-400">passwordsupprimeruser</code>.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setUserToFree(null)}
                                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleFreeEmail}
                                disabled={isProcessing}
                                className="flex-1 py-3 rounded-2xl font-black text-xs bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer la libération'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmation Suppression */}
            {userToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Supprimer cet utilisateur ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setUserToDelete(null)}
                                className="flex-1 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-2xl font-black text-xs bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-95"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
