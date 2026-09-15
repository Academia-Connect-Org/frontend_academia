import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, BookOpen, UserPlus, MessageSquare, CreditCard, ShieldCheck,
    ChevronRight, ChevronDown, PlayCircle, CheckCircle, ArrowRight, ArrowUp, Briefcase, Building,
    FileText, GraduationCap, Users, Wrench, AlertTriangle, LifeBuoy, PhoneCall,
    Mail, Globe, FileSpreadsheet, FileCode2, Database, Cloud, Server, Smartphone,
    Monitor, Coffee, Sparkles, ExternalLink, HelpCircle, Check, Compass, Sliders,
    Calendar, Award, Lock, FileCheck, Layers, Send, Download, Paperclip, Bell, RefreshCw
} from 'lucide-react';

const Support: React.FC = () => {
    const [activeTab, setActiveTab] = useState('getting-started');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTopBtn, setShowTopBtn] = useState(false);
    const mainRef = useRef<HTMLElement>(null);

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
        if (mainRef.current) {
            const yOffset = -100;
            const y = mainRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleTabChange = (id: string) => {
        setActiveTab(id);
        scrollToTop();
    };

    const menuItems = [
        { id: 'getting-started', label: 'Vue d\'Ensemble & Navigation', icon: Compass, desc: "Portail complet des procédures opérationnelles" },
        { id: 'pdg', label: 'Procédures PDG & Fondateur', icon: Briefcase, desc: "Multi-écoles, statistiques globales, trésorerie & licences" },
        { id: 'direction', label: 'Procédures Direction & Provisorat', icon: Building, desc: "Cycles, classes, emplois du temps, bulletins & clôture" },
        { id: 'secretariat', label: 'Procédures Secrétariat & Admissions', icon: FileText, desc: "Inscriptions (solo/CSV), reçus PDF, certificats & assiduité" },
        { id: 'teachers', label: 'Procédures Enseignant', icon: GraduationCap, desc: "Appel numérique, cahier de texte, devoirs & carnet de notes" },
        { id: 'parents', label: 'Procédures Parents & Élèves', icon: Users, desc: "Suivi des notes, bulletins PDF, devoirs & messagerie" },
        { id: 'troubleshooting', label: 'Maintenance & Guide Technique', icon: Wrench, desc: "Crash Linux/Wayland, purge du cache IndexDB & logs" }
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Component for Actionable Procedure Card
    const ProcedureGuide: React.FC<{
        id?: string;
        title: string;
        subtitle?: string;
        badge?: string;
        steps: Array<{ title: string; action: string; note?: string }>;
        tip?: string;
        warning?: string;
    }> = ({ id, title, subtitle, badge, steps, tip, warning }) => (
        <div id={id} className="mb-8 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700/70 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0">
                        <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h3>
                </div>
                {badge && (
                    <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-lg">
                        {badge}
                    </span>
                )}
            </div>

            {subtitle && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed font-medium">
                    {subtitle}
                </p>
            )}

            {/* Step-by-step Procedures List */}
            <div className="space-y-3 my-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 p-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                        </span>
                        <div className="text-xs sm:text-sm leading-relaxed flex-1">
                            <strong className="font-bold text-slate-900 dark:text-white">{step.title} : </strong>
                            <span className="text-slate-700 dark:text-slate-300">{step.action}</span>
                            {step.note && (
                                <span className="block text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                    💡 Remarque : {step.note}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Optional Tip Callout */}
            {tip && (
                <div className="mt-4 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Conseil pratique :</strong> {tip}</span>
                </div>
            )}

            {/* Optional Warning Callout */}
            {warning && (
                <div className="mt-4 p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Attention :</strong> {warning}</span>
                </div>
            )}
        </div>
    );

    // Section Title Banner
    const SectionHeader: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
        <div className="pb-5 mb-6 border-b border-slate-200/80 dark:border-slate-800">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                {desc}
            </p>
        </div>
    );

    const render_getting_started = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <div className="text-center max-w-3xl mx-auto pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200/60 dark:border-blue-800/60 mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Guide Intégral des Procédures Opérationnelles 2026
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Manuel d'Action Academia Connect
                </h1>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Ce centre de support rassemble les <strong>directives pas-à-pas et procédures d'exécution</strong> dérivées directement des fonctionnalités du système. Choisissez un profil ci-dessous pour accéder au guide pratique correspondant.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => handleTabChange('pdg')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Procédures PDG & Fondateur</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Créer et administrer les écoles, piloter la trésorerie globale et renouveler l'abonnement du groupe.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 4 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button
                    onClick={() => handleTabChange('direction')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Building className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Procédures Direction & Provisorat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configurer la structure pédagogique, valider l'emploi du temps, verrouiller les notes & clôturer l'année.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 5 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button
                    onClick={() => handleTabChange('secretariat')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Procédures Secrétariat & Admission</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Inscription d'un élève (solo/CSV), émission des reçus de paiement et des certificats de scolarité PDF.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 4 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button
                    onClick={() => handleTabChange('teachers')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Procédures Enseignant</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Faire l'appel numérique, tenir le cahier de texte, publier des devoirs et saisir les évaluations.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 4 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button
                    onClick={() => handleTabChange('parents')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Procédures Parents & Élèves</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consulter le bulletin en ligne, suivre l'emploi du temps, remettre des devoirs & utiliser la messagerie.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 5 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button
                    onClick={() => handleTabChange('troubleshooting')}
                    className="p-5 bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700 hover:border-blue-500 text-left transition-all group shadow-xs hover:shadow-md"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Maintenance & Dépannage Technique</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Régler un écran noir Linux/Wayland, réinitialiser le cache IndexDB et localiser le fichier crash-log.txt.</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 mt-3">Voir les 3 procédures <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>
            </div>
        </div>
    );

    const render_pdg = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Espace PDG (Fondateur Multi-Écoles)"
                desc="Manuels d'action détaillés pour chacune des fonctionnalités accessibles au PDG, incluant la création et la gestion post-création d'un établissement (responsables & abonnements)."
            />

            {/* 1. Tableau de bord */}
            <ProcedureGuide
                title="1. Tableau de Bord PDG (/dashboard/pdg)"
                subtitle="Directive de consultation rapide des KPIs vitaux et des alerte du groupe scolaire."
                badge="Vue Synthétique"
                steps={[
                    { title: "Consulter les KPIs en temps réel", action: "Observez la Moyenne Générale du groupe, la Meilleure Moyenne et le Taux de Réussite Global." },
                    { title: "Examiner la courbe de croissance du réseau", action: "Analysez le graphique interactif 'Croissance du Réseau' par mois ou par année pour suivre l'évolution des effectifs." },
                    { title: "Surveiller les Alertes Critiques", action: "Consultez le panneau d'alertes pour repérer immédiatement les écoles à taux d'absence élevé ou avec des baisses de moyenne." }
                ]}
            />

            {/* 2. Statistiques Globales */}
            <ProcedureGuide
                title="2. Statistiques Globales (/dashboard/pdg/stats)"
                subtitle="Directive d'analyse comparative de la performance pédagogique inter-établissements."
                badge="Audit Pédagogique"
                steps={[
                    { title: "Filtrer par Établissement ou Période", action: "Sélectionnez un établissement spécifique ou conservez la vue consolidée du groupe." },
                    { title: "Analyser la répartition des notes", action: "Consultez le diagramme des mentions (Très Bien, Bien, Passable, Échec) basé sur les évaluations enregistrées." },
                    { title: "Comparer l'évolution par trimestre", action: "Examinez la courbe d'évolution des moyennes pour évaluer la progression pédagogique trimestre par trimestre." }
                ]}
            />

            {/* 3. Établissements - Création */}
            <ProcedureGuide
                title="3a. Création d'un Établissement (/dashboard/pdg/schools)"
                subtitle="Procédure complète pour déclarer et créer une nouvelle école physique ou administrative dans le réseau."
                badge="Création École"
                steps={[
                    { title: "Accéder au module Établissements", action: "Cliquez sur 'Établissements' dans la barre latérale gauche." },
                    { title: "Lancer le formulaire d'ajout", action: "Cliquez sur le bouton bleu 'Ajouter une École' situé en haut à droite." },
                    { title: "Renseigner l'identité officielle", action: "Saisissez le Nom Officiel (ex: Complexe Scolaire Academia Nord) et le Type (Primaire, Secondaire, ou Mixte)." },
                    { title: "Définir les coordonnées", action: "Renseignez l'adresse physique, l'email officiel du secrétariat et le téléphone." },
                    { title: "Téléverser le logo officiel", action: "Importez le fichier image du logo (PNG/JPG).", note: "Ce logo sera utilisé sur les entêtes de bulletins et reçus générés par l'école." },
                    { title: "Valider la création", action: "Cliquez sur 'Enregistrer l'établissement' pour finaliser la création." }
                ]}
                tip="Une fois créée, l'école apparaît dans le réseau du groupe et dans le sélecteur d'établissement."
            />

            {/* 3b. Établissements - Gestion & Administration */}
            <ProcedureGuide
                title="3b. Administration & Gestion d'un Établissement (/dashboard/pdg/schools/:id)"
                subtitle="Procédure d'affectation des responsables (Direction/Secrétariat), de suivi de l'abonnement et de la licence de l'école."
                badge="Administration École"
                steps={[
                    { title: "Ouvrir la fiche de l'établissement", action: "Dans la liste des établissements (/dashboard/pdg/schools), cliquez sur gérer de la carte de l'école pour accéder à son tableau de bord d'administration." },
                    { title: "Nomination des Responsables (Onglet 'Équipe')", action: "Allez dans l'onglet 'Équipe' et cliquez sur 'Ajouter un membre du staff'. Saisissez le Prénom, Nom, Email professionnel, Téléphone et sélectionnez le rôle administratif : Direction, Provisorat ou Secrétariat. Attribuez un mot de passe temporaire pour leur première connexion." },
                    { title: "Gestion des Accès du Personnel", action: "Éditez à tout moment les profils des responsables ou révoquez l'accès d'un compte en cas de changement de personnel dans l'établissement." },
                    { title: "Gestion de l'Abonnement de l'Établissement (Onglet 'Abonnement')", action: "Accédez à l'onglet 'Abonnement' pour visualiser le forfait actif de l'école (Formule Mensuelle, Annuelle ou Premium), la date de fin de validité de la licence et le quota d'élèves/classes autorisés." },
                    { title: "Renouvellement & Modification d'Abonnement", action: "Cliquez sur 'Renouveler' ou 'Changer de formule' pour étendre la souscription de l'établissement et débloquer des fonctionnalités supérieures." },
                    { title: "Supervision Pédagogique & Grilles Tarifaires (Onglets 'Cycles' & 'Finances')", action: "Supervisez directement la structure des cycles pédagogiques et les plans tarifaires (droits d'inscription et de scolarité) rattachés à cette école." }
                ]}
                tip="Chaque école possède son propre compte d'abonnement et ses propres responsables désignés par le PDG. Le Directeur ou Secrétaire ainsi nommé pourra immédiatement se connecter avec les identifiants créés."
            />

            {/* 4. Finances & Analyses */}
            <ProcedureGuide
                title="4. Finances & Analyses (/dashboard/pdg/finances)"
                subtitle="Directive de pilotage financier global, trésorerie et détection des impayés."
                badge="Pilotage Financier"
                steps={[
                    { title: "Consulter la Trésorerie globale", action: "Examinez le montant total des frais d'inscription et des scolarités mensuelles encassées." },
                    { title: "Évaluer le Taux de Recouvrement", action: "Comparez les montants facturés aux montants réellement perçus." },
                    { title: "Cibler les impayés par établissement", action: "Filtrez par école et par classe pour identifier les retards de paiement et ordonner des relances." }
                ]}
            />

            {/* 5. Élèves & Effectifs */}
            <ProcedureGuide
                title="5. Élèves & Effectifs (/dashboard/pdg/students)"
                subtitle="Procédure de suivi du registre centralisé des élèves du groupe."
                badge="Registre Élèves"
                steps={[
                    { title: "Consulter l'effectif global", action: "Visualisez la liste exhaustive des élèves inscrits dans l'ensemble des établissements." },
                    { title: "Rechercher par matricule ou nom", action: "Saisissez le nom ou matricule (ex: 2026-001-A) dans la barre de recherche." },
                    { title: "Vérifier les dossiers administratifs", action: "Ouvrez la fiche élève pour contrôler le statut de paiement et les coordonnées des parents." }
                ]}
            />

            {/* 6. Enseignants */}
            <ProcedureGuide
                title="6. Enseignants (/dashboard/pdg/teachers)"
                subtitle="Directive de contrôle du corps professoral et des affectations du groupe."
                badge="Corps Professoral"
                steps={[
                    { title: "Consulter l'annuaire des professeurs", action: "Accédez à la liste des enseignants exerçant dans le groupe scolaire." },
                    { title: "Vérifier les affectations et matières", action: "Contrôlez les écoles, classes et matières attribuées à chaque enseignant." },
                    { title: "Vérifier le volume horaire", action: "Assurez-vous de l'équilibre des charges de travail entre les enseignants." }
                ]}
            />

            {/* 7. Assiduité Globale */}
            <ProcedureGuide
                title="7. Assiduité Globale (/dashboard/pdg/attendance)"
                subtitle="Directive de surveillance du taux de présence à l'échelle du groupe."
                badge="Surveillance Assiduité"
                steps={[
                    { title: "Consulter le taux de présence hebdomadaire", action: "Examinez le graphique d'assiduité globale actualisé quotidiennement." },
                    { title: "Repérer les anomalies d'absences", action: "Détectez les établissements ou niveaux ayant un taux d'absence anormalement élevé." }
                ]}
            />

            {/* 8. Années Scolaires */}
            <ProcedureGuide
                title="8. Années Scolaires (/dashboard/pdg/academic-years)"
                subtitle="Procédure de suivi des calendriers académiques et périodes de clôture."
                badge="Calendrier Académique"
                steps={[
                    { title: "Consulter l'année scolaire active", action: "Vérifiez les dates de début et de fin de l'année scolaire en cours (ex: 2025-2026)." },
                    { title: "Suivre le découpage des trimestres", action: "Contrôlez l'état des trimestres (En cours, Verrouillé, Clôturé)." }
                ]}
            />

            {/* 9. Annonce */}
            <ProcedureGuide
                title="9. Annonce (/dashboard/pdg/announcements)"
                subtitle="Procédure de rédaction et de diffusion de circulaires et notes officielles."
                badge="Circulaires Officieuses"
                steps={[
                    { title: "Créer une nouvelle circulaire", action: "Cliquez sur 'Nouvelle Annonce' et rédigez le titre et le corps de la note." },
                    { title: "Joindre des documents officiels", action: "Téléversez des fichiers PDF (ex: règlement intérieur, calendrier des vacances)." },
                    { title: "Définir la cible de diffusion", action: "Choisissez si la note s'adresse à tout le groupe, uniquement aux Directeurs, ou aux Enseignants." },
                    { title: "Diffuser", action: "Cliquez sur 'Publier'. Une notification push est transmise instantanément aux destinataires." }
                ]}
            />

            {/* 10. Messagerie */}
            <ProcedureGuide
                title="10. Messagerie (/dashboard/pdg/messages)"
                subtitle="Procédure de communication sécurisée directe avec les directeurs d'écoles et le personnel."
                badge="Messagerie Sécurisée"
                steps={[
                    { title: "Accéder à la messagerie", action: "Cliquez sur 'Messagerie' pour ouvrir le centre d'échange instantané." },
                    { title: "Sélectionner un interlocuteur", action: "Sélectionnez un directeur d'école ou membre du personnel administratif dans la liste." },
                    { title: "Envoyer un message ou document", action: "Rédigez votre message et joignez d'éventuels fichiers sans échanger vos coordonnées personnelles." }
                ]}
            />

            {/* 11. Paramètres */}
            <ProcedureGuide
                title="11. Paramètres (/dashboard/pdg/settings)"
                subtitle="Procédure de gestion du profil, de l'abonnement du groupe et de la sécurité."
                badge="Paramètres & Licences"
                steps={[
                    { title: "Onglet Profil & Identité (?tab=profile)", action: "Mettez à jour votre nom, photo de profil, adresse email et coordonnées personnelles." },
                    { title: "Onglet Mon Abonnement (?tab=subscription)", action: "Consultez l'état de la licence d'utilisation du groupe et lancez le renouvellement de votre formule." },
                    { title: "Onglet Sécurité & Accès (?tab=security)", action: "Modifiez votre mot de passe et activez la double authentification pour protéger le compte PDG." }
                ]}
            />
        </div>
    );

    const render_direction = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Espace Direction & Provisorat"
                desc="Manuels d'action détaillés pour chacune des 15 fonctionnalités de la barre latérale (Sidebar) de la Direction."
            />

            <ProcedureGuide
                title="1. Vue d'ensemble (/dashboard/direction)"
                subtitle="Directive de contrôle quotidien des KPIs de l'établissement."
                badge="Tableau de Bord"
                steps={[
                    { title: "Consulter la synthèse de l'établissement", action: "Observez le nombre total d'élèves inscrits, le nombre d'enseignants actifs et le taux de présence du jour." },
                    { title: "Surveiller les alertes de scolarité", action: "Consultez les notifications prioritaires (classes sans emploi du temps, absences d'enseignants, impayés)." }
                ]}
            />

            <ProcedureGuide
                title="2. Gestion Cycles (/dashboard/direction/cycles)"
                subtitle="Procédure de structuration des grands ensembles pédagogiques."
                badge="Cycles Pédagogiques"
                steps={[
                    { title: "Créer un nouveau cycle", action: "Cliquez sur 'Nouveau Cycle' et saisissez l'intitulé (ex: Premier Cycle, Second Cycle Général, Cycle Technique)." },
                    { title: "Définir les niveaux rattachés", action: "Associez les niveaux de classes correspondant à chaque cycle." }
                ]}
            />

            <ProcedureGuide
                title="3. Frais de scolarité & Grilles Tarifaires (/dashboard/direction/fees)"
                subtitle="Procédure de paramétrage des grilles tarifaires, rubriques de scolarité et ciblage des droits d'inscription ou ré-inscription."
                badge="Grille Tarifaire & Plans"
                steps={[
                    { title: "Définir les rubriques tarifaires", action: "Créer les types de frais (Inscription, Ré-inscription, Mensualité de scolarité, Tenue scolaire, Cantine, Assurance)." },
                    { title: "Créer ou Éditer un Plan de Paiement", action: "Cliquez sur 'Créer un plan' et saisissez le Nom du plan, la Description et le Montant Total." },
                    { title: "Sélectionner la Catégorie d'Élève ciblée", action: "Dans le champ 'Catégorie d'élève', choisissez la cible du tarif : 'Tous les élèves' (Nouveaux & Anciens), 'Nouveaux élèves uniquement' (Droit d'Inscription initiale), ou 'Anciens élèves uniquement' (Droit de Ré-inscription annuelle)." },
                    { title: "Définir le Périmètre (Classe ou Cycle)", action: "Choisissez d'appliquer le plan à une Classe spécifique ou à l'ensemble d'un Cycle pédagogique." },
                    { title: "Configurer l'Échéancier des Versements", action: "Ajoutez les lignes de frais avec leurs montants respectifs, date de début et date d'exigibilité." }
                ]}
                tip="Pour différencier les tarifs entre une première admission (Inscription) et la réadmission d'un élève existant (Ré-inscription), configurez deux plans distincts en sélectionnant la catégorie 'Nouveaux élèves uniquement' pour les frais d'inscription et 'Anciens élèves uniquement' pour les frais de ré-inscription."
            />

            <ProcedureGuide
                title="4. Gestion des Classes (/dashboard/direction/classes)"
                subtitle="Procédure de création des classes et nomination du Professeur Principal."
                badge="Gestion Classes"
                steps={[
                    { title: "Ajouter une nouvelle classe", action: "Cliquez sur 'Ajouter une Classe' et renseignez le nom (ex: 6ème A, Tle D)." },
                    { title: "Nommer le Professeur Principal", action: "Sélectionnez l'enseignant responsable dans la liste déroulante." },
                    { title: "Fixer la capacité maximale", action: "Renseignez le nombre maximal d'élèves autorisés par classe." }
                ]}
            />

            <ProcedureGuide
                title="5. Gestion des Matières (/dashboard/direction/subjects)"
                subtitle="Procédure de configuration de la grille des cours et coefficients."
                badge="Programme & Coefficients"
                steps={[
                    { title: "Enregistrer une matière", action: "Saisissez le nom de la matière (ex: Mathématiques, Physique-Chimie, Histoire-Géo)." },
                    { title: "Fixer les coefficients officiels", action: "Attribuez le coefficient par série ou niveau (ex: Coeff 5 en Tle C, Coeff 2 en 6ème)." }
                ]}
            />

            <ProcedureGuide
                title="6. Liste Enseignants (/dashboard/direction/teachers)"
                subtitle="Procédure d'administration du corps professoral."
                badge="Gestion Professeurs"
                steps={[
                    { title: "Créer un profil Enseignant", action: "Renseignez l'état civil, le diplôme et l'adresse email de l'enseignant." },
                    { title: "Attribuer les matières et classes", action: "Cochez les matières enseignées et les classes attribuées à chaque professeur." }
                ]}
            />

            <ProcedureGuide
                title="7. Gestion Élève (/dashboard/direction/students)"
                subtitle="Directive de consultation du fichier central des élèves de l'école."
                badge="Fichier Élèves"
                steps={[
                    { title: "Rechercher une fiche élève", action: "Accédez au registre pour consulter le dossier académique, les sanctions ou encouragements." },
                    { title: "Changer la classe d'un élève", action: "Effectuez une réaffectation administrative en cas de changement de filière." }
                ]}
            />

            <ProcedureGuide
                title="8. Gestion des Présences (/dashboard/direction/attendance)"
                subtitle="Directive de contrôle global de l'assiduité de l'établissement."
                badge="Présences & Discipline"
                steps={[
                    { title: "Consulter la synthèse journalière", action: "Visualisez l'état des appels effectués par les professeurs à chaque heure." },
                    { title: "Relancer les appels manquants", action: "Repérer les cours où l'appel numérique n'a pas été validé et notifier l'enseignant." }
                ]}
            />

            <ProcedureGuide
                title="9. Finances & Analyses (/dashboard/direction/finances)"
                subtitle="Directive de contrôle des encaissements de l'établissement."
                badge="Analyse Financière"
                steps={[
                    { title: "Analyser le rapport d'encaissement", action: "Consultez la somme des versements effectués au guichet du secrétariat." },
                    { title: "Suivre le taux d'impayés", action: "Identifier les classes accusant un retard de paiement important." }
                ]}
            />

            <ProcedureGuide
                title="10. Emploi du temps (/dashboard/direction/schedule)"
                subtitle="Procédure de planification des horaires de cours sans conflits."
                badge="Concepteur d'Horaires"
                steps={[
                    { title: "Positionner les créneaux horaires", action: "Glissez-déposez les cours sur la grille hebdomadaire." },
                    { title: "Résoudre les alerte de conflits", action: "Corrigez l'affectation si une salle ou un professeur est sélectionné deux fois simultanément." },
                    { title: "Publier", action: "Validez la publication pour rendre l'emploi du temps visible chez les profs, élèves et parents." }
                ]}
            />

            <ProcedureGuide
                title="11. Gestion des Salles (/dashboard/direction/rooms)"
                subtitle="Procédure de déclaration du parc de salles et laboratoires."
                badge="Gestion Salles"
                steps={[
                    { title: "Créer une salle", action: "Saisissez le nom/numéro de la salle (ex: Salle 102, Labo de Chimie)." },
                    { title: "Renseigner la capacité et équipements", action: "Indiquez le nombre de places et les équipements présents (Vidéoprojecteur, Ordinateurs)." }
                ]}
            />

            <ProcedureGuide
                title="12. Messagerie (/dashboard/direction/messages)"
                subtitle="Procédure de communication sécurisée avec l'écosystème scolaire."
                badge="Messagerie Institutionnelle"
                steps={[
                    { title: "Accéder à la boîte de réception", action: "Échangez en direct avec le PDG, les enseignants, le secrétariat ou les parents." }
                ]}
            />

            <ProcedureGuide
                title="13. Annonce (/dashboard/direction/announcements)"
                subtitle="Procédure de rédaction et de diffusion de notes d'information officielles."
                badge="Circulaires École"
                steps={[
                    { title: "Créer une annonce d'établissement", action: "Rédigez la note d'information, joignez d'éventuels fichiers PDF et choisissez le public ciblé." }
                ]}
            />

            <ProcedureGuide
                title="14. Gestion des Bulletins (/dashboard/direction/report-cards)"
                subtitle="Procédure de verrouillage des notes, calcul des moyennes et génération des bulletins PDF."
                badge="Génération Bulletins"
                steps={[
                    { title: "Verrouiller la saisie", action: "Clôturez la période de saisie à la fin du trimestre." },
                    { title: "Calculer les moyennes et rangs", action: "Exécutez le moteur de calcul automatisé de l'établissement." },
                    { title: "Générer et archiver les PDF", action: "Produisez les bulletins PDF officiels avec signature numérique et entête." }
                ]}
            />

            <ProcedureGuide
                title="15. Années Scolaires (/dashboard/direction/academic-years)"
                subtitle="Procédure de gestion des trimestres et de passage d'année."
                badge="Gestion Année"
                steps={[
                    { title: "Définir l'année académique active", action: "Configurer les dates de rentrée et de clôture." },
                    { title: "Assistant de fin d'année", action: "Exécuter le passage de classe massif des admis et le transfert des archives." }
                ]}
            />
        </div>
    );

    const render_secretariat = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Secrétariat & Admissions"
                desc="Manuels d'action détaillés pour chacune des 16 fonctionnalités accessibles dans le menu latéral (Sidebar) du Secrétariat."
            />

            {/* 1. Tableau de bord */}
            <ProcedureGuide
                title="1. Tableau de bord (/dashboard/secretariat)"
                subtitle="Directive de consultation de l'activité quotidienne du secrétariat."
                badge="Guichet & Admissions"
                steps={[
                    { title: "Consulter la synthèse des admissions", action: "Observez le nombre de nouvelles inscriptions du jour et les dossiers en attente de validation." },
                    { title: "Suivre la caisse du jour", action: "Vérifiez le total des frais d'inscription et scolarités encaissés au guichet." },
                    { title: "Alerte absences", action: "Consultez les signalements d'absences non justifiées transmises par les professeurs." }
                ]}
            />

            {/* 2. Gestion Cycles */}
            <ProcedureGuide
                title="2. Gestion Cycles (/dashboard/secretariat/cycles)"
                subtitle="Procédure de consultation de la structure des cycles pour l'orientation des inscriptions."
                badge="Cycles Pédagogiques"
                steps={[
                    { title: "Consulter les cycles disponibles", action: "Vérifiez les niveaux d'études ouverts aux nouvelles inscriptions (Primaire, Collège, Lycée)." }
                ]}
            />

            {/* 3. Frais de scolarité */}
            <ProcedureGuide
                title="3. Frais de scolarité (/dashboard/secretariat/fees)"
                subtitle="Directive d'information et d'encaissement des grilles tarifaires au guichet (Nouveaux & Anciens élèves)."
                badge="Information Familles"
                steps={[
                    { title: "Consulter le barème des frais", action: "Vérifiez les montants dus par classe et par statut d'élève : Frais d'Inscription (Nouveaux élèves), Frais de Ré-inscription (Anciens élèves), mensualités de scolarité, tenues et cantine." },
                    { title: "Renseigner les parents", action: "Communiquer le barème exact et le calendrier des échéances aux familles en fonction de la situation de l'élève (nouvel inscrit ou ré-inscrit)." }
                ]}
            />

            {/* 4. Gestion des Classes */}
            <ProcedureGuide
                title="4. Gestion des Classes (/dashboard/secretariat/classes)"
                subtitle="Directive de contrôle des effectifs et places disponibles par classe."
                badge="Capacité & Effectifs"
                steps={[
                    { title: "Vérifier la disponibilité des places", action: "Avant d'inscrire un élève, vérifiez que la classe souhaitée n'a pas atteint son effectif maximal." }
                ]}
            />

            {/* 5. Gestion des Matières */}
            <ProcedureGuide
                title="5. Gestion des Matières (/dashboard/secretariat/subjects)"
                subtitle="Consultation du programme des cours pour la constitution des fiches pédagogiques."
                badge="Programme d'Études"
                steps={[
                    { title: "Consulter la liste des matières", action: "Accédez au programme pour vérifier les matières enseignées par section." }
                ]}
            />

            {/* 6. Personnel / Enseignants */}
            <ProcedureGuide
                title="6. Personnel / Enseignants (/dashboard/secretariat/teachers)"
                subtitle="Directive d'utilisation de l'annuaire interne de l'établissement."
                badge="Annuaire Interne"
                steps={[
                    { title: "Consulter les coordonnées des enseignants", action: "Retrouver le numéro professionnel ou l'email d'un professeur en cas de besoin." },
                    { title: "Contacter un membre du staff", action: "Faciliter la prise de contact pour les urgences d'élèves ou remplaçants." }
                ]}
            />

            {/* 7. Inscriptions */}
            <ProcedureGuide
                title="7. Inscriptions & Admissions (/dashboard/secretariat/enroll)"
                subtitle="Procédure complète pour inviter un parent, valider les paiements cash en attente, inscrire un élève en direct ou ajouter un enseignant."
                badge="Admissions & Matrice"
                steps={[
                    { title: "Option A : Inviter un parent (WhatsApp / Email)", action: "Sélectionnez l'onglet 'Inviter un parent'. Saisissez son Prénom, Nom et Numéro WhatsApp (ou Email). Le système génère un lien personnalisé contenant le lien d'installation de l'application mobile et le Code d'Établissement unique (ex: ACXXXXX). Le parent télécharge l'application, s'inscrit et procède à la pré-inscription de son enfant." },
                    { title: "Option B : Valider les inscriptions & ré-inscriptions en attente de paiement (Paiement Cash)", action: "Cliquez sur l'onglet 'Inscriptions en attente' pour voir les demandes soumises par les parents (statut PENDING_FEE). Lorsqu'un parent se présente au guichet, cliquez sur 'Valider' à côté du nom de l'enfant, enregistrez le versement en espèces (Cash) des droits d'inscription (nouveaux élèves) ou de ré-inscription (anciens élèves). La validation active définitivement l'élève et génère le Reçu de Paiement PDF officiel." },
                    { title: "Option C : Inscription Directe de l'élève au guichet", action: "Si le parent n'a pas de smartphone, cliquez sur 'Inscription Directe'. Saisissez l'état civil complet de l'élève, la classe affectée et les coordonnées d'au moins un parent. Le système génère instantanément le matricule unique (ex: 2026-001-A) et les identifiants d'accès." },
                    { title: "Option D : Inscription d'un Nouvel Enseignant", action: "Sélectionnez l'onglet 'Nouvel Enseignant'. Saisissez son Prénom, Nom, Email institutionnel, Téléphone professionnel, Genre, les Cycles d'intervention (ex: Premier/Second Cycle), les Spécialités/Matières enseignées et attribuez un Mot de passe temporaire. Dès validation, un email d'activation d'accès lui est automatiquement adressé." }
                ]}
                tip="Pour les invitations WhatsApp, cliquez sur 'Générer l'invitation WhatsApp' puis sur 'WhatsApp' pour ouvrir la discussion pré-remplie directement."
                warning="Une pré-inscription reste bloquée au statut 'PENDING_FEE' jusqu'à ce que le secrétariat valide l'encaissement des frais d'inscription en espèces (Cash) ou mobile money."
            />

            {/* 8. Dossiers Élèves */}
            <ProcedureGuide
                title="8. Dossiers Élèves (/dashboard/secretariat/students)"
                subtitle="Procédure de délivrance de certificats de scolarité et de badges élèves."
                badge="Gestion des Dossiers"
                steps={[
                    { title: "Rechercher un dossier élève", action: "Recherchez par nom ou matricule dans le registre centralisé." },
                    { title: "Imprimer le Certificat de Scolarité", action: "Cliquez sur 'Générer Certificat' pour produire le PDF officiel avec le sceau de l'école." },
                    { title: "Émettre le Badge / Carte Éléve", action: "Imprimez le badge avec le QR Code d'identification pour le contrôle d'accès." }
                ]}
            />

            {/* 9. Présences */}
            <ProcedureGuide
                title="9. Présences (/dashboard/secretariat/attendance)"
                subtitle="Procédure de suivi des absences signalées et enregistrement des justificatifs."
                badge="Contrôle des Absences"
                steps={[
                    { title: "Consulter les absences du jour", action: "Examinez les signalements transmis par les enseignants lors des appels." },
                    { title: "Contacter les familles", action: "Passez un appel téléphonique aux parents d'élèves absents sans motif." },
                    { title: "Saisir le justificatif", action: "Enregistrer le certificat médical ou motif valable pour passer le statut de l'absence en 'Justifiée'." }
                ]}
            />

            {/* 10. Finances & Analyses */}
            <ProcedureGuide
                title="10. Finances & Analyses (/dashboard/secretariat/finances)"
                subtitle="Procédure d'encaissement des versements au guichet et émission des reçus PDF."
                badge="Guichet Encaissement"
                steps={[
                    { title: "Sélectionner l'élève débiteur", action: "Recherchez l'élève et ouvrez sa fiche financière." },
                    { title: "Sélectionner le type de frais", action: "Cochez la rubrique concernée (Inscription, Mensualité N°, Tenue)." },
                    { title: "Enregistrer le paiement", action: "Saisissez le montant et le mode (Espèces, Chèque, Mobile Money)." },
                    { title: "Imprimer le Reçu PDF", action: "Le reçu officiel est généré avec numéro d'enregistrement et entête. Remettez un exemplaire au parent." }
                ]}
            />

            {/* 11. Emploi du temps */}
            <ProcedureGuide
                title="11. Emploi du temps (/dashboard/secretariat/schedule)"
                subtitle="Consultation de l'agenda des cours pour l'orientation et l'information."
                badge="Consultation Horaires"
                steps={[
                    { title: "Rechercher la salle ou le cours", action: "Consultez l'emploi du temps pour localiser un élève ou transmettre un message en classe." }
                ]}
            />

            {/* 12. Gestion des Salles */}
            <ProcedureGuide
                title="12. Gestion des Salles (/dashboard/secretariat/rooms)"
                subtitle="Consultation de l'affectation des salles pour l'accueil des visiteurs."
                badge="Occupation Salles"
                steps={[
                    { title: "Vérifier la salle disponible", action: "Consulter la disponibilité des salles pour les entretiens de réinscription ou examens." }
                ]}
            />

            {/* 13. Gestion des Bulletins */}
            <ProcedureGuide
                title="13. Gestion des Bulletins (/dashboard/secretariat/report-cards)"
                subtitle="Procédure d'impression et de distribution des bulletins de notes."
                badge="Impression Bulletins"
                steps={[
                    { title: "Télécharger les bulletins validés", action: "Une fois le conseil de classe passé, accédez aux bulletins PDF validés par la Direction." },
                    { title: "Lancer l'impression en série", action: "Imprimez l'ensemble des bulletins de la classe pour la remise aux parents." }
                ]}
            />

            {/* 14. Années Scolaires */}
            <ProcedureGuide
                title="14. Années Scolaires (/dashboard/secretariat/academic-years)"
                subtitle="Directive de préparation de la campagne de réinscription."
                badge="Campagne Réinscription"
                steps={[
                    { title: "Consulter l'année active", action: "Vérifier les dates de l'année scolaire en cours et préparer les fiches de réinscription." }
                ]}
            />

            {/* 15. Annonce */}
            <ProcedureGuide
                title="15. Annonce (/dashboard/secretariat/announcements)"
                subtitle="Procédure de publication de notes de service du secrétariat."
                badge="Communication Guichet"
                steps={[
                    { title: "Rédiger un avis secrétariat", action: "Diffuser un appel à paiement, un rappel de délai ou des convocations aux parents." }
                ]}
            />

            {/* 16. Messagerie */}
            <ProcedureGuide
                title="16. Messagerie (/dashboard/secretariat/messages)"
                subtitle="Procédure d'échange en ligne sécurisé avec les parents et enseignants."
                badge="Messagerie Secrétariat"
                steps={[
                    { title: "Répondre aux sollicitations des parents", action: "Traiter les demandes d'informations ou de rendez-vous reçues en ligne." }
                ]}
            />
        </div>
    );

    const render_teachers = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Espace Enseignant"
                desc="Manuels d'action détaillés et directives pédagogiques pour chacune des 9 fonctionnalités du menu latéral (Sidebar) de l'Enseignant."
            />

            {/* 1. Tableau de bord */}
            <ProcedureGuide
                title="1. Tableau de Bord Enseignant (/dashboard/teacher)"
                subtitle="Directive de consultation rapide du planning quotidien et des alertes d'évaluation."
                badge="Vue Synthétique Professeur"
                steps={[
                    { title: "Consulter le cours actif / prochain cours", action: "Visualisez l'heure de cours à venir, le nom de la classe et la salle d'affectation." },
                    { title: "Statistiques & Devoirs à corriger", action: "Observez le nombre de devoirs remis en ligne en attente de correction et les dernières moyennes enregistrées." },
                    { title: "Accès rapide à l'Appel", action: "Cliquez sur le bouton du cours en cours pour lancer immédiatement l'appel numérique de l'heure." }
                ]}
            />

            {/* 2. Cahier de texte */}
            <ProcedureGuide
                title="2. Cahier de Texte (/dashboard/teacher/book)"
                subtitle="Procédure de tenue du cahier de texte numérique et de continuité pédagogique."
                badge="Cahier de Texte"
                steps={[
                    { title: "Sélectionner la classe et la séance", action: "Ouvrez le cahier de texte, choisissez la classe et la plage horaire effectuée." },
                    { title: "Rédiger le contenu du cours", action: "Saisissez le titre du chapitre, le résumé des notions enseignées et les exercices travaillés en classe." },
                    { title: "Joindre des supports de cours (PDF/Images)", action: "Cliquez sur 'Joindre un fichier' pour importer le cours au format PDF ou des fiches de révision." },
                    { title: "Programmer un devoir à la maison", action: "Cochez 'Assigner un devoir', saisissez la consigne et choisissez la date limite de rendu." },
                    { title: "Publier la séance", action: "Cliquez sur 'Valider'. La séance devient instantanément visible par la Direction, les élèves et les parents." }
                ]}
            />

            {/* 3. Gestion des Devoirs */}
            <ProcedureGuide
                title="3. Gestion des Devoirs (/dashboard/teacher/homework)"
                subtitle="Procédure de création, de suivi des remises et de correction des devoirs en ligne."
                badge="Devoirs & Corrections"
                steps={[
                    { title: "Créer un nouveau devoir", action: "Accédez à 'Devoirs', cliquez sur 'Ajouter un Devoir' et définissez la consigne, la classe et la date butoir." },
                    { title: "Suivre l'état des remises", action: "Consultez la liste des élèves ayant déposé leur travail en ligne vs les retardataires." },
                    { title: "Corriger et annoter les fichiers reçus", action: "Cliquez sur la copie numérique (PDF ou Photo) téléversée par l'élève, attribuez une note et saisissez un commentaire de correction." }
                ]}
            />

            {/* 4. Notes & Évaluation */}
            <ProcedureGuide
                title="4. Notes & Évaluation (/dashboard/teacher/grades)"
                subtitle="Procédure de création d'évaluations et de saisie rapide du carnet de notes."
                badge="Carnet de Notes"
                steps={[
                    { title: "Créer une nouvelle Évaluation", action: "Dans le carnet de notes, cliquez sur 'Nouvelle Évaluation' (ex: Interrogation Écrite n°2, TP de Chimie)." },
                    { title: "Configurer le barème et le coefficient", action: "Fixez la note maximale (ex: /20), le coefficient de l'épreuve (ex: Coeff 2) et le trimestre." },
                    { title: "Saisir les notes de classe", action: "Remplissez la grille de notation élève par élève. Utilisez la touche 'Entrée' pour passer à la ligne suivante." },
                    { title: "Valider et publier", action: "Cliquez sur 'Publier l'évaluation'. Les moyennes de classe sont recalculées et une notification est transmise aux parents." }
                ]}
            />

            {/* 5. Gestion des Bulletins */}
            <ProcedureGuide
                title="5. Gestion des Bulletins (/dashboard/teacher/report-cards)"
                subtitle="Procédure de saisie des appréciations pédagogiques trimestrielles."
                badge="Appréciations Trimestrielles"
                steps={[
                    { title: "Accéder au module Bulletins", action: "Sélectionnez votre classe et votre matière pour afficher le tableau des bulletins trimestriels." },
                    { title: "Rédiger les appréciations individuelles", action: "Saisissez l'avis pédagogique pour chaque élève en fonction de son travail et de sa conduite." },
                    { title: "Appréciation du Professeur Principal (si applicable)", action: "Si vous êtes Professeur Principal, saisissez l'avis global du conseil de classe et la décision de passage." }
                ]}
            />

            {/* 6. Mes Classes */}
            <ProcedureGuide
                title="6. Mes Classes (/dashboard/teacher/classes)"
                subtitle="Directive de consultation des effectifs et du trombinoscope de vos élèves."
                badge="Trombinoscope & Profils"
                steps={[
                    { title: "Consulter la liste de vos élèves", action: "Visualisez le trombinoscope complet avec les photos de chaque élève pour faciliter l'apprentissage des visages." },
                    { title: "Identifier les délégués et responsables", action: "Repérez le délégué de classe, le professeur principal et les fiches individuelles." }
                ]}
            />

            {/* 7. Emploi du temps */}
            <ProcedureGuide
                title="7. Emploi du temps (/dashboard/teacher/schedule)"
                subtitle="Consultation de l'agenda hebdomadaire et des affectations de salles."
                badge="Planning Personnel"
                steps={[
                    { title: "Consulter votre grille de cours", action: "Vérifiez vos heures de cours quotidiennes, vos salles d'affectation et vos créneaux libres." },
                    { title: "Suivre les modifications d'horaires", action: "Consultez les ajustements d'emploi du temps validés par la Direction." }
                ]}
            />

            {/* 8. Historique des Appels */}
            <ProcedureGuide
                title="8. Historique des Appels (/dashboard/teacher/attendance)"
                subtitle="Procédure obligatoire d'appel numérique en début de cours et suivi."
                badge="Appel Numérique"
                steps={[
                    { title: "Lancer l'Appel en début de séance", action: "Au début du cours, cliquez sur 'Faire l'Appel'. La liste des élèves s'affiche avec leurs photos." },
                    { title: "Marquer les absences et retards", action: "Tous les élèves sont 'Présents' par défaut. Cliquez pour passer en 'Absent' ou 'En Retard' (indiquez le retard en minutes, ex: 10 min)." },
                    { title: "Valider et transmettre", action: "Cliquez sur 'Valider l'Appel'. Le rapport est envoyé instantanément au Secrétariat et notifié aux parents." },
                    { title: "Consulter l'historique", action: "Revoir l'historique de vos appels passés pour vérifier les taux de présence par classe." }
                ]}
                tip="Exécutez l'appel dans les 5 premières minutes du cours pour que le secrétariat puisse contacter immédiatement les parents d'élèves absents."
            />

            {/* 9. Messagerie */}
            <ProcedureGuide
                title="9. Messagerie (/dashboard/teacher/messages)"
                subtitle="Procédure de communication sécurisée avec la Direction, le secrétariat et les parents."
                badge="Messagerie Enseignant"
                steps={[
                    { title: "Échanger en direct et en toute sécurité", action: "Discutez en ligne avec les parents d'élèves, vos collègues ou l'administration sans transmettre votre numéro de téléphone personnel." }
                ]}
            />
        </div>
    );

    const render_parents = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Espace Parents & Élèves"
                desc="Manuels d'action détaillés pour chacune des fonctionnalités accessibles aux Parents (8 modules) et aux Élèves (6 modules)."
            />

            {/* PARTIE 1 : ESPACE PARENTS */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
                <h3 className="text-base font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">👨‍👩‍👧 Espace Parents d'Élèves (8 Fonctionnalités)</h3>
            </div>

            {/* 1. Mes Enfants */}
            <ProcedureGuide
                title="1. Mes Enfants (/dashboard/parent)"
                subtitle="Directive de sélection de l'enfant et aperçu général de sa scolarité."
                badge="Espace Famille"
                steps={[
                    { title: "Basculez entre vos enfants", action: "Si vous avez plusieurs enfants inscrits dans l'établissement, cliquez sur le sélecteur d'enfant en haut de page pour basculer la vue." },
                    { title: "Consulter la synthèse globale", action: "Affichez la moyenne générale actuelle, le nombre d'absences signalées et le dernier devoir publié." }
                ]}
            />

            {/* 2. Inscrire un enfant */}
            <ProcedureGuide
                title="2. Inscrire ou ré-inscrire un enfant (/dashboard/parent/enroll)"
                subtitle="Procédure de pré-inscription en ligne d'un nouvel élève ou ré-inscription d'un ancien élève."
                badge="Pré-Inscription & Ré-inscription"
                steps={[
                    { title: "Saisir le Code d'Établissement (ex: ACXXXXX)", action: "Saisissez le code unique fourni par l'école ou scannez le QR Code de l'établissement." },
                    { title: "Remplir l'état civil et le statut de l'enfant", action: "Saisissez le Nom, Prénom, Date de naissance et choisissez la classe souhaitée (indiquez s'il s'agit d'un nouvel élève ou d'un ré-inscrit)." },
                    { title: "Soumettre la demande", action: "Validez la demande. Elle passe au statut 'PENDING_FEE'. Présentez-vous au guichet du secrétariat pour l'encaissement des droits d'inscription (nouveaux élèves) ou de ré-inscription (anciens élèves) et la validation définitive." }
                ]}
                tip="Les grilles tarifaires et montants exigés s'adaptent automatiquement selon que l'enfant effectue sa première inscription ou sa ré-inscription annuelle."
            />

            {/* 3. Explorer les écoles */}
            <ProcedureGuide
                title="3. Explorer les écoles (/dashboard/parent/schools)"
                subtitle="Consultation du catalogue et des fiches de présentation des écoles."
                badge="Catalogue Écoles"
                steps={[
                    { title: "Consulter les fiches d'établissements", action: "Découvrez les niveaux enseignés, la localisation, les équipements et les coordonnées des secrétariats du groupe." }
                ]}
            />

            {/* 4. Finances & Reçus */}
            <ProcedureGuide
                title="4. Finances & Reçus (/dashboard/parent/payments)"
                subtitle="Procédure de suivi des mensualités de scolarité et téléchargement des reçus PDF."
                badge="Comptabilité Famille"
                steps={[
                    { title: "Consulter l'échéancier des frais", action: "Vérifiez les mensualités déjà réglées au guichet et les échéances restant à payer." },
                    { title: "Télécharger un reçu de paiement PDF", action: "Cliquez sur l'icône de téléchargement en face d'un versement pour obtenir la preuve comptable officielle avec entête." }
                ]}
            />

            {/* 5. Résultats & Bulletins */}
            <ProcedureGuide
                title="5. Résultats & Bulletins (/dashboard/parent/results)"
                subtitle="Procédure de suivi des notes au fil de l'eau et téléchargement du bulletin officiel."
                badge="Résultats Scolaires"
                steps={[
                    { title: "Consulter les notes d'examens", action: "Consultez le relevé détaillé des interrogations et devoirs surveillés publiés par les professeurs." },
                    { title: "Télécharger le bulletin trimestriel PDF", action: "En fin de trimestre, cliquez sur 'Télécharger le Bulletin Officiel' pour obtenir le document signé par la Direction." }
                ]}
            />

            {/* 6. Emploi du temps */}
            <ProcedureGuide
                title="6. Emploi du temps (/dashboard/parent/schedule)"
                subtitle="Consultation de l'agenda hebdomadaire et des salles de cours de votre enfant."
                badge="Planning Élève"
                steps={[
                    { title: "Consulter l'emploi du temps hebdomadaire", action: "Vérifiez les heures de présence, les matières enseignées et les salles attribuées jour par jour." }
                ]}
            />

            {/* 7. Assiduité */}
            <ProcedureGuide
                title="7. Assiduité (/dashboard/parent/attendance)"
                subtitle="Procédure de contrôle des absences, retards et transmission de justificatifs."
                badge="Bilan Assiduité"
                steps={[
                    { title: "Consulter l'historique d'assiduité", action: "Vérifiez la liste des absences et des retards en minutes signalés lors des appels numériques des professeurs." },
                    { title: "Contrôler la justification", action: "Assurez-vous que le secrétariat a bien enregistré votre motif (statut vert 'Justifiée')." }
                ]}
            />

            {/* 8. Messagerie */}
            <ProcedureGuide
                title="8. Messagerie (/dashboard/parent/messages)"
                subtitle="Procédure d'échange sécurisé avec les professeurs et la Direction."
                badge="Messagerie Parents"
                steps={[
                    { title: "Démarrer une discussion", action: "Cliquez sur 'Nouveau message', sélectionnez le professeur ou l'administration et rédigez votre message sans partager votre numéro personnel." }
                ]}
            />

            {/* PARTIE 2 : ESPACE ÉLÈVES */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 pt-6">
                <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">🎓 Espace Élèves (6 Fonctionnalités)</h3>
            </div>

            {/* 1. Mon Espace */}
            <ProcedureGuide
                title="1. Mon Espace (/dashboard/student)"
                subtitle="Directive de consultation du tableau de bord de l'élève."
                badge="Espace Élève"
                steps={[
                    { title: "Aperçu du jour", action: "Consultez l'emploi du temps de la journée, la salle du cours suivant et le nombre de devoirs à faire pour le lendemain." }
                ]}
            />

            {/* 2. Mes Cours */}
            <ProcedureGuide
                title="2. Mes Cours (/dashboard/student/courses)"
                subtitle="Procédure d'accès au cahier de texte et supports de cours."
                badge="Supports de Cours"
                steps={[
                    { title: "Consulter le cahier de texte", action: "Ouvrez la liste des séances publiées par vos professeurs." },
                    { title: "Télécharger les ressources PDF", action: "Cliquez sur les fiches de cours et exercices joints pour réviser la leçon." }
                ]}
            />

            {/* 3. Mes Notes */}
            <ProcedureGuide
                title="3. Mes Notes (/dashboard/student/results)"
                subtitle="Procédure de consultation des notes obtenues et moyennes par matière."
                badge="Notes & Moyennes"
                steps={[
                    { title: "Consulter vos résultats", action: "Examinez vos notes par matière, le coefficient de l'épreuve et les appréciations du professeur." }
                ]}
            />

            {/* 4. Devoirs */}
            <ProcedureGuide
                title="4. Devoirs (/dashboard/student/homework)"
                subtitle="Procédure de consultation des devoirs et remise des travaux en ligne."
                badge="Devoirs à la Maison"
                steps={[
                    { title: "Consulter les devoirs à rendre", action: "Accédez à la liste des travaux assignés avec leur date limite de rendu." },
                    { title: "Déposer votre travail numérisé", action: "Cliquez sur 'Soumettre mon travail', téléversez votre fichier (PDF ou Photo lisible de votre cahier) et validez." }
                ]}
                tip="Veillez à prendre une photo bien éclairée et cadrée si vous remettez votre devoir sous forme d'image."
            />

            {/* 5. Emploi du temps */}
            <ProcedureGuide
                title="5. Emploi du temps (/dashboard/student/schedule)"
                subtitle="Consultation de l'emploi du temps de la classe."
                badge="Emploi du Temps"
                steps={[
                    { title: "Vérifier le planning des cours", action: "Consultez vos horaires quotidiens, les matières et les numéros de salles." }
                ]}
            />

            {/* 6. Messagerie */}
            <ProcedureGuide
                title="6. Messagerie (/dashboard/student/messages)"
                subtitle="Procédure de communication directe avec les enseignants."
                badge="Messagerie Élève"
                steps={[
                    { title: "Poser une question au professeur", action: "Envoyez un message direct à votre enseignant pour demander une précision sur un cours ou un devoir." }
                ]}
            />
        </div>
    );

    const render_troubleshooting = () => (
        <div className="space-y-6 animate-in fade-in transition-all duration-300">
            <SectionHeader
                title="Directives & Procédures : Maintenance & Dépannage Technique"
                desc="Procédures de résolution de problèmes informatiques pour les administrateurs système et utilisateurs."
            />

            <ProcedureGuide
                title="Comment résoudre un écran noir au démarrage sous Linux (Wayland / NVIDIA) ?"
                subtitle="Directive de dépannage pour l'application Desktop sous Linux."
                badge="Dépannage Linux"
                steps={[
                    { title: "Fermer l'application bloquée", action: "Appuyez sur Alt+F4 ou quittez le processus via le terminal (`killall frontend-desktop`)." },
                    { title: "Nettoyer le dossier de cache", action: "Ouvrez votre terminal Linux et exécutez la commande : `rm -rf ~/.config/frontend-desktop/`" },
                    { title: "Relancer l'application", action: "Relancez l'application depuis votre menu ou le terminal. Le script `main.ts` forçera le mode X11 stable." }
                ]}
                warning="Ne modifiez pas manuellement les variables d'environnement XDG_SESSION_TYPE, le binaire gère lui-même le basculement X11 de secours."
            />

            <ProcedureGuide
                title="Comment forcer la réinitialisation du cache et la synchronisation ?"
                subtitle="Directive en cas d'affichage incohérent des données sur navigateur web."
                badge="Purge du Cache"
                steps={[
                    { title: "Effectuer une Déconnexion", action: "Cliquez sur 'Déconnexion' dans le menu latéral pour vider les jetons d'accès expiré." },
                    { title: "Ouvrir l'inspecteur web", action: "Appuyez sur la touche F12 de votre clavier (ou Clic droit > Inspecter)." },
                    { title: "Purger les données Storage", action: "Allez dans l'onglet 'Application' > 'Storage', puis cliquez sur 'Clear site data' (Réinitialise la base IndexDB)." },
                    { title: "Recharger et se reconnecter", action: "Rechargez la page (Ctrl+F5) et connectez-vous à nouveau." }
                ]}
            />

            <ProcedureGuide
                title="Comment récupérer les fichiers de logs de crash pour le support ?"
                subtitle="Procédure d'extraction des logs d'erreurs techniques pour transmission à notre équipe."
                badge="Extraction Logs"
                steps={[
                    { title: "Ouvrir l'explorateur de fichiers", action: "Accédez au dossier de configuration selon votre système d'exploitation :" },
                    { title: "Sur Windows", action: "Saisissez `%APPDATA%/frontend-desktop/` dans la barre d'adresse et localisez `crash-log.txt`." },
                    { title: "Sur Linux", action: "Ouvrez le dossier masqué `~/.config/frontend-desktop/crash-log.txt`." },
                    { title: "Sur macOS", action: "Ouvrez `~/Library/Application Support/frontend-desktop/crash-log.txt`." },
                    { title: "Transmettre au support", action: "Joignez ce fichier texte à votre ticket d'assistance accompagnant une capture d'écran de l'erreur." }
                ]}
            />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans pb-24 transition-colors">
            {/* Header Hero Banner */}
            <header className="relative bg-slate-900 dark:bg-slate-950 pt-16 pb-12 overflow-hidden shadow-xl shrink-0 border-b border-slate-800">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/15 blur-[100px] rounded-full"></div>
                    <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-indigo-600/15 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs rounded-full mb-4 shadow-sm">
                            <LifeBuoy className="w-4 h-4" />
                            <span>Guide Intégral des Directives & Procédures d'Exécution</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            Manuels d'Action <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Academia Connect</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-xl mx-auto">
                            Consultez les procédures "Comment faire..." pas-à-pas et les directives d'exécution issues directement du code de l'application.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto mt-6">
                            <div className="relative flex items-center bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden focus-within:border-blue-500 transition-all">
                                <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une procédure (ex: créer une école, faire l'appel, notes...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none text-white text-sm p-3.5 pl-3 focus:outline-none placeholder-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="xl:w-80 shrink-0 sticky top-24 z-30 self-start">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-3">
                            {/* Mobile Drawer Trigger */}
                            {(() => {
                                const activeItem = menuItems.find(m => m.id === activeTab) || menuItems[0];
                                const ActiveIcon = activeItem.icon;
                                return (
                                    <div className="xl:hidden relative z-50">
                                        <button
                                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                            className="w-full flex items-center justify-between bg-blue-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-blue-200/60 dark:border-slate-700 text-blue-900 dark:text-white font-bold text-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ActiveIcon className="text-blue-600 dark:text-blue-400" size={18} />
                                                <div className="text-left">
                                                    <div className="text-xs font-extrabold">{activeItem.label}</div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{activeItem.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronDown className={`transition-transform duration-300 shrink-0 ${isMobileMenuOpen ? 'rotate-180' : ''}`} size={18} />
                                        </button>
                                        <AnimatePresence>
                                            {isMobileMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col max-h-[60vh] overflow-y-auto"
                                                >
                                                    {filteredMenuItems.map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => { handleTabChange(item.id); setIsMobileMenuOpen(false); }}
                                                            className={`flex items-start gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${activeTab === item.id ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 last:border-0'}`}
                                                        >
                                                            <item.icon size={16} className={`mt-0.5 shrink-0 ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                                                            <div>
                                                                <div className="text-xs font-bold">{item.label}</div>
                                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })()}

                            {/* Desktop Sidebar Nav */}
                            <nav className="hidden xl:flex flex-col gap-1.5">
                                {filteredMenuItems.length === 0 && (
                                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">Aucune procédure trouvée.</div>
                                )}
                                {filteredMenuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleTabChange(item.id)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-xl font-bold transition-all text-left ${isActive
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                                                }`}
                                        >
                                            <Icon size={18} className={`mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs leading-snug">{item.label}</div>
                                                <div className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main ref={mainRef} className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-10 relative overflow-hidden"
                            >
                                {activeTab === 'getting-started' && render_getting_started()}
                                {activeTab === 'pdg' && render_pdg()}
                                {activeTab === 'direction' && render_direction()}
                                {activeTab === 'secretariat' && render_secretariat()}
                                {activeTab === 'teachers' && render_teachers()}
                                {activeTab === 'parents' && render_parents()}
                                {activeTab === 'troubleshooting' && render_troubleshooting()}

                                {/* Bottom Support Assistance Banner */}
                                <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <HelpCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Besoin d'aide sur une procédure spécifique ?</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Consultez l'administrateur de votre établissement ou contactez notre équipe technique.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                                                Support Direct 24/7
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Scroll To Top Button */}
            <AnimatePresence>
                {showTopBtn && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        aria-label="Retour en haut"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Support;
