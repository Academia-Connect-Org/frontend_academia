import React, { useState } from 'react';
import StudentList from '../../../components/dashboard/shared/StudentList';
import DemographicsModal from '../../../components/dashboard/shared/DemographicsModal';
import { Download, Users, ArrowLeft, Loader2, Plus, Upload } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { exportToCSV } from '../../../utils/export';
import api from '../../../api/axios';
import CsvImporterModal from '../../../components/dashboard/shared/CsvImporterModal';

const Students: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const institutionId = searchParams.get('institutionId') ? Number(searchParams.get('institutionId')) : undefined;

    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showCsvModal, setShowCsvModal] = useState(false);

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const url = institutionId ? `/students?institutionId=${institutionId}` : '/students';
            const res = await api.get(url);
            const exportData = (res.data || []).map((s: any) => ({
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
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {institutionId && (
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD.PDG.SCHOOL_DETAILS.replace(':id', institutionId.toString()))}
                            className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm shrink-0"
                            title="Retour à l'établissement"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Liste des Élèves</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Vue d'ensemble sur l'effectif total des élèves.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Excel
                    </button>
                    <button
                        onClick={() => setShowCsvModal(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Upload size={16} /> Importer CSV
                    </button>
                    <button
                        onClick={() => setIsDemoModalOpen(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                        <Users size={16} /> Rapport
                    </button>
                    <button
                        onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.ENROLL}${institutionId ? `?institutionId=${institutionId}` : ''}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Nouvelle Inscription
                    </button>
                </div>
            </div>

            <StudentList role="PDG" institutionId={institutionId} />

            <DemographicsModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                institutionId={institutionId}
            />

            {showCsvModal && (
                <CsvImporterModal
                    institutionId={institutionId}
                    onClose={() => setShowCsvModal(false)}
                    onSuccess={() => {
                        setShowCsvModal(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default Students;
