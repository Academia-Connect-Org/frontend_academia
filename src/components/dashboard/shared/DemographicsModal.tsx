import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PieChart, BarChart2, Info } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import api from '../../../api/axios';

interface DemographicsModalProps {
    isOpen: boolean;
    onClose: () => void;
    institutionId?: number;
}

const DemographicsModal: React.FC<DemographicsModalProps> = ({ isOpen, onClose, institutionId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && institutionId) {
            fetchDemographics();
        }
    }, [isOpen, institutionId]);

    const fetchDemographics = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/dashboard/institution/${institutionId}/demographics`);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching demographics:", error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const genderData = data?.genderDistribution ? Object.entries(data.genderDistribution).map(([name, value]) => ({ name, value })) : [];
    const cycleData = data?.cycleDistribution ? Object.entries(data.cycleDistribution).map(([name, value]) => ({ name, value })) : [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                                <BarChart2 size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rapport Démographique</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Analyse de la répartition des élèves par genre et par cycle.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        {loading ? (
                            <div className="py-16 text-center">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Analyse des données en cours...</p>
                            </div>
                        ) : data ? (
                            <div className="space-y-6">
                                {/* KPIs */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-950/40 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Élèves</p>
                                        <h4 className="text-2xl font-black text-blue-700 dark:text-blue-300">{data.totalStudents ?? 0}</h4>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Garçons</p>
                                        <h4 className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{data.genderDistribution?.GARÇONS ?? 0}</h4>
                                    </div>
                                    <div className="bg-pink-50 dark:bg-pink-950/40 p-5 rounded-xl border border-pink-100 dark:border-pink-900/50">
                                        <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-1">Filles</p>
                                        <h4 className="text-2xl font-black text-pink-700 dark:text-pink-300">{data.genderDistribution?.FILLES ?? 0}</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Gender Pie Chart */}
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <PieChart size={18} className="text-blue-600 dark:text-blue-400" />
                                            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Répartition par Genre</h4>
                                        </div>
                                        <div className="h-[240px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <RePieChart>
                                                    <Pie
                                                        data={genderData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={6}
                                                        dataKey="value"
                                                    >
                                                        {genderData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.name === 'GARÇONS' ? '#3b82f6' : '#ec4899'} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                                        itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                                        labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                                        formatter={(val: any, name: any) => [`${val} élèves`, `${name}`]}
                                                    />
                                                    <Legend />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Cycle Bar Chart */}
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BarChart2 size={18} className="text-blue-600 dark:text-blue-400" />
                                            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Répartition par Cycle</h4>
                                        </div>
                                        <div className="h-[240px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={cycleData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                                                        itemStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}
                                                        labelStyle={{ color: '#cbd5e1', fontWeight: 700, fontSize: '12px' }}
                                                        formatter={(val: any, name: any) => [`${val} élèves`, `${name}`]}
                                                    />
                                                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-16 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                <Info size={36} className="mx-auto text-slate-400 mb-3" />
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Aucune donnée démographique disponible pour cet établissement.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DemographicsModal;
