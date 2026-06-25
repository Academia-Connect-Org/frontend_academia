import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, BookOpen, UserPlus, MessageSquare, CreditCard, ShieldCheck,
    ChevronRight, ChevronDown, PlayCircle, CheckCircle, ArrowRight, ArrowUp, Briefcase, Building,
    FileText, GraduationCap, Users, Wrench, AlertTriangle, LifeBuoy, PhoneCall,
    Mail, Globe, FileSpreadsheet, FileCode2, Database, Cloud, Server, Smartphone,
    Monitor, Coffee
} from 'lucide-react';

const Support: React.FC = () => {
    const [activeTab, setActiveTab] = useState('getting-started');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTopBtn, setShowTopBtn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowTopBtn(true);
            } else {
                setShowTopBtn(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (id: string) => {
        setActiveTab(id);
        scrollToTop();
    };



    const menuItems = [
        { id: 'getting-started', label: 'Introduction & Démarrage', icon: PlayCircle, desc: "Vision globale du produit" },
        { id: 'pdg', label: 'Espace PDG (Multi-écoles)', icon: Briefcase, desc: "Pilotage stratégique et stat globales" },
        { id: 'direction', label: 'Espace Direction & Pilotage', icon: Building, desc: "Scolarité, Personnel, Emplous du temps" },
        { id: 'secretariat', label: 'Secrétariat & Admissions', icon: FileText, desc: "Inscriptions, Bulletins, Dossiers" },
        { id: 'teachers', label: 'Espace Enseignant', icon: GraduationCap, desc: "Appels, Devoirs, Saisie de notes" },
        { id: 'parents', label: 'Espace Parents & Mobile', icon: Users, desc: "Suivi, Assiduité, Reçus PDF" },
        { id: 'troubleshooting', label: 'Maintenance / Linux', icon: Wrench, desc: "Crash Linux, Wayland, X11, Caches" }
    ];

    const filteredMenuItems = menuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const render_getting_started = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">📚 NB-MIND School : Manuel d'Utilisation Intégral (2026)</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Bienvenue dans le guide de référence d'**NB-MIND School**. Ce manuel a été conçu pour offrir une vision exhaustive de chaque module, de chaque bouton et de chaque flux de travail pour l'ensemble des acteurs de l'écosystème scolaire.
            </p>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🌟 Vision du Produit</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                NB-MIND School n'est pas qu'un simple logiciel de gestion. C'est un environnement de travail unifié qui relie l'administration, les enseignants et les familles pour garantir le succès des élèves.
            </p>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📂 Organisation du manuel</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Pour faciliter votre lecture, le manuel est divisé en chapitres dédiés à chaque profil d'utilisateur. Cliquez sur les liens ci-dessous pour accéder aux guides détaillés :
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                1.  ### [👔 Le Profil PDG (Multi-Écoles)](./PDG.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Gestion globale des établissements.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Pilotage financier et abonnements.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Audit et statistiques stratégiques.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                2.  ### [🏛️ Le Profil Direction d'Établissement](./Direction.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Configuration des cycles, classes et matières.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Gestion du personnel (Staff & Enseignants).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Emploi du temps intelligent et annonces.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                3.  ### [📝 Le Profil Secrétariat & Admission](./Secretariat.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Processus d'inscription (Enrollment).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Dossier élève et suivi d'assiduité.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Génération de documents administratifs (Certificats, Reçus).</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                4.  ### [👨‍🏫 Le Profil Enseignant (Expertise Pédagogique)](./Enseignant.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Appel numérique et cahier de texte.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Gestion fine des notes et des moyennes.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Devoirs et ressources partagées.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                5.  ### [📱 Le Profil Parent & Élève (Usage Mobile)](./Parent_Eleve.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Suivi des résultats et bulletins.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Agenda, devoirs et messagerie.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Suivi financier des frais de scolarité.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                6.  ### [🛠️ Guide Technique & Maintenance](./Technique.md)
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Résolution des problèmes (Crash Linux/Wayland).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Gestion du cache et mises à jour.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Dernière mise à jour : 22 Mars 2026*
            </p>
        </div>
    );

    const render_pdg = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">👔 GUIDE FONCTIONNEL : Le Profil PDG (Multi-Écoles)</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Ce sous-manuel est destiné aux propriétaires d'établissement(s) et aux directeurs de gestion de haut niveau cherchant à piloter leur(s) structure(s) scolaires via les indicateurs de performance d'NB-MIND School.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📈 1. Tableau de bord stratégique (Global Stats)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le module **Global Stats** (accessible sur Web/Desktop) offre une vue consolidée de l'ensemble de l'écosystème Evenia.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📊 1.1 Indicateurs de Performance (KPI)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Nombre d'Élèves Totaux</strong> : Affichage du volume global d'élèves répartis sur l'ensemble des établissements d'un même groupe scolaire.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Taux de Présence Moyen</strong> : Un graphique interactif montrant l'évolution hebdomadaire de l'assiduité. Un PDG peut ainsi détecter un pic d'absence sur un établissement précis (problème sanitaire, infrastructure, etc.).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Performance Académique Globale</strong> : Moyenne arithmétique globale calculée à partir des derniers examens enregistrés dans chaque école. Permet de comparer la qualité pédagogique entre différents sites.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🏗️ 2. Créer une École ou un Établissement (Pas à Pas)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                C'est ici que le PDG définit la structure globale du groupe scolaire en ajoutant de nouveaux sites physiques ou administratifs.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">➕ Procédure de création d'un nouveau site :</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                1.  **Accéder au module Schools** : Dans la barre latérale gauche, cliquez sur l'icône **Établissements**.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                2.  **Lancer l'ajout** : Cliquez sur le bouton bleu **"Ajouter une École"** situé en haut à droite de l'interface.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                3.  **Renseigner l'Identité** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Saisissez le <strong className="text-blue-800 font-extrabold">Nom Officiel</strong> (ex: Complexe Scolaire Evenia Nord).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Sélectionnez le <strong className="text-blue-800 font-extrabold">Type d'établissement</strong> (Primaire, Secondaire, ou Mixte).</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                4.  **Coordonnées de l'École** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Entrez l'<strong className="text-blue-800 font-extrabold">Adresse physique</strong> précise (pour la géolocalisation éventuelle).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Ajoutez l'<strong className="text-blue-800 font-extrabold">Email de contact</strong> et le <strong className="text-blue-800 font-extrabold">Téléphone du secrétariat</strong> qui apparaîtront sur les courriers.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                5.  **Personnalisation Visuelle** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Cliquez sur la zone de téléchargement pour importer le <strong className="text-blue-800 font-extrabold">Logo de l'école</strong> (Format PNG/JPG recommandé).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  *Note : Ce logo est utilisé par le système pour générer automatiquement les entêtes de bulletins.*</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                6.  **Validation** : Cliquez sur **"Enregistrer l'établissement"**. L'école apparaît désormais dans votre liste et vous pouvez commencer à y affecter du personnel de direction.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🏫 Suivi des Détails de l'Ecole (School Details)</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Une fois l'école créée, vous pouvez cliquer dessus pour surveiller :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Volume d'Enseignants</strong> : Liste exhaustive des professeurs avec leur charge de travail.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Volume d'Eleves</strong> : Répartition par niveau (Primaire, Collège, Lycée).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Capacité des Salles</strong> : Vérification de la saturation des infrastructures.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">💰 3. Gestion Financière & Abonnements (Finance)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La santé financière du groupe est pilotée directement depuis ce module.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">💸 3.1 Encaissements Globaux</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Rapport de Trésorerie</strong> : Somme cumulative des frais d'inscription et des scolarités mensuelles.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Taux de Recouvrement</strong> : Comparaison entre facturation et encaissement réel.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Détection des Impayés</strong> : Ciblez les classes problématiques.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">💳 3.2 Renouveler son Abonnement (Pas à Pas)</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le PDG gère ici son propre accès au logiciel NB-MIND School pour l'ensemble du groupe.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                1.  **Naviguer vers "Mon Compte / Licence"** : Cliquez sur votre profil en haut à droite, puis sur **Abonnement**.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                2.  **Vérifier le Statut** : Consultez la date d'expiration de votre licence actuelle.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                3.  **Choisir le Mode de Renouvellement** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Automatique</strong> : Enregistrez une carte bancaire pour éviter toute coupure de service.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Manuel</strong> : Cliquez sur le bouton <strong className="text-blue-800 font-extrabold">"Renouveler Maintenant"</strong>.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                4.  **Sélection des Modules** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Cochez les options souhaitées (Mobile Parent, SMS illimités, Module Transport).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Le prix s'ajuste dynamiquement en fonction du nombre total d'élèves enregistrés dans vos écoles.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                5.  **Paiement Sécurisé** :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Saisissez vos informations de paiement ou utilisez le crédit de votre portefeuille virtuel.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  Une fois validé, une facture au format PDF est générée instantanément dans l'onglet <strong className="text-blue-800 font-extrabold">Historique des Factures</strong>.</span>
                    </div>
                </div>
            </motion.div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                6.  **Confirmation** : Votre date d'expiration est mise à jour immédiatement et les nouveaux modules sont débloqués pour tous les utilisateurs concernés.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🔒 4. Administration & Sécurité (Settings)</h2>
            </div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">⚙️ 4.1 Variables Globales</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Cycles Scolaires</strong> : Définition des cycles (ex: Primaire/Secondaire).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Modèles de Bulletins</strong> : Choix du design graphique pour assurer une image de marque cohérente.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🚀 5. Avantages du Support Desktop pour le PDG</h2>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Rapidité des exports</strong> : Génération de rapports financiers complexes en quelques secondes.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Mode "Focus"</strong> : Interface sans distraction pour vos analyses stratégiques.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide PDG détaillé*
            </p>
        </div>
    );

    const render_direction = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">🏛️ GUIDE FONCTIONNEL : Le Profil Provisoriat/Direction</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La Direction d'établissement assure le pilotage opérationnel d'une école. Ce guide détaille chaque module de gestion académique pour le Proviseur, le Principal ou le Directeur d'école.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📅 1. Configuration Annuelle et Cycles (Cycles)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Avant le début de l'année scolaire, la Direction doit configurer l'infrastructure logique de l'établissement.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🔄 1.1 Définition des Cycles</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Cycle Primaire</strong> (CP au CM2) : Configuration des coefficients (bases 10 ou 20) et des tranches d'âges admises.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Cycle Collège</strong> (6ème à la 3ème) : Mise en place des matières obligatoires et facultatives.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Cycle Lycée</strong> (2nde à la Terminale) : Gestion des spécialités et des coefficients d'examens (BAC).</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🏫 2. Gestion des Classes et des Salles (Classes & Rooms)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                C'est le module de structuration physique et logique.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🗂️ 2.1 Création des Classes</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Dénomination</strong> : Exemple : "Terminale S1", "6ème A", "CM2 Vert".</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Affectation Enseignant Principal</strong> : Choix du professeur responsable pour la classe. Ce dernier aura des privilèges étendus (validation des bulletins, avis de conseil de classe).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Capacité Maximale</strong> : Nombre de places assises disponibles pour éviter la surpopulation scolaire.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🚪 2.2 Salles de Classe (Rooms)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Inventaire des Salles</strong> : Création des salles physiques (Salle 102, Laboratoire de SVT, Salle de Sport).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Disponibilité</strong> : Suivi des créneaux libres pour la location ou les cours de soutien.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">👮 3. Gestion du Personnel (Staff & Teachers)</h2>
            </div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">👨‍🏫 3.1 Corps Enseignant (Teachers)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Fiches Professeurs</strong> : Coordonnées, diplômes et spécialités (Maths, Français, Musique).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Volumes Horaires</strong> : Définition du nombre d'heures contractuelles par semaine.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Assignation des Matières</strong> : Liaison entre un professeur et les matières qu'il est habilité à enseigner (ex: un professeur de Physique peut aussi enseigner la Technologie).</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">👷 3.2 Personnel Administratif (Staff)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Gestion des Comptes</strong> : Création de comptes spécifiques pour les agents de sécurité, les surveillants et les agents d'entretien.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Droits d'Accès</strong> : Limitation des vues aux seuls modules nécessaires à leur mission.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🗓️ 4. Emploi du Temps Intelligent (Schedule)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le module **Schedule** est le cœur synchronisé de l'école.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🛠️ 4.1 Génération de l'Emploi du Temps</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Grilles Horaires</strong> : Définition des heures de début et de fin de cours (ex: 08:00 - 17:00).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Évitement des Conflits</strong> : Le système empêche d'affecter un professeur ou une salle à deux cours simultanés.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Export PDF/Numérique</strong> : Une fois validé, l'emploi du temps est instantanément publié sur les applications des professeurs, élèves et parents.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📢 5. Communication et Annonces (Announcements)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La Direction utilise ce canal pour les communications officielles.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Diffusion de News</strong> : Annonce de réunions parents-profs, jours fériés ou événements sportifs.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Ciblage des Messages</strong> : Possibilité d'envoyer une annonce à toute l'école, à un niveau seulement (ex: Brevet Blanc pour les 3èmes) ou aux enseignants uniquement.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Notifications Push</strong> : Chaque annonce génère une alerte mobile immédiate pour assurer une visibilité maximale.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📑 6. Validation des Résultats & Bulletins (Report Cards)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La Direction a le dernier mot sur les performances académiques.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Révision des Moyennes</strong> : Vue d'ensemble sur les carnets de notes pour détecter les anomalies de saisie.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Génération des Bulletins PDF</strong> : Une fois le conseil de classe passé, la Direction lance la génération massive des PDF. Ces documents sont horodatés et protégés.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Signature Numérique</strong> : Possibilité d'apposer un sceau numérique sur les documents pour authentifier leur origine.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🌐 7. Avantages Desktop pour la Direction</h2>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Edition Multi-fenêtres</strong> : Travaillez sur l'emploi du temps tout en consultant la liste des enseignants grâce à la gestion native des fenêtres sur l'app Desktop.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Impression Rapide</strong> : Accès direct aux drivers d'imprimantes locales pour les certificats et badges.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide Direction*
            </p>
        </div>
    );

    const render_secretariat = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">📝 GUIDE FONCTIONNEL : Le Profil Secrétariat & Admission</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le secrétariat d'établissement est le premier point de contact des familles. Ce guide détaille chaque étape du processus d'inscription et de réinscription scolaire.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🎒 1. Processus d'Inscription (Enrollment)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                C'est l'un des flux les plus critiques d'NB-MIND School.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📝 1.1 Inscription individuelle</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Formulaire d'Admission</strong> : Saisie des informations de base (Nom, Prénom, Date de Naissance, Sexe, Nationalité).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Coordonnées Parents</strong> : Liaison obligatoire entre un compte élève et au moins un compte parent (téléphone, email, lien de parenté).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Génération de Matricule</strong> : Un identifiant unique (Ex: 2026-001-A) est automatiquement généré pour assurer le suivi sans erreur de l'élève durant toute sa scolarité.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🍱 1.2 Inscription Massive (Bulk Import)</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Lors de la rentrée scolaire ou du transfert d'élèves, le secrétariat peut importer un fichier Excel ou CSV pré-rempli pour créer des centaines de comptes en un clic.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📂 2. Gestion du Dossier Éélève (Students)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le module **Students** centralise toute l'histoire académique et administrative de l'enfant.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🔍 2.1 Fiche Éélève détaillée</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Historique Scolaire</strong> : Conservation des bulletins des années précédentes (si l'école utilise NB-MIND School depuis longtemps).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">État Civil</strong> : Information sur les allergies, urgences médicales et certificats d'aptitude.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Statut de Paiement</strong> : Indicateur visuel (Vert/Rouge) sur la situation financière de l'élève (scolarité payée ou en retard).</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🏷️ 2.2 Re-inscription Annuelle</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le secrétariat peut passer les élèves d'une classe N à une classe N+1 (ex: du CM1 au CM2) via une interface de validation simplifiée.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📑 3. Génération de Documents Administratifs (Reports)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le secrétariat est sollicité pour produire des documents officiels.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Certificats de Scolarité</strong> : Pré-remplis avec les données de l'élève, datés et signés numériquement.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Listes d'Émargement</strong> : Listes nominatives par classe pour les examens ou les sorties scolaires.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Reçus de Paiement</strong> : Déclenchés automatiquement lors d'un encaissement pour preuve de paiement des frais.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">⏱️ 4. Suivi d'Assiduité (Attendance Admin)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Alors que les professeurs font l'appel en classe, le secrétariat traite les absences au niveau administratif.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Justification d'Absence</strong> : Saisie des certificats médicaux ou motifs familiaux pour passer une absence de "non-justifiée" à "justifiée".</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Synthèse Quotidienne</strong> : Rapport montrant les élèves absents sur plusieurs cours successifs pour un appel téléphonique immédiat aux familles.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">👩‍💻 5. Usage de l'application Desktop pour le Secrétariat</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le secrétariat bénéficie grandement de l'application **Desktop** pour :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Saisie Rapide</strong> : Rapidité de réaction de l'interface lors de la saisie de gros volumes d'informations (période de pointe de la rentrée).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Impression en Série</strong> : Lancement de l'impression de centaines de badges élèves en une seule action.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Support Hors-ligne (Cache)</strong> : Possibilité de continuer à saisir des informations même lors de micro-coupures internet, avec synchronisation automatique au retour de la connexion.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide Secrétariat*
            </p>
        </div>
    );

    const render_teachers = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">👨‍🏫 GUIDE FONCTIONNEL : Le Profil Enseignant (Expertise Pédagogique)</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le professeur utilise NB-MIND School au quotidien, souvent en classe ou à domicile. Ce manuel présente les outils pour optimiser la gestion pédagogique.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🗂️ 1. Organisation Hebdomadaire (My Schedule)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le professeur dispose d'une vue personnalisée de sa semaine.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🕰️ 1.1 Emploi du Temps personnel</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Synchronisation Automatique</strong> : Toute modification de l'emploi du temps par la Direction est instantanément mise à jour sur le tableau de bord du professeur.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Affectation des Salles</strong> : Indication claire de la salle pour chaque cours.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Liste des Classes</strong> : Un bouton direct permet d'accéder à la liste des élèves de la classe concernée par le cours.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">⏱️ 2. Gestion de l'Assiduité (Attendance)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                C'est l'un des premiers gestes au début de chaque heure de cours.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📝 2.1 Appel Numérique</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Liste des Éleves dynamique</strong> : Affichage des photos des élèves pour une identification rapide.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Marquage Rapide</strong> : En un clic, marquez un élève comme :</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Présent</strong> : Statut par défaut.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Absent</strong> : Déclenche automatiquement une alerte interne et, selon les réglages, une notification mobile au parent.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Retard</strong> : Enregistre le temps de retard (ex: 10 min) pour le décompte global.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Validation du Rapport</strong> : Une fois validé, le rapport d'appel est transmis au secrétariat et à la Direction.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📒 3. Cahier de Texte et Progression (Books)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Afin d'assurer la continuité pédagogique, le professeur renseigne le cahier de texte numérique.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🖊️ 3.1 Contenu de la Séance</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Résumé du Cours</strong> : Description rapide des notions abordées (ex: Théorème de Pythagore, Analyse de texte, etc.).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Pièces Jointes</strong> : Possibilité de télécharger le support de cours (PDF, Images) pour que les élèves puissent le consulter plus tard.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🎒 3.2 Gestion des Devoirs (Homework)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Description du Travail</strong> : Consignes détaillées pour le travail à faire à la maison.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Date de Rendu</strong> : Une date limite est fixée pour le rendu du devoir. Celui-ci apparaît automatiquement sur le calendrier mobile de l'élève.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📊 4. Évaluation et Saisie des Notes (Grades)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La saisie des notes est l'un des volets les plus optimisés d'NB-MIND School.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📝 4.1 Carnet de Notes Numérique</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Création d'Évaluation</strong> : Définition d'un titre (ex: Devoir Surveillé N°1), d'une date et d'un coefficient.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Interface de Saisie Rapide</strong> : Liste des élèves avec un champ de saisie unique. Le passage d'un élève à l'autre se fait via la touche "Entrée" ou "Tabulation" (Optimisation Desktop).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Commentaires et Appréciations</strong> : Ajout d'un commentaire individualisé par élève (ex: "Très bon travail", "Des efforts à poursuivre").</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📈 4.2 Calcul des Moyennes</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le système calcule automatiquement les moyennes pondérées en fonction des coefficients définis par le professeur ou l'administration.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">👨‍💻 5. Pourquoi privilégier l'application Desktop pour l'Enseignant ?</h2>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Mode Hors-ligne (Offline)</strong> : Le professeur peut saisir les notes chez lui sans connexion internet stable. Les données se synchroniseront dès le retour du réseau.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Saisie au Clavier</strong> : L'ergonomie native de l'application desktop permet de saisir des notes beaucoup plus rapidement qu'un navigateur web (pas de lag de rechargement de page).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Double Écran</strong> : Possibilité de garder le cahier de texte ouvert à côté de ses propres supports de cours numériques.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide Enseignant*
            </p>
        </div>
    );

    const render_parents = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">📱 GUIDE FONCTIONNEL : Le Profil Parent & Élève (Usage Mobile)</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                L'application mobile est l'interface vivante d'NB-MIND School, elle assure le lien constant entre l'école et la famille.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">👨‍👩‍👧 1. Profil Parent : Suivi Scolaire à Distance</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le parent dispose de sa propre session pour suivre un ou plusieurs enfants au sein de l'établissement scolaire.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🏠 1.1 Tableau de Bord Enfant</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Aperçu Actuel</strong> : Visualisation instantanée des dernières évaluations, de l'état d'assiduité et des événements à venir.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Changement d'enfant</strong> : Si un parent a plusieurs enfants (ex: un au Primaire, un au Collège), il peut basculer entre leurs profils via un menu intuitif sans se reconnecter.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📉 2. Résultats Académiques (Scores & Bulletins)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                C'est le module le plus consulté de l'application.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📊 2.1 Notes et Évaluations</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Historique des Notes</strong> : Liste des notes obtenues par matière, avec le coefficient associé.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Moyenne Provisoire</strong> : Calcul automatique de la moyenne trimestrielle actuelle basée sur les devoirs déjà saisis par les professeurs.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Appréciations</strong> : Lecture des commentaires des enseignants par évaluation.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📑 2.2 Téléchargement des Bulletins (Report Cards)</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Une fois validés par la Direction, les livrets scolaires (bulletins) sont disponibles au format PDF. Le parent peut les télécharger sur son téléphone ou les imprimer directement.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">⏱️ 3. Assiduité et Ponctualité (Attendance & Absences)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le parent est immédiatement informé du comportement scolaire de l'élève.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📝 3.1 Registre des Absences et Retards</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Détail du Jour et de l'Heure</strong> : Indication du cours précis où l'absence a été enregistrée.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Suivi du Statut</strong> : Le parent peut voir si l'absence a été transmise comme "justifiée" ou "non-justifiée" par le Secrétariat.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🎒 4. Profil Élève : Agenda et Devoirs (Homework)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                L'élève utilise l'application mobile pour son organisation personnelle.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🗓️ 4.1 Emploi du Temps et Salles</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Lien vers le Cours</strong> : Consultation quotidienne de l'emploi du temps avec indication de la salle et du professeur.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Gestion des Changements</strong> : En cas de changement de salle ou d'enseignant, l'application se met à jour en temps réel.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📒 4.2 Cahier de Texte et Travaux à rendre</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Détails des Devoirs</strong> : Liste des travaux à faire par matière avec les consignes détaillées laissées par le professeur.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Calendrier de Rendu</strong> : Alertes pour les dates limites de rendu de devoirs ou les évaluations à réviser.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">💰 5. Suivi Financier (Finances & Scolarité)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Le parent peut suivre l'état financier de son foyer avec l'école.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Détail des Frais</strong> : Liste des rubriques payées (Inscriptions, Tenues scolaires, Assurance, Mensualités).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Paiements à échoir</strong> : Notifications de rappels pour les mensualités à venir pour éviter les retards.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Reçus PDF</strong> : Téléchargement des reçus de paiement pour les besoins de preuve comptable.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">💬 6. Messagerie et Notifications (Messages)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Canal direct de communication.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Avis de l'École</strong> : Réception des notes d'information, circulaires et invitations aux réunions.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Échanges Enseignants/Parents</strong> : Messagerie sécurisée pour discuter du comportement ou de la scolarité de l'élève sans échanger de numéros personnels.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide Parent & Élève*
            </p>
        </div>
    );

    const render_troubleshooting = () => (
        <div className='animate-in fade-in transition-all duration-700'>
            <div className="mb-10 text-center">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 tracking-tight leading-tight py-2">🛠️ GUIDE FONCTIONNEL : Guide Technique & Maintenance</h1>
                <div className="h-2 w-32 bg-blue-600  mx-auto mt-6 mb-8"></div>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Ce manuel s'adresse aux référents informatiques et aux utilisateurs avancés de la solution NB-MIND School. Il détaille les bonnes pratiques pour le maintien de l'application.
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">💻 1. Installation et Mises à Jour (Setup)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                NB-MIND School est une solution hybride combinant Web, Desktop et Mobile.
            </p>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🌐 1.1 Accès Web</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">URL Officielle</strong> : Recommandé pour l'usage ponctuel ou les postes sans droits d'installation (Cybercafés, Bibliothèques).</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Navigateurs Supportés</strong> : Chrome, Firefox et Edge dans leurs versions les plus récentes.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🖥️ 1.2 Application Desktop (Recommandé)</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Windows / macOS / Linux</strong> : Téléchargement du binaire depuis le portail d'administration.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Mise à jour Automatique</strong> : L'application vérifie la présence d'une nouvelle version à chaque lancement pour assurer l'accès aux derniers correctifs de sécurité.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">📱 1.3 Application Mobile</h3>
            </div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Android (Play Store) & iOS (App Store)</strong> : L'application est nommée "NB-MIND School Mobile".</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Connexion au Code École</strong> : Lors de la première installation, le parent doit renseigner le code école (ex: ECOLE-001) avant ses identifiants personnels.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">🐛 2. Dépannage Courant (Troubleshooting)</h2>
            </div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">⚠️ 2.1 Problèmes de Lancement (Spécial Linux/Wayland)</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                Si l'application Desktop affiche un écran noir ou se ferme au démarrage sur Linux :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Cause Problématique</strong> : Incompatibilité du GPU avec les pilotes NVIDIA ou Wayland.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Solution Implémentée</strong> : Nous avons forcé le mode X11 et désactivé l'accélération matérielle nativement dans le script de démarrage `main.ts`.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Restauration Initiale</strong> : Si le problème persiste, vider le dossier de cache de l'utilisateur à l'adresse suivante : `~/.config/frontend-desktop/`.</span>
                    </div>
                </div>
            </motion.div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">🧹 2.2 Vidage du Cache et Réinitialisation</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                En cas d'affichage incohérent des données (données non à jour malgré la synchronisation) :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Déconnexion / Reconnexion</strong> : Force le rafraîchissement des jetons d'accès.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Nettoyage du Local Storage</strong> : Dans les options du navigateur (F12, Application puis Storage), vider les données de cache (LocalStorage/IndexDB). NB-MIND School utilise IndexDB pour la fluidité hors-ligne.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">💾 3. Sauvegardes et Sécurité (Backup)</h2>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                La sécurité des données est au cœur d'NB-MIND School.
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Stockage Cloud Sécurisé</strong> : Toutes les données de scolarité sont chiffrées sur nos serveurs.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Sauvegardes Quotidiennes</strong> : Une copie de sauvegarde de la base de données est effectuée toutes les 24 heures.</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Chiffrement des PDF</strong> : Les bulletins de notes et reçus générés sont marqués numériquement pour éviter les falsifications.</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <div className="mt-16 mb-8 relative">
                <div className="absolute -left-6 top-2 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 "></div>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-800 pl-4">📞 4. Support Technique NB-MIND School</h2>
            </div>
            <div className="mt-10 mb-6 flex items-center gap-4 bg-slate-50 p-4   ">
                <div className="w-10 h-10  bg-blue-100 flex items-center justify-center font-bold text-blue-700"><CheckCircle className="w-6 h-6" /></div>
                <h3 className="text-lg md:text-2xl font-bold text-blue-900">Comment signaler un bug ?</h3>
            </div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                1.  **Identification du Module** : Précisez sur quel écran le problème survient (ex: "Saisie des notes").
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                2.  **Capture d'Écran** : Fournir une image de l'erreur si un message rouge s'affiche.
            </p>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                3.  **Logs Techniques** : Pour les utilisateurs d'application Desktop, les erreurs sont enregistrées dans :
            </p>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Windows</strong> : `%APPDATA%/frontend-desktop/crash-log.txt`</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">Linux</strong> : `~/.config/frontend-desktop/crash-log.txt`</span>
                    </div>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="mb-4 pl-4 hover:pl-6 transition-all duration-300">
                <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 bg-white    shadow-sm hover:shadow-md hover: transition-all">
                    <div className="mt-1 shrink-0 w-6 h-6 md:w-8 md:h-8  bg-blue-50 flex items-center justify-center text-blue-500"><ArrowRight className="w-4 h-4" /></div>
                    <div className="text-sm md:text-lg text-slate-600 leading-relaxed font-medium">
                        <span>  <strong className="text-blue-800 font-extrabold">macOS</strong> : `~/Library/Application Support/frontend-desktop/crash-log.txt`</span>
                    </div>
                </div>
            </motion.div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12 hidden md:block"></div>
            <p className="text-sm md:text-xl text-slate-500 mb-8 leading-loose font-medium">
                *Fin du guide Technique & Maintenance*
            </p>
        </div>
    );


    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-32 overflow-x-hidden xl:overflow-x-visible">
            <header className="relative bg-[#0A192F] pt-32 pb-16 xl:pt-28 xl:pb-12 overflow-hidden shadow-2xl shrink-0">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/20  blur-[120px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-500/20  blur-[150px] mix-blend-screen animate-pulse"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-3 px-6 py-2  bg-blue-500/10   text-blue-300 font-semibold tracking-wide uppercase text-sm mb-6 backdrop-blur-sm shadow-lg">
                            <LifeBuoy className="w-5 h-5" />
                            <span>Centre de Support & Documentation Ultime</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                            Maîtrisez <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">NB-MIND School</span>
                        </h1>
                        <div className="relative max-w-2xl mx-auto mt-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500  blur opacity-25"></div>
                            <div className="relative flex items-center bg-[#112240]    shadow-2xl p-1.5">
                                <Search className="w-6 h-6 ml-4 text-blue-400" />
                                <input type="text" placeholder="Rechercher une fonctionnalité..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none text-white text-lg p-4 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
                <div className="flex flex-col xl:flex-row gap-8 pb-8 xl:pb-0">
                    <aside className="xl:w-1/3 2xl:w-[400px] shrink-0 sticky top-24 z-30 self-start max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                        <div className="bg-white/90 backdrop-blur-md shadow-xl p-3 md:p-6 shadow-blue-500/5">

                            {(() => {
                                const activeItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
                                const ActiveIcon = activeItem.icon;
                                return (
                                    <div className="xl:hidden relative z-50">
                                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full flex items-center justify-between bg-blue-50 p-4 border border-blue-100 shadow-sm font-bold text-blue-900">
                                            <div className="flex items-center gap-3">
                                                <ActiveIcon className="text-blue-600" size={20} />
                                                <div className="text-left">
                                                    <div className="text-sm">{activeItem.label}</div>
                                                    <div className="text-[10px] text-slate-500 font-normal">{activeItem.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`transition-transform duration-300 shrink-0 ${isMobileMenuOpen ? 'rotate-180' : ''}`} size={20} />
                                        </button>
                                        <AnimatePresence>
                                            {isMobileMenuOpen && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full mt-1 left-0 w-full bg-white shadow-2xl z-50 flex flex-col border border-slate-100 max-h-[60vh] overflow-y-auto">
                                                    {filteredMenuItems.map(item => (
                                                        <button key={item.id} onClick={() => { handleTabChange(item.id); setIsMobileMenuOpen(false); }} className={`flex items-start gap-3 p-4 text-left hover:bg-slate-50 transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 border-b border-slate-50 last:border-0'}`}>
                                                            <item.icon size={18} className={`mt-0.5 shrink-0 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                                            <div>
                                                                <div className="font-bold text-sm">{item.label}</div>
                                                                <div className="text-xs text-slate-400">{item.desc}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })()}

                            <nav className="hidden xl:flex flex-col gap-3">
                                {filteredMenuItems.length === 0 && (
                                    <div className="p-4 text-center text-slate-500 font-medium">Aucun résultat trouvé.</div>
                                )}
                                {filteredMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button key={item.id} onClick={() => handleTabChange(item.id)}
                                            className={`w-full group flex items-start gap-4 p-5 font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-700 bg-white hover:bg-slate-50'}`}>
                                            <Icon size={20} className={activeTab === item.id ? 'text-white' : 'text-blue-600'} />
                                            <div className="text-left flex-1 min-w-0">
                                                <div className="text-lg whitespace-normal">{item.label}</div>
                                                <div className={`text-xs ${activeTab === item.id ? 'text-blue-100' : 'text-slate-400'}`}>{item.desc}</div>
                                            </div>
                                            <ChevronRight size={18} className={activeTab === item.id ? 'text-white' : 'text-slate-300'} />
                                        </button>
                                    );
                                })}
                            </nav>

                        </div>
                    </aside>

                    <main className="flex-1 min-w-0 overflow-hidden break-words">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="bg-white shadow-2xl p-6 md:p-16 relative overflow-hidden">
                                <div className="space-y-4">
                                    {activeTab === 'getting-started' && render_getting_started()}
                                    {activeTab === 'pdg' && render_pdg()}
                                    {activeTab === 'direction' && render_direction()}
                                    {activeTab === 'secretariat' && render_secretariat()}
                                    {activeTab === 'teachers' && render_teachers()}
                                    {activeTab === 'parents' && render_parents()}
                                    {activeTab === 'troubleshooting' && render_troubleshooting()}

                                </div>
                                <div className="mt-32 pt-16 ]   text-center">
                                    <h2 className="text-4xl font-black text-slate-800 mb-6">FAQ & Support Technique</h2>
                                    <p className="text-sm md:text-xl text-slate-500 mb-10">Notre documentation couvre l'intégralité des flux de travail.</p>
                                    <div className="grid md:grid-cols-2 gap-8 text-left">
                                        <div className="bg-slate-50 p-6 ">
                                            <h4 className="font-bold mb-2">Comment synchroniser mes données ?</h4>
                                            <p className="text-slate-600">L'application se synchronise automatiquement. En cas de déconnexion, elle utilise IndexDB pour sauvegarder vos modifications localement.</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 ">
                                            <h4 className="font-bold mb-2">Support Linux / Wayland ?</h4>
                                            <p className="text-slate-600">Nous avons désactivé l'accélération matérielle et forcé le backend X11 pour garantir une stabilité maximale sur les distributions Linux modernes.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            <AnimatePresence>
                {showTopBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 hover:shadow-blue-500/50 transition-all group"
                        title="Remonter en haut"
                    >
                        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Support;
