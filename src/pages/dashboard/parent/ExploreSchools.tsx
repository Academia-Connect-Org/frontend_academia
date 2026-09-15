import { encodeSchoolId } from "../../../utils/schoolCode";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getFileUrl } from '../../../api/axios';
import { Search, MapPin, Building2, ChevronRight, GraduationCap, X, Phone, Mail } from 'lucide-react';
import { COUNTRIES } from '../../../constants/countries';

const ExploreSchools: React.FC = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
    const [schoolDetails, setSchoolDetails] = useState<any | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const handleSelectSchool = async (school: any) => {
        setSelectedSchool(school);
        setDetailsLoading(true);
        try {
            const res = await api.get(`/public/institutions/${school.id}/details`);
            setSchoolDetails(res.data);
        } catch (error) {
            console.error("Error fetching school details", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, [countryFilter, typeFilter]);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (countryFilter) params.append('country', countryFilter);
            if (typeFilter) params.append('type', typeFilter);
            if (searchTerm) params.append('name', searchTerm);

            const response = await api.get(`/public/institutions?${params.toString()}`);
            setSchools(response.data);
        } catch (error) {
            console.error("Error fetching schools", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSchools();
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Découvrir le réseau ACADEMIA CONNECT</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Explorez nos établissements scolaires partenaires, trouvez l'école idéale pour vos enfants, et rejoignez une communauté éducative d'excellence.
                </p>
            </div>

            {/* Filters & Search Form */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rechercher par nom</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Nom de l'établissement..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-64 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pays</label>
                    <input
                        type="text"
                        list="country-list"
                        placeholder="Saisissez un pays..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                    />
                    <datalist id="country-list">
                        {COUNTRIES.map(c => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>

                <div className="w-full md:w-56 space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type d'établissement</label>
                    <select
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="ECOLE">École Primaire / Maternelle</option>
                        <option value="ETABLISSEMENT">Lycée / Collège</option>
                    </select>
                </div>

                <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all">
                    Filtrer
                </button>
            </form>

            {/* Results Grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                </div>
            ) : schools.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Aucun établissement trouvé</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Essayez de modifier vos critères de recherche ou de réinitialiser le filtre.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schools.map(school => (
                        <div key={school.id} className="bg-white dark:bg-slate-900 group rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col">
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => handleSelectSchool(school)}>
                                {school.logoUrl ? (
                                    <img src={getFileUrl(school.logoUrl)} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <Building2 size={56} className="text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                    {school.type === 'ECOLE' ? 'Primaire/Maternelle' : 'Collège/Lycée'}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{school.name}</h3>
                                    <div className="space-y-1.5 mt-2">
                                        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <MapPin size={14} className="text-blue-500 shrink-0" /> {school.country || 'Pays non spécifié'}
                                        </p>
                                        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <GraduationCap size={14} className="text-purple-500 shrink-0" /> Code: <span className="font-bold text-slate-900 dark:text-white">{encodeSchoolId(school.id)}</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/parent/enroll?schoolCode=${encodeSchoolId(school.id)}`)}
                                    className="w-full py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all rounded-2xl flex items-center justify-center gap-2 border border-slate-200/60 dark:border-slate-700/60"
                                >
                                    Inscrire un enfant <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* School Details Modal */}
            <AnimatePresence>
                {selectedSchool && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 shrink-0">
                                {selectedSchool.logoUrl ? (
                                    <img src={getFileUrl(selectedSchool.logoUrl)} alt={selectedSchool.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><Building2 size={64} className="text-slate-300 dark:text-slate-600" /></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                                <button onClick={() => setSelectedSchool(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-xl p-2 transition-colors">
                                    <X size={18} />
                                </button>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedSchool.name}</h2>
                                    {selectedSchool.motto && <p className="text-blue-200 text-xs font-medium italic mt-0.5">« {selectedSchool.motto} »</p>}
                                </div>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                                <div className="flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2.5">
                                        <MapPin size={16} className="text-blue-500 shrink-0" />
                                        <span className="font-semibold">{selectedSchool.address || 'Adresse non spécifiée'} • {selectedSchool.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Phone size={16} className="text-blue-500 shrink-0" />
                                        <span className="font-semibold">{selectedSchool.phone || 'Non renseigné'}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Mail size={16} className="text-blue-500 shrink-0" />
                                        <span className="font-semibold">{selectedSchool.email || 'Non renseigné'}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">À propos de l'établissement</h4>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                        {selectedSchool.description || "Aucune description fournie pour cet établissement pour le moment."}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Informations Financières</h4>
                                    <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/60">
                                        <p className="text-xs text-blue-800 dark:text-blue-300 font-bold">Frais d'inscription</p>
                                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                            {selectedSchool.enrollmentFee ? `${selectedSchool.enrollmentFee.toLocaleString()} FCFA` : '0 FCFA (Gratuit ou non spécifié)'}
                                        </p>
                                    </div>

                                    {detailsLoading ? (
                                        <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 mx-auto rounded-full border-t-transparent"></div></div>
                                    ) : schoolDetails?.paymentPlans?.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Plans de scolarité disponibles :</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {schoolDetails.paymentPlans.map((plan: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">{plan.name}</p>
                                                            {(plan.classe || plan.cycle) && (
                                                                <p className="text-[10px] text-slate-400">Pour {plan.classe || plan.cycle}</p>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white">{plan.totalAmount ? `${plan.totalAmount.toLocaleString()} FCFA` : '0 FCFA'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        const code = `${encodeSchoolId(selectedSchool.id)}`;
                                        setSelectedSchool(null);
                                        setSchoolDetails(null);
                                        navigate(`/dashboard/parent/enroll?schoolCode=${code}`);
                                    }}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    Inscrire un enfant dans cette école <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExploreSchools;
