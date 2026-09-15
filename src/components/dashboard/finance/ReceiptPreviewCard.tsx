import React from 'react';
import type { ReceiptConfig } from '../../../types/receiptConfig';
import { QrCode, ShieldCheck, Printer } from 'lucide-react';

interface Props {
  config: ReceiptConfig;
  schoolName?: string;
  logoUrl?: string;
  transaction?: any;
  student?: any;
  user?: any;
  onSelectSection?: (section: 'format' | 'colors' | 'header' | 'toggles') => void;
  zoomLevel?: number;
  interactive?: boolean;
  showPreviewHeader?: boolean;
}

export const ReceiptPreviewCard: React.FC<Props> = ({
  config,
  schoolName = "COLLÈGE BILINGUE EXCELLENCE",
  logoUrl,
  transaction,
  student,
  user,
  onSelectSection,
  zoomLevel = 100,
  interactive = true,
  showPreviewHeader,
}) => {
  // Extract real transaction & student data if provided, or fallback to sample data
  const studentObj = student?.enrollment?.student || student?.student || student;
  const rawFirstName = studentObj?.firstName || user?.firstName || "NASSARAMADJI";
  const rawLastName = studentObj?.lastName || user?.lastName || "NASAIE";
  
  const sampleData = {
    ref: transaction?.reference || `REC-${transaction?.id || '2026-08492X'}`,
    date: transaction?.paymentDate || transaction?.createdAt
      ? new Date(transaction.paymentDate || transaction.createdAt).toLocaleDateString('fr-FR') + " " + new Date(transaction.paymentDate || transaction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleDateString('fr-FR') + " " + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    studentName: `${rawFirstName} ${rawLastName}`.trim(),
    matricule: studentObj?.studentIdNumber || studentObj?.matricule || "26-CBE-0482",
    classe: student?.enrollment?.classe?.name || student?.classe?.name || "TERMINALE C1",
    feeType: transaction?.feeType || student?.feeType?.name || "Frais de scolarité - 2ème Tranche",
    paymentMethod: transaction?.paymentMethod || "Express Union / Mobile Money",
    amountPaid: transaction?.amountPaid || transaction?.amount || 85000,
    totalDue: transaction?.totalDue || 150000,
    previousPaid: transaction?.previousPaid || 35000,
    remainingBalance: transaction?.remainingBalance !== undefined ? transaction.remainingBalance : 30000,
    cashierName: "Mme KOUAMÉ Marie (Secrétariat)",
  };

  const isDual = config.layoutType === 'DUAL_SLIP';

  const handleSectionClick = (e: React.MouseEvent, section: 'format' | 'colors' | 'header' | 'toggles') => {
    if (interactive && onSelectSection) {
      e.stopPropagation();
      onSelectSection(section);
    }
  };

  const renderSingleSlip = (stubLabel?: string) => (
    <div
      onClick={(e) => handleSectionClick(e, 'colors')}
      className={`relative rounded-lg shadow-xl p-3 sm:p-5 transition-all duration-200 border overflow-hidden flex flex-col justify-between group ${
        interactive ? 'hover:ring-2 hover:ring-blue-500/80 cursor-pointer' : ''
      }`}
      style={{
        backgroundColor: config.backgroundColor || '#FFFFFF',
        color: config.textColor || '#1E293B',
        borderColor: '#E2E8F0',
        fontFamily: config.fontFamily || 'sans-serif',
        minHeight: config.paperSize === 'THERMAL_80MM' ? '340px' : '280px',
        minWidth: config.paperSize === 'THERMAL_80MM' ? '280px' : '500px',
      }}
    >
      {/* Corner Crop Marks for authentic print layout preview */}
      <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none opacity-60" style={{ borderColor: '#CBD5E1' }}></div>
      <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 pointer-events-none opacity-60" style={{ borderColor: '#CBD5E1' }}></div>
      <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 pointer-events-none opacity-60" style={{ borderColor: '#CBD5E1' }}></div>
      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none opacity-60" style={{ borderColor: '#CBD5E1' }}></div>
      
      {/* Watermark text */}
      {config.showWatermark && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-black text-2xl sm:text-3xl uppercase tracking-widest"
          style={{
            color: config.primaryColor || '#1E3A8A',
            opacity: 0.06,
            transform: 'rotate(-18deg)',
            zIndex: 0,
          }}
        >
          {config.watermarkText || 'OFFICIEL'}
        </div>
      )}

      {/* Stub Tag if Dual Slip */}
      {stubLabel && (
        <div 
          className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-white mb-2 self-start shadow-xs"
          style={{ backgroundColor: config.secondaryColor }}
        >
          {stubLabel}
        </div>
      )}

      {/* Header Section */}
      <div
        onClick={(e) => handleSectionClick(e, 'header')}
        className={`pb-2 border-b-2 flex items-center justify-between gap-2 sm:gap-3 rounded p-1 transition-all ${
          interactive ? 'hover:bg-blue-50/70 hover:ring-1 hover:ring-blue-400' : ''
        }`}
        style={{ borderColor: config.primaryColor }}
        title="Cliquer pour modifier l'en-tête"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {config.showLogo && (
            <div
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-xl shadow-sm overflow-hidden shrink-0"
              style={{ backgroundColor: config.primaryColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                schoolName.charAt(0)
              )}
            </div>
          )}
          <div>
            <div className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#64748B' }}>
              {config.headerTitle || 'RÉPUBLIQUE DU CAMEROUN'}
            </div>
            <h3
              className="font-bold text-xs sm:text-sm leading-tight uppercase"
              style={{ color: config.primaryColor }}
            >
              {schoolName}
            </h3>
            {config.motto && (
              <p className="text-[8px] sm:text-[10px] italic" style={{ color: '#64748B' }}>{config.motto}</p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-white text-[10px] sm:text-xs font-bold shadow-sm inline-block uppercase tracking-wider"
            style={{ backgroundColor: config.primaryColor }}
          >
            Reçu de Paiement
          </div>
          <div className="text-[8px] sm:text-[10px] font-mono mt-0.5 sm:mt-1" style={{ color: '#475569' }}>
            N° {sampleData.ref}
          </div>
          <div className="text-[8px] sm:text-[10px]" style={{ color: '#94A3B8' }}>{sampleData.date}</div>
        </div>
      </div>

      {/* Body Details Grid - Fixed 2 columns for exact 1:1 print reproduction */}
      <div className="my-2 sm:my-3 grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        {/* Student Info */}
        <div className="space-y-1 p-2 sm:p-2.5 rounded-md border" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
          <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
            Élève & Inscription
          </div>
          <div className="font-bold text-xs sm:text-sm" style={{ color: '#1E293B' }}>{sampleData.studentName}</div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px]" style={{ color: '#475569' }}>
            <span>Classe: <strong style={{ color: '#0F172A' }}>{sampleData.classe}</strong></span>
            {config.showStudentPhoto && (
              <span className="text-[8px] sm:text-[9px] px-1 rounded" style={{ backgroundColor: '#E2E8F0', color: '#334155' }}>Photo incluse</span>
            )}
          </div>
          <div className="text-[10px] sm:text-[11px]" style={{ color: '#64748B' }}>
            Matricule: <span className="font-mono font-medium">{sampleData.matricule}</span>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="space-y-1 p-2 sm:p-2.5 rounded-md border flex flex-col justify-between" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
          <div>
            <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
              Motif du Règlement
            </div>
            <div className="font-semibold text-xs sm:text-sm" style={{ color: '#1E293B' }}>{sampleData.feeType}</div>
            {config.showPaymentMethod && (
              <div className="text-[10px] sm:text-[11px] mt-0.5" style={{ color: '#64748B' }}>
                Mode: <strong style={{ color: '#334155' }}>{sampleData.paymentMethod}</strong>
              </div>
            )}
          </div>

          <div
            className="mt-2 pt-1 border-t flex items-center justify-between font-bold"
            style={{ borderColor: config.secondaryColor }}
          >
            <span className="text-[10px] sm:text-xs" style={{ color: '#475569' }}>MONTANT PAYÉ:</span>
            <span className="text-sm sm:text-base" style={{ color: config.primaryColor }}>
              {sampleData.amountPaid.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Cumulative Balance bar if toggled */}
      {config.showCumulativeBalance && (
        <div className="mb-2 sm:mb-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-[9px] sm:text-xs flex flex-wrap sm:flex-nowrap justify-between items-center gap-1" style={{ backgroundColor: '#FEF3C7', borderColor: '#FDE68A', color: '#78350F' }}>
          <span>Total dû: <strong>{sampleData.totalDue.toLocaleString()} FCFA</strong></span>
          <span>Cumul versé: <strong>{(sampleData.previousPaid + sampleData.amountPaid).toLocaleString()} FCFA</strong></span>
          <span className="font-bold" style={{ color: '#92400E' }}>
            Reste à payer: {sampleData.remainingBalance.toLocaleString()} FCFA
          </span>
        </div>
      )}

      {/* Footer / Stamp & QR Code */}
      <div className="pt-2 border-t flex items-center justify-between gap-2 sm:gap-4 text-[10px] sm:text-[11px]" style={{ borderColor: '#E2E8F0' }}>
        {/* Footer Note */}
        <div className="flex-1 text-[8px] sm:text-[10px] leading-tight" style={{ color: '#64748B' }}>
          <p>{config.footerNote || 'Les frais versés ne sont ni remboursables ni transmissibles.'}</p>
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-medium mt-1" style={{ color: '#047857' }}>
            <ShieldCheck className="w-3 h-3" style={{ color: '#059669' }} stroke="#059669" />
            Vérification numérique garantie par Academia Connect
          </div>
        </div>

        {/* QR Code section */}
        {config.showQrCode && (
          <div className="flex flex-col items-center p-1 sm:p-1.5 rounded border shrink-0" style={{ backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }}>
            <QrCode className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#1E293B' }} stroke="#1E293B" />
            <span className="text-[7px] sm:text-[8px] font-mono mt-0.5" style={{ color: '#64748B' }}>SCANNER POUR VÉRIFIER</span>
          </div>
        )}

        {/* Cachet / Signature box */}
        {config.showStampBox && (
          <div
            className="w-28 sm:w-36 h-11 sm:h-14 rounded border-2 border-dashed flex flex-col items-center justify-center text-center p-0.5 sm:p-1 relative shrink-0"
            style={{ borderColor: config.accentColor || '#DC2626' }}
          >
            <span
              className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider"
              style={{ color: config.accentColor || '#DC2626' }}
            >
              {config.signatureTitle || 'Cachet & Signature'}
            </span>
            <span className="text-[7px] sm:text-[8px] italic mt-auto" style={{ color: '#94A3B8' }}>
              {sampleData.cashierName}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const displayHeader = showPreviewHeader !== undefined ? showPreviewHeader : interactive;

  return (
    <div className="w-full min-w-fit">
      {displayHeader && (
        <div className="no-print flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold min-w-0" style={{ color: '#475569' }}>
            <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{ color: '#2563EB' }} stroke="#2563EB" />
            <span className="truncate">Aperçu de l'Impression ({config.paperSize} • {config.layoutType === 'DUAL_SLIP' ? 'Double Volet Découpable' : 'Volet Unique'})</span>
          </div>
          <span className="text-[9px] sm:text-[11px] bg-blue-50 text-blue-700 font-medium px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            Rendu en temps réel
          </span>
        </div>
      )}

      {isDual ? (
        <div className="space-y-3 sm:space-y-4">
          {renderSingleSlip("VOLET 1 : EXEMPLAIRE ÉLÈVE / PARENT")}

          {/* Perforated Cut Line */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t-2 border-dashed" style={{ borderColor: '#94A3B8' }}></div>
            <span className="absolute bg-white px-2 sm:px-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 border rounded-full shadow-sm" style={{ borderColor: '#CBD5E1', color: '#64748B' }}>
              ✂ LIGNE DE DÉCOUPE / PERFORATION (SOUCHE ÉCOLE)
            </span>
          </div>

          {renderSingleSlip("VOLET 2 : SOUCHE CAISSE / ÉTABLISSEMENT")}
        </div>
      ) : (
        renderSingleSlip()
      )}
    </div>
  );
};
