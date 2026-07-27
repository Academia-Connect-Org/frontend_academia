import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';
import { useSearchParams } from 'react-router-dom';
import type { ChatRoom, Message, Announcement } from './types';

export const MessagesContext = createContext<any>(null);

export const MessagesProvider: React.FC<{ role: string, children: React.ReactNode }> = ({ role, children }) => {

    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chats' | 'communities' | 'announcements'>('chats');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [readAnnouncementIds, setReadAnnouncementIds] = useState<number[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const [roomMembers, setRoomMembers] = useState<any[]>([]);
    const [newMemberSearch, setNewMemberSearch] = useState('');
    const [parentRoomId, setParentRoomId] = useState<number | null>(null);

    const [groupType, setGroupType] = useState<ChatRoom['type']>('GROUP');
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [showInviteLink, setShowInviteLink] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showStickers, setShowStickers] = useState(false);
    const [showEditGroup, setShowEditGroup] = useState(false);
    const [editGroupName, setEditGroupName] = useState('');
    const [editGroupDescription, setEditGroupDescription] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userRole, setUserRole] = useState<string>('MEMBER');
    const [roomSearchResults, setRoomSearchResults] = useState<ChatRoom[]>([]);

    // Voice Message State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);

    // Notification State
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [recentlyEditedId, setRecentlyEditedId] = useState<number | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);
    const [showReactionsMenu, setShowReactionsMenu] = useState(false);
    const [messageReactions, setMessageReactions] = useState<{ [key: number]: string[] }>({});
    const [showScrollButton, setShowScrollButton] = useState(false);

    const showNotify = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    useEffect(() => {
        console.log("Current User in Messages:", user);
        if (user && !user.id) {
            console.error("CRITICAL: User object exists but ID is missing!", user);
        }
    }, [user]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [searchParams] = useSearchParams();
    const contactId = searchParams.get('contactId');
    const prefill = searchParams.get('prefill');

    useEffect(() => {
        if (prefill && selectedRoom) {
            setNewMessage(decodeURIComponent(prefill));
        }
    }, [prefill, !!selectedRoom]);

    useEffect(() => {
        if (user?.id) {
            fetchRooms();
            fetchAnnouncements();
            const storedReads = localStorage.getItem(`readAnnouncements_${user.id}`);
            if (storedReads) {
                try {
                    setReadAnnouncementIds(JSON.parse(storedReads));
                } catch(e) {}
            }
        }
    }, [user?.id]);

    useEffect(() => {
        if (contactId && user?.id && rooms.length > 0 && !selectedRoom) {
            const autoStart = async () => {
                try {
                    const res = await api.post(`chat/rooms/private?u1=${user.id}&u2=${contactId}`);
                    const room = res.data;
                    if (!rooms.some(r => r.id === room.id)) {
                        setRooms(prev => [room, ...prev]);
                    }
                    setSelectedRoom(room);
                } catch (err) {
                    console.error("Auto-start chat error:", err);
                }
            };
            autoStart();
        }
    }, [contactId, user?.id, rooms.length, !!selectedRoom]);

    useEffect(() => {
        if (selectedRoom?.id && user?.id) {
            setMessages([]);
            fetchMessages(selectedRoom.id);

            // Fetch User Role in this room
            if (selectedRoom.type !== 'PRIVATE') {
                api.get(`chat/rooms/${selectedRoom.id}/role/${user.id}`).then(res => {
                    const role = (res.data.role || 'MEMBER').trim().toUpperCase();
                    console.log("DEBUG: Final User Role:", role);
                    setUserRole(role);
                }).catch((err) => {
                    console.error("Error fetching role:", err);
                    setUserRole('MEMBER');
                });
            } else {
                setUserRole('MEMBER');
            }
        }
    }, [selectedRoom?.id, user?.id]);

    useEffect(() => {
        if (selectedRoom?.id) {
            const interval = setInterval(() => fetchMessages(selectedRoom.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedRoom?.id]);

    const lastMessageIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;

        const lastMessage = messages[messages.length - 1];
        if (!lastMessage) {
            lastMessageIdRef.current = null;
            return;
        }

        // Only proceed if a new message has actually arrived
        if (lastMessage.id === lastMessageIdRef.current) return;
        lastMessageIdRef.current = lastMessage.id;

        // Only scroll to bottom if:
        // 1. User is already close to the bottom (within 150px)
        // 2. The new message was sent by the current user
        const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
        const sentByMe = lastMessage?.sender.id === user?.id;

        if (isNearBottom || sentByMe) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, user?.id]);

    useEffect(() => {
        // Force scroll when room changes
        if (selectedRoom?.id) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
    }, [selectedRoom?.id]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
        setShowScrollButton(!isNearBottom);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    
    const fetchRoomMembers = async (roomId: number) => {
        try {
            const res = await api.get(`chat/rooms/${roomId}/members`);
            setRoomMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRooms = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`chat/rooms/${user.id}`);
            console.log("Fetched rooms for user", user.id, ":", res.data);
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (roomId: number) => {
        try {
            const res = await api.get(`chat/rooms/${roomId}/messages`);
            const fetchedMessages = res.data;
            if (Array.isArray(fetchedMessages)) {
                setMessages(fetchedMessages);
                if (fetchedMessages.length > 0 && user?.id) {
                    const lastMsg = fetchedMessages[fetchedMessages.length - 1];
                    if (lastMsg && lastMsg.id) {
                        api.put(`chat/rooms/${roomId}/read?userId=${user.id}&lastMessageId=${lastMsg.id}`).catch(console.error);
                        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
                        window.dispatchEvent(new Event('chat_read'));
                    }
                }
            } else {
                console.error("fetchedMessages is not an array:", fetchedMessages);
                setMessages([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const params = new URLSearchParams();
            if (role === 'PDG' && user?.id) {
                params.append('ceoId', user.id.toString());
            } else if (user?.institution?.id) {
                params.append('institutionId', user.institution.id.toString());
            }
            const qs = params.toString() ? `?${params.toString()}` : '';
            const res = await api.get(`announcements${qs}`);
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAnnouncementAsRead = (annId: number) => {
        if (!readAnnouncementIds.includes(annId) && user?.id) {
            const updatedIds = [...readAnnouncementIds, annId];
            setReadAnnouncementIds(updatedIds);
            localStorage.setItem(`readAnnouncements_${user.id}`, JSON.stringify(updatedIds));
        }
    };

    const handleSearchUsers = async (q: string) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setUserSearchResults([]);
            setRoomSearchResults([]);
            return;
        }
        try {
            const res = await api.get(`users?query=${q}`);
            setUserSearchResults(res.data.filter((u: any) => u.id !== user?.id));

            // Also search for rooms
            const roomRes = await api.get(`chat/rooms/search?query=${q}`);
            // Show only rooms where user is not a member
            setRoomSearchResults(roomRes.data.filter((r: any) => !rooms.some(myR => myR.id === r.id)));
        } catch (err) {
            console.error(err);
        }
    };

    const startPrivateChat = async (otherUser: any) => {
        try {
            const res = await api.post(`chat/rooms/private?u1=${user?.id}&u2=${otherUser.id}`);
            const room = res.data;
            if (!room.name) room.name = `${otherUser.firstName} ${otherUser.lastName}`;
            setRooms(prev => [room, ...prev.filter(r => r.id !== room.id)]);
            setSelectedRoom(room);
            setIsSearching(false);
            setSearchQuery('');
        } catch (err) {
            console.error(err);
        }
    };

    const createGroup = async () => {
        if (!groupName.trim()) {
            showNotify("Veuillez donner un nom à votre espace.");
            return;
        }
        if (!user?.id) {
            showNotify("Erreur d'authentification : ID utilisateur manquant. Veuillez vous déconnecter et vous reconnecter.", "error");
            return;
        }
        try {
            let url = `chat/rooms/group?adminId=${user.id}&name=${encodeURIComponent(groupName)}&type=${groupType}`;
            if (groupDescription?.trim()) {
                url += `&description=${encodeURIComponent(groupDescription.trim())}`;
            }
            if (parentRoomId && groupType === 'GROUP') {
                url += `&parentRoomId=${parentRoomId}`;
            }
            const res = await api.post(url);
            setRooms(prev => [res.data, ...prev]);
            setSelectedRoom(res.data);
            setShowCreateGroup(false);
            setGroupName('');
            setGroupDescription('');
            setParentRoomId(null);
        } catch (err: any) {
            console.error(err);
            showNotify("Erreur lors de la création : " + (err.response?.data?.message || err.message), "error");
        }
    };

    
    const updateMemberRole = async (userId: number, role: string) => {
        try {
            await api.put(`chat/rooms/${selectedRoom?.id}/members/${userId}/role?role=${role}&requesterId=${user?.id}`);
            fetchRoomMembers(selectedRoom!.id);
        } catch(err:any) { showNotify(err.response?.data?.message || 'Erreur', 'error'); }
    };

    const addMember = async (userId: number) => {
        try {
            await api.post(`chat/rooms/${selectedRoom?.id}/members?userId=${userId}&requesterId=${user?.id}`);
            fetchRoomMembers(selectedRoom!.id);
            setNewMemberSearch('');
            setUserSearchResults([]);
            showNotify('Membre ajouté', 'success');
        } catch(err:any) { showNotify(err.response?.data?.message || 'Erreur', 'error'); }
    };

    const updateGroup = async () => {
        if (!editGroupName.trim() || !selectedRoom || !user) return;
        try {
            let url = `chat/rooms/${selectedRoom.id}?requesterId=${user.id}&name=${encodeURIComponent(editGroupName)}`;
            if (editGroupDescription?.trim()) {
                 url += `&description=${encodeURIComponent(editGroupDescription.trim())}`;
            }
            const response = await api.put(url, {});
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? response.data : r));
            setSelectedRoom(response.data);
            setShowEditGroup(false);
            showNotify("Espace mis à jour avec succès !", "success");
        } catch (err: any) {
            console.error(err);
            showNotify("Erreur lors de la mise à jour : " + (err.response?.data?.message || err.message), "error");
        }
    };

    const deleteGroup = async () => {
        if (!selectedRoom || !user) return;
        try {
            await api.delete(`chat/rooms/${selectedRoom.id}?requesterId=${user.id}`);
            setRooms(prev => prev.filter(r => r.id !== selectedRoom.id));
            setSelectedRoom(null);
            setShowEditGroup(false);
            showNotify("Groupe supprimé avec succès !", "success");
        } catch (err: any) {
            console.error(err);
            showNotify("Erreur lors de la suppression : " + (err.response?.data?.message || err.message), "error");
        }
    };

    const sendMessage = async (e?: React.FormEvent, stickerContent?: string) => {
        if (e) e.preventDefault();

        const isSticker = !!stickerContent;
        if (!selectedRoom || (!newMessage.trim() && !uploadingFile && !isSticker)) return;

        const content = isSticker ? stickerContent : newMessage;
        let type = isSticker ? 'STICKER' : 'TEXT';
        if (uploadingFile) {
            if (uploadingFile.type.startsWith('image/')) type = 'IMAGE';
            else if (uploadingFile.type.startsWith('video/')) type = 'VIDEO';
            else type = 'FILE';
        }

        const previousMessages = [...messages];
        const tempId = -Date.now();

        // Optimistic UI for TEXT/STICKER
        if (!uploadingFile) {
            const tempMsg: Message = {
                id: tempId,
                content: content,
                type: type as any,
                sender: user as any,
                sentAt: new Date().toISOString(),
                fileUrl: null,
                fileName: null,
                fileSize: null,
                duration: null
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');
        }

        const formData = new FormData();
        formData.append('content', content);
        formData.append('type', type);
        if (replyingTo) formData.append('parentMessageId', replyingTo.id.toString());
        if (uploadingFile) formData.append('file', uploadingFile);

        try {
            const res = await api.post(`chat/messages/send?roomId=${selectedRoom.id}&senderId=${user?.id}`, formData);
            if (!uploadingFile) {
                // Replace optimistic one with real one
                setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
            } else {
                setMessages(prev => [...prev, res.data]);
                setUploadingFile(null);
            }
            setReplyingTo(null);
            // fetchMessages is no longer needed here as we manually updated the state
        } catch (err) {
            setMessages(previousMessages);
            showNotify('Erreur lors de l\'envoi : ' + ((err as any).response?.data?.message || 'Fichier trop lourd (>10MB)'), "error");
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            const startTime = Date.now();
            recorder.onstop = async () => {
                const finalDuration = Math.round((Date.now() - startTime) / 1000);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice_msg_${Date.now()}.webm`, { type: 'audio/webm' });

                const formData = new FormData();
                formData.append('file', audioFile);
                formData.append('type', 'VOICE');
                formData.append('content', 'Message vocal');
                formData.append('duration', finalDuration.toString());

                try {
                    await api.post(`chat/messages/send?roomId=${selectedRoom!.id}&senderId=${user?.id}`, formData);
                    fetchMessages(selectedRoom!.id);
                    fetchRooms();
                } catch (err) {
                    showNotify("Erreur lors de l'envoi du message vocal", 'error');
                }

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            showNotify("Permission micro refusée ou non disponible", 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.onstop = null;
            mediaRecorder.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            showNotify("Enregistrement annulé", "info");
        }
    };

    const deleteMessage = async (messageId: number) => {
        const previousMessages = [...messages];
        // Optimistic UI: remove immediately
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setMessageToDelete(null);

        try {
            await api.delete(`chat/messages/${messageId}?userId=${user?.id}`);
            showNotify("Message supprimé", "success");
        } catch (err) {
            // Rollback on error
            setMessages(previousMessages);
            showNotify("Erreur lors de la suppression", "error");
        }
    };

    const startEditing = (msg: Message) => {
        setEditingMessageId(msg.id);
        setEditingContent(msg.content);
    };

    const saveEdit = async () => {
        if (!editingContent.trim() || !editingMessageId) return;

        const previousMessages = [...messages];
        const idToSave = editingMessageId;
        const contentToSave = editingContent;

        // Optimistic UI: update immediately
        setMessages(prev => prev.map(m => m.id === idToSave ? { ...m, content: contentToSave } : m));

        setIsSaving(true);
        setEditingMessageId(null);
        setEditingContent('');

        try {
            const res = await api.put(`chat/messages/${idToSave}?userId=${user?.id}&content=${encodeURIComponent(contentToSave)}`);
            // Sync with backend data
            setMessages(prev => prev.map(m => m.id === idToSave ? res.data : m));
            setRecentlyEditedId(idToSave);
            setTimeout(() => setRecentlyEditedId(null), 2000);
            showNotify("Message modifié", "success");
        } catch (err) {
            // Rollback on error
            setMessages(previousMessages);
            showNotify("Erreur lors de la modification", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReact = (messageId: number, emoji: string) => {
        setMessageReactions(prev => {
            const current = prev[messageId] || [];
            if (current.includes(emoji)) {
                return { ...prev, [messageId]: current.filter(e => e !== emoji) };
            }
            return { ...prev, [messageId]: [...current, emoji] };
        });
        setActiveMessageMenu(null);
        setShowReactionsMenu(false);
        showNotify("Réaction mise à jour", "success");
    };

    const copyInviteLink = () => {
        if (selectedRoom?.inviteLink) {
            navigator.clipboard.writeText(`${window.location.origin}/join/${selectedRoom.inviteLink}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const filteredRooms = Array.isArray(rooms) ? rooms.filter(r => {
        if (activeTab === 'chats') return r.type !== 'COMMUNITY';
        if (activeTab === 'communities') return r.type === 'COMMUNITY';
        return false;
    }) : [];

    const contextValue = {
        copied, showStickers, setEditingContent, startEditing, editGroupDescription, userSearchResults, setCopied, setActiveMessageMenu, stopRecording, setUserSearchResults, showReactionsMenu, fetchRooms, groupName, recentlyEditedId, setMediaRecorder, setSearchQuery, setShowStickers, uploadingFile, setIsSaving, showMembersPanel, isSearching, setAnnouncements, setMessages, showEditGroup, setNewMemberSearch, cancelRecording, setEditingMessageId, messagesEndRef, setNotification, setIsRecording, scrollRef, editingMessageId, activeTab, updateMemberRole, setShowReactionsMenu, setGroupDescription, groupType, setActiveTab, startPrivateChat, setGroupName, mediaRecorder, createGroup, saveEdit, messageToDelete, lastMessageIdRef, showCreateGroup, searchParams, setNewMessage, messageReactions, editGroupName, setReadAnnouncementIds, deleteGroup, messages, newMessage, setMessageReactions, setIsSearching, updateGroup, selectedAnnouncement, setReplyingTo, user, setUploadingFile, selectedRoom, editingContent, setRoomMembers, activeMessageMenu, searchQuery, showScrollButton, isSaving, userRole, fileInputRef, setShowDeleteConfirm, notification, setMessageToDelete, handleScroll, handleReact, readAnnouncementIds, showInviteLink, setShowCreateGroup, roomMembers, sendMessage, timerRef, setRecordingTime, addMember, isRecording, prefill, setRecentlyEditedId, replyingTo, deleteMessage, recordingTime, announcements, setShowInviteLink, groupDescription, setRooms, setGroupType, setRoomSearchResults, markAnnouncementAsRead, fetchMessages, setShowMembersPanel, copyInviteLink, fetchRoomMembers, fetchAnnouncements, newMemberSearch, audioChunksRef, setSelectedAnnouncement, roomSearchResults, setEditGroupDescription, scrollToBottom, setUserRole, setShowEditGroup, parentRoomId, setShowScrollButton, handleSearchUsers, contactId, startRecording, showDeleteConfirm, rooms, setEditGroupName, setParentRoomId, setSelectedRoom, showNotify, formatTime, filteredRooms
    };

    return (
        <MessagesContext.Provider value={contextValue}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => useContext(MessagesContext);
