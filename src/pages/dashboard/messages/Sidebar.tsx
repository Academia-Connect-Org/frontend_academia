import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, Video, Smile, Image as ImageIcon, Users, Megaphone, Plus, FileText, Download, X, MessageCircle, Copy, Share2, Check, Lock, Settings2, Trash2, Pencil, Mic, Square, Volume2, Reply, Heart, MoreHorizontal, ArrowLeft, ChevronsDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import api, { getFileUrl } from '../../../api/axios';

export const Sidebar = () => {
    const { copied, showStickers, setEditingContent, startEditing, editGroupDescription, userSearchResults, setCopied, setActiveMessageMenu, stopRecording, setUserSearchResults, showReactionsMenu, fetchRooms, groupName, recentlyEditedId, setMediaRecorder, setSearchQuery, setShowStickers, uploadingFile, setIsSaving, showMembersPanel, isSearching, setAnnouncements, setMessages, showEditGroup, setNewMemberSearch, cancelRecording, setEditingMessageId, messagesEndRef, setNotification, setIsRecording, scrollRef, editingMessageId, activeTab, updateMemberRole, setShowReactionsMenu, setGroupDescription, groupType, setActiveTab, startPrivateChat, setGroupName, mediaRecorder, createGroup, saveEdit, messageToDelete, lastMessageIdRef, showCreateGroup, searchParams, setNewMessage, messageReactions, editGroupName, setReadAnnouncementIds, deleteGroup, messages, newMessage, setMessageReactions, setIsSearching, updateGroup, selectedAnnouncement, setReplyingTo, user, setUploadingFile, selectedRoom, editingContent, setRoomMembers, activeMessageMenu, searchQuery, showScrollButton, isSaving, userRole, fileInputRef, setShowDeleteConfirm, notification, setMessageToDelete, handleScroll, handleReact, readAnnouncementIds, showInviteLink, setShowCreateGroup, roomMembers, sendMessage, timerRef, setRecordingTime, addMember, isRecording, prefill, setRecentlyEditedId, replyingTo, deleteMessage, recordingTime, announcements, setShowInviteLink, groupDescription, setRooms, setGroupType, setRoomSearchResults, markAnnouncementAsRead, fetchMessages, setShowMembersPanel, copyInviteLink, fetchRoomMembers, fetchAnnouncements, newMemberSearch, audioChunksRef, setSelectedAnnouncement, roomSearchResults, setEditGroupDescription, scrollToBottom, setUserRole, setShowEditGroup, parentRoomId, setShowScrollButton, handleSearchUsers, contactId, startRecording, showDeleteConfirm, rooms, setEditGroupName, setParentRoomId, setSelectedRoom, showNotify, formatTime, filteredRooms } = useMessages();
    return (
        <>
                {/* Sidebar */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white   shadow-sm z-10 ${(selectedRoom || selectedAnnouncement) ? 'hidden md:flex' : 'flex'}`}>

                    {/* Sidebar Header */}
                    <div className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                Messagerie
                                {activeTab === 'communities' && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-1  uppercase">Communautés</span>}
                            </h3>
                            <button
                                onClick={() => { setParentRoomId(null); setGroupDescription(""); setShowCreateGroup(true); }}
                                className="w-10 h-10  bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl shadow-slate-900/20"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1.5  mb-6">
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5  text-xs font-black transition-all ${activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <MessageCircle size={16} /> Discussions
                            </button>
                            <button
                                onClick={() => setActiveTab('communities')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5  text-xs font-black transition-all ${activeTab === 'communities' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Users size={16} /> Communautés
                            </button>
                            <button
                                onClick={() => setActiveTab('announcements')}
                                className={`relative flex-1 flex items-center justify-center gap-2 py-2.5  text-xs font-black transition-all ${activeTab === 'announcements' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Megaphone size={16} /> Annonces
                                {announcements.filter((a: any) => !readAnnouncementIds.includes(a.id)).length > 0 && (
                                    <span className="absolute top-1 right-3 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                                )}
                            </button>
                        </div>

                        {/* Search Bar */}
                        {activeTab !== 'announcements' && (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
                                <input
                                    type="text"
                                    placeholder={isSearching ? "Recherche par email ou matricule..." : "Rechercher une discussion..."}
                                    value={searchQuery}
                                    onChange={(e) => isSearching ? handleSearchUsers(e.target.value) : setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearching(true)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50    text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus: transition-all outline-none"
                                />
                                {isSearching && (
                                    <button
                                        onClick={() => { setIsSearching(false); setSearchQuery(''); setUserSearchResults([]); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat List Area */}
                    <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                        {isSearching && (userSearchResults.length > 0 || roomSearchResults.length > 0) ? (
                            <div className="space-y-6 mt-4 pb-6">
                                {roomSearchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Groupes & Communautés</p>
                                        {roomSearchResults.map((room: any) => (
                                            <div
                                                key={room.id}
                                                className="p-4 ] hover:bg-slate-50 flex gap-4 items-center justify-between transition-all   hover: group"
                                            >
                                                <div className="flex gap-4 items-center flex-1">
                                                    <div className={`w-12 h-12  flex items-center justify-center font-black ${room.type === 'COMMUNITY' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {(room.name || "G")[0]}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate">{room.name || "Groupe"}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{room.type}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!user) return;
                                                        try {
                                                            await api.post(`chat/join?userId=${user.id}&link=${room.inviteLink}`);
                                                            fetchRooms();
                                                            setRoomSearchResults((prev: any) => prev.filter((r: any) => r.id !== room.id));
                                                            showNotify(`Bienvenue dans ${room.name} !`, "success");
                                                        } catch (err) {
                                                            showNotify("Action impossible.", "error");
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 text-white  text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap"
                                                >
                                                    Rejoindre
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {userSearchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Personnes</p>
                                        {userSearchResults.map((u: any) => (
                                            <div
                                                key={u.id}
                                                onClick={() => startPrivateChat(u)}
                                                className="p-3 ] hover:bg-slate-50 cursor-pointer flex gap-3 items-center transition-all   hover:"
                                            >
                                                <div className="w-10 h-10  bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                                    {u.firstName[0]}{u.lastName[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-[13px]">{u.firstName} {u.lastName}</h4>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{u.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'announcements' ? (
                            <div className="space-y-3 mt-4">
                                {announcements.map((ann: any) => (
                                    <motion.div
                                        key={ann.id}
                                        onClick={() => {
                                            setSelectedAnnouncement(ann);
                                            setSelectedRoom(null);
                                            markAnnouncementAsRead(ann.id);
                                        }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`p-5 relative cursor-pointer transition-all ${selectedAnnouncement?.id === ann.id ? 'bg-amber-100 shadow-sm border-l-4 border-amber-500' : 'bg-amber-50/50 hover:bg-amber-50'}`}
                                    >
                                        {!readAnnouncementIds.includes(ann.id) && (
                                            <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                        )}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6  bg-amber-500 text-white flex items-center justify-center">
                                                <Megaphone size={12} fill="currentColor" />
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm line-clamp-1 pr-4">{ann.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">{ann.content}</p>
                                        <div className="flex justify-between items-center text-[9px] font-bold text-amber-600/60 uppercase tracking-widest">
                                            <span>{ann.signature}</span>
                                            <span>{format(new Date(ann.createdAt), 'dd MMMM', { locale: fr })}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 mt-4">
                                {filteredRooms.map((room: any) => (
                                    <div
                                        key={room.id}
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            setSelectedAnnouncement(null);
                                        }}
                                        className={`p-3 ] cursor-pointer transition-all duration-300 flex gap-3 items-center group relative ${selectedRoom?.id === room.id ? 'bg-white shadow-xl shadow-slate-200/40  ' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="relative">
                                            <div className={`w-11 h-11  flex items-center justify-center overflow-hidden font-black text-base ${room.type === 'COMMUNITY' ? 'bg-amber-100 text-amber-600' : room.type === 'GROUP' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {room.imageUrl ? <img src={room.imageUrl} alt="" className="w-full h-full object-cover" /> : (room.name ? room.name[0] : '?')}
                                            </div>
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500   "></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="font-bold text-slate-900 text-[13px] truncate">{room.name}</h4>
                                                <span className="text-[9px] text-slate-400 font-bold">12:30</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[11px] text-slate-500 truncate font-medium flex items-center gap-1">
                                                    {room.type !== 'PRIVATE' && <span className="font-black text-blue-500">Admin:</span>}
                                                    Dernier message ici...
                                                </p>
                                                {room.unreadCount ? (
                                                    <span className="w-5 h-5 bg-red-500 text-white  flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ml-2">
                                                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        {selectedRoom?.id === room.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600  shadow-[4px_0_15px_rgba(37,99,235,0.4)]"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


        </>
    );
};
