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

    const handleConfirmPayment = async () => {
        if (!user || !selectedInstitution) {
            setError("Veuillez choisir un établissement pour procéder au paiement.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let subscriptionType = plan;

            // Map duration to SubscriptionPeriod enum
            const subscriptionPeriod = durationLabel.includes("an") ? "ANNUAL" : "MONTHLY";

            await api.post(`/subscription/subscribe`, null, {
                params: {
                    pdgId: user.id,
                    institutionId: selectedInstitution.id,
                    type: subscriptionType,
                    period: subscriptionPeriod
                }
            });

            // Refresh user data before moving to success step
            await refreshUser();
            setStep(5);
        } catch (err: any) {
            console.error("Payment Error:", err);
            setError(err.response?.data?.message || "Une erreur est survenue lors du traitement du paiement.");
        } finally {
            setIsLoading(false);
        }
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
                        <p className="text-slate-500 font-medium">Sélectionnez l'établissement pour lequel vous souhaitez renouveler l'abonnement :</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {institutions.map((inst) => (
                                <button
                                    key={inst.id}
                                    onClick={() => handleInstitutionSelect(inst)}
                                    className={`flex items-center gap-4 p-5   transition-all text-left group ${selectedInstitution?.id === inst.id ? ' bg-blue-50' : ' hover: bg-white'}`}
                                >
                                    <div className="w-12 h-12  bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden">
                                        {inst.logoUrl ? <img src={getFileUrl(inst.logoUrl)} alt={inst.name} className="w-full h-full object-cover" /> : <Building size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">{inst.name}</h4>
                                        <p className="text-xs text-slate-400 capitalize">{inst.type.toLowerCase()}</p>
                                    </div>
                                    <div className={`w-6 h-6   flex items-center justify-center transition-all ${selectedInstitution?.id === inst.id ? ' bg-blue-600 text-white' : ''}`}>
                                        {selectedInstitution?.id === inst.id && <ArrowRight size={14} />}
                                    </div>
                                </button>
                            ))}
                            {institutions.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-400 italic">
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
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher votre pays..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4  bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredCountries.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => handleCountrySelect(c)}
                                    className="flex flex-col items-center gap-3 p-6    hover: hover:bg-blue-50/50 transition-all group"
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{c.flag}</span>
                                    <span className="font-bold text-slate-700">{c.name}</span>
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
                                    className="w-full flex items-center gap-6 p-6    hover: hover:bg-blue-50/50 transition-all text-left group"
                                >
                                    <div className="w-14 h-14  bg-white   flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <method.icon size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg">{method.name}</h4>
                                        <p className="text-slate-500">{method.description}</p>
                                    </div>
                                    <ArrowRight size={20} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
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
                        <div className="bg-blue-50 p-4  flex items-center gap-4 text-blue-700 font-medium">
                            {selectedMethod && <selectedMethod.icon size={20} />}
                            <span>Paiement via {selectedMethod?.name}</span>
                        </div>

                        <div className="space-y-4">
                            {selectedMethod?.id === 'card' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de Carte</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full p-4  bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expiration</label>
                                            <input type="text" placeholder="MM / YY" className="w-full p-4  bg-slate-100 border-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                                            <input type="text" placeholder="123" className="w-full p-4  bg-slate-100 border-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                </>
                            ) : selectedMethod?.id === 'bank' ? (
                                <div className="p-6  bg-slate-50   ">
                                    <Building className="text-slate-400 mb-4" size={40} />
                                    <h5 className="font-bold text-slate-800 mb-2">Informations de virement</h5>
                                    <p className="text-slate-500 text-sm mb-6">Veuillez effectuer le virement vers notre compte ECOBANK :</p>
                                    <div className="space-y-3">
                                        <div className="flex justify-between p-3 bg-white  text-sm   uppercase tracking-tighter">
                                            <span className="text-slate-400">IBAN</span>
                                            <span className="font-black text-slate-800">TD65 1010 1000 1234 5678 90</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-white  text-sm   uppercase tracking-tighter">
                                            <span className="text-slate-400">BIC/SWIFT</span>
                                            <span className="font-black text-slate-800">ECOBTDCT</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numéro de Téléphone {selectedMethod?.name}</label>
                                    <div className="flex gap-2">
                                        <div className="p-4 bg-slate-100  font-bold text-slate-500">+{selectedCountry?.code === 'TD' ? '235' : selectedCountry?.code === 'CM' ? '237' : '225'}</div>
                                        <input
                                            type="tel"
                                            placeholder="Numéro de compte"
                                            className="flex-1 p-4  bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 italic">* Une demande de confirmation apparaîtra sur votre téléphone.</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600  text-sm font-bold   flex items-center gap-3">
                                <ShieldCheck size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            className="w-full py-5  bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mt-8"
                            onClick={handleConfirmPayment}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Traitement en cours...' : 'Confirmer le Paiement'}
                            {!isLoading && <ArrowRight size={20} />}
                        </button>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-24 h-24 bg-green-100 text-green-600  flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Paiement Réussi !</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-sm mx-auto">Votre abonnement <strong>{planTitle}</strong> pour <strong>{selectedInstitution?.name}</strong> est maintenant actif.</p>
                        <button
                            onClick={() => navigate('/dashboard/pdg')}
                            className="px-10 py-4 bg-slate-900 text-white  font-black shadow-xl hover:bg-slate-800 transition-all"
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
        <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

                {/* Left side: Form */}
                <div className="flex-1 w-full flex flex-col gap-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold transition-colors w-fit group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Retour
                    </button>

                    <div className="bg-white ] shadow-2xl shadow-slate-200/50 p-8 md:p-12   flex-1 min-h-[600px] flex flex-col">
                        <header className="mb-10">
                            <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4">
                                <span className="w-8 h-[2px] bg-blue-600"></span>
                                Étape {step}/4
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                                {step === 1 ? 'Choisissez l\'établissement' :
                                    step === 2 ? 'Choisissez votre pays' :
                                        step === 3 ? 'Moyen de paiement' :
                                            step === 4 ? 'Finalisation' : 'Succès !'}
                            </h1>
                            <p className="text-slate-400 text-lg mt-2">
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

                        <footer className="mt-12 pt-8   flex items-center justify-between text-slate-400 text-sm">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-green-500" />
                                Paiement Sécurisé SSL
                            </div>
                            <div>Propulsé par Academia Pay</div>
                        </footer>
                    </div>
                </div>

                {/* Right side: Summary (Sticky) */}
                <aside className="lg:w-[400px] w-full sticky top-12">
                    <div className="bg-blue-900 ] p-10 text-white shadow-2xl shadow-blue-900/30 overflow-hidden relative">
                        {/* Abstract background decors */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5  blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10  blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        <h3 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
                            <Building size={20} className="text-blue-400" />
                            Récapitulatif
                        </h3>

                        <div className="space-y-8 relative z-10">
                            {selectedInstitution && (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-blue-300/60 text-xs font-black uppercase tracking-widest mb-1">Établissement</p>
                                        <h4 className="text-xl font-black">{selectedInstitution.name}</h4>
                                    </div>
                                    <div className="p-3 bg-white/10 ">
                                        <Building className="text-blue-400" size={24} />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-300/60 text-xs font-black uppercase tracking-widest mb-1">Plan Sélectionné</p>
                                    <h4 className="text-2xl font-black">{planTitle}</h4>
                                </div>
                                <div className="p-3 bg-white/10 ">
                                    <Globe className="text-blue-400" size={24} />
                                </div>
                            </div>

                            <div className="h-px bg-white/10"></div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-blue-100/60 font-medium">
                                    <span>Sous-total</span>
                                    <span>{priceValue}</span>
                                </div>
                                <div className="flex justify-between text-blue-100/60 font-medium">
                                    <span>Frais de service</span>
                                    <span>Inclut</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4">
                                    <span className="text-lg font-bold">Total à payer</span>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white">{priceValue}</div>
                                        <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-1">{durationLabel}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedCountry && (
                                <div className="pt-8   flex items-center gap-4">
                                    <div className="w-12 h-12  bg-white/10 flex items-center justify-center text-3xl">
                                        {selectedCountry.flag}
                                    </div>
                                    <div>
                                        <p className="text-blue-300/60 text-[10px] font-black uppercase tracking-widest mb-1">Pays de facturation</p>
                                        <h5 className="font-bold">{selectedCountry.name}</h5>
                                    </div>
                                </div>
                            )}

                            <div className="pt-10">
                                <div className="p-6  bg-white/5   space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2  bg-green-500 shadow-sm shadow-green-500"></div>
                                        <span className="text-sm font-bold text-blue-100">Activation instantanée</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2  bg-blue-400"></div>
                                        <span className="text-sm font-bold text-blue-100">Facture numérique incluse</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8  ">
                                <button className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white text-xs font-bold transition-colors">
                                    <LogOut size={14} />
                                    Annuler et recharger
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Global style for custom scrollbar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; -radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

export default SubscriptionCheckout;
