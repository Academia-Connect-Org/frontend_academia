import React from 'react';
import { Search } from 'lucide-react';

interface StudentFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    selectedCycle: string;
    setSelectedCycle: (val: string) => void;
    selectedClass: string;
    setSelectedClass: (val: string) => void;
    selectedStatus: string;
    setSelectedStatus: (val: string) => void;
    cycles: any[];
    filteredClasses: any[];
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    selectedCycle,
    setSelectedCycle,
    selectedClass,
    setSelectedClass,
    selectedStatus,
    setSelectedStatus,
    cycles,
    filteredClasses
}) => {
    return (
        <div className="bg-white p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-end justify-between">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recherche</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nom, prénom, matricule..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 focus:bg-white focus:outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle</label>
                    <select
                        value={selectedCycle}
                        onChange={(e) => { setSelectedCycle(e.target.value); setSelectedClass(''); }}
                        className="w-full px-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white"
                    >
                        <option value="">Tous les cycles</option>
                        {cycles.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classe</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white disabled:opacity-50"
                    >
                        <option value="">Toutes les classes</option>
                        {filteredClasses.map((c: any) => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-black tracking-widest text-[10px] uppercase">Statut</span>
                    </div>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full pl-16 pr-5 py-3.5 bg-slate-50 text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="ENROLLED">Inscrits définitivement</option>
                        <option value="PENDING">En attente (Paiement/Validation)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default StudentFilters;
