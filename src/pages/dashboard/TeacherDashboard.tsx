import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    Calendar,
    Clock,
    ChevronRight,
    Star,
    MessageSquare,
    AlertCircle,
    Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classes, setClasses] = React.useState<any[]>([]);
    const [timetableEntries, setTimetableEntries] = React.useState<any[]>([]);
    const [teacherSpecialties, setTeacherSpecialties] = React.useState<string[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [recentChats, setRecentChats] = React.useState<any[]>([]);
    const [recentLessons, setRecentLessons] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({ pendingCopies: 0, unreadMsgs: 0 });

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            try {
                // Fetch classes
                const resClasses = await api.get(`/classes/teacher/${user.id}`);
                setClasses(resClasses.data || []);

                // Fetch timetable
                const resTimetable = await api.get(`/timetable/teacher/${user.id}`).catch(() => ({ data: [] }));
                setTimetableEntries(resTimetable.data || []);

                // Fetch pending submissions count
                const resPending = await api.get(`/submissions/teacher/${user.id}/count-pending`).catch(() => ({ data: 0 }));
                // Fetch unread messages count
                const resUnread = await api.get(`/chat/unread/${user.id}`).catch(() => ({ data: { unreadCount: 0 } }));

                setStats({
                    pendingCopies: resPending.data || 0,
                    unreadMsgs: resUnread.data?.unreadCount || 0
                });

                // Fetch teacher details for specialties
                const resTeacher = await api.get(`/teachers/${user.id}`).catch(() => ({ data: {} }));
                const rawSpecialties = resTeacher.data?.specialties || [];
                setTeacherSpecialties(Array.from(new Set(rawSpecialties)));

                // Fetch recent chats
                const resRooms = await api.get(`chat/rooms/${user.id}`).catch(() => ({ data: [] }));
                const topRooms = (resRooms.data || []).slice(0, 3);

                const chatsWithMessages = await Promise.all(topRooms.map(async (room: any) => {
                    try {
                        const msgRes = await api.get(`chat/rooms/${room.id}/messages`);
                        const msgs = msgRes.data || [];
                        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

                        const formatTime = (dateStr: string) => {
                            const date = new Date(dateStr);
                            const now = new Date();
                            const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

                            if (diffInSeconds < 60) return "À l'instant";
                            if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
                            if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
                            if (diffInSeconds < 172800) return "Hier";
                            return date.toLocaleDateString();
                        };

                        return {
                            id: room.id,
                            name: room.name || 'Conversation',
                            text: lastMsg ? lastMsg.content : 'Nouvelle conversation',
                            time: lastMsg ? formatTime(lastMsg.sentAt) : formatTime(room.createdAt),
                            unread: (room.unreadCount || 0) > 0
                        };
                    } catch {
                        return { id: room.id, name: room.name || 'Chat', text: 'Impossible de charger', time: '', unread: (room.unreadCount || 0) > 0 };
                    }
                }));

                setRecentChats(chatsWithMessages);

                // Fetch recent lessons
                const resLessons = await api.get(`/lessons/teacher/${user.id}`).catch(() => ({ data: [] }));
                setRecentLessons((resLessons.data || []).slice(0, 3));
            } catch (err) {
                console.error("Erreur lors du chargement des données enseignant:", err);
            }
        };
        fetchData();
    }, [user?.id]);

    const getNextClassTime = (classeId: number) => {
        const dayMap: { [key: string]: number } = {
            'DIMANCHE': 0, 'LUNDI': 1, 'MARDI': 2, 'MERCREDI': 3, 'JEUDI': 4, 'VENDREDI': 5, 'SAMEDI': 6
        };

        const now = new Date();
        const currentDayIdx = now.getDay();
        const currentHour = now.getHours() * 60 + now.getMinutes();

        const classEntries = timetableEntries.filter(e => e.classeId === classeId);
        if (classEntries.length === 0) return { dayText: "Non planifié", timeText: "--h--" };

        const upcoming = classEntries.map(e => {
            const entryDayIdx = dayMap[e.dayOfWeek?.toUpperCase()] || 0;
            const [h, m] = (e.startTime || "00:00").split(':').map(Number);
            const entryTime = h * 60 + (m || 0);

            let daysDiff = entryDayIdx - currentDayIdx;
            if (daysDiff < 0 || (daysDiff === 0 && entryTime <= currentHour)) {
                daysDiff += 7;
            }

            const minutesUntil = daysDiff * 24 * 60 + (entryTime - currentHour);
            return { ...e, minutesUntil, daysDiff };
        }).sort((a, b) => a.minutesUntil - b.minutesUntil);

        const nextEntry = upcoming[0];

        let dayText = "";
        if (nextEntry.daysDiff === 0) {
            dayText = "Aujourd'hui";
        } else if (nextEntry.daysDiff === 1) {
            dayText = "Demain";
        } else {
            dayText = nextEntry.dayOfWeek ? (nextEntry.dayOfWeek.charAt(0).toUpperCase() + nextEntry.dayOfWeek.slice(1).toLowerCase()) : "";
        }

        return { dayText, timeText: `${nextEntry.startTime} - ${nextEntry.endTime}` };
    };

    const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Cours du jour</p>
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                            {timetableEntries.filter(e => {
                                const days = ['DIMANCHE', 'LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
                                return e.dayOfWeek?.toUpperCase() === days[new Date().getDay()];
                            }).length} Séances
                        </h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Calendar size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Copies à corriger</p>
                        <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCopies} Copies</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <BookOpen size={24} />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Messages non lus</p>
                        <h4 className="text-xl font-bold text-red-600 dark:text-red-400">{stats.unreadMsgs} Messages</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Classes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Mes Classes Actives</h3>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une classe..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none w-full sm:w-64"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredClasses.length > 0 ? filteredClasses.map((cls: any, i) => (
                                <ClassCard
                                    key={cls.id}
                                    onClick={() => navigate('/dashboard/teacher/classes', { state: { openClassId: cls.id } })}
                                    grade={cls.name}
                                    subject={cls.subjectsTaught && cls.subjectsTaught.length > 0 ? cls.subjectsTaught.join(', ') : (teacherSpecialties.length > 0 ? teacherSpecialties.join(', ') : 'Toutes les matières')}
                                    students={cls.capacity || 0}
                                    boys={cls.boysCount || 0}
                                    girls={cls.girlsCount || 0}
                                    nextDay={getNextClassTime(cls.id).dayText}
                                    nextTime={getNextClassTime(cls.id).timeText}
                                    isMainTeacher={cls.mainTeacher?.id === user?.id}
                                    color={['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600'][i % 4]}
                                />
                            )) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400 col-span-2 py-6 text-center">Aucune classe ne correspond à votre recherche.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Cahier de Texte Récent</h3>
                        <div className="space-y-2">
                            {recentLessons.length > 0 ? recentLessons.map((lesson) => (
                                <LessonItem
                                    key={lesson.id}
                                    title={lesson.title}
                                    grade={lesson.classe?.name}
                                    date={new Date(lesson.lessonDate).toLocaleDateString('fr-FR')}
                                />
                            )) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">Aucune séance récente enregistrée.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Messages & Actions */}
                <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-850 p-6 rounded-2xl border border-slate-800 text-white shadow-sm relative overflow-hidden">
                        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                            <MessageSquare size={18} className="text-blue-400" /> Messagerie
                        </h3>
                        <div className="space-y-4">
                            {recentChats.length > 0 ? recentChats.map((chat) => (
                                <MessageItem
                                    key={chat.id}
                                    name={chat.name}
                                    text={chat.text}
                                    time={chat.time}
                                    unread={chat.unread}
                                />
                            )) : (
                                <p className="text-slate-400 text-xs text-center py-4">Aucun message récent</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/teacher/messages')}
                            className="w-full mt-6 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-wider text-white"
                        >
                            Ouvrir la messagerie
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Actions Rapides
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/dashboard/teacher/book')}
                                className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-600 hover:text-white transition-all text-center"
                            >
                                Nouveau Cours
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/homework')}
                                className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-center"
                            >
                                Nouveau Devoir
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/grades')}
                                className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-600 hover:text-white transition-all text-center"
                            >
                                Saisir Notes
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/attendance')}
                                className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-center"
                            >
                                Historique Appels
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClassCard = ({ grade, subject, students, nextDay, nextTime, color, boys, girls, isMainTeacher, onClick }: { grade: string, subject: string, students: number, nextDay: string, nextTime: string, color: string, boys?: number, girls?: number, isMainTeacher?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group">
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 text-[10px] font-bold text-white rounded-lg uppercase tracking-wider ${color}`}>
                    {grade}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase">{nextTime}</span>
                </div>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight truncate">{subject}</h4>
            <div className="space-y-1">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">{nextDay}</p>
                {isMainTeacher && (
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-amber-500" />
                        <span className="text-[10px] font-bold uppercase">Enseignant Principal</span>
                    </div>
                )}
            </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                <Users size={14} className="text-slate-400" />
                <span>{students} élèves</span>
            </div>
            {(boys !== undefined || girls !== undefined) && (
                <div className="flex gap-1 text-[10px] font-bold">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md">{boys || 0} G</span>
                    <span className="px-2 py-0.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-md">{girls || 0} F</span>
                </div>
            )}
        </div>
    </div>
);

const LessonItem = ({ title, grade, date }: { title: string, grade: string, date: string }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen size={16} />
            </div>
            <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{grade} • {date}</p>
            </div>
        </div>
        <ChevronRight size={16} className="text-slate-400" />
    </div>
);

const MessageItem = ({ name, text, time, unread }: { name: string, text: string, time: string, unread: boolean }) => (
    <div className="space-y-0.5 cursor-pointer group">
        <div className="flex items-center justify-between">
            <h5 className={`text-xs font-bold ${unread ? 'text-white' : 'text-slate-300'}`}>{name}</h5>
            <span className="text-[10px] text-blue-400 font-semibold">{time}</span>
        </div>
        <p className={`text-xs ${unread ? 'text-slate-200 font-semibold' : 'text-slate-400'} truncate group-hover:text-white transition-colors`}>{text}</p>
    </div>
);

export default TeacherDashboard;
