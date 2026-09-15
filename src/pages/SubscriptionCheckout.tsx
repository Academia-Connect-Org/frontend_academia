import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    CreditCard,
    Smartphone,
    Building,
    CheckCircle2,
    ArrowRight,
    Search,
    Globe,
    ShieldCheck,
    LogOut
} from 'lucide-react';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getFileUrl } from '../api/axios';

interface PaymentMethod {
    id: string;
    name: string;
    icon: any;
    description: string;
}

interface Country {
    code: string;
    name: string;
    flag: string;
    methods: string[];
}

const COUNTRIES: Country[] = [
    { code: 'TD', name: 'Tchad', flag: '🇹🇩', methods: ['moov', 'airtel'] },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲', methods: ['orange', 'mtn', 'card', 'bank'] },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', methods: ['orange', 'mtn', 'moov', 'wave', 'card'] },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳', methods: ['orange', 'free', 'wave', 'card'] },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯', methods: ['mtn', 'moov', 'card'] },
    { code: 'GA', name: 'Gabon', flag: '🇬🇦', methods: ['airtel', 'moov', 'card'] },
    { code: 'CG', name: 'Congo', flag: '🇨🇬', methods: ['mtn', 'airtel', 'card'] },
    { code: 'EG', name: 'Égypte', flag: '🇪🇬', methods: ['fawry', 'vodafone', 'card'] },
    { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', methods: ['ozow', 'paystack', 'card'] },
];

const METHODS_CONFIG: Record<string, PaymentMethod> = {
    orange: { id: 'orange', name: 'Orange Money', icon: Smartphone, description: 'Payez via votre compte Orange Money' },
    mtn: { id: 'mtn', name: 'MTN Mobile Money', icon: Smartphone, description: 'Payez via votre compte MTN MoMo' },
    moov: { id: 'moov', name: 'Moov Money', icon: Smartphone, description: 'Payez via votre compte Moov' },
    airtel: { id: 'airtel', name: 'Airtel Money', icon: Smartphone, description: 'Payez via votre compte Airtel' },
    wave: { id: 'wave', name: 'Wave', icon: Smartphone, description: 'Payez via l\'application Wave' },
    free: { id: 'free', name: 'Free Money', icon: Smartphone, description: 'Payez via Free Money' },
    card: { id: 'card', name: 'Carte Bancaire', icon: CreditCard, description: 'Visa, Mastercard, American Express' },
    bank: { id: 'bank', name: 'Virement Bancaire', icon: Building, description: 'Transfert direct vers notre compte' },
    fawry: { id: 'fawry', name: 'Fawry', icon: Building, description: 'Paiement via point Fawry' },
    vodafone: { id: 'vodafone', name: 'Vodafone Cash', icon: Smartphone, description: 'Vodafone Cash semi-wallet' },
};

const SubscriptionCheckout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token, refreshUser } = useAuth();
    const queryParams = new URLSearchParams(location.search);

    const plan = queryParams.get('plan') || 'STANDARD';
    const planTitle = queryParams.get('planTitle') || plan;
    const priceValue = queryParams.get('price') || '95 000 FCFA';
    const durationLabel = queryParams.get('duration') || '/ mois';

    const [step, setStep] = useState(1);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const institutionIdParam = queryParams.get('institutionId');

    React.useEffect(() => {
        const fetchInstitutions = async () => {
            if (!user?.id) return;
            try {
                const res = await api.get(`/institutions/ceo/${user.id}`);
                setInstitutions(res.data);

                if (institutionIdParam) {
                    const inst = res.data.find((i: any) => i.id === Number(institutionIdParam));
                    if (inst) {
                        setSelectedInstitution(inst);
                        setStep(2);
                    }
                }
            } catch (err) {
                console.error("Fetch institutions error:", err);
            }
        };
        fetchInstitutions();
    }, [user?.id, token, institutionIdParam]);

    const filteredCountries = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    const handleInstitutionSelect = (inst: any) => {
        setSelectedInstitution(inst);
        setStep(2);
    };

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setStep(3);
    };

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep(4);
    };

    const [showUnavailableModal, setShowUnavailableModal] = useState(false);

    const handleConfirmPayment = () => {
        if (!user || !selectedInstitution) {
            setError("Veuillez choisir un établissement pour procéder au paiement.");
            return;
        }
        setShowUnavailableModal(true);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">Sélectionnez l'établissement pour lequel vous souhaitez renouveler l'abonnement :</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {institutions.map((inst) => (
                                <button
                                    key={inst.id}
                                    onClick={() => handleInstitutionSelect(inst)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${selectedInstitution?.id === inst.id
                                        ? 'bg-sky-50/80 dark:bg-sky-950/60 border-sky-500 dark:border-sky-400 shadow-md'
                                        : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700'
                                        }`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 group-hover:bg-sky-600 group-hover:text-white transition-all overflow-hidden shrink-0">
                                        {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt={inst.name} className="w-full h-full object-cover" /> : <Building size={22} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{inst.name}</h4>
                                        <p className="text-xs text-slate-400 capitalize mt-0.5">{inst.type.toLowerCase()}</p>
                                    </div>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${selectedInstitution?.id === inst.id ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                        <ArrowRight size={14} />
                                    </div>
                                </button>
                            ))}
                            {institutions.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs italic bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    Aucun établissement trouvé. Veuillez d'abord créer un établissement.
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher votre pays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredCountries.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => handleCountrySelect(c)}
                                    className="flex flex-col items-center gap-2.5 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-400 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-all group"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{c.flag}</span>
                                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {selectedCountry?.methods.map((methodId) => {
                            const method = METHODS_CONFIG[methodId];
                            if (!method) return null;
                            return (
                                <button
                                    key={methodId}
                                    onClick={() => handleMethodSelect(method)}
                                    className="w-full flex items-center gap-5 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm shrink-0">
                                        <method.icon size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{method.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{method.description}</p>
                                    </div>
                                    <ArrowRight size={18} className="ml-auto text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
                                </button>
                            );
                        })}
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-sky-50 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-900/60 rounded-2xl p-4 flex items-center gap-3 text-sky-700 dark:text-sky-300 font-semibold text-xs sm:text-sm">
                            {selectedMethod && <selectedMethod.icon size={18} />}
                            <span>Paiement via {selectedMethod?.name}</span>
                        </div>

                        <div className="space-y-4">
                            {selectedMethod?.id === 'card' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Numéro de Carte</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Expiration</label>
                                            <input type="text" placeholder="MM / YY" className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">CVC</label>
                                            <input type="text" placeholder="123" className="w-full p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400" />
                                        </div>
                                    </div>
                                </>
                            ) : selectedMethod?.id === 'bank' ? (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                    <Building className="text-sky-500 mb-3" size={32} />
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Informations de virement</h5>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Veuillez effectuer le virement vers notre compte ECOBANK :</p>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                                            <span className="text-slate-400">IBAN</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">TD65 1010 1000 1234 5678 90</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                                            <span className="text-slate-400">BIC/SWIFT</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">ECOBTDCT</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Numéro de Téléphone {selectedMethod?.name}</label>
                                    <div className="flex gap-2">
                                        <div className="p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-center">
                                            +{selectedCountry?.code === 'TD' ? '235' : selectedCountry?.code === 'CM' ? '237' : '225'}
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Numéro de compte"
                                            className="flex-1 p-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-2 italic">* Une demande de confirmation apparaîtra sur votre téléphone.</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                                <ShieldCheck size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            className="w-full py-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 mt-6 disabled:opacity-50"
                            onClick={handleConfirmPayment}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Traitement en cours...' : 'Confirmer le Paiement'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Paiement Réussi !</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                            Votre abonnement <strong className="text-slate-900 dark:text-white">{planTitle}</strong> pour <strong className="text-slate-900 dark:text-white">{selectedInstitution?.name}</strong> est désormais actif.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard/pdg')}
                            className="px-8 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-200"
                        >
                            Accéder à mon Dashboard
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

                {/* Left side: Form */}
                <div className="flex-1 w-full flex flex-col gap-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold text-xs transition-colors w-fit group"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </button>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-10 flex-1 min-h-[550px] flex flex-col transition-colors duration-300">
                        <header className="mb-8">
                            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs uppercase tracking-wider mb-3">
                                <span className="w-6 h-[2px] bg-sky-500 rounded-full" />
                                Étape {step}/4
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {step === 1 ? 'Choisissez l\'établissement' :
                                    step === 2 ? 'Choisissez votre pays' :
                                        step === 3 ? 'Moyen de paiement' :
                                            step === 4 ? 'Finalisation' : 'Succès !'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-normal">
                                {step === 1 ? 'Sélectionnez l\'école concernée par cet abonnement.' :
                                    step === 2 ? 'Sélectionnez le pays de facturation pour voir les méthodes disponibles.' :
                                        step === 3 ? `Modes de paiement disponibles au ${selectedCountry?.name}.` :
                                            step === 4 ? `Dernière étape pour activer votre accès.` : ''}
                            </p>
                        </header>

                        <div className="flex-1">
                            <AnimatePresence mode="wait">
                                {renderStepContent()}
                            </AnimatePresence>
                        </div>

                        <footer className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={15} className="text-emerald-500" />
                                Paiement Sécurisé SSL
                            </div>
                            <div>Propulsé par Academia Pay</div>
                        </footer>
                    </div>
                </div>

                {/* Right side: Summary (Sticky) */}
                <aside className="lg:w-[380px] w-full sticky top-28">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-8 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                        <h3 className="text-lg font-bold mb-6 relative z-10 flex items-center gap-2.5">
                            <Building size={18} className="text-sky-400" />
                            Récapitulatif
                        </h3>

                        <div className="space-y-6 relative z-10 text-xs">
                            {selectedInstitution && (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Établissement</p>
                                        <h4 className="text-base font-bold text-white">{selectedInstitution.name}</h4>
                                    </div>
                                    <div className="p-2.5 bg-white/10 rounded-xl">
                                        <Building className="text-sky-400" size={20} />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Plan Sélectionné</p>
                                    <h4 className="text-xl font-extrabold text-white">{planTitle}</h4>
                                </div>
                                <div className="p-2.5 bg-white/10 rounded-xl">
                                    <Globe className="text-sky-400" size={20} />
                                </div>
                            </div>

                            <div className="h-px bg-slate-800 my-4" />

                            <div className="space-y-3">
                                <div className="flex justify-between text-slate-300">
                                    <span>Sous-total</span>
                                    <span>{priceValue}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Frais de service</span>
                                    <span className="text-emerald-400 font-semibold">Inclus</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-3 border-t border-slate-800">
                                    <span className="text-sm font-bold text-white">Total à payer</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-white">{priceValue}</div>
                                        <div className="text-sky-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">{durationLabel}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedCountry && (
                                <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                                        {selectedCountry.flag}
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Pays de facturation</p>
                                        <h5 className="font-bold text-white text-xs">{selectedCountry.name}</h5>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 text-[11px]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                                        <span className="font-medium text-slate-200">Activation instantanée</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-sky-400" />
                                        <span className="font-medium text-slate-200">Facture numérique PDF incluse</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 text-center">
                                <button onClick={() => navigate(ROUTES.PRICING)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                                    <LogOut size={13} />
                                    Changer de plan
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Payment Method Unavailable Modal */}
            <AnimatePresence>
                {showUnavailableModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center"
                        >
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <ShieldCheck size={36} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Paiement en ligne indisponible</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Le moyen de paiement automatique par carte / mobile money n'est pas encore disponible en ligne.
                                    <br /><br />
                                    Pour souscrire ou renouveler l'accès de votre établissement <strong>{selectedInstitution?.name}</strong>, veuillez contacter directement l'administration.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-left space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Administration</p>
                                <div className="text-xs space-y-1 font-semibold text-slate-800 dark:text-slate-200">
                                    <p>Email: <a href="mailto:academiaconnects@gmail.com" className="text-sky-600 dark:text-sky-400 underline">academiaconnects@gmail.com</a></p>
                                    <p>Téléphone / WhatsApp: <span className="font-mono">+237 696 731 837</span></p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUnavailableModal(false)}
                                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                                >
                                    Fermer
                                </button>
                                <a
                                    href={`mailto:contact@academia-connect.com?subject=Demande%20d'activation%20d'abonnement%20-%20${encodeURIComponent(selectedInstitution?.name || '')}`}
                                    className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                                >
                                    Contacter
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionCheckout;
