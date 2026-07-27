import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Phone, Video, Smile, Image as ImageIcon, Users, Megaphone, Plus, FileText, Download, X, MessageCircle, Copy, Share2, Check, Lock, Settings2, Trash2, Pencil, Mic, Square, Volume2, Reply, Heart, MoreHorizontal, ArrowLeft, ChevronsDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import { getFileUrl } from '../../../api/axios';

export const Notifications = () => {
    const { copied, showStickers, setEditingContent, startEditing, editGroupDescription, userSearchResults, setCopied, setActiveMessageMenu, stopRecording, setUserSearchResults, showReactionsMenu, fetchRooms, groupName, recentlyEditedId, setMediaRecorder, setSearchQuery, setShowStickers, uploadingFile, setIsSaving, showMembersPanel, isSearching, setAnnouncements, setMessages, showEditGroup, setNewMemberSearch, cancelRecording, setEditingMessageId, messagesEndRef, setNotification, setIsRecording, scrollRef, editingMessageId, activeTab, updateMemberRole, setShowReactionsMenu, setGroupDescription, groupType, setActiveTab, startPrivateChat, setGroupName, mediaRecorder, createGroup, saveEdit, messageToDelete, lastMessageIdRef, showCreateGroup, searchParams, setNewMessage, messageReactions, editGroupName, setReadAnnouncementIds, deleteGroup, messages, newMessage, setMessageReactions, setIsSearching, updateGroup, selectedAnnouncement, setReplyingTo, user, setUploadingFile, selectedRoom, editingContent, setRoomMembers, activeMessageMenu, searchQuery, showScrollButton, isSaving, userRole, fileInputRef, setShowDeleteConfirm, notification, setMessageToDelete, handleScroll, handleReact, readAnnouncementIds, showInviteLink, setShowCreateGroup, roomMembers, sendMessage, timerRef, setRecordingTime, addMember, isRecording, prefill, setRecentlyEditedId, replyingTo, deleteMessage, recordingTime, announcements, setShowInviteLink, groupDescription, setRooms, setGroupType, setRoomSearchResults, markAnnouncementAsRead, fetchMessages, setShowMembersPanel, copyInviteLink, fetchRoomMembers, fetchAnnouncements, newMemberSearch, audioChunksRef, setSelectedAnnouncement, roomSearchResults, setEditGroupDescription, scrollToBottom, setUserRole, setShowEditGroup, parentRoomId, setShowScrollButton, handleSearchUsers, contactId, startRecording, showDeleteConfirm, rooms, setEditGroupName, setParentRoomId, setSelectedRoom, showNotify, formatTime } = useMessages();
    return (
        <>
                {/* Notification Popup */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] min-w-[320px]"
                        >
                            <div className={`px-6 py-4  shadow-2xl  backdrop-blur-md flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-50/90  text-red-600' :
                                notification.type === 'success' ? 'bg-emerald-50/90  text-emerald-600' :
                                    'bg-blue-50/90  text-blue-600'
                                }`}>
                                <div className={`w-10 h-10  flex items-center justify-center shrink-0 ${notification.type === 'error' ? 'bg-red-600 text-white' :
                                    notification.type === 'success' ? 'bg-emerald-600 text-white' :
                                        'bg-blue-600 text-white'
                                    }`}>
                                    {notification.type === 'error' ? <X size={20} /> : notification.type === 'success' ? <Check size={20} /> : <MessageCircle size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-0.5">{notification.type}</p>
                                    <p className="text-sm font-bold leading-tight">{notification.message}</p>
                                </div>
                                <button onClick={() => setNotification(null)} className="p-2 hover:bg-black/5  transition-all">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


        </>
    );
};
