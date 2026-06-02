import React, { useState } from 'react';
import StudentList from '../../../components/dashboard/shared/StudentList';
import DemographicsModal from '../../../components/dashboard/shared/DemographicsModal';
import { Download, Users, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { exportToCSV } from '../../../utils/export';
import api from '../../../api/axios';

const Students: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const institutionId = searchParams.get('institutionId') ? Number(searchParams.get('institutionId')) : undefined;

    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const url = institutionId ? `/students?institutionId=${institutionId}` : '/students';
            const res = await api.get(url);
            const exportData = res.data.map((s: any) => ({
                ID: s.id,
                Nom: s.lastName,
                Prénom: s.firstName,
                Genre: s.gender,
                Classe: s.classe?.name || 'N/A',
                Cycle: s.classe?.cycle?.name || 'N/A',
                Email: s.email,
                Parent: s.parent ? `${s.parent.firstName} ${s.parent.lastName}` : 'N/A'
            }));
            exportToCSV(exportData, `Registre_Eleves_${institutionId || 'Global'}_${new Date().toISOString().split('T')[0]}`);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    {institutionId && (
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD.PDG.SCHOOL_DETAILS.replace(':id', institutionId.toString()))}
                            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                            title="Retour à l'établissement"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Liste des Élèves</h2>
                        <p className="text-slate-500 font-medium">Vue d'ensemble sur l'effectif total des élèves.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Export Excel
                    </button>
                    <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Users size={18} /> Rapport
                    </button>
                    <button
                        onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.ENROLL}${institutionId ? `?institutionId=${institutionId}` : ''}`)}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-extrabold flex items-center gap-2 shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Nouvelle Inscription
                    </button>
                </div>
            </div>

            <StudentList role="PDG" institutionId={institutionId} />

            <DemographicsModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                institutionId={institutionId}
            />
        </>
    );
};

export default Students;
