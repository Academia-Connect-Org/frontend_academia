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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Corps Enseignant</h2>
                    <p className="text-slate-500">Gérez les profils, les spécialités et suivez la performance.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={18} /> Exporter
                    </button>
                    <Link
                        to={ROUTES.DASHBOARD.DIRECTION.ENROLL}
                        className="bg-indigo-600 text-white px-8 py-3  font-extrabold flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Nouvel Enseignant
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard label="Total Enseignants" count={overview?.totalTeachers ?? "..."} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
                <KPICard label="Moyenne Évaluation" count="4.8/5" icon={Star} color="text-amber-600" bg="bg-amber-50" />
                <KPICard label="Matières Couvertes" count={overview?.totalSubjects ?? "..."} icon={BookOpen} color="text-emerald-600" bg="bg-emerald-50" />
                <KPICard label="Taux de Présence" count="98%" icon={Clock} color="text-blue-600" bg="bg-blue-50" />
            </div>

            <TeacherList role={(user?.role as any) || "DIRECTION"} institutionId={user?.institution?.id} />
        </>
    );
};

const KPICard = ({ label, count, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 ] shadow-sm   group transition-all duration-300 hover:shadow-lg">
        <div className={`w-12 h-12 ${bg} ${color}  flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
            <Icon size={24} />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{count}</h4>
    </div>
);

export default Teachers;
