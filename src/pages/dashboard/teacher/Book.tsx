import React from 'react';
import {
    Plus,
    Search,
    Calendar,
    Clock,
    ChevronRight,
    FileText,
    CheckCircle2,
    History,
    X,
    Edit
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
    const [viewingLesson, setViewingLesson] = React.useState<any>(null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dateFilter, setDateFilter] = React.useState('');

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

            setLessons(lessonsRes.data || []);
            setClasses(classesRes.data || []);

            if ((classesRes.data || []).length > 0) {
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
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Journal de Classe</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consignez vos séances et suivez l'avancement des cours.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                >
                    <Plus size={16} /> Nouvelle Séance
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Recent Lessons */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <History size={18} className="text-blue-600 dark:text-blue-400" /> Séances Récentes
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Chercher..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none w-36 sm:w-44"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={e => setDateFilter(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                {(searchQuery || dateFilter) && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                                        className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
                                <div key={lesson.id} className="group cursor-pointer" onClick={() => setViewingLesson(lesson)}>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-3 items-center">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${lesson.status === 'Terminé' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'}`}>
                                                    {lesson.status === 'Terminé' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md uppercase">{lesson.classe?.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Calendar size={12} /> {new Date(lesson.lessonDate).toLocaleDateString('fr-FR')}</span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate">{lesson.title}</h4>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(lesson); }} 
                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase flex items-center gap-1 transition-colors shadow-sm"
                                            >
                                                <Edit size={12} /> Modifier
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">{lesson.content}</p>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {lesson.duration}</span>
                                            <span className="flex items-center gap-1"><FileText size={12} /> Support de cours</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold italic">Aucune séance enregistrée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Schedule & Quick Entry */}
                <div className="space-y-4">
                    <div className="bg-slate-900 dark:bg-slate-850 p-5 rounded-2xl border border-slate-800 text-white shadow-sm">
                        <h3 className="text-sm font-bold mb-4 uppercase tracking-wider">Prochain Cours</h3>
                        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-bold uppercase rounded-md">Séance à venir</span>
                            </div>
                            <h4 className="text-base font-bold uppercase mb-1">Séance de cours</h4>
                            <p className="text-slate-400 text-xs mb-3">Consultez l'emploi du temps pour voir le prochain cours.</p>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                            >
                                Remplir le cahier
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Détail Séance */}
            {viewingLesson && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setViewingLesson(null)} />
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 w-full max-w-xl relative z-10 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
                        <button onClick={() => setViewingLesson(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={18} />
                        </button>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded-md">{viewingLesson.classe?.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1"><Calendar size={12} /> {new Date(viewingLesson.lessonDate).toLocaleDateString('fr-FR')}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1"><Clock size={12} /> {viewingLesson.duration}</span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 uppercase">{viewingLesson.title}</h2>
                        
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contenu du cours</h3>
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[150px]">
                                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{viewingLesson.content || 'Aucun contenu.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nouvelle Séance */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => { setIsModalOpen(false); setEditingLesson(null); }} />
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg relative z-10 shadow-2xl rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingLesson ? 'Modifier la Séance' : 'Nouvelle Séance'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingLesson(null); }} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreateLesson} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Titre de la séance</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Les équations différentielles"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson({ ...newLesson, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe</label>
                                    <select
                                        value={newLesson.classeId}
                                        onChange={e => setNewLesson({ ...newLesson, classeId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        required
                                    >
                                        {classes.length === 0 ? (
                                            <option value="">Chargement...</option>
                                        ) : (
                                            classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newLesson.lessonDate}
                                        onChange={e => setNewLesson({ ...newLesson, lessonDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Durée</label>
                                <input
                                    type="text"
                                    placeholder="2h"
                                    value={newLesson.duration}
                                    onChange={e => setNewLesson({ ...newLesson, duration: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contenu de la séance</label>
                                <textarea
                                    rows={4}
                                    placeholder="Résumé du cours, exercices effectués..."
                                    value={newLesson.content}
                                    onChange={e => setNewLesson({ ...newLesson, content: e.target.value })}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none resize-none"
                                />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all">
                                {editingLesson ? 'Mettre à jour' : 'Enregistrer la séance'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Book;
