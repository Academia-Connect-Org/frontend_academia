import React from 'react';
import StudentList from '../../../components/dashboard/shared/StudentList';
import { Printer } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

const Students: React.FC = () => {
    const { user } = useAuth();
    const [overview, setOverview] = React.useState<any>(null);
    const [stats, setStats] = React.useState<any>(null);

    React.useEffect(() => {
        const params = user?.institution?.id ? `?institutionId=${user.institution.id}` : '';
        api.get(`/dashboard/overview${params}`).then(res => setOverview(res.data)).catch(console.error);
        api.get(`/dashboard/secretariat${params}`).then(res => setStats(res.data)).catch(console.error);
    }, [user?.institution?.id]);

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Archives & Dossiers</h2>
                    <p className="text-slate-500 text-sm">Organisez et gérez les informations des étudiants.</p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Printer size={18} /> Impression de masse
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MatrixItem label="Eleves Inscrits" value={overview?.totalStudents?.toString() || "..."} color="bg-blue-600" trend="À jour" />
                <MatrixItem label="Presences (Jour)" value={stats?.dailyAdmissions?.toString() || "0"} color="bg-emerald-600" trend="+" />
                <MatrixItem label="Absences (Jour)" value={stats?.dailyAbsences?.toString() || "0"} color="bg-amber-600" trend="0" />
                <MatrixItem label="Certificats" value={stats?.certificatesIssued?.toString() || "0"} color="bg-rose-600" trend="+" />
            </div>

            <StudentList role="SECRETARIAT" institutionId={user?.institution?.id} />
        </>
    );
};

const MatrixItem = ({ label, value, color, trend }: { label: string, value: string, color: string, trend: string }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 group transition-all duration-300 hover:bg-slate-50/50">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
            <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black 
                ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                {trend}
            </div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: '65%' }}></div>
        </div>
    </div>
);

export default Students;
