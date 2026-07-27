import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, Video, Smile, Image as ImageIcon, Users, Megaphone, Plus, FileText, Download, X, MessageCircle, Copy, Share2, Check, Lock, Settings2, Trash2, Pencil, Mic, Square, Volume2, Reply, Heart, MoreHorizontal, ArrowLeft, ChevronsDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import { getFileUrl } from '../../../api/axios';

export const ChatArea = () => {
    const { copied, showStickers, setEditingContent, startEditing, editGroupDescription, userSearchResults, setCopied, setActiveMessageMenu, stopRecording, setUserSearchResults, showReactionsMenu, fetchRooms, groupName, recentlyEditedId, setMediaRecorder, setSearchQuery, setShowStickers, uploadingFile, setIsSaving, showMembersPanel, isSearching, setAnnouncements, setMessages, showEditGroup, setNewMemberSearch, cancelRecording, setEditingMessageId, messagesEndRef, setNotification, setIsRecording, scrollRef, editingMessageId, activeTab, updateMemberRole, setShowReactionsMenu, setGroupDescription, groupType, setActiveTab, startPrivateChat, setGroupName, mediaRecorder, createGroup, saveEdit, messageToDelete, lastMessageIdRef, showCreateGroup, searchParams, setNewMessage, messageReactions, editGroupName, setReadAnnouncementIds, deleteGroup, messages, newMessage, setMessageReactions, setIsSearching, updateGroup, selectedAnnouncement, setReplyingTo, user, setUploadingFile, selectedRoom, editingContent, setRoomMembers, activeMessageMenu, searchQuery, showScrollButton, isSaving, userRole, fileInputRef, setShowDeleteConfirm, notification, setMessageToDelete, handleScroll, handleReact, readAnnouncementIds, showInviteLink, setShowCreateGroup, roomMembers, sendMessage, timerRef, setRecordingTime, addMember, isRecording, prefill, setRecentlyEditedId, replyingTo, deleteMessage, recordingTime, announcements, setShowInviteLink, groupDescription, setRooms, setGroupType, setRoomSearchResults, markAnnouncementAsRead, fetchMessages, setShowMembersPanel, copyInviteLink, fetchRoomMembers, fetchAnnouncements, newMemberSearch, audioChunksRef, setSelectedAnnouncement, roomSearchResults, setEditGroupDescription, scrollToBottom, setUserRole, setShowEditGroup, parentRoomId, setShowScrollButton, handleSearchUsers, contactId, startRecording, showDeleteConfirm, rooms, setEditGroupName, setParentRoomId, setSelectedRoom, showNotify, formatTime } = useMessages();
    return (
        <>
                {/* Chat Window */}
                <div className={`flex-1 flex flex-col bg-white overflow-hidden relative ${(!selectedRoom && !selectedAnnouncement) ? 'hidden md:flex' : 'flex'}`}>
                    {selectedRoom ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3   bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedRoom(null)}
                                        className="p-2 hover:bg-slate-100  md:hidden text-slate-500"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className={`w-10 h-10  flex items-center justify-center font-black text-base ${selectedRoom.type === 'COMMUNITY' ? 'bg-amber-100 text-amber-600' : selectedRoom.type === 'GROUP' ? 'bg-purple-100 text-purple-600' : 'bg-slate-900 text-white'}`}>
                                        {selectedRoom.imageUrl ? <img src={selectedRoom.imageUrl} alt="" className="w-full h-full object-cover" /> : (selectedRoom.name ? selectedRoom.name[0] : '?')}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm leading-none mb-1.5">{selectedRoom.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 text-slate-500 ">{selectedRoom.type}</span>
                                            <span className="w-1 h-1 bg-slate-300 "></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">En ligne</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedRoom.type !== 'PRIVATE' && (
                                        <button
                                            onClick={() => setShowInviteLink(true)}
                                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600  text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <Share2 size={13} /> Inviter
                                        </button>
                                    )}
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all"><Phone size={16} /></button>
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all"><Video size={16} /></button>
                                    {selectedRoom.type !== 'PRIVATE' && (userRole === 'ADMIN') && (
                                        <button
                                            onClick={() => {
                                                setEditGroupName(selectedRoom.name || '');
                                                setEditGroupDescription(selectedRoom.description || '');
                                                setShowEditGroup(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all"
                                        >
                                            <Settings2 size={16} />
                                        </button>
                                    )}
                                    {userRole === 'ADMIN' && selectedRoom.type !== 'PRIVATE' && (
                                        <button onClick={() => { fetchRoomMembers(selectedRoom.id); setShowMembersPanel(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Gérer les membres">
                                            <Users size={16} />
                                        </button>
                                    )}
                                    {userRole === 'ADMIN' && selectedRoom.type === 'COMMUNITY' && (
                                        <button onClick={() => { setParentRoomId(selectedRoom.id); setGroupType('GROUP'); setShowCreateGroup(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Créer un sous-groupe">
                                            <Plus size={16} />
                                        </button>
                                    )}

                                    <div className="w-px h-5 bg-slate-100 mx-1"></div>
                                    <button className="p-2 text-slate-400 hover:bg-slate-100  transition-all"><MoreVertical size={16} /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div
                                ref={scrollRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20 custom-scrollbar relative"
                                onClick={() => setActiveMessageMenu(null)}
                            >
                                <div className="flex flex-col gap-6">
                                    <div className="flex justify-center">
                                        <span className="px-4 py-1.5 bg-white   text-slate-400 text-[10px] font-black uppercase tracking-widest  shadow-sm">Aujourd'hui</span>
                                    </div>

                                    <AnimatePresence>
                                        {Array.isArray(messages) && messages.map((msg) => {
                                            const isMe = msg.sender.id === user?.id;
                                            return (
                                                <motion.div
                                                    key={msg.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[85%] lg:max-w-[70%] flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        {!isMe && (
                                                            <div className="w-6 h-6  bg-slate-100 text-slate-600 flex items-center justify-center font-black text-[9px] shrink-0 self-end mb-4">
                                                                {msg.sender.firstName[0]}
                                                            </div>
                                                        )}
                                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            {!isMe && selectedRoom.type !== 'PRIVATE' && (
                                                                <span className="text-[9px] font-black text-slate-500 mb-0.5 ml-1 uppercase tracking-tight">{msg.sender.firstName} ({msg.sender.role})</span>
                                                            )}

                                                            {msg.parentMessage && (
                                                                <div className={`mb-1 p-2  bg-slate-100/50   max-w-[200px] truncate opacity-80 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                                    <p className="text-[8px] font-black text-blue-600 uppercase">En réponse à {msg.parentMessage.sender.firstName}</p>
                                                                    <p className="text-[10px] text-slate-500 truncate">{msg.parentMessage.content}</p>
                                                                </div>
                                                            )}

                                                            <div className={`group relative px-3 py-2 ] text-[12px] shadow-sm transition-all duration-300 ${isMe
                                                                ? 'bg-blue-600 text-white  shadow-blue-600/20'
                                                                : 'bg-white text-slate-700    shadow-slate-200/50'
                                                                } ${editingMessageId === msg.id && isSaving ? 'animate-pulse scale-[0.98] opacity-70' : ''}`}>
                                                                {/* Success flash when edited */}
                                                                <AnimatePresence>
                                                                    {msg.id === recentlyEditedId && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0.8, scale: 1 }}
                                                                            animate={{ opacity: 0, scale: 1.2 }}
                                                                            exit={{ opacity: 0 }}
                                                                            className="absolute inset-0 bg-emerald-400 ] z-[-1]"
                                                                        />
                                                                    )}
                                                                </AnimatePresence>
                                                                {msg.type === 'IMAGE' ? (
                                                                    <div className="space-y-2 group/media relative">
                                                                        <a href={getFileUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="block">
                                                                            <img src={getFileUrl(msg.fileUrl)} alt="" className=" max-h-96 w-full object-contain bg-black/5 hover:opacity-90 transition-opacity" />
                                                                        </a>
                                                                        <div className="absolute top-3 right-3 opacity-0 group-hover/media:opacity-100 transition-opacity flex gap-2">
                                                                            <a
                                                                                href={getFileUrl(msg.fileUrl, true)}
                                                                                download={msg.fileName || 'image.jpg'}
                                                                                className="p-3 bg-white/90 backdrop-blur-sm text-slate-900  shadow-xl hover:bg-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest no-underline"
                                                                            >
                                                                                <Download size={18} /> Télécharger
                                                                            </a>
                                                                        </div>
                                                                        {msg.content && <p className="text-sm px-1 whitespace-pre-wrap break-words">{msg.content}</p>}
                                                                    </div>
                                                                ) : msg.type === 'VIDEO' ? (
                                                                    <div className="space-y-2 group/media relative">
                                                                        <video
                                                                            src={getFileUrl(msg.fileUrl)}
                                                                            controls
                                                                            className=" max-h-96 w-full bg-black shadow-2xl"
                                                                            poster={getFileUrl(msg.fileUrl) + '#t=0.5'}
                                                                        />
                                                                        <div className="absolute top-3 right-3 opacity-0 group-hover/media:opacity-100 transition-opacity z-10 flex gap-2">
                                                                            <a
                                                                                href={getFileUrl(msg.fileUrl)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="p-3 bg-white/90 backdrop-blur-sm text-slate-900  shadow-xl hover:bg-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest no-underline"
                                                                            >
                                                                                <Share2 size={18} /> Voir
                                                                            </a>
                                                                            <a
                                                                                href={getFileUrl(msg.fileUrl, true)}
                                                                                download={msg.fileName || 'video.mp4'}
                                                                                className="p-3 bg-white/90 backdrop-blur-sm text-slate-900  shadow-xl hover:bg-white transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest no-underline"
                                                                            >
                                                                                <Download size={18} /> Télécharger
                                                                            </a>
                                                                        </div>
                                                                        {msg.content && <p className="text-sm px-1 whitespace-pre-wrap break-words">{msg.content}</p>}
                                                                    </div>
                                                                ) : msg.type === 'FILE' ? (
                                                                    <div className={`flex items-center gap-3 p-2 sm:p-3 w-full min-w-0 ${isMe ? 'bg-blue-500/50' : 'bg-slate-50'}`}>
                                                                        <div className={`w-8 h-8 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center ${isMe ? 'bg-blue-400' : 'bg-white shadow-sm text-blue-600'}`}>
                                                                            <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 pr-2">
                                                                            <p className="font-bold text-[11px] sm:text-xs truncate">{msg.fileName}</p>
                                                                            <p className={`text-[9px] sm:text-[10px] font-black ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{(msg.fileSize || 0) / 1024 > 1024 ? ((msg.fileSize || 0) / (1024 * 1024)).toFixed(1) + ' MB' : ((msg.fileSize || 0) / 1024).toFixed(0) + ' KB'}</p>
                                                                        </div>
                                                                        <a href={getFileUrl(msg.fileUrl, true)} download={msg.fileName || 'file'} className="p-1.5 sm:p-2 hover:bg-black/10 transition-all shrink-0">
                                                                            <Download size={18} />
                                                                        </a>
                                                                    </div>
                                                                ) : msg.type === 'STICKER' ? (
                                                                    <span className="text-4xl">{msg.content}</span>
                                                                ) : msg.type === 'VOICE' ? (
                                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-[200px] sm:min-w-[300px] max-w-full py-1">
                                                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-blue-600 text-white'}`}>
                                                                            <Volume2 size={12} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 w-full">
                                                                            <audio
                                                                                src={getFileUrl(msg.fileUrl || '')}
                                                                                controls
                                                                                className="w-full max-w-full h-8 sm:h-10 filter brightness-100 contrast-100 invert-0 bg-white shadow-inner"
                                                                                preload="metadata"
                                                                                onLoadedMetadata={(e) => {
                                                                                    if (e.currentTarget.duration === Infinity) {
                                                                                        e.currentTarget.currentTime = 1e101;
                                                                                        e.currentTarget.ontimeupdate = () => {
                                                                                            e.currentTarget.ontimeupdate = null;
                                                                                            e.currentTarget.currentTime = 0;
                                                                                        };
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <div className="flex justify-between mt-1 px-1">
                                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                                    Message Vocal {msg.duration ? `• ${formatTime(msg.duration)}` : ''}
                                                                                </span>
                                                                                <span className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                                                    {(msg.fileSize || 0) / 1024 > 1024 ? ((msg.fileSize || 0) / (1024 * 1024)).toFixed(1) + ' MB' : ((msg.fileSize || 0) / 1024).toFixed(0) + ' KB'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    editingMessageId === msg.id ? (
                                                                        <div className="space-y-2">
                                                                            <input
                                                                                type="text"
                                                                                value={editingContent}
                                                                                onChange={(e) => setEditingContent(e.target.value)}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') saveEdit();
                                                                                    if (e.key === 'Escape') setEditingMessageId(null);
                                                                                }}
                                                                                className="w-full bg-white/20 border-none outline-none text-white text-[12px] p-1 "
                                                                                autoFocus
                                                                            />
                                                                            <div className="flex justify-end gap-2 text-[8px] font-black uppercase">
                                                                                <button onClick={() => setEditingMessageId(null)}>Annuler</button>
                                                                                <button onClick={saveEdit}>Enregistrer</button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                                                    )
                                                                )}

                                                                {/* Options button (visible on hover) */}
                                                                {!editingMessageId && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id);
                                                                        }}
                                                                        className={`absolute ${isMe ? '-left-8' : '-right-8'} top-1/2 -translate-y-1/2 p-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 z-10`}
                                                                    >
                                                                        <MoreHorizontal size={16} />
                                                                    </button>
                                                                )}

                                                                {/* Options Dropdown */}
                                                                <AnimatePresence>
                                                                    {activeMessageMenu === msg.id && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-2 w-48 bg-white    shadow-2xl p-1.5 z-[60]`}
                                                                        >
                                                                            {!showReactionsMenu ? (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => { setReplyingTo(msg); setActiveMessageMenu(null); }}
                                                                                        className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50  text-left transition-all"
                                                                                    >
                                                                                        <Reply size={14} className="text-blue-600" />
                                                                                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">Répondre</span>
                                                                                    </button>
                                                                                    <button
                                                                                        className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50  text-left transition-all"
                                                                                        onClick={() => setShowReactionsMenu(true)}
                                                                                    >
                                                                                        <Heart size={14} className="text-rose-500" />
                                                                                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">Réagir</span>
                                                                                    </button>
                                                                                    {['IMAGE', 'VIDEO', 'FILE'].includes(msg.type) && (
                                                                                        <>
                                                                                            <a
                                                                                                href={getFileUrl(msg.fileUrl)}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50  text-left transition-all no-underline"
                                                                                                onClick={() => setActiveMessageMenu(null)}
                                                                                            >
                                                                                                <Share2 size={14} className="text-blue-500" />
                                                                                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">Ouvrir</span>
                                                                                            </a>
                                                                                            <a
                                                                                                href={getFileUrl(msg.fileUrl, true)}
                                                                                                download={msg.fileName || 'file'}
                                                                                                className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50  text-left transition-all no-underline"
                                                                                                onClick={() => setActiveMessageMenu(null)}
                                                                                            >
                                                                                                <Download size={14} className="text-emerald-500" />
                                                                                                <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">Télécharger</span>
                                                                                            </a>
                                                                                        </>
                                                                                    )}
                                                                                    {isMe && (
                                                                                        <div className="mt-1 pt-1  ">
                                                                                            {msg.type === 'TEXT' && (
                                                                                                <button
                                                                                                    onClick={() => { startEditing(msg); setActiveMessageMenu(null); }}
                                                                                                    className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-50  text-left transition-all"
                                                                                                >
                                                                                                    <Pencil size={14} className="text-indigo-500" />
                                                                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700">Modifier</span>
                                                                                                </button>
                                                                                            )}
                                                                                            <button
                                                                                                onClick={() => { setMessageToDelete(msg.id); setActiveMessageMenu(null); }}
                                                                                                className="w-full flex items-center gap-2.5 p-2 hover:bg-rose-50  text-left transition-all"
                                                                                            >
                                                                                                <Trash2 size={14} className="text-rose-500" />
                                                                                                <span className="text-[10px] font-black uppercase tracking-tight text-rose-500">Supprimer</span>
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <div className="flex flex-col gap-2">
                                                                                    <div className="flex items-center gap-2 px-2 py-1  ">
                                                                                        <button onClick={() => setShowReactionsMenu(false)} className="p-1 hover:bg-slate-50 "><ArrowLeft size={12} /></button>
                                                                                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">Réactions</span>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-4 gap-1 p-1">
                                                                                        {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎓', '🎉'].map(emoji => (
                                                                                            <button
                                                                                                key={emoji}
                                                                                                onClick={() => handleReact(msg.id, emoji)}
                                                                                                className={`w-9 h-9 flex items-center justify-center text-lg hover:bg-slate-50  transition-all ${messageReactions[msg.id]?.includes(emoji) ? 'bg-blue-50' : ''}`}
                                                                                            >
                                                                                                {emoji}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                {/* Reactions Display */}
                                                                {messageReactions[msg.id]?.length > 0 && (
                                                                    <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex gap-0.5 bg-white    px-1.5 py-0.5 shadow-sm z-20`}>
                                                                        {messageReactions[msg.id].map((emoji: any) => (
                                                                            <span key={emoji} className="text-[10px] animate-in zoom-in-50 duration-200">{emoji}</span>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Hover timestamp or reactions could go here */}
                                                                <div className={`absolute bottom-0 ${isMe ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                                                                    <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-1  shadow-sm   uppercase">{format(new Date(msg.sentAt), 'HH:mm')}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-1 px-2">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(msg.sentAt), 'HH:mm')}</span>
                                                                {isMe && <CheckCheck size={14} className="text-blue-500" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Scroll to Bottom Button */}
                                <AnimatePresence>
                                    {showScrollButton && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                            onClick={scrollToBottom}
                                            className="fixed bottom-32 right-12 w-12 h-12 bg-blue-600 text-white  flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50   group"
                                            title="Retourner en bas"
                                        >
                                            <ChevronsDown size={24} className="group-hover:animate-bounce" />
                                            <div className="absolute -top-12 right-0 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                                Nouveaux messages
                                            </div>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 sm:p-8 bg-white shrink-0">
                                {replyingTo && (
                                    <div className="mb-4 p-4 bg-slate-50 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">En réponse à {replyingTo.sender.firstName}</p>
                                            <p className="text-xs text-slate-500 truncate">{replyingTo.content}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-white transition-all shrink-0">
                                            <X size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                )}
                                {uploadingFile && (
                                    <div className="mb-4 p-3 sm:p-4 bg-blue-50 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                {uploadingFile.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{uploadingFile.name}</p>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate">Prêt pour envoi - {(uploadingFile.size / (1024 * 1024)).toFixed(2)}MB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setUploadingFile(null)} className="p-2 hover:bg-white transition-all shrink-0">
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={sendMessage} className="flex items-center gap-2 sm:gap-5 bg-slate-50 p-2 sm:p-3 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all min-w-0">
                                    <div className="flex items-center gap-1 pl-2 relative">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white  transition-all shrink-0 shadow-sm"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowStickers(!showStickers)}
                                            className={`p-2.5 hover:bg-white  transition-all shadow-sm ${showStickers ? 'text-amber-500 bg-white' : 'text-slate-400'}`}
                                        >
                                            <Smile size={18} />
                                        </button>

                                        {/* Stickers Popover */}
                                        <AnimatePresence>
                                            {showStickers && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                    className="absolute bottom-20 left-0 bg-white    shadow-2xl p-4 grid grid-cols-4 gap-2 z-50 min-w-[200px]"
                                                >
                                                    {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎓', '📚', '🚀', '⭐', '✅', '🎉', '😭', '🙏', '👋', ''].map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => { setNewMessage((prev: any) => prev + emoji); setShowStickers(false); }}
                                                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-50 transition-all "
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {isRecording ? (
                                        <div className="flex-1 flex items-center justify-between px-6 py-2 bg-red-50 ]   animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-red-500  shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                                <span className="text-xs font-black text-red-600 uppercase tracking-widest">Enregistrement... {formatTime(recordingTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={cancelRecording}
                                                    className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                                                >
                                                    Annuler
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={stopRecording}
                                                    className="w-10 h-10 bg-red-500 text-white  flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                                                >
                                                    <Square size={16} fill="currentColor" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <textarea
                                                rows={1}
                                                value={newMessage}
                                                onChange={(e) => {
                                                    setNewMessage(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    if(e.target.value) {
                                                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage(e as any);
                                                        e.currentTarget.style.height = 'auto';
                                                    }
                                                }}
                                                placeholder="Taper votre message ici..."
                                                className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-700 text-xs font-medium py-1.5 resize-none max-h-32 custom-scrollbar"
                                            />

                                            <div className="flex items-center gap-1 sm:gap-3 pr-1 sm:pr-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={startRecording}
                                                    className="p-2 sm:p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Message Vocal"
                                                >
                                                    <Mic size={18} />
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={`p-2 sm:p-3 transition-all shadow-2xl ${newMessage.trim() || uploadingFile ? 'bg-slate-900 text-white shadow-slate-900/30 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                                    disabled={!newMessage.trim() && !uploadingFile}
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </form>
                                <div className="mt-3 flex justify-center">
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Lock size={8} /> Chiffrement de bout en bout actif
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : selectedAnnouncement ? (
                        <>
                            {/* Announcement Header */}
                            <div className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center gap-3 border-b border-slate-100">
                                <button
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="p-2 hover:bg-slate-100 md:hidden text-slate-500 rounded-full transition-colors shrink-0"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <Megaphone size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-900 text-sm leading-none mb-1.5 truncate">{selectedAnnouncement.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-50 text-amber-600">Annonce</span>
                                    </div>
                                </div>
                            </div>

                            {/* Announcement Body */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 custom-scrollbar">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-3xl mx-auto bg-white p-6 md:p-10 shadow-sm border border-slate-100"
                                >
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
                                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-snug break-words">
                                            {selectedAnnouncement.title}
                                        </h2>
                                        <span className="text-xs text-slate-400 font-bold whitespace-nowrap pt-1 flex items-center gap-1 shrink-0">
                                            {format(new Date(selectedAnnouncement.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                        </span>
                                    </div>

                                    <div className="mb-8 flex gap-2 flex-wrap">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                            Public cible : {selectedAnnouncement.targetRole || 'Tous'}
                                        </span>
                                    </div>

                                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px] mb-12">
                                        {selectedAnnouncement.content}
                                    </div>

                                    <div className="border-t-2 border-slate-50 pt-8 mt-8 flex justify-end">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Signé par</p>
                                            <p className="text-base font-bold text-slate-800">{selectedAnnouncement.signature}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 bg-blue-600 text-white ] flex items-center justify-center shadow-3xl shadow-blue-600/30 mb-8"
                            >
                                <MessageCircle size={48} fill="currentColor" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-slate-800 mb-4 text-center">Votre Espace de Discussion</h2>
                            <p className="text-slate-500 text-center max-w-md leading-relaxed mb-8">
                                Connectez-vous avec vos professeurs, camarades et la direction en toute sécurité.
                                Partagez vos documents et collaborez en temps réel.
                            </p>
                            <button
                                onClick={() => setIsSearching(true)}
                                className="px-8 py-4 bg-slate-900 text-white ] font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-2xl shadow-slate-900/20"
                            >
                                Commencer une discussion
                            </button>
                        </div>
                    )}
                </div>

        </>
    );
};
