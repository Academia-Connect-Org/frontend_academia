import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    User,
    PlayCircle,
    Download,
    FileText,
    TrendingUp,
    BarChart3,
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

const StudentCourses: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lessons, setLessons] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.classe?.id) {
            fetchData();
        }
    }, [user?.classe?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const lessonsRes = await api.get(`/lessons/classe/${user?.classe?.id}`);
            setLessons(lessonsRes.data);
        } catch (err) {
            console.error("Erreur chargement cours:", err);
        } finally {
            setLoading(false);
        }
    };

    const recentLessons = lessons.slice(0, 6);

    if (loading) {
        return (
            <>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 uppercase">Journal des Cours</h2>
                    <p className="text-slate-500 font-medium">Consulte le contenu des séances passées pour chaque matière.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {recentLessons.length > 0 ? recentLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-white rounded-[48px] shadow-lg border border-slate-100 group transition-all duration-300 hover:bg-slate-50/50 hover:-translate-y-2 relative overflow-hidden flex flex-col p-8">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-blue-600 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`}></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 bg-blue-600 text-white rounded-[24px] flex items-center justify-center font-black text-xl shadow-xl shadow-slate-900/10 group-hover:rotate-6 transition-transform`}>
                                <BookOpen size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(lesson.lessonDate).toLocaleDateString()}</span>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{lesson.title}</h3>
                        <div className="flex items-center gap-1.5 mb-6">
                            <User size={12} className="text-slate-300" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {lesson.teacher?.lastName} {lesson.teacher?.firstName}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl mb-6 flex-1">
                            <p className="text-xs text-slate-500 line-clamp-3 font-medium leading-relaxed">
                                {lesson.content}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp size={12} /> {lesson.duration}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText size={12} /> Terminé
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/dashboard/student/messages?contactId=${lesson.teacher?.id}`)}
                                    className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Consulter <ChevronRight size={14} />
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/student/messages?contactId=${lesson.teacher?.id}`)}
                                    className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center"
                                    title="Contacter le professeur"
                                >
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="lg:col-span-3 text-center py-20 bg-white rounded-[48px] border border-slate-100">
                        <p className="text-slate-400 font-bold uppercase tracking-widest italic">Aucune séance enregistrée pour le moment.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[300px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[80px]"></div>
                    <h3 className="text-2xl font-black mb-10 relative z-10 tracking-tight flex items-center gap-3">
                        <BarChart3 size={24} className="text-blue-400" /> Vue d'ensemble
                    </h3>
                    <div className="space-y-8 relative z-10">
                        <SmallLegendItem label="Matières Actives" value={`${new Set(lessons.map(l => l.title)).size}`} color="bg-emerald-500" percent={100} />
                        <SmallLegendItem label="Séances Validées" value={`${lessons.length}`} color="bg-blue-500" percent={100} />
                        <SmallLegendItem label="Assiduité" value="95%" color="bg-indigo-500" percent={95} />
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[48px] shadow-2xl border border-blue-50 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-slate-800">Ressources Utiles</h3>
                            <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none shadow-sm">Temps Réel</div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResourceBox title="Syllabus Annuel" description="Programme complet 2024." icon={FileText} type="PDF" />
                        <ResourceBox title="Méthodologie" description="Comment réviser efficacement." icon={PlayCircle} type="VIDEO" />
                        <ResourceBox title="Annales Concours" description="Sujets des années précédentes." icon={TrendingUp} type="LINK" />
                        <ResourceBox title="Règlement Intérieur" description="Droits et devoirs de l'élève." icon={User} type="PDF" />
                    </div>
                </div>
            </div>
        </>
    );
};

const ResourceBox = ({ title, description, icon: Icon, type }: { title: string, description: string, icon: any, type: string }) => (
    <div className="p-6 rounded-[32px] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 border border-transparent hover:border-blue-100 transition-all group flex gap-4 cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:rotate-6 transition-all duration-300">
            <Icon size={24} />
        </div>
        <div className="flex-1">
            <h5 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight leading-none">{title}</h5>
            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 mb-2 leading-none">{description}</p>
            <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{type}</span>
        </div>
        <Download size={16} className="text-slate-100 group-hover:text-slate-300 transition-colors" />
    </div>
);

const SmallLegendItem = ({ label, value, color, percent }: { label: string, value: string, color: string, percent: number }) => (
    <div className="group">
        <div className="flex justify-between items-end mb-3 group-hover:translate-x-1 transition-transform">
            <div>
                <span className="text-[10px] font-black text-blue-300/60 uppercase tracking-widest block mb-1 leading-none">{label}</span>
                <span className="text-lg font-black text-white leading-none tracking-tight">{value}</span>
            </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
                className={`h-full ${color} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

export default StudentCourses;
