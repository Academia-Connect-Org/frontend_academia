import React from 'react';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    ChevronRight,
    FileText,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    History,
    X
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

const Book: React.FC = () => {
    const { user } = useAuth();
    const [lessons, setLessons] = React.useState<any[]>([]);
    const [classes, setClasses] = React.useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [editingLesson, setEditingLesson] = React.useState<any>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState('');

    // Form state
    const [newLesson, setNewLesson] = React.useState({
        title: '',
        content: '',
        classeId: '',
        duration: '2h',
        lessonDate: new Date().toISOString().split('T')[0]
    });

    React.useEffect(() => {
        fetchData();
    }, [user?.id]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [lessonsRes, classesRes] = await Promise.all([
                api.get(`/lessons/teacher/${user.id}`),
                api.get(`/classes/teacher/${user.id}`)
            ]);
            console.log("Fetched Lessons:", lessonsRes.data);
            console.log("Fetched Classes for Book:", classesRes.data);

            setLessons(lessonsRes.data);
            setClasses(classesRes.data);

            if (classesRes.data.length > 0) {
                setNewLesson(prev => ({ ...prev, classeId: classesRes.data[0].id.toString() }));
            }
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: newLesson.title,
                content: newLesson.content,
                duration: newLesson.duration,
                lessonDate: new Date(newLesson.lessonDate).toISOString(),
                teacher: { id: user?.id },
                classe: { id: parseInt(newLesson.classeId) },
                status: 'Terminé'
            };

            if (editingLesson) {
                await api.put(`/lessons/${editingLesson.id}`, payload);
            } else {
                await api.post('/lessons', payload);
            }

            setIsModalOpen(false);
            setEditingLesson(null);
            setNewLesson({ ...newLesson, title: '', content: '' });
            fetchData();
        } catch (err) {
            console.error("Erreur lors de l'enregistrement de la séance:", err);
        }
    };

    const handleEditClick = (lesson: any) => {
        setEditingLesson(lesson);
        setNewLesson({
            title: lesson.title,
            content: lesson.content,
            classeId: lesson.classe?.id?.toString() || '',
            duration: lesson.duration,
            lessonDate: new Date(lesson.lessonDate).toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const filteredLessons = React.useMemo(() => {
        return lessons.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                l.content.toLowerCase().includes(searchQuery.toLowerCase());

            const lessonDate = new Date(l.lessonDate);
            const y = lessonDate.getFullYear();
            const m = String(lessonDate.getMonth() + 1).padStart(2, '0');
            const d = String(lessonDate.getDate()).padStart(2, '0');
            const lessonDateStr = `${y}-${m}-${d}`;

            const matchesDate = !dateFilter || lessonDateStr === dateFilter;
            return matchesSearch && matchesDate;
        });
    }, [lessons, searchQuery, dateFilter]);
    return (
        <>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">Journal de Classe</h2>
                    <p className="text-slate-500 font-medium">Consignez vos séances et suivez l'avancement des cours.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-4  font-black flex items-center gap-3 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} /> Nouvelle Séance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content: Recent Lessons */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 ] shadow-2xl   relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50  blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <History size={22} className="text-blue-600" /> Séances Récentes
                            </h3>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Chercher..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-slate-50 border-none  pl-11 pr-4 py-2.5 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all w-48"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={e => setDateFilter(e.target.value)}
                                        className="bg-slate-50 border-none  pl-11 pr-4 py-2.5 text-[10px] font-bold outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                                    className="p-2.5 bg-slate-50  text-slate-400 hover:text-red-600 transition-all"
                                    title="Réinitialiser les filtres"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
                                <div key={lesson.id} className="group cursor-pointer" onClick={() => handleEditClick(lesson)}>
                                    <div className="p-6 ] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5   hover: transition-all duration-300 relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4 items-center">
                                                <div className={`w-12 h-12  flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${lesson.status === 'Terminé' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {lesson.status === 'Terminé' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-600  text-[10px] font-black uppercase tracking-widest">{lesson.classe?.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Calendar size={12} /> {new Date(lesson.lessonDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lesson.title}</h4>
                                                </div>
                                            </div>
                                            <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical size={20} /></button>
                                        </div>
                                        <div className="pl-16">
                                            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">{lesson.content}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Clock size={12} /> {lesson.duration}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <FileText size={12} /> Aucun document
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="absolute right-6 bottom-6 text-slate-200 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-500 font-bold italic">Aucune séance enregistrée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Schedule & Quick Entry */}
                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 ] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20  blur-[80px]"></div>
                        <h3 className="text-2xl font-black mb-8 relative z-10 tracking-tight">Prochain Cours</h3>
                        <div className="space-y-6 relative z-10 mb-10">
                            <div className="p-6 bg-white/5    hover:bg-white/10 transition-all cursor-pointer">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="bg-emerald-500 text-white px-3 py-1  text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30">En cours</span>
                                    <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Salle B4</span>
                                </div>
                                <h4 className="text-xl font-black mb-1 uppercase tracking-tight">Probabilités</h4>
                                <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest mb-4">Terminal C • 2h</p>
                                <button className="w-full bg-white text-slate-900 py-4  font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                                    Remplir le cahier
                                </button>
                            </div>

                            <div className="p-6 bg-white/5    opacity-60">
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest block mb-1">16:30 - 18:00</span>
                                <h4 className="text-lg font-black uppercase tracking-tight">Algèbre Linéaire</h4>
                                <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest">1ère D • Salle A12</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 ] shadow-xl  ">
                        <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-blue-600" /> Rappels Académiques
                        </h4>
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50   ">
                                <p className="text-xs text-blue-900 font-bold leading-relaxed">Pensez à uploader le syllabus pour la classe de Terminal C avant vendredi.</p>
                            </div>
                            <div className="p-4 bg-emerald-50   ">
                                <p className="text-xs text-emerald-900 font-bold leading-relaxed">Tous vos cahiers de texte de la semaine passée sont validés. Félicitations !</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Nouvelle Séance */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setEditingLesson(null); }}></div>
                    <div className="bg-white ] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-2xl  ">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800">{editingLesson ? 'Modifier la Séance' : 'Nouvelle Séance'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingLesson(null); }} className="p-2 hover:bg-slate-100  transition-all"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateLesson} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Titre de la séance</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Les équations différentielles"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                                    className="w-full bg-slate-50 border-none  px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Classe</label>
                                    <select
                                        value={newLesson.classeId}
                                        onChange={e => setNewLesson({ ...newLesson, classeId: e.target.value })}
                                        className="w-full bg-slate-50 border-none  px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none appearance-none"
                                        required
                                    >
                                        {classes.length === 0 ? (
                                            <option value="">Chargement...</option>
                                        ) : (
                                            classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newLesson.lessonDate}
                                        onChange={e => setNewLesson({ ...newLesson, lessonDate: e.target.value })}
                                        className="w-full bg-slate-50 border-none  px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Durée</label>
                                    <input
                                        type="text"
                                        placeholder="2h"
                                        value={newLesson.duration}
                                        onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })}
                                        className="w-full bg-slate-50 border-none  px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contenu de la séance</label>
                                <textarea
                                    rows={4}
                                    placeholder="Résumé du cours, exercices effectués..."
                                    value={newLesson.content}
                                    onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
                                    className="w-full bg-slate-50 border-none  px-6 py-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-5  font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest uppercase text-xs">
                                {editingLesson ? 'Mettre à jour' : 'Enregistrer la séance'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Book;
