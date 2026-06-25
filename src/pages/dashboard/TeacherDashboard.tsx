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
                setClasses(resClasses.data);

                // Fetch pending submissions count
                const resPending = await api.get(`/submissions/teacher/${user.id}/count-pending`);
                // Fetch unread messages count
                const resUnread = await api.get(`/chat/unread/${user.id}`);

                setStats({
                    pendingCopies: resPending.data,
                    unreadMsgs: resUnread.data.unreadCount || 0
                });

                // Fetch teacher details for specialties
                const resTeacher = await api.get(`/teachers/${user.id}`);
                const rawSpecialties = resTeacher.data.specialties || [];
                setTeacherSpecialties(Array.from(new Set(rawSpecialties)));

                // Fetch recent chats
                const resRooms = await api.get(`chat/rooms/${user.id}`);
                const topRooms = resRooms.data.slice(0, 3);

                const chatsWithMessages = await Promise.all(topRooms.map(async (room: any) => {
                    try {
                        const msgRes = await api.get(`chat/rooms/${room.id}/messages`);
                        const msgs = msgRes.data;
                        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

                        // Utility to format time properly
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
                            unread: room.unreadCount > 0
                        };
                    } catch {
                        return { id: room.id, name: room.name || 'Chat', text: 'Impossible de charger', time: '', unread: room.unreadCount > 0 };
                    }
                }));

                setRecentChats(chatsWithMessages);

                // Fetch recent lessons
                const resLessons = await api.get(`/lessons/teacher/${user.id}`);
                setRecentLessons(resLessons.data.slice(0, 3));
            } catch (err) {
                console.error("Erreur lors du chargement des données enseignant:", err);
            }
        };
        fetchData();
    }, [user?.id]);

    const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 ] shadow-lg   flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Cours du jour</p>
                        <h4 className="text-2xl font-black text-slate-800">4 Séances</h4>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600  flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 ] shadow-lg   flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Copies à corriger</p>
                        <h4 className="text-2xl font-black text-amber-600">{stats.pendingCopies} Copies</h4>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600  flex items-center justify-center">
                        <BookOpen size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 ] shadow-lg   flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Messages unread</p>
                        <h4 className="text-2xl font-black text-red-600">{stats.unreadMsgs} Messages</h4>
                    </div>
                    <div className="w-12 h-12 bg-red-50 text-red-600  flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Classes */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 ] shadow-xl  ">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Mes Classes Actives</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher une classe..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-50    text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus: transition-all text-slate-600 font-medium"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredClasses.length > 0 ? filteredClasses.map((cls: any, i) => (
                                <ClassCard
                                    key={cls.id}
                                    grade={cls.name}
                                    subject={cls.subjectsTaught && cls.subjectsTaught.length > 0 ? cls.subjectsTaught.join(', ') : (teacherSpecialties.length > 0 ? teacherSpecialties.join(', ') : 'Toutes les matières')}
                                    students={cls.capacity}
                                    boys={cls.boysCount}
                                    girls={cls.girlsCount}
                                    time="Emploi du temps..."
                                    color={['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-emerald-600'][i % 4]}
                                />
                            )) : (
                                <p className="text-slate-500 font-medium col-span-2">Aucune classe ne correspond à votre recherche.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Cahier de Texte Récent</h3>
                        <div className="space-y-4">
                            {recentLessons.length > 0 ? recentLessons.map((lesson) => (
                                <LessonItem
                                    key={lesson.id}
                                    title={lesson.title}
                                    grade={lesson.classe?.name}
                                    date={new Date(lesson.lessonDate).toLocaleDateString()}
                                />
                            )) : (
                                <p className="text-slate-400 text-sm italic py-4">Aucune séance récente enregistrée.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Messages & Todo */}
                <div className="space-y-8">
                    <div className="bg-slate-900 ] p-8 text-white shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20  blur-3xl"></div>
                        <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-2">
                            <MessageSquare size={20} className="text-blue-400" /> Messagerie
                        </h3>
                        <div className="space-y-6 relative z-10">
                            {recentChats.length > 0 ? recentChats.map((chat) => (
                                <MessageItem
                                    key={chat.id}
                                    name={chat.name}
                                    text={chat.text}
                                    time={chat.time}
                                    unread={chat.unread}
                                />
                            )) : (
                                <p className="text-blue-100/50 text-sm text-center py-4">Aucun message récent</p>
                            )}
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/teacher/messages')}
                            className="w-full mt-10 bg-white/10 hover:bg-white/20 py-4  font-bold transition-all   text-xs uppercase tracking-widest"
                        >
                            Ouvrir la messagerie
                        </button>
                    </div>

                    <div className="bg-white p-8 ] shadow-xl   italic">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            Actions Rapides
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/dashboard/teacher/book')}
                                className="p-4 bg-blue-50 text-blue-600  font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all text-center  "
                            >
                                Nouveau Cours
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/homework')}
                                className="p-4 bg-indigo-50 text-indigo-600  font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all text-center  "
                            >
                                Nouveau Devoir
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/grades')}
                                className="p-4 bg-amber-50 text-amber-600  font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all text-center  "
                            >
                                Saisir Notes
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/teacher/attendance')}
                                className="p-4 bg-emerald-50 text-emerald-600  font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-center  "
                            >
                                Historique Appels
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Star size={20} className="text-amber-500" /> À Faire
                        </h3>
                        <div className="space-y-4">
                            <TodoItem text="Saisir les notes de la 3ème B" checked={false} />
                            <TodoItem text="Préparer le TP de physique" checked={true} />
                            <TodoItem text="Appeler le parent de Marc Yao" checked={false} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ClassCard = ({ grade, subject, students, time, color, boys, girls }: { grade: string, subject: string, students: number, time: string, color: string, boys?: number, girls?: number }) => (
    <div className="group relative p-6 ] bg-white   hover: hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px]">
        {/* Animated background shape */}
        <div className={`absolute -top-12 -right-12 w-24 h-24  blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${color}`}></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
                <div className={`px-4 py-1.5  text-[10px] font-black text-white shadow-lg uppercase tracking-widest ${color}`}>
                    {grade}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50    group-hover:bg-blue-50 group-hover: transition-all">
                    <Clock size={12} className="text-slate-400 group-hover:text-blue-500" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:text-blue-600">Prochain: --h--</span>
                </div>
            </div>
            <h4 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{subject}</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{time}</p>
        </div>

        <div className="relative z-10 pt-5   mt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8  bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users size={14} />
                    </div>
                    <span className="text-xs font-black text-slate-700 tracking-tight">{students} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Total</span></span>
                </div>
                {boys !== undefined && girls !== undefined && (
                    <div className="flex gap-2">
                        <div className="px-2 py-1 bg-blue-50/50  text-[10px] font-black text-blue-600  ">{boys} G</div>
                        <div className="px-2 py-1 bg-pink-50/50  text-[10px] font-black text-pink-600  ">{girls} F</div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const LessonItem = ({ title, grade, date }: { title: string, grade: string, date: string }) => (
    <div className="flex items-center justify-between p-4  bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white  shadow-sm flex items-center justify-center text-blue-600">
                <BookOpen size={18} />
            </div>
            <div>
                <h5 className="text-sm font-bold text-slate-800">{title}</h5>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{grade} • {date}</p>
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-300" />
    </div>
);

const MessageItem = ({ name, text, time, unread }: { name: string, text: string, time: string, unread: boolean }) => (
    <div className="space-y-1 cursor-pointer group">
        <div className="flex items-center justify-between">
            <h5 className={`text-sm font-bold ${unread ? 'text-white' : 'text-blue-100/70'}`}>{name}</h5>
            <span className="text-[10px] text-blue-400 font-bold">{time}</span>
        </div>
        <p className={`text-xs ${unread ? 'text-blue-100' : 'text-blue-100/40'} line-clamp-1 group-hover:text-white transition-colors`}>{text}</p>
    </div>
);

const TodoItem = ({ text, checked }: { text: string, checked: boolean }) => (
    <div className="flex items-center gap-3">
        <div className={`w-5 h-5   transition-all flex items-center justify-center shrink-0 ${checked ? 'bg-emerald-500 ' : ''}`}>
            {checked && <Star size={10} className="text-white fill-white" />}
        </div>
        <span className={`text-sm font-medium ${checked ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{text}</span>
    </div>
);

export default TeacherDashboard;
