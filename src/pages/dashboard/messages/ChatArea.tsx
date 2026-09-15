import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, Video, Smile, Image as ImageIcon, Users, Megaphone, Plus, FileText, Download, X, MessageCircle, Share2, Check, Lock, Settings2, Trash2, Pencil, Mic, Square, Volume2, Reply, Heart, MoreHorizontal, ArrowLeft, ChevronsDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import { getFileUrl } from '../../../api/axios';

export const ChatArea = () => {
    const {
        showStickers,
        setEditingContent,
        startEditing,
        editGroupDescription,
        userSearchResults,
        setActiveMessageMenu,
        stopRecording,
        showReactionsMenu,
        editingMessageId,
        updateMemberRole,
        setShowReactionsMenu,
        setReplyingTo,
        user,
        setUploadingFile,
        selectedRoom,
        editingContent,
        activeMessageMenu,
        userRole,
        fileInputRef,
        setShowDeleteConfirm,
        setMessageToDelete,
        handleScroll,
        handleReact,
        setShowInviteLink,
        sendMessage,
        isRecording,
        replyingTo,
        deleteMessage,
        recordingTime,
        announcements,
        selectedAnnouncement,
        setSelectedAnnouncement,
        markAnnouncementAsRead,
        scrollToBottom,
        setShowEditGroup,
        setParentRoomId,
        setShowScrollButton,
        startRecording,
        setEditGroupName,
        setEditGroupDescription,
        setSelectedRoom,
        formatTime,
        showScrollButton,
        messages,
        messagesEndRef,
        scrollRef,
        newMessage,
        setNewMessage,
        uploadingFile,
        setShowStickers,
        cancelRecording,
        setIsSearching,
        setShowCreateGroup,
        setGroupType,
        fetchRoomMembers,
        setShowMembersPanel,
        messageReactions,
        recentlyEditedId,
        isSaving,
        saveEdit,
        setEditingMessageId
    } = useMessages();

    return (
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative ${(!selectedRoom && !selectedAnnouncement) ? 'hidden md:flex' : 'flex'}`}>
            {selectedRoom ? (
                <>
                    {/* Chat Header */}
                    <div className="p-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedRoom(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${selectedRoom.type === 'COMMUNITY' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : selectedRoom.type === 'GROUP' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                                {selectedRoom.imageUrl ? <img src={selectedRoom.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : (selectedRoom.name ? selectedRoom.name[0] : '?')}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-none mb-1">{selectedRoom.name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">{selectedRoom.type}</span>
                                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {selectedRoom.type !== 'PRIVATE' && (
                                <button
                                    onClick={() => setShowInviteLink(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                >
                                    <Share2 size={12} /> Inviter
                                </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Phone size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Video size={16} /></button>
                            {selectedRoom.type !== 'PRIVATE' && (userRole === 'ADMIN') && (
                                <button
                                    onClick={() => {
                                        setEditGroupName(selectedRoom.name || '');
                                        setEditGroupDescription(selectedRoom.description || '');
                                        setShowEditGroup(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <Settings2 size={16} />
                                </button>
                            )}
                            {userRole === 'ADMIN' && selectedRoom.type !== 'PRIVATE' && (
                                <button onClick={() => { fetchRoomMembers(selectedRoom.id); setShowMembersPanel(true); }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Gérer les membres">
                                    <Users size={16} />
                                </button>
                            )}
                            {userRole === 'ADMIN' && selectedRoom.type === 'COMMUNITY' && (
                                <button onClick={() => { setParentRoomId(selectedRoom.id); setGroupType('GROUP'); setShowCreateGroup(true); }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Créer un sous-groupe">
                                    <Plus size={16} />
                                </button>
                            )}

                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
                            <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><MoreVertical size={16} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 relative"
                        onClick={() => setActiveMessageMenu(null)}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-center">
                                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-xs">Aujourd'hui</span>
                            </div>

                            <AnimatePresence>
                                {Array.isArray(messages) && messages.map((msg) => {
                                    const isMe = msg.sender?.id === user?.id;
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
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 self-end mb-2">
                                                        {msg.sender?.firstName?.[0]}
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {!isMe && selectedRoom.type !== 'PRIVATE' && (
                                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 ml-1 uppercase">{msg.sender?.firstName} ({msg.sender?.role})</span>
                                                    )}

                                                    {msg.parentMessage && (
                                                        <div className={`mb-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 max-w-[200px] truncate opacity-90 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                            <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">En réponse à {msg.parentMessage.sender?.firstName}</p>
                                                            <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate">{msg.parentMessage.content}</p>
                                                        </div>
                                                    )}

                                                    <div className={`group relative px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all ${isMe
                                                        ? 'bg-blue-600 text-white rounded-br-xs'
                                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                                                        } ${editingMessageId === msg.id && isSaving ? 'animate-pulse scale-[0.98] opacity-70' : ''}`}>
                                                        
                                                        {/* Success flash when edited */}
                                                        <AnimatePresence>
                                                            {msg.id === recentlyEditedId && (
                                                                <motion.div
                                                                    initial={{ opacity: 0.8, scale: 1 }}
                                                                    animate={{ opacity: 0, scale: 1.1 }}
                                                                    exit={{ opacity: 0 }}
                                                                    className="absolute inset-0 bg-emerald-400 rounded-2xl z-[-1]"
                                                                />
                                                            )}
                                                        </AnimatePresence>

                                                        {msg.type === 'IMAGE' ? (
                                                            <div className="space-y-2 group/media relative">
                                                                <a href={getFileUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <img src={getFileUrl(msg.fileUrl)} alt="" className="rounded-xl max-h-96 w-full object-contain bg-black/5 hover:opacity-90 transition-opacity" />
                                                                </a>
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity flex gap-1">
                                                                    <a
                                                                        href={getFileUrl(msg.fileUrl, true)}
                                                                        download={msg.fileName || 'image.jpg'}
                                                                        className="p-2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-lg shadow-md hover:bg-white transition-all flex items-center gap-1 font-bold text-[10px] uppercase no-underline"
                                                                    >
                                                                        <Download size={14} /> Télécharger
                                                                    </a>
                                                                </div>
                                                                {msg.content && <p className="text-xs px-1 whitespace-pre-wrap break-words">{msg.content}</p>}
                                                            </div>
                                                        ) : msg.type === 'VIDEO' ? (
                                                            <div className="space-y-2 group/media relative">
                                                                <video
                                                                    src={getFileUrl(msg.fileUrl)}
                                                                    controls
                                                                    className="rounded-xl max-h-96 w-full bg-black shadow-lg"
                                                                />
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity z-10 flex gap-1">
                                                                    <a
                                                                        href={getFileUrl(msg.fileUrl, true)}
                                                                        download={msg.fileName || 'video.mp4'}
                                                                        className="p-2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-lg shadow-md hover:bg-white transition-all flex items-center gap-1 font-bold text-[10px] uppercase no-underline"
                                                                    >
                                                                        <Download size={14} /> Télécharger
                                                                    </a>
                                                                </div>
                                                                {msg.content && <p className="text-xs px-1 whitespace-pre-wrap break-words">{msg.content}</p>}
                                                            </div>
                                                        ) : msg.type === 'FILE' ? (
                                                            <div className={`flex items-center gap-3 p-2 rounded-xl w-full min-w-0 ${isMe ? 'bg-blue-700/50' : 'bg-slate-50 dark:bg-slate-900'}`}>
                                                                <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${isMe ? 'bg-blue-500' : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400'}`}>
                                                                    <FileText className="w-5 h-5" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <p className="font-bold text-xs truncate">{msg.fileName}</p>
                                                                    <p className={`text-[10px] ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>{(msg.fileSize || 0) / 1024 > 1024 ? ((msg.fileSize || 0) / (1024 * 1024)).toFixed(1) + ' MB' : ((msg.fileSize || 0) / 1024).toFixed(0) + ' KB'}</p>
                                                                </div>
                                                                <a href={getFileUrl(msg.fileUrl, true)} download={msg.fileName || 'file'} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors shrink-0">
                                                                    <Download size={16} />
                                                                </a>
                                                            </div>
                                                        ) : msg.type === 'STICKER' ? (
                                                            <span className="text-3xl">{msg.content}</span>
                                                        ) : msg.type === 'VOICE' ? (
                                                            <div className="flex items-center gap-2 min-w-[200px] max-w-full py-1">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-blue-600 text-white'}`}>
                                                                    <Volume2 size={14} />
                                                                </div>
                                                                <div className="flex-1 min-w-0 w-full">
                                                                    <audio
                                                                        src={getFileUrl(msg.fileUrl || '')}
                                                                        controls
                                                                        className="w-full h-8 bg-white dark:bg-slate-800 rounded-lg"
                                                                        preload="metadata"
                                                                    />
                                                                    <div className="flex justify-between mt-1 px-1 text-[9px] font-bold">
                                                                        <span className={isMe ? 'text-blue-100' : 'text-slate-400'}>
                                                                            Vocal {msg.duration ? `• ${formatTime(msg.duration)}` : ''}
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
                                                                        className="w-full bg-white/20 border-none outline-none text-white text-xs p-1 rounded-lg"
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2 text-[9px] font-bold uppercase">
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
                                                                className={`absolute ${isMe ? '-left-7' : '-right-7'} top-1/2 -translate-y-1/2 p-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 z-10`}
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
                                                                    className={`absolute top-full ${isMe ? 'right-0' : 'left-0'} mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 z-[60]`}
                                                                >
                                                                    {!showReactionsMenu ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => { setReplyingTo(msg); setActiveMessageMenu(null); }}
                                                                                className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                                                                            >
                                                                                <Reply size={14} className="text-blue-600 dark:text-blue-400" />
                                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Répondre</span>
                                                                            </button>
                                                                            <button
                                                                                className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                                                                                onClick={() => setShowReactionsMenu(true)}
                                                                            >
                                                                                <Heart size={14} className="text-rose-500" />
                                                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Réagir</span>
                                                                            </button>
                                                                            {isMe && (
                                                                                <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                                                                                    {msg.type === 'TEXT' && (
                                                                                        <button
                                                                                            onClick={() => { startEditing(msg); setActiveMessageMenu(null); }}
                                                                                            className="w-full flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                                                                                        >
                                                                                            <Pencil size={14} className="text-indigo-500" />
                                                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Modifier</span>
                                                                                        </button>
                                                                                    )}
                                                                                    <button
                                                                                        onClick={() => { setMessageToDelete(msg.id); setActiveMessageMenu(null); }}
                                                                                        className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-left transition-colors"
                                                                                    >
                                                                                        <Trash2 size={14} className="text-red-500" />
                                                                                        <span className="text-xs font-bold text-red-500">Supprimer</span>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <div className="flex flex-col gap-1 p-1">
                                                                            <div className="flex items-center gap-1 px-1 py-0.5">
                                                                                <button onClick={() => setShowReactionsMenu(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"><ArrowLeft size={12} /></button>
                                                                                <span className="text-[10px] font-bold text-slate-400">Réactions</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-4 gap-1">
                                                                                {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎓', '🎉'].map(emoji => (
                                                                                    <button
                                                                                        key={emoji}
                                                                                        onClick={() => handleReact(msg.id, emoji)}
                                                                                        className="w-8 h-8 flex items-center justify-center text-base hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
                                                            <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} flex gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full shadow-xs z-20`}>
                                                                {messageReactions[msg.id].map((emoji: any) => (
                                                                    <span key={emoji} className="text-[10px]">{emoji}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 mt-1 px-1">
                                                        <span className="text-[9px] text-slate-400 font-medium">{msg.sentAt ? format(new Date(msg.sentAt), 'HH:mm') : ''}</span>
                                                        {isMe && <CheckCheck size={12} className="text-blue-500" />}
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
                                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.5, y: 10 }}
                                    onClick={scrollToBottom}
                                    className="fixed bottom-24 right-8 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-all z-50"
                                    title="Retourner en bas"
                                >
                                    <ChevronsDown size={20} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
                        {replyingTo && (
                            <div className="mb-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">En réponse à {replyingTo.sender?.firstName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{replyingTo.content}</p>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        {uploadingFile && (
                            <div className="mb-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-between gap-2 border border-blue-100 dark:border-blue-900/50">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                                        {uploadingFile.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{uploadingFile.name}</p>
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Prêt pour envoi - {(uploadingFile.size / (1024 * 1024)).toFixed(2)}MB</p>
                                    </div>
                                </div>
                                <button onClick={() => setUploadingFile(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={sendMessage} className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-1 pl-1 pb-1 relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                                    className={`p-2 rounded-xl transition-colors ${showStickers ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
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
                                            className="absolute bottom-14 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 grid grid-cols-4 gap-2 z-50 min-w-[180px]"
                                        >
                                            {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎓', '📚', '🚀', '⭐', '✅', '🎉', '😭', '🙏', '👋'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => { setNewMessage((prev: any) => prev + emoji); setShowStickers(false); }}
                                                    className="w-9 h-9 flex items-center justify-center text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {isRecording ? (
                                <div className="flex-1 flex items-center justify-between px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl animate-pulse min-h-[52px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                                        <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Enregistrement... {formatTime(recordingTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelRecording}
                                            className="px-2.5 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            onClick={stopRecording}
                                            className="w-8 h-8 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md transition-all"
                                        >
                                            <Square size={14} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        rows={2}
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            e.target.style.height = 'auto';
                                            if(e.target.value) {
                                                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(e as any);
                                                e.currentTarget.style.height = 'auto';
                                            }
                                        }}
                                        placeholder="Taper votre message..."
                                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white text-xs sm:text-sm font-medium py-2 px-1 resize-none min-h-[52px] max-h-40 leading-relaxed"
                                    />

                                    <div className="flex items-center gap-1 shrink-0 pb-1">
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                                            title="Message Vocal"
                                        >
                                            <Mic size={18} />
                                        </button>
                                        <button
                                            type="submit"
                                            className={`p-3 rounded-xl transition-all ${newMessage.trim() || uploadingFile ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                                            disabled={!newMessage.trim() && !uploadingFile}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                        <div className="mt-2 flex justify-center">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Lock size={10} /> Chiffrement de bout en bout actif
                            </p>
                        </div>
                    </div>
                </>
            ) : selectedAnnouncement ? (
                <>
                    {/* Announcement Header */}
                    <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800">
                        <button
                            onClick={() => setSelectedAnnouncement(null)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden text-slate-500 rounded-xl transition-colors shrink-0"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Megaphone size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-none mb-1 truncate">{selectedAnnouncement.title}</h4>
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-md">Annonce</span>
                        </div>
                    </div>

                    {/* Announcement Body */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800"
                        >
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-6">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug break-words">
                                    {selectedAnnouncement.title}
                                </h2>
                                <span className="text-xs text-slate-400 font-medium whitespace-nowrap pt-1 shrink-0">
                                    {selectedAnnouncement.createdAt ? format(new Date(selectedAnnouncement.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr }) : ''}
                                </span>
                            </div>

                            <div className="mb-6 flex gap-2 flex-wrap">
                                <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded-lg">
                                    Public cible : {selectedAnnouncement.targetRole || 'Tous'}
                                </span>
                            </div>

                            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm mb-8">
                                {selectedAnnouncement.content}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Signé par</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAnnouncement.signature}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-950/40 text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg mb-6"
                    >
                        <MessageCircle size={32} />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Votre Espace de Discussion</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
                        Connectez-vous avec vos enseignants, la direction, les parents et les élèves en toute sécurité.
                    </p>
                    <button
                        onClick={() => setIsSearching(true)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                        Commencer une discussion
                    </button>
                </div>
            )}
        </div>
    );
};
