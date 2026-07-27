import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, Video, Smile, Image as ImageIcon, Users, Megaphone, Plus, FileText, Download, X, MessageCircle, Copy, Share2, Check, Lock, Settings2, Trash2, Pencil, Mic, Square, Volume2, Reply, Heart, MoreHorizontal, ArrowLeft, ChevronsDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import { getFileUrl } from '../../../api/axios';

export const Modals = () => {
    const { copied, showStickers, setEditingContent, startEditing, editGroupDescription, userSearchResults, setCopied, setActiveMessageMenu, stopRecording, setUserSearchResults, showReactionsMenu, fetchRooms, groupName, recentlyEditedId, setMediaRecorder, setSearchQuery, setShowStickers, uploadingFile, setIsSaving, showMembersPanel, isSearching, setAnnouncements, setMessages, showEditGroup, setNewMemberSearch, cancelRecording, setEditingMessageId, messagesEndRef, setNotification, setIsRecording, scrollRef, editingMessageId, activeTab, updateMemberRole, setShowReactionsMenu, setGroupDescription, groupType, setActiveTab, startPrivateChat, setGroupName, mediaRecorder, createGroup, saveEdit, messageToDelete, lastMessageIdRef, showCreateGroup, searchParams, setNewMessage, messageReactions, editGroupName, setReadAnnouncementIds, deleteGroup, messages, newMessage, setMessageReactions, setIsSearching, updateGroup, selectedAnnouncement, setReplyingTo, user, setUploadingFile, selectedRoom, editingContent, setRoomMembers, activeMessageMenu, searchQuery, showScrollButton, isSaving, userRole, fileInputRef, setShowDeleteConfirm, notification, setMessageToDelete, handleScroll, handleReact, readAnnouncementIds, showInviteLink, setShowCreateGroup, roomMembers, sendMessage, timerRef, setRecordingTime, addMember, isRecording, prefill, setRecentlyEditedId, replyingTo, deleteMessage, recordingTime, announcements, setShowInviteLink, groupDescription, setRooms, setGroupType, setRoomSearchResults, markAnnouncementAsRead, fetchMessages, setShowMembersPanel, copyInviteLink, fetchRoomMembers, fetchAnnouncements, newMemberSearch, audioChunksRef, setSelectedAnnouncement, roomSearchResults, setEditGroupDescription, scrollToBottom, setUserRole, setShowEditGroup, parentRoomId, setShowScrollButton, handleSearchUsers, contactId, startRecording, showDeleteConfirm, rooms, setEditGroupName, setParentRoomId, setSelectedRoom, showNotify, formatTime } = useMessages();
    return (
        <>
            {/* Create Group Modal */}
            <AnimatePresence>
                {showCreateGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateGroup(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-slate-900 mb-6">Créer un espace</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-3 bg-slate-100 p-1.5 ">
                                        <button
                                            onClick={() => setGroupType('GROUP')}
                                            className={`flex-1 py-3  text-xs font-black transition-all ${groupType === 'GROUP' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Groupe
                                        </button>
                                        <button
                                            onClick={() => setGroupType('COMMUNITY')}
                                            className={`flex-1 py-3  text-xs font-black transition-all ${groupType === 'COMMUNITY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Communauté
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Nom de l'espace</label>
                                        <input
                                            type="text"
                                            value={groupName}
                                            onChange={(e) => setGroupName(e.target.value)}
                                            placeholder="Ex: Club de Mathématiques"
                                            className="w-full px-6 py-4 bg-slate-50   ] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus: outline-none transition-all"
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Description</label>
                                        <textarea
                                            value={groupDescription || ''}
                                            onChange={(e) => setGroupDescription(e.target.value)}
                                            placeholder="Ex: Groupe dédié aux discussions sur les mathématiques..."
                                            className="w-full px-6 py-4 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all resize-none h-24"
                                        />
                                    </div>

                                    {groupType === 'GROUP' && rooms.filter((r: any) => r.type === 'COMMUNITY').length > 0 && (
                                        <div className="mt-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Appartient à la communauté (Optionnel)</label>
                                            <select
                                                value={parentRoomId || ''}
                                                onChange={(e) => setParentRoomId(e.target.value ? Number(e.target.value) : null)}
                                                className="w-full px-6 py-4 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all"
                                            >
                                                <option value="">-- Aucune communauté --</option>
                                                {rooms.filter((r: any) => r.type === 'COMMUNITY').map((comm: any) => (
                                                    <option key={comm.id} value={comm.id}>{comm.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 p-5 bg-blue-50 ]  ">
                                        <div className="w-12 h-12 bg-blue-600 text-white  flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                        <p className="text-xs text-blue-800 leading-relaxed font-medium">
                                            {groupType === 'COMMUNITY'
                                                ? "Une communauté permet de regrouper plusieurs groupes, pour discuter d'un sujet commun."
                                                : "Un groupe permet de réunir des personnes pour discuter d'un sujet commun."}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setShowCreateGroup(false)}
                                        className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={createGroup}
                                        disabled={!groupName.trim()}
                                        className="flex-1 py-4 bg-slate-900 text-white ] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                    >
                                        Créer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Invite Link Modal */}
            <AnimatePresence>
                {showInviteLink && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInviteLink(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white ] shadow-3xl p-8"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 ] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                                    <Share2 size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Lien d'invitation</h3>
                                <p className="text-sm text-slate-500 mb-8">Partagez ce lien avec les personnes que vous souhaitez inviter dans ce groupe.</p>

                                <div className="relative mb-8">
                                    <div className="w-full px-5 py-4 bg-slate-50    text-xs font-mono text-slate-600 pr-12 truncate">
                                        {window.location.origin}/join/{selectedRoom?.inviteLink}
                                    </div>
                                    <button
                                        onClick={copyInviteLink}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-400 hover:text-blue-600  shadow-sm   transition-all"
                                    >
                                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowInviteLink(false)}
                                    className="w-full py-4 bg-slate-900 text-white ] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-900/20"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showEditGroup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditGroup(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar p-8"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Paramètres de l'espace</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Nom de l'espace</label>
                                    <input
                                        type="text"
                                        value={editGroupName}
                                        onChange={(e) => setEditGroupName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Description (Optionnelle)</label>
                                    <textarea
                                        value={editGroupDescription}
                                        onChange={(e) => setEditGroupDescription(e.target.value)}
                                        placeholder="Description de votre espace..."
                                        className="w-full px-6 py-4 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:outline-none transition-all resize-none h-24"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={updateGroup}
                                        className="flex-1 py-4 bg-blue-600 text-white ] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/20"
                                    >
                                        Enregistrer
                                    </button>
                                    <button
                                        onClick={() => setShowEditGroup(false)}
                                        className="px-6 py-4 bg-slate-100 text-slate-400 ] font-black uppercase text-[10px] tracking-widest"
                                    >
                                        Annuler
                                    </button>
                                </div>

                                <div className="pt-6   mt-6">
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full py-4 bg-rose-50 text-rose-600 ] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={16} /> Supprimer l'espace
                                    </button>
                                    <p className="text-center text-[9px] text-rose-400 font-bold uppercase mt-3 tracking-widest">Zone de danger : cette action est irréversible</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteConfirm(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-white ] shadow-3xl overflow-hidden p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-rose-100 text-rose-600 ] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/10">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Supprimer l'espace ?</h3>
                            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                                Êtes-vous sûr de vouloir supprimer <strong>{selectedRoom?.name}</strong> ?<br />
                                <span className="text-rose-500 font-bold">Cette action est définitive.</span>
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        deleteGroup();
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="w-full py-4 bg-rose-600 text-white ] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-900/20"
                                >
                                    Oui, supprimer définitivement
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-4 bg-slate-100 text-slate-400 ] font-black uppercase text-[10px] tracking-widest"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Custom Delete Confirmation Modal */}
                <AnimatePresence>
                    {messageToDelete !== null && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMessageToDelete(null)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-white ] p-10 max-w-sm w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]   text-center"
                            >
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 ] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <Trash2 size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Supprimer ?</h3>
                                <p className="text-slate-500 text-sm mb-10 leading-relaxed px-4">
                                    Voulez-vous vraiment retirer ce message ?<br />
                                    <span className="font-bold text-slate-400 opacity-60">Cette action est définitive.</span>
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => deleteMessage(messageToDelete)}
                                        className="w-full py-5 bg-rose-600 text-white ] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-rose-900/20 active:scale-95 transition-all hover:bg-rose-700"
                                    >
                                        Oui, supprimer
                                    </button>
                                    <button
                                        onClick={() => setMessageToDelete(null)}
                                        className="w-full py-5 bg-slate-50 text-slate-400 ] font-black uppercase text-[11px] tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                </AnimatePresence>

        </>
    );
};
