import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Megaphone, Plus, X, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMessages } from './MessagesContext';
import api from '../../../api/axios';

export const Sidebar = () => {
    const {
        selectedRoom,
        selectedAnnouncement,
        activeTab,
        setActiveTab,
        announcements,
        readAnnouncementIds,
        isSearching,
        setIsSearching,
        searchQuery,
        setSearchQuery,
        handleSearchUsers,
        setUserSearchResults,
        roomSearchResults,
        userSearchResults,
        startPrivateChat,
        setSelectedAnnouncement,
        setSelectedRoom,
        markAnnouncementAsRead,
        filteredRooms,
        setParentRoomId,
        setGroupDescription,
        setShowCreateGroup,
        user,
        fetchRooms,
        setRoomSearchResults,
        showNotify
    } = useMessages();

    return (
        <div className={`w-full md:w-64 lg:w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-10 ${(selectedRoom || selectedAnnouncement) ? 'hidden md:flex' : 'flex'}`}>

            {/* Sidebar Header */}
            <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        Messagerie
                        {activeTab === 'communities' && <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] px-2.5 py-0.5 rounded-xl font-bold uppercase">Communautés</span>}
                    </h3>
                    <button
                        onClick={() => { setParentRoomId(null); setGroupDescription(""); setShowCreateGroup(true); }}
                        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-md shrink-0"
                        title="Nouveau groupe"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl mb-4 border border-slate-200/50 dark:border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'chats' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <MessageCircle size={14} /> Discussions
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'communities' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <Users size={14} /> Groupes
                    </button>
                    <button
                        onClick={() => setActiveTab('announcements')}
                        className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'announcements' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <Megaphone size={14} /> Annonces
                        {announcements.filter((a: any) => !readAnnouncementIds.includes(a.id)).length > 0 && (
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Search Input */}
                {activeTab !== 'announcements' && (
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={isSearching ? "Rechercher par email ou nom..." : "Rechercher..."}
                            value={searchQuery}
                            onChange={(e) => isSearching ? handleSearchUsers(e.target.value) : setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearching(true)}
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                        {isSearching && (
                            <button
                                onClick={() => { setIsSearching(false); setSearchQuery(''); setUserSearchResults([]); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Chat List Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {isSearching && (userSearchResults.length > 0 || roomSearchResults.length > 0) ? (
                    <div className="space-y-4">
                        {roomSearchResults.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Groupes & Communautés</p>
                                {roomSearchResults.map((room: any) => (
                                    <div
                                        key={room.id}
                                        className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${room.type === 'COMMUNITY' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'}`}>
                                                {(room.name || "G")[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{room.name || "Groupe"}</h4>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">{room.type}</p>
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
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            Rejoindre
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {userSearchResults.length > 0 && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">Personnes</p>
                                {userSearchResults.map((u: any) => (
                                    <div
                                        key={u.id}
                                        onClick={() => startPrivateChat(u)}
                                        className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex gap-3 items-center transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                            {u.firstName?.[0]}{u.lastName?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{u.firstName} {u.lastName}</h4>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{u.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'announcements' ? (
                    <div className="space-y-2">
                        {announcements.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 px-4">
                                <Megaphone size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucune annonce</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Aucune annonce officielle publiée pour le moment.</p>
                            </div>
                        ) : (
                            announcements.map((ann: any) => (
                                <motion.div
                                    key={ann.id}
                                    onClick={() => {
                                        setSelectedAnnouncement(ann);
                                        setSelectedRoom(null);
                                        markAnnouncementAsRead(ann.id);
                                    }}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-2xl relative cursor-pointer transition-all border ${selectedAnnouncement?.id === ann.id ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm' : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {!readAnnouncementIds.includes(ann.id) && (
                                        <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
                                    )}
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Megaphone size={12} fill="currentColor" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate pr-4">{ann.title}</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">{ann.content}</p>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                        <span>{ann.signature || 'Administration'}</span>
                                        <span>{ann.createdAt ? format(new Date(ann.createdAt), 'dd MMMM', { locale: fr }) : ''}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredRooms.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 px-4">
                                <MessageCircle size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Aucune discussion</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Recherchez un contact ou créez un groupe pour démarrer une conversation.</p>
                            </div>
                        ) : (
                            filteredRooms.map((room: any) => (
                                <div
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setSelectedAnnouncement(null);
                                    }}
                                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 relative border ${selectedRoom?.id === room.id ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-sm' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden font-bold text-xs ${room.type === 'COMMUNITY' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : room.type === 'GROUP' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                                            {room.imageUrl ? <img src={room.imageUrl} alt="" className="w-full h-full object-cover" /> : (room.name ? room.name[0] : '?')}
                                        </div>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{room.name || 'Discussion'}</h4>
                                            <span className="text-[9px] text-slate-400 font-medium">
                                                {room.lastMessageDate ? format(new Date(room.lastMessageDate), 'HH:mm', { locale: fr }) : ''}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium flex items-center gap-1">
                                                {room.lastMessageContent || (room.type !== 'PRIVATE' ? 'Groupe de discussion' : 'Discussion privée')}
                                            </p>
                                            {room.unreadCount && room.unreadCount > 0 ? (
                                                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold shrink-0 ml-2">
                                                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
