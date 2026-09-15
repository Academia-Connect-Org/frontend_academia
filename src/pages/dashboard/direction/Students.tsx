import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentList from '../../../components/dashboard/shared/StudentList';
import { Download, GraduationCap, UserCheck, UserX, Clock, Plus, Upload } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';
import CsvImporterModal from '../../../components/dashboard/shared/CsvImporterModal';

const Students: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = React.useState<any>(null);
    const [exporting, setExporting] = React.useState(false);
    const [showCsvModal, setShowCsvModal] = React.useState(false);

    React.useEffect(() => {
        if (!user?.institution?.id) return;
        api.get(`/dashboard/overview?institutionId=${user.institution.id}`).then(res => setOverview(res.data)).catch(console.error);
    }, [user?.institution?.id]);

    const handleExport = async () => {
        try {
            setExporting(true);
            const instId = user?.institution?.id;
            const response = await api.get(`/students/export?institutionId=${instId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'liste_eleves.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestion Scolaire</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Suivez les inscriptions, l'assiduité et les résultats des élèves.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Download size={16} /> {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button
                        onClick={() => setShowCsvModal(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Upload size={16} /> Importer CSV
                    </button>
                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.DIRECTION.ENROLL)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                        <Plus size={16} /> Ajouter Élève
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Effectif Total" count={overview?.totalStudents ?? 0} icon={GraduationCap} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-950/40" />
                <KPICard label="Présents (Aujourd'hui)" count={overview?.presentToday ?? 0} icon={UserCheck} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
                <KPICard label="Absents" count={overview?.absentToday ?? 0} icon={UserX} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-950/40" />
                <KPICard label="En Retard" count={overview?.lateToday ?? 0} icon={Clock} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/40" />
            </div>

            <StudentList role={(user?.role as any) || "DIRECTION"} institutionId={user?.institution?.id} />

            {showCsvModal && (
                <CsvImporterModal
                    institutionId={user?.institution?.id}
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

const KPICard = ({ label, count, icon: Icon, color, bg }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>
            <Icon size={22} />
        </div>
        <div className="min-w-0">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{count}</h4>
        </div>
    </div>
);

export default Students;
