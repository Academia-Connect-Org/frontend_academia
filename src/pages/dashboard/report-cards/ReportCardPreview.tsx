import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, ShieldCheck, Award } from 'lucide-react';
import { getFileUrl } from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

interface ReportCardData {
    student: any;
    stats: any;
}

interface ReportCardPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    data: ReportCardData[];
    selectedClass: any;
    trimester: string;
    academicYear: string;
    institution: any;
    isEcole: boolean;
}

const ReportCardPreview: React.FC<ReportCardPreviewProps> = ({
    isOpen,
    onClose,
    data,
    selectedClass,
    trimester,
    academicYear,
    institution,
    isEcole
}) => {
    if (!isOpen || !data || data.length === 0) return null;

    const { user } = useAuth();
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const isAdmin = ['PROVISEUR', 'SECRETAIRE', 'DIRECTION', 'PDG'].includes(user?.role?.toUpperCase() || '');

    const handleAction = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Simulation de l'appel API
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 1200);
    };

    const handlePrint = () => {
        if (isPrinting) return;
        setIsPrinting(true);

        // Save original title to restore later
        const oldTitle = document.title;

        // Build a professional filename
        const clsName = selectedClass?.name || 'Archives';
        const fileName = `Bulletins_${clsName}_${trimester}_${academicYear}`.replace(/\s+/g, '_');
        document.title = fileName;

        console.log("Démarrage de l'impression avec titre personnalisé...");

        // Small delay to ensure the browser registers the title change
        setTimeout(() => {
            window.print();

            // Restore original title
            document.title = oldTitle;
            setIsPrinting(false);
        }, 500);
    };

    const getMention = (average: any) => {
        const val = Number(average);
        if (isNaN(val) || average === '-') return { label: '-', color: 'text-slate-300', bg: 'bg-slate-50' };
        
        // Normalize to 20 for standard thresholds if needed, but here we already have final average
        // If isEcole, average is on 10, so let's normalize to 20 for the check
        const score = isEcole ? val * 2 : val;

        if (score >= 18) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        if (score >= 16) return { label: 'Très Bien', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (score >= 14) return { label: 'Bien', color: 'text-indigo-600', bg: 'bg-indigo-50' };
        if (score >= 12) return { label: 'Assez Bien', color: 'text-amber-600', bg: 'bg-amber-50' };
        if (score >= 10) return { label: 'Passable', color: 'text-slate-600', bg: 'bg-slate-50' };
        if (score >= 8) return { label: 'Insuffisant', color: 'text-orange-600', bg: 'bg-orange-50' };
        return { label: 'Médiocre', color: 'text-red-600', bg: 'bg-red-50' };
    };


    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <div key="report-card-preview-overlay" className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-8 print:block print:p-0 print:static">
                    {/* Backdrop */}
                    <motion.div
                        key="report-card-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm no-print"
                        onClick={onClose}
                    />

                    {/* Content Container */}
                    <motion.div
                        id="bulletin-preview-modal"
                        key="report-card-modal-container"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:h-auto print:rounded-none print:overflow-visible print:shadow-none print:block print:static"
                    >
                        {/* Top Toolbar - Hidden on Print */}
                        <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100 no-print">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                    {data.length > 1 ? `Bulletins de la classe (${data.length} élèves)` : 'Aperçu du Bulletin'}
                                </h3>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {trimester}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Action for Management/Administration */}
                                <button
                                    onClick={handleAction}
                                    disabled={isPrinting || isSubmitting}
                                    className={`flex items-center gap-2 px-5 py-2.5 ${isSubmitting ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <ShieldCheck size={16} />
                                    )}
                                    {isSubmitting ? 'Traitement...' : isAdmin ? 'Publier aux Parents/Élèves' : (isEcole ? 'Envoyer à la Direction' : 'Envoyer au Provisoriat')}
                                </button>

                                <button
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                    className={`flex items-center gap-2 px-5 py-2.5 ${isPrinting ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95`}
                                >
                                    <Printer size={16} /> {isPrinting ? 'Préparation...' : 'Imprimer'}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 bg-white text-slate-400 hover:text-slate-600 rounded-2xl border border-slate-100 transition-all font-black"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Report Card Content - Optimized for Print */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-100 print:overflow-visible print:p-0 print:bg-white print:flex print:flex-col print:items-center">
                            <div id="printable-bulletins-container" className="flex flex-col gap-10 print:gap-0 print:flex print:flex-col print:items-center print:w-full print-section">
                                {data.map((item, index) => (
                                    <div
                                        key={`student-bulletin-${item.student.id || index}-${index}`}
                                        className={`w-full max-w-[21cm] mx-auto bg-white p-[1cm] border border-slate-100 rounded-[20px] print:border-none print:shadow-none print:p-0 shadow-xl overflow-hidden print:m-0 print:rounded-none report-card-printable ${index > 0 ? 'print:break-before-page mt-10 print:mt-0' : ''}`}
                                    >
                                        {/* Chadian Header */}
                                        <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-1">
                                            <div className="text-center w-1/3">
                                                <p className="text-[10px] font-black uppercase leading-tight">{institution?.country || 'République du Tchad'}</p>
                                                <p className="text-[9px] font-bold text-red-600 mb-2">{institution?.motto || 'Unité - Travail - Progrès'}</p>
                                                <div className="w-12 h-0.5 bg-slate-800 mx-auto my-2"></div>
                                                <p className="text-[10px] font-black uppercase leading-tight">{institution?.ministry || 'Ministère de l\'Éducation Nationale et de la Promotion Civique'}</p>
                                            </div>

                                            <div className="text-center w-1/3 flex flex-col items-center">
                                                {institution?.logoUrl ? (
                                                    <img src={getFileUrl(institution.logoUrl)} alt="Logo" className="w-[100px] h-auto object-contain mb-2" />
                                                ) : (
                                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-2">
                                                        <ShieldCheck size={32} className="text-slate-300" />
                                                    </div>
                                                )}
                                                <p className="text-xs font-black text-slate-800">{institution?.name || 'VOTRE INSTITUTION'}</p>
                                                <div className="mt-1 flex flex-col items-center">
                                                    {institution?.phone && <p className="text-[8px] font-bold text-slate-500">Tél: {institution.phone}</p>}
                                                    {institution?.email && <p className="text-[8px] font-bold text-slate-500">Email: {institution.email}</p>}
                                                    {institution?.address && <p className="text-[8px] font-bold text-slate-500">{institution.address}</p>}
                                                </div>
                                            </div>

                                            <div className="text-center w-1/3">
                                                <p className="text-[12px] font-black text-blue-600 uppercase mb-1">BULLETIN DE NOTES</p>
                                                <p className="text-[10px] font-bold text-slate-500">{trimester}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{academicYear}</p>
                                            </div>
                                        </div>

                                        {/* Intelligent Compact Student Identity Box */}
                                        <div className="grid grid-cols-4 gap-2 mb-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                                            {/* Col 1: Name & ID */}
                                            <div className="border-r border-slate-200 pr-2">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Élève</p>
                                                <p className="text-[10px] font-black text-slate-800 uppercase leading-tight truncate">
                                                    {item.student.lastName} {item.student.firstName}
                                                </p>
                                                <p className="text-[8px] font-bold text-slate-500 mt-0.5">ID: {item.student.studentIdNumber || 'N/A'}</p>
                                            </div>

                                            {/* Col 2: Class & Level */}
                                            <div className="border-r border-slate-200 px-2 text-center">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Classe / Cycle</p>
                                                <p className="text-[10px] font-black text-indigo-600 leading-tight">{selectedClass.name}</p>
                                                <p className="text-[8px] font-bold text-slate-500 mt-0.5">{selectedClass.cycle?.name || 'Lycée'}</p>
                                            </div>

                                            {/* Col 3: Stats & Gender */}
                                            <div className="border-r border-slate-200 px-2 text-center">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Infos</p>
                                                <div className="flex justify-center gap-2 mt-0.5">
                                                    <div>
                                                        <span className="text-[7px] font-bold text-slate-400 uppercase">Sexe:</span>
                                                        <span className="ml-1 text-[8px] font-black">{item.student.gender === 'Masculin' ? 'M' : 'F'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[7px] font-bold text-slate-400 uppercase">Ef:</span>
                                                        <span className="ml-1 text-[8px] font-black">{selectedClass.capacity || '30'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Col 4: Parents */}
                                            <div className="pl-2">
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Contacts Parents</p>
                                                <div className="flex flex-col">
                                                    <span className="text-[7.5px] font-bold text-slate-700 truncate leading-tight">
                                                        Père: {item.student.fatherLastName?.charAt(0)}. {item.student.fatherPhone}
                                                    </span>
                                                    <span className="text-[7.5px] font-bold text-slate-700 truncate leading-tight">
                                                        Mère: {item.student.motherLastName?.charAt(0)}. {item.student.motherPhone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Grades Table */}
                                        <div className="border border-slate-200 rounded-[20px] overflow-hidden mb-2 shadow-sm">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-800 text-white">
                                                        <th className="px-3 py-1 text-[8px] font-black uppercase tracking-widest leading-none">Matières</th>
                                                        {!isEcole ? (
                                                            <>
                                                                <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Moy. Dev</th>
                                                                <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Note Exam</th>
                                                                <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Moy. G</th>
                                                                <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Coef</th>
                                                                <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Moy. Coef</th>
                                                            </>
                                                        ) : (
                                                            <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Note Compo</th>
                                                        )}
                                                        <th className="px-4 py-1 text-[8px] font-black uppercase tracking-widest text-center leading-none">Appréciations</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {(isEcole ? ['PRIMARY_GROUP'] : ['LITTERAIRE', 'SCIENTIFIQUE', 'ADDITIONNELLE']).map(cat => {
                                                        const catDetails = isEcole 
                                                            ? item.stats.details 
                                                            : item.stats.details.filter((d: any) => d.category === cat || (cat === 'LITTERAIRE' && !d.category));
                                                        
                                                        if (catDetails.length === 0) return null;

                                                        const totalCoefCat = catDetails.reduce((a: number, c: any) => a + Number(c.coef), 0);
                                                        const totalPointsCat = catDetails.reduce((a: number, c: any) => a + Number(c.weighted), 0);

                                                        return (
                                                            <React.Fragment key={cat}>
                                                                <tr className="bg-slate-100/80">
                                                                    <td colSpan={isEcole ? 5 : 7} className="px-4 py-1.5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-y border-slate-200 shadow-sm">
                                                                        {isEcole ? "Matières d'Enseignement" : (cat === 'LITTERAIRE' ? 'Matières Littéraires' : cat === 'SCIENTIFIQUE' ? 'Matières Scientifiques' : 'Matières Optionnelles / Additionnelles')}
                                                                    </td>
                                                                </tr>
                                                                {catDetails
                                                                    .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                                                    .map((detail: any, idx: number) => (
                                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                                                                        <td className="px-3 py-0.5">
                                                                            <p className="text-[9px] font-black text-slate-800 leading-none">{detail.subjectName}</p>
                                                                            {!isEcole && <p className="text-[6.5px] font-medium text-slate-400 leading-none">M. {detail.teacherName}</p>}
                                                                        </td>
                                                                        {!isEcole && (
                                                                            <>
                                                                                <td className="px-3 py-0.5 text-center text-[9px] font-medium text-slate-600 leading-none">{detail.devAvg}</td>
                                                                                <td className="px-3 py-0.5 text-center text-[9px] font-medium text-slate-600 leading-none">{detail.examNote}</td>
                                                                            </>
                                                                        )}
                                                                        <td className="px-3 py-0.5 text-center leading-none">
                                                                            <span className={`text-[10px] font-black ${detail.average === '-' ? 'text-slate-300' : (Number(detail.average) >= (isEcole ? 5 : 10) ? 'text-blue-600' : 'text-red-600')}`}>
                                                                                {detail.average}
                                                                            </span>
                                                                        </td>
                                                                        {!isEcole && (
                                                                            <>
                                                                                <td className="px-3 py-0.5 text-center text-[10px] font-black text-slate-400 leading-none">×{detail.coef}</td>
                                                                                <td className="px-3 py-0.5 text-center text-[10px] font-black text-slate-800 leading-none">{detail.isSubmitted ? detail.weighted : '-'}</td>
                                                                            </>
                                                                        )}
                                                                        <td className="px-3 py-0.5 leading-none">
                                                                            <span className={`text-[8px] font-bold uppercase tracking-tight ${getMention(detail.average).color}`}>
                                                                                {getMention(detail.average).label}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                                {/* Sous-total de la catégorie */}
                                                                <tr className="bg-slate-50/50">
                                                                    <td colSpan={isEcole ? 1 : 5} className="px-4 py-0.5 text-[8px] font-black uppercase text-slate-400 tracking-widest text-right leading-none">Sous-total :</td>
                                                                    {!isEcole && (
                                                                        <>
                                                                            <td className="px-4 py-0.5 text-center text-[9px] font-black text-slate-600 leading-none">{totalCoefCat}</td>
                                                                            <td className="px-4 py-0.5 text-center text-[9px] font-black text-slate-600 border-r border-white leading-none">{totalPointsCat.toFixed(2)}</td>
                                                                        </>
                                                                    )}
                                                                    {isEcole && <td className="px-4 py-0.5 bg-slate-50/50 text-right text-[10px] font-black text-slate-700">{totalPointsCat.toFixed(2)} pts</td>}
                                                                    <td className="bg-slate-50/50"></td>
                                                                </tr>
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-slate-50 border-t-2 border-slate-800">
                                                        <td className="px-4 py-4 text-[10px] font-black uppercase tracking-widest">Total Général</td>
                                                        {!isEcole ? (
                                                            <>
                                                                <td colSpan={2}></td>
                                                                <td></td>
                                                                <td className="text-center text-[11px] font-black text-slate-800">{item.stats.totalCoefficients}</td>
                                                                <td className="text-center text-[12px] font-black text-slate-800">
                                                                    {item.stats.details.reduce((acc: number, d: any) => acc + Number(d.weighted), 0).toFixed(2)}
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="text-right pr-4 text-[11px] font-black text-slate-900" colSpan={2}>
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-[12px]">{item.stats.details.reduce((acc: number, d: any) => acc + Number(d.weighted), 0).toFixed(2)} pts</span>
                                                                        <span className="text-[7px] text-slate-400 uppercase tracking-tighter">sur {item.stats.totalCoefficients} matière(s)</span>
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>

                                        {/* Statistics Summary */}
                                        <div className="grid grid-cols-2 gap-10 mb-2 items-stretch">
                                            <div className="border border-slate-200 rounded-[24px] p-6 relative overflow-hidden bg-white shadow-sm">
                                                <div className={`absolute top-0 right-0 w-24 h-24 ${getMention(Number(item.stats.generalAverage)).bg} rounded-bl-full -mr-8 -mt-8 flex items-center justify-center pt-6 pl-6`}>
                                                    <Award size={32} className={getMention(Number(item.stats.generalAverage)).color} />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">Résumé des résultats</h4>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[11px] font-black text-slate-500 uppercase">Moyenne Trimestrielle :</span>
                                                         <span className={`${isEcole ? 'text-2xl' : 'text-3xl'} font-black tabular-nums ${Number(item.stats.generalAverage) >= (isEcole ? 5 : 10) ? 'text-emerald-600' : 'text-red-600'}`}>
                                                             {item.stats.generalAverage} <span className="text-xs text-slate-300">/ {isEcole ? '10' : '20'}</span>
                                                         </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-black text-slate-500 uppercase">Mention :</span>
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${getMention(Number(item.stats.generalAverage)).bg} ${getMention(Number(item.stats.generalAverage)).color}`}>
                                                            {getMention(Number(item.stats.generalAverage)).label}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[11px] font-black text-slate-500 uppercase">Rang :</span>
                                                        <span className="text-sm font-black text-slate-800">
                                                            {item.stats.rank}{item.stats.rank === 1 ? 'er' : 'ème'} / {selectedClass.capacity || '?'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-[20px] p-3 bg-slate-50/30 flex flex-col justify-center">
                                                {/* Historique des trimestres */}
                                                <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between gap-1.5">
                                                    {[
                                                        { label: "Trim 1", stats: item.stats.trim1Stats },
                                                        { label: "Trim 2", stats: item.stats.trim2Stats },
                                                        { label: "Trim 3", stats: item.stats.trim3Stats }
                                                    ].map((t, i) => (
                                                        <div key={i} className={`flex-1 ${t.stats ? 'bg-white border border-slate-100 shadow-sm' : 'bg-slate-50/50'} rounded-lg p-1.5 text-center flex flex-col items-center justify-center`}>
                                                            <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-1">{t.label}</p>
                                                            {t.stats ? (
                                                                <>
                                                                    <div className="flex flex-col items-center">
                                                                        <p className={`text-[10px] font-black leading-tight ${Number(t.stats.avg) >= (isEcole ? 5 : 10) ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                                            {t.stats.avg}
                                                                            {isEcole && <span className="text-[7px] opacity-40 ml-0.5">/10</span>}
                                                                        </p>
                                                                        <div className="mt-1 px-1.5 py-0.5 bg-slate-900 rounded-md">
                                                                            <p className="text-[7px] font-black text-white leading-none">
                                                                                {t.stats.rank}{t.stats.rank === 1 ? 'er' : 'ème'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <p className="text-[8px] font-bold text-slate-300 leading-none">-</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white pb-1">{isEcole ? 'Observation de la Direction' : 'Observation du PP'}</h4>
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                    {[
                                                        "Encouragement",
                                                        "Félicitation",
                                                        "Tableau d'honneur",
                                                        "Av. conduite",
                                                        "Av. travail",
                                                        "Blâme de conduite",
                                                        "Blâme de travail"
                                                    ].map((obs, idx) => (
                                                        <div key={idx} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-slate-400 text-[8px]">➢</span>
                                                                <span className="text-[9px] font-bold text-slate-700 leading-none">{obs}</span>
                                                            </div>
                                                            <div className="w-3 h-3 border border-slate-400 bg-white"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Signature Footer */}
                                        <div className="grid grid-cols-3 gap-8 mt-2 text-center pb-2">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Le Parent d'Élève</p>
                                                <div className="w-full border-b border-slate-200 mt-1 italic text-[9px] text-slate-300">Signer ici</div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{isEcole ? 'Le Titulaire' : 'Le Titulaire / PP'}</p>
                                                <p className="text-[9px] font-bold text-slate-800 mb-2">{selectedClass.mainTeacher ? `${selectedClass.mainTeacher.lastName} ${selectedClass.mainTeacher.firstName}` : '... '}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Sceau & Signature</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{isEcole ? 'Le Directeur / La Directrice' : "Le Chef d'Établissement"}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sceau & Signature</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <style>
                        {`
                                @media print {
                                    * {
                                        -webkit-print-color-adjust: exact !important;
                                        print-color-adjust: exact !important;
                                    }

                                    /* Ultimate Isolation Strategy */
                                    body {
                                        visibility: hidden !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        background: white !important;
                                    }

                                    #printable-bulletins-container {
                                        visibility: visible !important;
                                        position: absolute !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 100% !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        display: block !important;
                                    }

                                    #printable-bulletins-container * {
                                        visibility: visible !important;
                                    }

                                    .report-card-printable {
                                        visibility: visible !important;
                                        border: none !important;
                                        width: 210mm !important;
                                        height: 297mm !important;
                                        margin: 0 auto !important;
                                        padding: 10mm !important;
                                        box-sizing: border-box !important;
                                        background: white !important;
                                        display: flex !important;
                                        flex-direction: column !important;
                                        justify-content: space-between !important;
                                        position: relative !important;
                                        page-break-after: always !important;
                                        break-after: page !important;
                                        page-break-inside: avoid !important;
                                    }

                                    .report-card-printable:last-child {
                                        page-break-after: auto !important;
                                        break-after: auto !important;
                                    }

                                    @page {
                                        size: A4 portrait;
                                        margin: 0 !important;
                                    }

                                    /* Hide interactive UI */
                                    .no-print, button, nav, header {
                                        display: none !important;
                                    }
                                }
                            `}
                    </style>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReportCardPreview;
