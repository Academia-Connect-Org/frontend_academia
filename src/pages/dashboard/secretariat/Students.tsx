import React from 'react';
import StudentList from '../../../components/dashboard/shared/StudentList';
import { Printer, Upload } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import CsvImporterModal from '../../../components/dashboard/shared/CsvImporterModal';

const Students: React.FC = () => {
    const { user } = useAuth();
    const [overview, setOverview] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any>(null);
    const [showCsvModal, setShowCsvModal] = React.useState(false);

    React.useEffect(() => {
        const params = user?.institution?.id ? `?institutionId=${user.institution.id}` : '';
        api.get(`/dashboard/overview${params}`).then(res => setOverview(res.data)).catch(console.error);
        api.get(`/dashboard/secretariat${params}`).then(res => setStats(res.data)).catch(console.error);
    }, [user?.institution?.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Archives & Dossiers</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Organisez et gérez les informations des étudiants.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCsvModal(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Upload size={16} /> Importer CSV
                    </button>
                    <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Printer size={16} /> Impression de masse
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MatrixItem label="Élèves Inscrits" value={overview?.totalStudents?.toString() || "0"} color="bg-blue-600" />
                <MatrixItem label="Présences (Jour)" value={stats?.dailyAdmissions?.toString() || "0"} color="bg-emerald-600" />
                <MatrixItem label="Absences (Jour)" value={stats?.dailyAbsences?.toString() || "0"} color="bg-amber-600" />
                <MatrixItem label="Certificats" value={stats?.certificatesIssued?.toString() || "0"} color="bg-rose-600" />
            </div>

            <StudentList role="SECRETARIAT" institutionId={user?.institution?.id} />

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

const MatrixItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-xl font-bold text-slate-900 dark:text-white">{value}</h4>
        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: value !== '0' ? '100%' : '0%' }}></div>
        </div>
    </div>
);

export default Students;
