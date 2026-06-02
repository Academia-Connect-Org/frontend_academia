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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Overlay - No blur here to keep it crisp */}
            <div className="absolute inset-0 bg-[#0F172A]/80 transition-opacity animate-in fade-in duration-300" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-slate-200">

                {/* Close Button UI */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-slate-900 hover:rotate-90 hover:bg-slate-100 transition-all z-50 group"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                    {/* Left Panel: Profile Sidebar */}
                    <div className="lg:w-80 bg-slate-50/50 p-10 flex flex-col items-center border-r border-slate-100">
                        <div className="w-32 h-32 rounded-[48px] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-200 mb-6 transition-transform hover:scale-105 duration-500">
                            {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight mb-2">
                            {formData.firstName} {formData.lastName}
                        </h3>
                        <p className="text-[10px] font-black text-indigo-500 bg-white border border-indigo-100 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-10 shadow-sm">
                            Profil Enseignant
                        </p>

                        <div className="w-full space-y-5 pt-10 border-t border-slate-200">
                            <SidebarStat label="ID Personnel" value={`#TCH-${teacher.id}`} icon={<Layers size={14} />} />
                            <SidebarStat label="Type" value="Corps Enseignant" icon={<UserCheck size={14} />} />
                            <SidebarStat label="Email Pro" value={formData.email} icon={<Mail size={14} />} />
                        </div>

                        {message.text && (
                            <div className={`mt-auto w-full p-5 rounded-[24px] flex items-start gap-4 animate-in slide-in-from-bottom-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-lg shadow-emerald-500/10' : 'bg-red-50 text-red-600 border border-red-200 shadow-lg shadow-red-500/10'}`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                                <p className="text-[11px] font-black leading-snug uppercase tracking-wider">{message.text}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Scrollable Form */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar scroll-smooth">
                            <form id="editTeacherForm" onSubmit={handleSubmit} className="space-y-16">
                                {/* Identity Section */}
                                <SectionContainer title="Identité & Coordonnées" icon={<UserCircle size={22} className="text-indigo-600" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                        <EnhancedInput label="Prénom" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />
                                        <EnhancedInput label="Nom" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />
                                        <EnhancedInput label="Téléphone" value={formData.phone} onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })} />
                                        <EnhancedSelect label="Sexe" options={['Masculin', 'Féminin']} value={formData.gender} onChange={(e: any) => setFormData({ ...formData, gender: e.target.value })} />
                                        <div className="md:col-span-2">
                                            <EnhancedInput label="Email institutionnel" type="email" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                    </div>
                                </SectionContainer>

                                {/* Assignment Section */}
                                <SectionContainer title="Cycles & Classes" icon={<BookOpen size={22} className="text-amber-600" />}>
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-3">
                                                Cycles autorisés <div className="h-[2px] bg-slate-100 flex-1"></div>
                                            </label>
                                            <div className="flex flex-wrap gap-3">
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

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-3">
                                                Classes d'enseignement <div className="h-[2px] bg-slate-100 flex-1"></div>
                                            </label>
                                            {formData.cycleIds.length > 0 ? (
                                                <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 flex flex-wrap gap-2.5 shadow-inner">
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
                                                        <p className="w-full text-center py-4 text-[10px] font-bold text-slate-400 italic">Chargement des classes...</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/30 flex items-center justify-center">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center opacity-60">Sélectionnez d'abord un cycle</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-3">
                                                Matières enseignées <div className="h-[2px] bg-slate-100 flex-1"></div>
                                            </label>
                                            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/20 flex flex-wrap gap-2.5 min-h-[80px]">
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
                                                    placeholder="Taper pour ajouter manuellement..."
                                                    value={formData.specialties}
                                                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                                    className="flex-1 min-w-[200px] bg-transparent outline-none text-sm font-black text-slate-700 placeholder:text-slate-300 placeholder:font-normal ml-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </SectionContainer>

                                {/* Security Section */}
                                <SectionContainer title="Sécurité du Compte" icon={<UserCheck size={22} className="text-rose-600" />}>
                                    <div className="bg-rose-50/20 p-8 rounded-[32px] border border-rose-100/50">
                                        <EnhancedInput
                                            label="Modifier le mot de passe"
                                            type="password"
                                            placeholder="••••••••••••"
                                            description="Laisser vide si vous ne souhaitez pas modifier le mot de passe actuel de l'utilisateur"
                                            value={formData.password}
                                            onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </SectionContainer>
                            </form>
                        </div>

                        {/* Footer UI */}
                        <div className="p-10 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                            <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white transition-colors px-6">
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="editTeacherForm"
                                disabled={loading}
                                className="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black shadow-2xl hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-4 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Sauvegarder les modifications
                                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
                                            <CheckCircle2 size={16} />
                                        </div>
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

// --- Crisp Styled Components ---

const SectionContainer = ({ title, icon, children }: any) => (
    <div className="space-y-8">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-[20px] bg-white shadow-xl shadow-slate-100 border border-slate-100 flex items-center justify-center font-black">
                {icon}
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h4>
        </div>
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-transparent rounded-[52px] opacity-20 blur-xl"></div>
            <div className="relative bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
                {children}
            </div>
        </div>
    </div>
);

const EnhancedInput = ({ label, type = "text", placeholder, value, onChange, description }: any) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-[12px] focus:ring-indigo-600/5 transition-all outline-none placeholder:text-slate-300 placeholder:font-normal shadow-sm"
        />
        {description && <p className="text-[9px] font-bold text-slate-400 mt-3 px-2 uppercase tracking-widest leading-relaxed">{description}</p>}
    </div>
);

const EnhancedSelect = ({ label, options, value, onChange }: any) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-black text-slate-800 focus:bg-white focus:border-indigo-400 focus:ring-[12px] focus:ring-indigo-600/5 transition-all outline-none appearance-none cursor-pointer shadow-sm"
            >
                {options.map((opt: string, i: number) => (
                    <option key={i} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-xs uppercase tracking-widest">
                Profil
            </div>
        </div>
    </div>
);

const TagButton = ({ label, active, onClick, variant = 'primary' }: any) => {
    let activeStyles = 'bg-slate-900 text-white border-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.2)]';
    if (variant === 'success') activeStyles = 'bg-emerald-600 text-white border-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)]';
    if (variant === 'indigo') activeStyles = 'bg-indigo-600 text-white border-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.3)]';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border
                ${active ? activeStyles : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600 shadow-sm active:scale-95'}`}
        >
            {active ? '✓ ' : '+ '} {label}
        </button>
    );
};

const SidebarStat = ({ label, value, icon }: any) => (
    <div className="flex items-center gap-5 w-full group">
        <div className="w-10 h-10 rounded-[14px] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-black text-slate-800 truncate leading-tight tracking-tight">{value}</p>
        </div>
    </div>
);

export default TeacherEditModal;
