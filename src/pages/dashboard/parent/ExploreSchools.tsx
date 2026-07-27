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
    }, [countryFilter, typeFilter]); // Re-fetch on filter change, but for search term we might want a debounced effect or manual submit

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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Découvrir le réseau ACADEMIA CONNECT</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Explorez nos établissements, trouvez l'école idéale pour vos enfants, et rejoignez une communauté éducative d'excellence.</p>
            </div>

            {/* Filters & Search */}
            <form onSubmit={handleSearch} className="bg-white p-6 shadow-xl mb-12 flex flex-col md:flex-row gap-4 items-end rounded-lg">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rechercher</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Nom de l'établissement..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pays</label>
                    <input 
                        type="text"
                        list="country-list"
                        placeholder="Saisissez un pays..."
                        className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                    />
                    <datalist id="country-list">
                        {COUNTRIES.map(c => (
                            <option key={c} value={c} />
                        ))}
                    </datalist>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Type</label>
                    <select 
                        className="w-full px-4 py-3 bg-slate-50 border-none focus:ring-2 focus:ring-blue-600 rounded-md"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        <option value="ECOLE">École Primaire / Maternelle</option>
                        <option value="ETABLISSEMENT">Lycée / Collège</option>
                    </select>
                </div>
                <button type="submit" className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors rounded-md shadow-lg shadow-blue-600/30">
                    Filtrer
                </button>
            </form>

            {/* Results */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : schools.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-600">Aucun établissement trouvé</h3>
                    <p className="text-slate-400 mt-2">Essayez de modifier vos critères de recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {schools.map(school => (
                        <div key={school.id} className="bg-white group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 flex flex-col">
                            <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => handleSelectSchool(school)}>
                                {school.logoUrl ? (
                                    <img src={getFileUrl(school.logoUrl)} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <Building2 size={64} className="text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-800 shadow-sm">
                                    {school.type === 'ECOLE' ? 'Primaire/Maternelle' : 'Collège/Lycée'}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-slate-800 mb-2">{school.name}</h3>
                                <div className="space-y-2 mb-6 flex-1">
                                    <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <MapPin size={16} className="text-blue-500" /> {school.country || 'Pays non spécifié'}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                        <GraduationCap size={16} className="text-purple-500" /> Code: {encodeSchoolId(school.id)}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/dashboard/parent/enroll?schoolCode=${encodeSchoolId(school.id)}`)}
                                    className="w-full py-3 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors rounded flex items-center justify-center gap-2"
                                >
                                    Inscrire un enfant <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* School Details Modal */}
            {selectedSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="relative h-48 bg-slate-100 flex-shrink-0">
                            {selectedSchool.logoUrl ? (
                                <img src={getFileUrl(selectedSchool.logoUrl)} alt={selectedSchool.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><Building2 size={64} className="text-slate-300" /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                            <button onClick={() => setSelectedSchool(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors">
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-4 left-6 right-6">
                                <h2 className="text-3xl font-black text-white">{selectedSchool.name}</h2>
                                {selectedSchool.motto && <p className="text-blue-200 text-sm font-medium italic mt-1">« {selectedSchool.motto} »</p>}
                            </div>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="flex flex-col gap-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin size={18} className="text-blue-500" />
                                    <span className="font-medium">{selectedSchool.address || 'Adresse non spécifiée'} • {selectedSchool.country}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={18} className="text-blue-500" />
                                    <span className="font-medium">{selectedSchool.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail size={18} className="text-blue-500" />
                                    <span className="font-medium">{selectedSchool.email || 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">À propos</h4>
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {selectedSchool.description || "Aucune description fournie pour cet établissement."}
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Informations Financières</h4>
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                                    <p className="text-sm text-blue-800 font-bold mb-1">Frais d'inscription</p>
                                    <p className="text-xl font-black text-blue-600">
                                        {selectedSchool.enrollmentFee ? `${selectedSchool.enrollmentFee.toLocaleString()} FCFA` : 'Gratuit ou non spécifié'}
                                    </p>
                                </div>

                                {detailsLoading ? (
                                    <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 mx-auto rounded-full border-t-transparent"></div></div>
                                ) : schoolDetails?.paymentPlans?.length > 0 && (
                                    <div>
                                        <p className="text-sm font-bold text-slate-600 mb-2">Plans de scolarité disponibles :</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {schoolDetails.paymentPlans.map((plan: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                                                    <div>
                                                        <p className="font-bold text-slate-700 text-sm">{plan.name}</p>
                                                        {(plan.classe || plan.cycle) && (
                                                            <p className="text-xs text-slate-400 font-medium">Pour {plan.classe || plan.cycle}</p>
                                                        )}
                                                    </div>
                                                    <span className="font-black text-slate-800">{plan.totalAmount?.toLocaleString()} FCFA</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Classes Disponibles</h4>
                                {detailsLoading ? (
                                    <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-2 border-blue-600 mx-auto rounded-full border-t-transparent"></div></div>
                                ) : schoolDetails?.classes?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {schoolDetails.classes.map((cls: any, idx: number) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                                {cls.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm italic">Aucune classe configurée pour le moment.</p>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => {
                                    const code = `${encodeSchoolId(selectedSchool.id)}`;
                                    setSelectedSchool(null);
                                    setSchoolDetails(null);
                                    navigate(`/dashboard/parent/enroll?schoolCode=${code}`);
                                }}
                                className="w-full py-4 bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-colors rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                            >
                                Inscrire un enfant <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExploreSchools;
