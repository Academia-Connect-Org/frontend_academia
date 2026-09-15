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
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Recherche</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Nom, prénom, matricule..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Cycle</label>
                    <select
                        value={selectedCycle}
                        onChange={(e) => { setSelectedCycle(e.target.value); setSelectedClass(''); }}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                        <option value="">Tous les cycles</option>
                        {cycles.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Classe</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer disabled:opacity-50"
                    >
                        <option value="">Toutes les classes</option>
                        {filteredClasses.map((c: any) => (
                            <option key={c.id} value={c.id.toString()}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Statut</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
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
