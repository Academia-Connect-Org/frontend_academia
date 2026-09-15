import React from 'react';
import { Link } from 'react-router-dom';
import TeacherList from '../../../components/dashboard/shared/TeacherList';
import { Download, Plus, Users, Star, BookOpen, Clock } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Teachers: React.FC = () => {
    const { user } = useAuth();
    const [overview, setOverview] = React.useState<any>(null);

    React.useEffect(() => {
        if (!user?.institution?.id) return;
        api.get(`/dashboard/overview?institutionId=${user.institution.id}`).then(res => setOverview(res.data)).catch(console.error);
    }, [user?.institution?.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Corps Enseignant</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gérez les profils, les spécialités et suivez la performance.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Download size={16} /> Exporter
                    </button>
                    <Link
                        to={ROUTES.DASHBOARD.DIRECTION.ENROLL}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                        <Plus size={16} /> Nouvel Enseignant
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Enseignants" count={overview?.totalTeachers ?? 0} icon={Users} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-950/40" />
                <KPICard label="Moyenne Évaluation" count={`${overview?.averageRating ?? 0}/5`} icon={Star} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/40" />
                <KPICard label="Matières Couvertes" count={overview?.totalSubjects ?? 0} icon={BookOpen} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/40" />
                <KPICard label="Taux de Présence" count={`${overview?.teacherAttendanceRate ?? 0}%`} icon={Clock} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/40" />
            </div>

            <TeacherList role={(user?.role as any) || "DIRECTION"} institutionId={user?.institution?.id} />
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

export default Teachers;
