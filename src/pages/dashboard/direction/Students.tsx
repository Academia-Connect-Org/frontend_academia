import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentList from '../../../components/dashboard/shared/StudentList';
import { Download, GraduationCap, UserCheck, UserX, Clock, Plus } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { ROUTES } from '../../../constants/routes';

const Students: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = React.useState<any>(null);
    const [exporting, setExporting] = React.useState(false);

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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gestion Scolaire</h2>
                    <p className="text-slate-500">Suivez les inscriptions, l'assiduité et les résultats des élèves.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        <Download size={18} /> {exporting ? 'Exportation...' : 'Exporter Liste'}
                    </button>
                    <button
                        onClick={() => navigate(ROUTES.DASHBOARD.DIRECTION.ENROLL)}
                        className="bg-white   px-6 py-3  font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Plus size={18} /> Ajouter Élève
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPICard label="Effectif Total" count={overview?.totalStudents ?? "00"} icon={GraduationCap} color="text-indigo-600" bg="bg-indigo-50" />
                <KPICard label="Présents (Aujourd'hui)" count="00" icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
                <KPICard label="Absents" count="00" icon={UserX} color="text-rose-600" bg="bg-rose-50" />
                <KPICard label="En Retard" count="00" icon={Clock} color="text-amber-600" bg="bg-amber-50" />
            </div>

            <StudentList role={(user?.role as any) || "DIRECTION"} institutionId={user?.institution?.id} />
        </>
    );
};

const KPICard = ({ label, count, icon: Icon, color, bg }: any) => (
    <div className="bg-white p-6 ] shadow-sm   group transition-all duration-300">
        <div className={`w-12 h-12 ${bg} ${color}  flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
            <Icon size={24} />
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{count}</h4>
    </div>
);

export default Students;
