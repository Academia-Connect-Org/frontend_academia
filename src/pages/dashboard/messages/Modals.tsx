import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Share2, Check, Trash2 } from 'lucide-react';
import { useMessages } from './MessagesContext';

export const Modals = () => {
    const {
        showCreateGroup,
        setShowCreateGroup,
        groupType,
        setGroupType,
        groupName,
        setGroupName,
        groupDescription,
        setGroupDescription,
        parentRoomId,
        setParentRoomId,
        rooms,
        createGroup,
        showInviteLink,
        setShowInviteLink,
        selectedRoom,
        copyInviteLink,
        copied,
        showEditGroup,
        setShowEditGroup,
        editGroupName,
        setEditGroupName,
        editGroupDescription,
        setEditGroupDescription,
        updateGroup,
        setShowDeleteConfirm,
        showDeleteConfirm,
        deleteGroup,
        messageToDelete,
        setMessageToDelete,
        deleteMessage
    } = useMessages();

    return (
        <>
            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateGroup(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Créer un espace</h3>

                            <div className="space-y-4">
                                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setGroupType('GROUP')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${groupType === 'GROUP' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        Groupe
                                    </button>
                                    <button
                                        onClick={() => setGroupType('COMMUNITY')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${groupType === 'COMMUNITY' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                    >
                                        Communauté
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de l'espace</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Ex: Club de Mathématiques"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                                    <textarea
                                        value={groupDescription || ''}
                                        onChange={(e) => setGroupDescription(e.target.value)}
                                        placeholder="Ex: Groupe dédié aux discussions sur les mathématiques..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                    />
                                </div>

                                {groupType === 'GROUP' && rooms.filter((r: any) => r.type === 'COMMUNITY').length > 0 && (
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Appartient à la communauté (Optionnel)</label>
                                        <select
                                            value={parentRoomId || ''}
                                            onChange={(e) => setParentRoomId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        >
                                            <option value="">-- Aucune communauté --</option>
                                            {rooms.filter((r: any) => r.type === 'COMMUNITY').map((comm: any) => (
                                                <option key={comm.id} value={comm.id}>{comm.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300">
                                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-xs leading-relaxed font-medium">
                                        {groupType === 'COMMUNITY'
                                            ? "Une communauté permet de regrouper plusieurs groupes pour discuter d'un sujet commun."
                                            : "Un groupe permet de réunir des personnes pour discuter d'un sujet commun."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowCreateGroup(false)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={createGroup}
                                    disabled={!groupName.trim()}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
                                >
                                    Créer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Link Modal */}
            <AnimatePresence>
                {showInviteLink && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInviteLink(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center"
                        >
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                                <Share2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Lien d'invitation</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Partagez ce lien pour inviter des membres dans ce groupe.</p>

                            <div className="relative mb-6">
                                <div className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 pr-10 truncate">
                                    {window.location.origin}/join/{selectedRoom?.inviteLink}
                                </div>
                                <button
                                    onClick={copyInviteLink}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                            </div>

                            <button
                                onClick={() => setShowInviteLink(false)}
                                className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                            >
                                Fermer
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Edit Group Modal */}
                {showEditGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditGroup(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Paramètres de l'espace</h3>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de l'espace</label>
                                    <input
                                        type="text"
                                        value={editGroupName}
                                        onChange={(e) => setEditGroupName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Optionnelle)</label>
                                    <textarea
                                        value={editGroupDescription}
                                        onChange={(e) => setEditGroupDescription(e.target.value)}
                                        placeholder="Description de votre espace..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={updateGroup}
                                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                                    >
                                        Enregistrer
                                    </button>
                                    <button
                                        onClick={() => setShowEditGroup(false)}
                                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                                    >
                                        <Trash2 size={16} /> Supprimer l'espace
                                    </button>
                                    <p className="text-center text-[10px] text-red-500 dark:text-red-400 font-semibold mt-2">Zone de danger : cette action est irréversible</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Delete Confirm Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer l'espace ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                Êtes-vous sûr de vouloir supprimer <strong>{selectedRoom?.name}</strong> ?<br />
                                <span className="text-red-500 font-bold">Cette action est définitive.</span>
                            </p>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        deleteGroup();
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                                >
                                    Oui, supprimer définitivement
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Message Delete Modal */}
                {messageToDelete !== null && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMessageToDelete(null)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer ce message ?</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                Voulez-vous vraiment retirer ce message ?<br />
                                <span className="font-bold text-slate-400">Cette action est définitive.</span>
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => deleteMessage(messageToDelete)}
                                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                                >
                                    Oui, supprimer
                                </button>
                                <button
                                    onClick={() => setMessageToDelete(null)}
                                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
