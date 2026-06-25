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
            const exportData = res.data.map((t: any) => ({
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    {institutionId && (
                        <button
                            onClick={() => navigate(ROUTES.DASHBOARD.PDG.SCHOOL_DETAILS.replace(':id', institutionId.toString()))}
                            className="w-12 h-12 bg-white    flex items-center justify-center text-slate-400 hover:text-indigo-600 hover: transition-all shadow-sm"
                            title="Retour à l'établissement"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Liste des Enseignants</h2>
                        <p className="text-slate-500 font-medium">Gérez le personnel enseignant de vos institutions.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        Export Liste
                    </button>
                    <button
                        onClick={() => navigate(`${ROUTES.DASHBOARD.PDG.ENROLL}${institutionId ? `?institutionId=${institutionId}` : ''}`)}
                        className="bg-indigo-600 text-white px-8 py-3  font-extrabold flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Nouveau Enseignant
                    </button>
                </div>
            </div>

            <TeacherList role="PDG" institutionId={institutionId} ceoId={user?.id} />
        </>
    );
};

export default Teachers;
