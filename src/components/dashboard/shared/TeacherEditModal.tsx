import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, BookOpen, Layers, UserCircle, Mail, UserCheck } from 'lucide-react';
import api from '../../../api/axios';

interface TeacherEditModalProps {
    teacher: any;
    onClose: () => void;
    onSuccess: () => void;
}

const TeacherEditModal: React.FC<TeacherEditModalProps> = ({ teacher, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<any>({
        firstName: teacher.firstName || '',
        lastName: teacher.lastName || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        gender: teacher.gender || 'Masculin',
        specialties: (teacher.specialties || []).join(', '),
        cycleIds: (teacher.cycles || []).map((c: any) => c.id),
        classes: (teacher.classes || []).map((c: any) => c.name).join(', '),
        password: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [cycles, setCycles] = useState<any[]>([]);
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

    useEffect(() => {
        api.get('/cycles')
            .then(res => setCycles(res.data || []))
            .catch(() => console.error("Erreur cycle"));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (formData.cycleIds.length > 0) {
                try {
                    const classesPromises = formData.cycleIds.map((id: number) => api.get(`/classes/cycle/${id}`));
                    const classesResults = await Promise.all(classesPromises);
                    const allAvailableClasses = classesResults.flatMap(res => res.data || []);
                    const uniqueClasses = allAvailableClasses.filter((cls, index, self) =>
                        index === self.findIndex((t) => t.name === cls.name)
                    );
                    setAvailableClasses(uniqueClasses);

                    const subjectsPromises = formData.cycleIds.map((id: number) => api.get(`/subjects/cycle/${id}`));
                    const subjectsResults = await Promise.all(subjectsPromises);
                    const allAvailableSubjects = subjectsResults.flatMap(res => res.data || []);
                    const uniqueSubjects = allAvailableSubjects.filter((subj, index, self) =>
                        index === self.findIndex((t) => t.name === subj.name)
                    );
                    setAvailableSubjects(uniqueSubjects);
                } catch (err) {
                    console.error("Error fetching data:", err);
                }
            } else {
                setAvailableClasses([]);
                setAvailableSubjects([]);
            }
        };
        fetchData();
    }, [formData.cycleIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                cycleIds: formData.cycleIds.map(Number),
                specialties: formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean),
                classes: formData.classes.split(',').map((s: string) => s.trim()).filter(Boolean)
            };

            await api.put(`/teachers/${teacher.id}`, payload);
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50"
                >
                    <X size={18} />
                </button>

                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-72 bg-slate-50/50 dark:bg-slate-850/50 p-6 flex flex-col items-center shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-0 w-full lg:w-auto">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md lg:mb-4 shrink-0">
                                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                            </div>
                            <div className="flex flex-col items-start lg:items-center min-w-0 flex-1">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white text-left lg:text-center uppercase tracking-tight mb-1 truncate w-full">
                                    {formData.firstName} {formData.lastName}
                                </h3>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Profil Enseignant
                                </p>
                            </div>
                        </div>

                        <div className="w-full flex flex-row lg:flex-col gap-3 lg:space-y-3 pt-6 overflow-x-auto">
                            <SidebarStat label="ID Personnel" value={`#TCH-${teacher.id}`} icon={<Layers size={14} />} />
                            <SidebarStat label="Type" value="Corps Enseignant" icon={<UserCheck size={14} />} />
                            <SidebarStat label="Email Pro" value={formData.email} icon={<Mail size={14} />} />
                        </div>

                        {message.text && (
                            <div className={`mt-auto w-full p-4 rounded-xl flex items-center gap-2.5 font-bold text-xs ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Form */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <form id="editTeacherForm" onSubmit={handleSubmit} className="space-y-8">
                                <SectionContainer title="Identité & Coordonnées" icon={<UserCircle size={20} className="text-blue-600 dark:text-blue-400" />}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <EnhancedInput label="Prénom" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />
                                        <EnhancedInput label="Nom" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />
                                        <EnhancedInput label="Téléphone" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} />
                                        <EnhancedSelect label="Sexe" options={['Masculin', 'Féminin']} value={formData.gender} onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })} />
                                        <div className="sm:col-span-2">
                                            <EnhancedInput label="Email institutionnel" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>
                                </SectionContainer>

                                <SectionContainer title="Cycles & Classes" icon={<BookOpen size={20} className="text-amber-600 dark:text-amber-400" />}>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                Cycles autorisés
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {cycles.map((cycle: any) => (
                                                    <TagButton
                                                        key={cycle.id}
                                                        label={cycle.name}
                                                        active={formData.cycleIds.includes(Number(cycle.id))}
                                                        onClick={() => {
                                                            const id = Number(cycle.id);
                                                            const active = formData.cycleIds.includes(id);
                                                            const newIds = active ? formData.cycleIds.filter((cid: number) => cid !== id) : [...formData.cycleIds, id];
                                                            setFormData({ ...formData, cycleIds: newIds });
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                Classes d'enseignement
                                            </label>
                                            {formData.cycleIds.length > 0 ? (
                                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap gap-2">
                                                    {availableClasses.map((c: any) => {
                                                        const current = formData.classes.split(',').map((s: string) => s.trim()).filter(Boolean);
                                                        const isSelected = current.includes(c.name);
                                                        return (
                                                            <TagButton
                                                                key={c.id}
                                                                variant="success"
                                                                label={c.name}
                                                                active={isSelected}
                                                                onClick={() => {
                                                                    const next = isSelected
                                                                        ? current.filter((cls: string) => cls !== c.name)
                                                                        : [...current, c.name];
                                                                    setFormData({ ...formData, classes: next.join(', ') });
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                    {availableClasses.length === 0 && (
                                                        <p className="w-full text-center py-2 text-xs font-semibold text-slate-400 italic">Chargement des classes...</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-center">
                                                    <p className="text-xs font-semibold text-slate-400">Sélectionnez d'abord un cycle</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                                Matières enseignées
                                            </label>
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap gap-2">
                                                {availableSubjects.map((subj: any) => {
                                                    const currentSpecs = formData.specialties.split(',').map((s: string) => s.trim()).filter(Boolean);
                                                    const isSelected = currentSpecs.includes(subj.name);
                                                    return (
                                                        <TagButton
                                                            key={subj.id}
                                                            variant="indigo"
                                                            label={subj.name}
                                                            active={isSelected}
                                                            onClick={() => {
                                                                const next = isSelected
                                                                    ? currentSpecs.filter((s: string) => s !== subj.name)
                                                                    : [...currentSpecs, subj.name];
                                                                setFormData({ ...formData, specialties: next.join(', ') });
                                                            }}
                                                        />
                                                    );
                                                })}
                                                <input
                                                    type="text"
                                                    placeholder="Ajouter manuellement..."
                                                    value={formData.specialties}
                                                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                                    className="flex-1 min-w-[160px] bg-transparent outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SectionContainer>

                                <SectionContainer title="Sécurité du Compte" icon={<UserCheck size={20} className="text-rose-600 dark:text-rose-400" />}>
                                    <EnhancedInput
                                        label="Modifier le mot de passe"
                                        type="password"
                                        placeholder="••••••••••••"
                                        description="Laisser vide si vous ne souhaitez pas modifier le mot de passe actuel"
                                        value={formData.password}
                                        onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </SectionContainer>
                            </form>
                        </div>

                        <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-850/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="editTeacherForm"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <>
                                        <span>Sauvegarder</span>
                                        <CheckCircle2 size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionContainer = ({ title, icon, children }: any) => (
    <div className="space-y-4">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-800 dark:text-slate-200">
                {icon}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {children}
        </div>
    </div>
);

const EnhancedInput = ({ label, type = "text", placeholder, value, onChange, description }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {description && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
    </div>
);

const EnhancedSelect = ({ label, options, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
        >
            {options.map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const TagButton = ({ label, active, onClick, variant = 'primary' }: any) => {
    let activeStyles = 'bg-blue-600 text-white shadow-sm';
    if (variant === 'success') activeStyles = 'bg-emerald-600 text-white shadow-sm';
    if (variant === 'indigo') activeStyles = 'bg-indigo-600 text-white shadow-sm';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${active ? activeStyles : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
            {active ? '✓ ' : '+ '} {label}
        </button>
    );
};

const SidebarStat = ({ label, value, icon }: any) => (
    <div className="flex items-center gap-3 w-full shrink-0">
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

export default TeacherEditModal;
