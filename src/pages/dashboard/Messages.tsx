import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Send,
    Paperclip,
    MoreVertical,
    CheckCheck,
    Phone,
    Video,
    Smile,
    Image as ImageIcon,
    Users,
    Megaphone,
    Plus,
    FileText,
    Download,
    X,
    MessageCircle,
    Copy,
    Share2,
    Check,
    Lock,
    Settings2,
    Trash2,
    Pencil,
    Mic,
    Square,
    Volume2,
    Reply,
    Heart,
    MoreHorizontal,
    ArrowLeft,
    ChevronsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getFileUrl } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';

interface ChatRoom {
    id: number;
    name: string | null;
    type: 'PRIVATE' | 'GROUP' | 'COMMUNITY';
    imageUrl: string | null;
    inviteLink: string | null;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

interface Message {
    id: number;
    sender: {
        id: number;
        firstName: string;
        lastName: string;
        role: string;
    };
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'STICKER' | 'VOICE';
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    duration: number | null;
    sentAt: string;
    parentMessage?: {
        id: number;
        content: string;
        sender: {
            firstName: string;
        };
    } | null;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    signature: string;
    createdAt: string;
}

const Messages: React.FC<{ role: string }> = ({ role }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chats' | 'communities' | 'announcements'>('chats');
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState<ChatRoom['type']>('GROUP');
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [showInviteLink, setShowInviteLink] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showStickers, setShowStickers] = useState(false);
    const [showEditGroup, setShowEditGroup] = useState(false);
    const [editGroupName, setEditGroupName] = useState('');
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
            const res = await api.post(`chat/rooms/group?adminId=${user.id}&name=${encodeURIComponent(groupName)}&type=${groupType}`);
            setRooms(prev => [res.data, ...prev]);
            setSelectedRoom(res.data);
            setShowCreateGroup(false);
            setGroupName('');
        } catch (err: any) {
            console.error(err);
            showNotify("Erreur lors de la création : " + (err.response?.data?.message || err.message), "error");
        }
    };

    const updateGroup = async () => {
        if (!editGroupName.trim() || !selectedRoom || !user) return;
        try {
            const response = await api.put(`chat/rooms/${selectedRoom.id}?requesterId=${user.id}&name=${encodeURIComponent(editGroupName)}`, {});
            setRooms(prev => prev.map(r => r.id === selectedRoom.id ? response.data : r));
            setSelectedRoom(response.data);
            setShowEditGroup(false);
            showNotify("Groupe mis à jour avec succès !", "success");
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

    return (
        <>
            <div className="bg-slate-100/50 ] shadow-2l flex h-[calc(100vh-140px)] overflow-hidden  ">

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

                {/* Sidebar */}
                <div className={`w-full md:w-80 lg:w-96 flex flex-col bg-white   shadow-sm z-10 ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>

                    {/* Sidebar Header */}
                    <div className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                Messagerie
                                {activeTab === 'communities' && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-1  uppercase">Communautés</span>}
                            </h3>
                            <button
                                onClick={() => setShowCreateGroup(true)}
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
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5  text-xs font-black transition-all ${activeTab === 'announcements' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Megaphone size={16} /> Annonces
                            </button>
                        </div>

                        {/* Search Bar */}
                        {activeTab !== 'announcements' && (
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={18} />
                                <input
                                    type="text"
                                    placeholder={isSearching ? "Chercher un utilisateur..." : "Rechercher une discussion..."}
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
                                        {roomSearchResults.map(room => (
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
                                                            setRoomSearchResults(prev => prev.filter(r => r.id !== room.id));
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
                                        {userSearchResults.map(u => (
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
                                {announcements.map(ann => (
                                    <motion.div
                                        key={ann.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-5 ] bg-amber-50/50   hover:bg-amber-50 transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6  bg-amber-500 text-white flex items-center justify-center">
                                                <Megaphone size={12} fill="currentColor" />
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm line-clamp-1">{ann.title}</h4>
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
                                {filteredRooms.map(room => (
                                    <div
                                        key={room.id}
                                        onClick={() => setSelectedRoom(room)}
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

                {/* Chat Window */}
                <div className={`flex-1 flex flex-col bg-white overflow-hidden relative ${!selectedRoom ? 'hidden md:flex' : 'flex'}`}>
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
                                                setShowEditGroup(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50  transition-all"
                                        >
                                            <Settings2 size={16} />
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
                                                                        {msg.content && <p className="text-sm px-1">{msg.content}</p>}
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
                                                                        {msg.content && <p className="text-sm px-1">{msg.content}</p>}
                                                                    </div>
                                                                ) : msg.type === 'FILE' ? (
                                                                    <div className={`flex items-center gap-4 p-3  ${isMe ? 'bg-blue-500/50' : 'bg-slate-50'}`}>
                                                                        <div className={`w-12 h-12  flex items-center justify-center ${isMe ? 'bg-blue-400' : 'bg-white shadow-sm text-blue-600'}`}>
                                                                            <FileText size={24} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 pr-8">
                                                                            <p className="font-bold text-xs truncate">{msg.fileName}</p>
                                                                            <p className={`text-[10px] font-black ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{(msg.fileSize || 0) / 1024 > 1024 ? ((msg.fileSize || 0) / (1024 * 1024)).toFixed(1) + ' MB' : ((msg.fileSize || 0) / 1024).toFixed(0) + ' KB'}</p>
                                                                        </div>
                                                                        <a href={getFileUrl(msg.fileUrl, true)} download={msg.fileName || 'file'} className="p-2 hover:bg-black/10  transition-all">
                                                                            <Download size={20} />
                                                                        </a>
                                                                    </div>
                                                                ) : msg.type === 'STICKER' ? (
                                                                    <span className="text-4xl">{msg.content}</span>
                                                                ) : msg.type === 'VOICE' ? (
                                                                    <div className="flex items-center gap-3 min-w-[300px] py-1">
                                                                        <div className={`w-10 h-10  flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-blue-600 text-white'}`}>
                                                                            <Volume2 size={12} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-[200px]">
                                                                            <audio
                                                                                src={getFileUrl(msg.fileUrl || '')}
                                                                                controls
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
                                                                                className="w-full h-10 filter brightness-100 contrast-100 invert-0 bg-white  shadow-inner"
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
                                                                        <p className="leading-relaxed">{msg.content}</p>
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
                                                                        {messageReactions[msg.id].map(emoji => (
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
                            <div className="p-8   bg-white">
                                {replyingTo && (
                                    <div className="mb-4 p-4 bg-slate-50    flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase text-blue-600 mb-1">En réponse à {replyingTo.sender.firstName}</p>
                                            <p className="text-xs text-slate-500 truncate">{replyingTo.content}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-white  transition-all">
                                            <X size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                )}
                                {uploadingFile && (
                                    <div className="mb-4 p-4 bg-blue-50    flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 text-white  flex items-center justify-center">
                                                {uploadingFile.type.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{uploadingFile.name}</p>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pret pour envoi - {(uploadingFile.size / (1024 * 1024)).toFixed(2)}MB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setUploadingFile(null)} className="p-2 hover:bg-white  transition-all">
                                            <X size={20} className="text-slate-400" />
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={sendMessage} className="flex items-center gap-5 bg-slate-50 p-3 ]   focus-within:ring-4 focus-within:ring-blue-500/10 focus-within: focus-within:bg-white transition-all">
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
                                                            onClick={() => { setNewMessage(prev => prev + emoji); setShowStickers(false); }}
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
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage(e as any);
                                                    }
                                                }}
                                                placeholder="Taper votre message ici..."
                                                className="flex-1 bg-transparent border-none outline-none text-slate-700 text-xs font-medium py-1.5"
                                            />

                                            <div className="flex items-center gap-3 pr-2">
                                                <button
                                                    type="button"
                                                    onClick={startRecording}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50  transition-all shadow-sm"
                                                    title="Message Vocal"
                                                >
                                                    <Mic size={18} />
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={`p-3  transition-all shadow-2xl ${newMessage.trim() || uploadingFile ? 'bg-slate-900 text-white shadow-slate-900/30 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
            </div>

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
                            className="relative w-full max-w-md bg-white ] shadow-3xl overflow-hidden"
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
                            className="relative w-full max-w-md bg-white ] shadow-3xl overflow-hidden p-8"
                        >
                            <h3 className="text-2xl font-black text-slate-900 mb-6">Paramètres de l'espace</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Nom de l'espace</label>
                                    <input
                                        type="text"
                                        value={editGroupName}
                                        onChange={(e) => setEditGroupName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50   ] focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus: outline-none transition-all"
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

export default Messages;

