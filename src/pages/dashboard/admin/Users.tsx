import React, { useEffect, useState } from 'react';
import {
    Search,
    Mail,
    Phone,
    UserCheck,
    UserX,
    MoreVertical,
    Activity
} from 'lucide-react';
import api from '../../../api/axios';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterRole === 'ALL') return matchesSearch;
        return matchesSearch && user.role === filterRole;
    });

    const getRoleBadge = (role: string) => {
        const styles: any = {
            'APP_ADMIN': 'bg-red-50 text-red-600',
            'PDG': 'bg-blue-50 text-blue-600',
            'DIRECTION': 'bg-indigo-50 text-indigo-600',
            'PROVISORIAT': 'bg-violet-50 text-violet-600',
            'SECRETARIAT': 'bg-emerald-50 text-emerald-600',
            'ENSEIGNANT': 'bg-amber-50 text-amber-600',
            'ELEVE': 'bg-slate-50 text-slate-600',
            'PARENT': 'bg-pink-50 text-pink-600',
        };
        return styles[role] || 'bg-slate-50 text-slate-400';
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Annuaire du Réseau</h2>
                    <p className="text-slate-500 font-medium italic">Gérez les accès et les statuts des comptes utilisateurs de la plateforme.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nom, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white pl-12 pr-6 py-4 rounded-[20px] border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none w-full md:w-[250px] font-bold text-sm"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-white px-6 py-4 rounded-[20px] border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-sm text-slate-600"
                    >
                        <option value="ALL">Tous les Rôles</option>
                        <option value="PDG">PDG / Fondateurs</option>
                        <option value="DIRECTION">Direction</option>
                        <option value="PROVISORIAT">Provisoriat</option>
                        <option value="SECRETARIAT">Secrétariat</option>
                        <option value="ENSEIGNANT">Enseignants</option>
                        <option value="ELEVE">Élèves</option>
                        <option value="PARENT">Parents</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100 uppercase tracking-widest text-[10px] font-black text-slate-400">
                                <tr>
                                    <th className="px-8 py-6">Utilisateur</th>
                                    <th className="px-8 py-6">Rôle</th>
                                    <th className="px-8 py-6">Contact</th>
                                    <th className="px-8 py-6">Statut</th>
                                    <th className="px-8 py-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Activity size={48} className="text-slate-100 mb-4" />
                                                <p className="text-slate-400 font-bold">Aucun utilisateur trouvé</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm shadow-inner group-hover:scale-110 transition-transform">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1">{user.firstName} {user.lastName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                        <Mail size={12} className="text-slate-300" />
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                            <Phone size={12} className="text-slate-300" />
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${user.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                    {user.active ? 'Actif' : 'Désactivé'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, user.active)}
                                                        className={`p-2 rounded-xl transition-all ${user.active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                                    >
                                                        {user.active ? <UserX size={18} /> : <UserCheck size={18} />}
                                                    </button>
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

export default AdminUsers;
