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
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const genderData = data ? Object.entries(data.genderDistribution).map(([name, value]) => ({ name, value })) : [];
    const cycleData = data ? Object.entries(data.cycleDistribution).map(([name, value]) => ({ name, value })) : [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Rapport Démographique</h3>
                                <p className="text-slate-500 text-sm font-medium">Analyse de la répartition des élèves par genre et par cycle.</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 hover:shadow-md transition-all border border-slate-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Analyse des données en cours...</p>
                            </div>
                        ) : data ? (
                            <div className="space-y-10">
                                {/* KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Élèves</p>
                                        <h4 className="text-3xl font-black text-indigo-600">{data.totalStudents}</h4>
                                    </div>
                                    <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Garçons</p>
                                        <h4 className="text-3xl font-black text-blue-600">{data.genderDistribution.GARÇONS}</h4>
                                    </div>
                                    <div className="bg-pink-50/50 p-6 rounded-[32px] border border-pink-100">
                                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Filles</p>
                                        <h4 className="text-3xl font-black text-pink-600">{data.genderDistribution.FILLES}</h4>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Gender Pie Chart */}
                                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <PieChart size={20} className="text-indigo-600" />
                                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Répartition par Genre</h4>
                                        </div>
                                        <div className="h-[300px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <RePieChart>
                                                    <Pie
                                                        data={genderData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={8}
                                                        dataKey="value"
                                                    >
                                                        {genderData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.name === 'GARÇONS' ? '#3b82f6' : '#ec4899'} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend />
                                                </RePieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Cycle Bar Chart */}
                                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <BarChart2 size={20} className="text-indigo-600" />
                                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Répartition par Cycle</h4>
                                        </div>
                                        <div className="h-[300px] w-full min-w-0">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={cycleData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                                    <Tooltip
                                                        cursor={{ fill: '#f8fafc' }}
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                <Info size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-bold">Aucune donnée démographique disponible pour cet établissement.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DemographicsModal;
