import React, { useState } from 'react';
import TeacherList from '../../../components/dashboard/shared/TeacherList';
import { Download, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { exportToCSV } from '../../../utils/export';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Teachers: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const institutionId = searchParams.get('institutionId') ? Number(searchParams.get('institutionId')) : undefined;

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            if (institutionId) params.append('institutionId', institutionId.toString());
            if (user?.id) params.append('ceoId', user.id.toString());
            const qs = params.toString() ? `?${params.toString()}` : '';

            const res = await api.get(`/teachers${qs}`);
            const exportData = (res.data || []).map((t: any) => ({
                ID: t.id,
                Nom: t.lastName,
                Prénom: t.firstName,
                Email: t.email,
                Téléphone: t.phone || 'N/A',
                Etablissement: t.institution?.name || 'N/A',
                Spécialités: t.specialties?.join(', ') || 'N/A'
            }));
            exportToCSV(exportData, `Registre_Enseignants_${institutionId || 'Global'}_${new Date().toISOString().split('T')[0]}`);
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
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Liste des Enseignants</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Gérez le personnel enseignant de vos institutions.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Export Liste
                    </button>
                    <button
                        onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.ENROLL}${institutionId ? `?institutionId=${institutionId}` : ''}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={16} /> Nouveau Enseignant
                    </button>
                </div>
            </div>

            <TeacherList role="PDG" institutionId={institutionId} ceoId={user?.id} />
        </div>
    );
};

export default Teachers;
