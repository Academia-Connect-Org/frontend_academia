import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import type { ReceiptConfig } from '../../../types/receiptConfig';
import { ReceiptPreviewCard } from '../../../components/dashboard/finance/ReceiptPreviewCard';
import { PrintableReceiptModal } from '../../../components/dashboard/finance/PrintableReceiptModal';
import {
  Palette,
  FileText,
  SlidersHorizontal,
  Save,
  Printer,
  Scissors,
  Layout,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Type,
  PanelRightClose,
  PanelRightOpen,
  Sliders,
  Sun,
  Moon,
  Undo2,
  Redo2,
  FileCode,
  Sparkles,
  Move,
} from 'lucide-react';

export const ReceiptConfigPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const institutionId = user?.institution?.id;

  const defaultConfig: ReceiptConfig = {
    paperSize: 'RECTANGULAR_SLIP_DL',
    layoutType: 'SINGLE_SLIP',
    customWidthMm: 210,
    customHeightMm: 99,
    headerTitle: 'RÉPUBLIQUE DU CAMEROUN',
    headerSubtitle: "MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE",
    motto: 'Paix - Travail - Patrie',
    schoolHeaderDetails: 'BP: 1234 Yaoundé • Tél: +237 696 73 18 37',
    primaryColor: '#1E3A8A',
    secondaryColor: '#2563EB',
    textColor: '#1E293B',
    backgroundColor: '#FFFFFF',
    accentColor: '#DC2626',
    fontFamily: 'Helvetica',
    showLogo: true,
    showWatermark: true,
    watermarkText: 'SÉCURISÉ',
    showQrCode: true,
    showStampBox: true,
    showStudentPhoto: false,
    showCumulativeBalance: true,
    showPaymentMethod: true,
    signatureTitle: 'Le Caissier / Le Comptable',
    footerNote: 'Les frais versés ne sont ni remboursables ni transmissibles. Gardez ce reçu précieusement.',
  };

  const [config, setConfigState] = useState<ReceiptConfig>(defaultConfig);
  const [history, setHistory] = useState<ReceiptConfig[]>([defaultConfig]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'format' | 'colors' | 'header' | 'toggles'>('format');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showTestModal, setShowTestModal] = useState<boolean>(false);

  // Helper to update state and record in undo history stack
  const updateConfig = useCallback((newPartialConfig: Partial<ReceiptConfig>) => {
    setConfigState((prev) => {
      const updated = { ...prev, ...newPartialConfig };
      setHistory((prevHistory) => {
        const sliced = prevHistory.slice(0, historyIndex + 1);
        return [...sliced, updated];
      });
      setHistoryIndex((prevIdx) => prevIdx + 1);
      return updated;
    });
  }, [historyIndex]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setConfigState(history[newIdx]);
      toast.success("Action annulée");
    }
  }, [historyIndex, history]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setConfigState(history[newIdx]);
      toast.success("Action rétablie");
    }
  }, [historyIndex, history]);

  // Keyboard shortcut listener (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    if (institutionId) {
      setLoading(true);
      api.get(`/institutions/${institutionId}/receipt-config`)
        .then((res) => {
          if (res.data) {
            const merged = { ...defaultConfig, ...res.data };
            setConfigState(merged);
            setHistory([merged]);
            setHistoryIndex(0);
          }
        })
        .catch((err) => {
          console.warn("No custom config found, using defaults", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [institutionId]);

  const handleSave = async () => {
    if (!institutionId) {
      toast.error("Établissement non spécifié.");
      return;
    }
    try {
      setSaving(true);
      const res = await api.put(`/institutions/${institutionId}/receipt-config`, config);
      setConfigState(res.data);
      toast.success("Modèle de reçu enregistré avec succès !");
    } catch (err) {
      console.error('Error saving receipt config', err);
      toast.error("Erreur lors de la sauvegarde de la configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handlePresetColor = (primary: string, secondary: string, accent: string) => {
    updateConfig({
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
    });
    toast.success("Palette de couleurs appliquée !");
  };

  // Sample data for PDF Test modal
  const sampleStudent = {
    firstName: "Nassaramadji",
    lastName: "Nasaie",
    matricule: "26-CBE-0482",
    enrollment: {
      classe: {
        name: "TERMINALE C1",
        institution: user?.institution || { name: "COLLÈGE BILINGUE EXCELLENCE" }
      }
    }
  };

  const sampleTransaction = {
    id: 9942,
    reference: "REC-2026-08492X",
    amountPaid: 85000,
    paymentMethod: "Express Union / Mobile Money",
    paymentDate: new Date().toISOString(),
    feeType: "Frais de scolarité - 2ème Tranche",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl p-8 transition-colors">
        <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mb-3" />
        <span className="text-slate-700 dark:text-slate-300 font-bold text-lg">Chargement de LibreOffice Receipt Studio...</span>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Initialisation de votre feuille de travail</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 font-sans transition-colors duration-200">
      {/* 1. LIBREOFFICE / WORD TOP RIBBON BAR */}
      <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none transition-colors">
        {/* Title Bar & Quick Actions */}
        <div className="px-3 py-2 sm:px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 rounded-lg text-blue-700 dark:text-blue-400 font-black tracking-wide text-[11px] sm:text-xs">
              <FileCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              <span>Studio Reçu</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden lg:inline">
              Modèle: <strong className="text-slate-800 dark:text-slate-200">{config.paperSize}</strong> ({config.layoutType === 'DUAL_SLIP' ? 'Double Volet' : 'Volet Unique'})
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* UNDO & REDO BUTTONS */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1 sm:p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Annuler la dernière modification (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1 sm:p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Rétablir la dernière modification (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-bold transition-all text-xs cursor-pointer"
              title="Basculer le mode clair/sombre"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Sombre</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-600/30 dark:hover:bg-indigo-600/50 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 rounded-lg font-bold transition-all text-xs cursor-pointer"
              title="Tester la génération du reçu PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Essai PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-md hover:shadow-emerald-600/30 transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${inspectorOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              title={inspectorOpen ? 'Masquer le panneau latéral' : 'Afficher le panneau latéral'}
            >
              {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Ribbon Navigation Tabs */}
        <div className="flex items-center gap-1 px-3 pt-2 overflow-x-auto custom-scrollbar border-b border-slate-200 dark:border-slate-800 text-xs font-semibold whitespace-nowrap">
          <button
            onClick={() => setActiveTab('format')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg transition-all cursor-pointer ${activeTab === 'format'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-x border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/50'
              }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>1. Format & Disposition</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg transition-all cursor-pointer ${activeTab === 'colors'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-x border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/50'
              }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>2. Couleurs & Style</span>
          </button>

          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg transition-all cursor-pointer ${activeTab === 'header'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-x border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/50'
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. En-tête & Mentions</span>
          </button>

          <button
            onClick={() => setActiveTab('toggles')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg transition-all cursor-pointer ${activeTab === 'toggles'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-t-2 border-x border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/50'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>4. Widgets Visuels</span>
          </button>
        </div>

        {/* Ribbon Quick Formatting Toolbar */}
        <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/90 flex items-center gap-3 overflow-x-auto custom-scrollbar text-xs transition-colors whitespace-nowrap">
          {/* Paper Quick Pick */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Format:</span>
            {[
              { id: 'RECTANGULAR_SLIP_DL', label: 'Bordereau DL' },
              { id: 'THERMAL_80MM', label: 'Thermique 80mm' },
              { id: 'LANDSCAPE_A5', label: 'A5 Paysage' },
              { id: 'PORTRAIT_A5', label: 'A5 Portrait' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => updateConfig({ paperSize: p.id as any })}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${config.paperSize === p.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Single vs Dual Slip Quick Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => updateConfig({ layoutType: 'SINGLE_SLIP' })}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${config.layoutType === 'SINGLE_SLIP'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              Volet Unique
            </button>
            <button
              type="button"
              onClick={() => updateConfig({ layoutType: 'DUAL_SLIP' })}
              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${config.layoutType === 'DUAL_SLIP'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
            >
              <Scissors className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Double Volet</span>
            </button>
          </div>

          {/* Quick Color Preset Swatches */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Palettes:</span>
            <button
              type="button"
              onClick={() => handlePresetColor('#1E3A8A', '#2563EB', '#DC2626')}
              className="w-5 h-5 rounded-full bg-blue-900 border border-white dark:border-slate-700 shadow-xs cursor-pointer"
              title="Bleu Officiel"
            />
            <button
              type="button"
              onClick={() => handlePresetColor('#065F46', '#059669', '#D97706')}
              className="w-5 h-5 rounded-full bg-emerald-900 border border-white dark:border-slate-700 shadow-xs cursor-pointer"
              title="Vert Émeraude"
            />
            <button
              type="button"
              onClick={() => handlePresetColor('#312E81', '#4F46E5', '#E11D48')}
              className="w-5 h-5 rounded-full bg-indigo-900 border border-white dark:border-slate-700 shadow-xs cursor-pointer"
              title="Violet Noble"
            />
            <button
              type="button"
              onClick={() => handlePresetColor('#0F172A', '#334155', '#E11D48')}
              className="w-5 h-5 rounded-full bg-slate-950 border border-white dark:border-slate-700 shadow-xs cursor-pointer"
              title="Noir Élégant"
            />
          </div>

          {/* Zoom Level Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 ml-auto">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 px-1">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CANVAS + RIGHT RESPONSIVE INSPECTOR */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-slate-200/80 dark:bg-slate-950 transition-colors">
        {/* CENTER CANVAS (WORKSPACE BACKGROUND WITH PAPER SHEET & RULERS) */}
        <div className="flex-1 flex flex-col items-center overflow-auto touch-pan-x touch-pan-y p-3 sm:p-6 md:p-8 relative custom-scrollbar">
          {/* Top Millimeter Ruler Bar (hidden on small mobile screens) */}
          <div className="w-full max-w-4xl hidden sm:flex items-center justify-between mb-2 text-[9px] font-mono text-slate-500 dark:text-slate-500 border-b border-slate-300 dark:border-slate-800 pb-1 select-none">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-bold">
              <Type className="w-3 h-3 text-blue-600 dark:text-blue-400" /> RÈGLE DE MARGE (MM)
            </span>
            <div className="hidden md:flex items-center gap-6">
              <span>0mm</span>
              <span>20mm</span>
              <span>40mm</span>
              <span>60mm</span>
              <span>80mm</span>
              <span>100mm</span>
              <span>120mm</span>
              <span>140mm</span>
              <span>160mm</span>
              <span>180mm</span>
              <span>200mm</span>
            </div>
            <span className="text-slate-600 dark:text-slate-400 font-bold">Format: {config.paperSize}</span>
          </div>

          {/* Interactive Document Sheet Container */}
          <div
            className="w-full max-w-3xl my-auto transition-transform duration-200 overflow-auto touch-pan-x touch-pan-y flex justify-center py-2 custom-scrollbar"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="relative group max-w-none">
              {/* Realistic Paper Preview Card Wrapper */}
              <div className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors overflow-auto touch-pan-x touch-pan-y custom-scrollbar">
                <ReceiptPreviewCard
                  config={config}
                  schoolName={user?.institution?.name}
                  logoUrl={user?.institution?.logoUrl}
                  onSelectSection={(section) => {
                    setActiveTab(section);
                    setInspectorOpen(true);
                  }}
                  interactive={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT DOCKED / RESPONSIVE INSPECTOR PANEL */}
        {inspectorOpen && (
          <>
            {/* Mobile & Tablet Backdrop Overlay (< lg) */}
            <div
              onClick={() => setInspectorOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 animate-fadeIn"
            />

            {/* Inspector Container: Fixed Drawer on Mobile/Tablet (< lg), Docked Sidebar on Desktop (>= lg) */}
            <div className="fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto w-full max-w-xs sm:max-w-md lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-0 shadow-2xl animate-slideLeft transition-all duration-300">
              {/* Inspector Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    {activeTab === 'format' && 'Réglages du Format'}
                    {activeTab === 'colors' && 'Palette & Couleurs'}
                    {activeTab === 'header' && 'En-tête & Mentions'}
                    {activeTab === 'toggles' && 'Widgets & Options'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectorOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Inspector Body Controls */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar text-xs">
                {/* TAB 1: FORMAT & DIMENSIONS */}
                {activeTab === 'format' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
                        Structure des Exemplaires
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => updateConfig({ layoutType: 'SINGLE_SLIP' })}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${config.layoutType === 'SINGLE_SLIP'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-200">Volet Unique</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Un seul reçu imprimé par page.</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateConfig({ layoutType: 'DUAL_SLIP' })}
                          className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${config.layoutType === 'DUAL_SLIP'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                            <span>Double Volet Découpable</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Volet Élève + Souche Caisse avec perforation.</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
                        Format & Dimensions du Papier
                      </label>
                      <div className="space-y-2">
                        {[
                          { id: 'RECTANGULAR_SLIP_DL', title: 'Bordereau DL (210 x 99 mm)', desc: 'Format standard des banques et microfinances' },
                          { id: 'THERMAL_80MM', title: 'Thermique POS (80 x 200 mm)', desc: 'Imprimantes caisse de supermarchés et guichets' },
                          { id: 'LANDSCAPE_A5', title: 'A5 Paysage (210 x 148.5 mm)', desc: 'Demi-page horizontale classique' },
                          { id: 'PORTRAIT_A5', title: 'A5 Portrait (148.5 x 210 mm)', desc: 'Demi-page verticale recommandée pour reçu long' },
                          { id: 'CUSTOM', title: 'Sur-mesure (Personnalisé)', desc: 'Entrer des dimensions spécifiques en millimètres' },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => updateConfig({ paperSize: preset.id as any })}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${config.paperSize === preset.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/30 text-blue-900 dark:text-white'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                          >
                            <div className="font-bold">{preset.title}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{preset.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {config.paperSize === 'CUSTOM' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Largeur (mm)</label>
                          <input
                            type="number"
                            value={config.customWidthMm || 210}
                            onChange={(e) => updateConfig({ customWidthMm: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Hauteur (mm)</label>
                          <input
                            type="number"
                            value={config.customHeightMm || 99}
                            onChange={(e) => updateConfig({ customHeightMm: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: STYLES & COLORS */}
                {activeTab === 'colors' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
                        Palettes de Couleurs Recommandées
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Bleu Officiel', p: '#1E3A8A', s: '#2563EB', a: '#DC2626' },
                          { name: 'Émeraude Caisse', p: '#065F46', s: '#059669', a: '#D97706' },
                          { name: 'Violet Impérial', p: '#312E81', s: '#4F46E5', a: '#E11D48' },
                          { name: 'Sleek Dark Mode', p: '#0F172A', s: '#334155', a: '#E11D48' },
                        ].map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => handlePresetColor(item.p, item.s, item.a)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-all cursor-pointer"
                          >
                            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">{item.name}</div>
                            <div className="flex gap-1.5">
                              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.p }} />
                              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.s }} />
                              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.a }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Couleur Principale (En-tête & Titres)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.primaryColor || '#1E3A8A'}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.primaryColor || '#1E3A8A'}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Couleur Secondaire (Badges & Lignes)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.secondaryColor || '#2563EB'}
                            onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                            className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.secondaryColor || '#2563EB'}
                            onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Couleur d'Accent (Cachet & Ugent)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.accentColor || '#DC2626'}
                            onChange={(e) => updateConfig({ accentColor: e.target.value })}
                            className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.accentColor || '#DC2626'}
                            onChange={(e) => updateConfig({ accentColor: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-800 dark:text-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Polices Typographiques</label>
                        <select
                          value={config.fontFamily || 'Helvetica'}
                          onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium outline-none"
                        >
                          <option value="Helvetica">Sans-Serif Moderne (Helvetica / Inter)</option>
                          <option value="Times">Serif Officiel (Times New Roman)</option>
                          <option value="Courier">Monospace Guichet (Courier Code)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: HEADER & TEXTS */}
                {activeTab === 'header' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Titre de l'En-tête Officiel</label>
                      <input
                        type="text"
                        value={config.headerTitle || ''}
                        onChange={(e) => updateConfig({ headerTitle: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
                        placeholder="RÉPUBLIQUE DU CAMEROUN"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Devise de l'Établissement / Pays</label>
                      <input
                        type="text"
                        value={config.motto || ''}
                        onChange={(e) => updateConfig({ motto: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
                        placeholder="Paix - Travail - Patrie"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Intitulé du Cachet & Signature</label>
                      <input
                        type="text"
                        value={config.signatureTitle || ''}
                        onChange={(e) => updateConfig({ signatureTitle: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
                        placeholder="Le Caissier / Le Comptable"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Texte de Filigrane en Arrière-Plan</label>
                      <input
                        type="text"
                        value={config.watermarkText || ''}
                        onChange={(e) => updateConfig({ watermarkText: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
                        placeholder="SÉCURISÉ / OFFICIEL"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Notice Légale au Pied de Page</label>
                      <textarea
                        rows={3}
                        value={config.footerNote || ''}
                        onChange={(e) => updateConfig({ footerNote: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 outline-none resize-none"
                        placeholder="Les frais versés ne sont ni remboursables..."
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: TOGGLES & WIDGETS */}
                {activeTab === 'toggles' && (
                  <div className="space-y-3">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2 uppercase tracking-wider text-[11px]">
                      Éléments à Afficher sur le Reçu
                    </label>

                    {[
                      { key: 'showLogo', title: 'Logo de l\'Établissement', desc: 'Affiche le logo officiel dans l\'en-tête' },
                      { key: 'showWatermark', title: 'Filigrane de Sécurité', desc: 'Affiche un texte en filigrane discret au centre' },
                      { key: 'showQrCode', title: 'QR Code de Vérification', desc: 'Code-barres 2D pour valider l\'authenticité' },
                      { key: 'showStampBox', title: 'Cadre Cachet & Signature', desc: 'Zone réservée aux tampons et signatures' },
                      { key: 'showCumulativeBalance', title: 'Barre de Solde Cumulé', desc: 'Total dû, Cumul versé, Reste à payer' },
                      { key: 'showPaymentMethod', title: 'Mode de Règlement', desc: 'Mobile Money, Espèces, Banque' },
                      { key: 'showStudentPhoto', title: 'Photo de l\'Élève', desc: 'Insère la photo du profil élève' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean((config as any)[item.key])}
                          onChange={(e) => updateConfig({ [item.key]: e.target.checked })}
                          className="mt-0.5 rounded text-blue-600 focus:ring-0 w-4 h-4"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{item.title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Printable Receipt Modal for Test */}
      {showTestModal && (
        <PrintableReceiptModal
          transaction={sampleTransaction}
          student={sampleStudent}
          user={user}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
};
