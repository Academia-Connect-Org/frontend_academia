import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Shield } from 'lucide-react';
import { useMessages } from './MessagesContext';

export const MembersPanel = () => {
    const { showMembersPanel, setShowMembersPanel, roomMembers, userRole, selectedRoom, addMember, updateMemberRole, newMemberSearch, setNewMemberSearch, userSearchResults, handleSearchUsers, user } = useMessages();

    if (!showMembersPanel || !selectedRoom) return null;

    const isAdmin = userRole === 'ADMIN';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-full md:w-80 bg-white border-l border-slate-100 flex flex-col z-30 shadow-2xl md:shadow-none absolute md:relative right-0 h-full"
            >
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-800 tracking-tight">Membres ({roomMembers.length})</h3>
                    <button onClick={() => setShowMembersPanel(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {isAdmin && (
                        <div className="mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Ajouter un membre</h4>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Email ou matricule..."
                                    value={newMemberSearch}
                                    onChange={(e) => {
                                        setNewMemberSearch(e.target.value);
                                        handleSearchUsers(e.target.value);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            {userSearchResults.length > 0 && newMemberSearch && (
                                <div className="mt-2 bg-white border border-slate-100 shadow-xl max-h-40 overflow-y-auto custom-scrollbar">
                                    {userSearchResults.map((u: any) => (
                                        <div key={u.id} className="flex justify-between items-center p-2 hover:bg-slate-50">
                                            <span className="text-xs font-bold text-slate-700">{u.firstName} {u.lastName}</span>
                                            <button onClick={() => addMember(u.id)} className="text-[9px] px-2 py-1 bg-blue-600 text-white font-black uppercase tracking-wider">Ajouter</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Liste des membres</h4>
                        <div className="space-y-2">
                            {roomMembers.map((member: any) => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 transition-colors group">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {member.firstName} {member.lastName}
                                                {member.id === user?.id && " (Vous)"}
                                            </p>
                                            {member.role === 'ADMIN' && <Shield size={12} className="text-blue-500 ml-1 shrink-0" />}
                                        </div>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{member.role}</p>
                                    </div>
                                    {isAdmin && member.id !== user?.id && (
                                        <button 
                                            onClick={() => updateMemberRole(member.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
                                            title={member.role === 'ADMIN' ? "Rétrograder" : "Nommer Admin"}
                                        >
                                            <Shield size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
