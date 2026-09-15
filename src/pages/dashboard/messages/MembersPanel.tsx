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
                className="w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 flex flex-col z-30 shadow-2xl md:shadow-none absolute md:relative right-0 h-full"
            >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Membres ({(roomMembers || []).length})</h3>
                    <button onClick={() => setShowMembersPanel(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isAdmin && (
                        <div className="mb-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ajouter un membre</h4>
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
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                            </div>
                            {userSearchResults.length > 0 && newMemberSearch && (
                                <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                    {userSearchResults.map((u: any) => (
                                        <div key={u.id} className="flex justify-between items-center p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</span>
                                            <button onClick={() => addMember(u.id)} className="text-[10px] px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg uppercase tracking-wider">Ajouter</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Liste des membres</h4>
                        <div className="space-y-1">
                            {(roomMembers || []).map((member: any) => (
                                <div key={member.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                        {member.firstName?.[0]}{member.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {member.firstName} {member.lastName}
                                                {member.id === user?.id && " (Vous)"}
                                            </p>
                                            {member.role === 'ADMIN' && <Shield size={12} className="text-blue-500 ml-1 shrink-0" />}
                                        </div>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{member.role}</p>
                                    </div>
                                    {isAdmin && member.id !== user?.id && (
                                        <button 
                                            onClick={() => updateMemberRole(member.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
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
