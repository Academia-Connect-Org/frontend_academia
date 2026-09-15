import React, { useState, useEffect } from 'react';
import { Printer, Download, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../../../api/axios';
import type { ReceiptConfig } from '../../../types/receiptConfig';
import { generateReceipt } from '../../../utils/receiptGenerator';
import { ReceiptPreviewCard } from './ReceiptPreviewCard';

interface Props {
  transaction: any;
  student: any;
  user: any;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<Props> = ({
  transaction,
  student,
  user,
  onClose,
}) => {
  const [config, setConfig] = useState<ReceiptConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const institution =
    student?.enrollment?.classe?.institution ||
    student?.institution ||
    user?.institution;
  const institutionId = institution?.id;

  useEffect(() => {
    if (institutionId) {
      api.get(`/institutions/${institutionId}/receipt-config`)
        .then((res) => setConfig(res.data))
        .catch(() => setConfig(null))
        .finally(() => setLoadingConfig(false));
    } else {
      setLoadingConfig(false);
    }
  }, [institutionId]);

  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const ok = await generateReceipt(transaction, student, user, false, null, activeConfig);
      if (ok) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      }
    } catch (err) {
      console.error("PDF download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const printArea = document.getElementById('printable-receipt-area');
    if (!printArea) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression Reçu</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            html, body {
              margin: 0;
              padding: 10px;
              background-color: #FFFFFF;
              font-family: sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              overflow: hidden;
            }
            * {
              box-sizing: border-box;
            }
            .no-print {
              display: none !important;
            }
            .flex { display: flex !important; }
            .flex-col { display: flex !important; flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-3 { gap: 12px !important; }
            .gap-4 { gap: 16px !important; }
            .rounded-lg { border-radius: 8px !important; }
            .rounded-md { border-radius: 6px !important; }
            .rounded { border-radius: 4px !important; }
            .rounded-full { border-radius: 9999px !important; }
            .p-5 { padding: 20px !important; }
            .p-4 { padding: 16px !important; }
            .p-2\\.5 { padding: 10px !important; }
            .p-1\\.5 { padding: 6px !important; }
            .p-1 { padding: 4px !important; }
            .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
            .py-1\\.5 { padding-top: 6px !important; padding-bottom: 6px !important; }
            .px-2\\.5 { padding-left: 10px !important; padding-right: 10px !important; }
            .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
            .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
            .py-0\\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .px-1 { padding-left: 4px !important; padding-right: 4px !important; }
            .pt-2 { padding-top: 8px !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .mb-3 { margin-bottom: 12px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .my-3 { margin-top: 12px !important; margin-bottom: 12px !important; }
            .mt-1 { margin-top: 4px !important; }
            .mt-0\\.5 { margin-top: 2px !important; }
            .mt-auto { margin-top: auto !important; }
            .border { border-style: solid !important; border-width: 1px !important; }
            .border-b-2 { border-bottom-style: solid !important; border-bottom-width: 2px !important; }
            .border-t-2 { border-top-style: solid !important; border-top-width: 2px !important; }
            .border-t { border-top-style: solid !important; border-top-width: 1px !important; }
            .border-2 { border-width: 2px !important; }
            .border-dashed { border-style: dashed !important; }
            .text-xs { font-size: 12px !important; line-height: 16px !important; }
            .text-sm { font-size: 14px !important; line-height: 20px !important; }
            .text-base { font-size: 16px !important; line-height: 24px !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[11px\\] { font-size: 11px !important; }
            .text-\\[9px\\] { font-size: 9px !important; }
            .text-\\[8px\\] { font-size: 8px !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .uppercase { text-transform: uppercase !important; }
            .italic { font-style: italic !important; }
            .font-mono { font-family: monospace !important; }
            .tracking-wider { letter-spacing: 0.05em !important; }
            .tracking-wide { letter-spacing: 0.025em !important; }
            .relative { position: relative !important; }
            .absolute { position: absolute !important; }
            .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
            .w-12 { width: 48px !important; } .h-12 { height: 48px !important; }
            .w-36 { width: 144px !important; } .h-14 { height: 56px !important; }
            .w-8 { width: 32px !important; } .h-8 { height: 32px !important; }
            .w-3 { width: 12px !important; } .h-3 { height: 12px !important; }
            .w-4 { width: 16px !important; } .h-4 { height: 16px !important; }
            .w-full { width: 100% !important; }
            .shrink-0 { flex-shrink: 0 !important; }
            .flex-1 { flex: 1 1 0% !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .overflow-hidden { overflow: hidden !important; }
            .opacity-5 { opacity: 0.05 !important; }
            .opacity-60 { opacity: 0.6 !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .space-y-4 > * + * { margin-top: 16px !important; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 200);
  };

  const activeConfig: ReceiptConfig = config || {
    paperSize: 'RECTANGULAR_SLIP_DL',
    layoutType: 'SINGLE_SLIP',
    customWidthMm: 210,
    customHeightMm: 99,
    headerTitle: 'RÉPUBLIQUE DU CAMEROUN',
    headerSubtitle: "MINISTÈRE DE L'ENSEIGNEMENT SECONDAIRE",
    motto: 'Paix - Travail - Patrie',
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg">Impression & Téléchargement du Reçu</h3>
          </div>
          <button
            onClick={onClose}
            disabled={downloading}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Progress Banner during download */}
        {downloading && (
          <div className="bg-blue-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner animate-pulse">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Génération du reçu PDF haute résolution en cours...</span>
            </div>
            <span className="font-mono text-[10px] bg-blue-700/80 px-2 py-0.5 rounded">PDF 300 DPI</span>
          </div>
        )}

        {/* Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fichier PDF généré et téléchargé dans vos dossiers !</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-3 sm:p-6 space-y-4 max-h-[72vh] overflow-auto touch-pan-x touch-pan-y custom-scrollbar">
          {loadingConfig ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Chargement du modèle de reçu...</span>
            </div>
          ) : (
            <div id="printable-receipt-area" className="print-section bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-auto touch-pan-x touch-pan-y custom-scrollbar">
              <ReceiptPreviewCard
                config={activeConfig}
                schoolName={institution?.name}
                logoUrl={institution?.logoUrl}
                transaction={transaction}
                student={student}
                user={user}
                interactive={false}
              />
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Fermer
          </button>

          <button
            onClick={handlePrint}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Directement</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`flex items-center gap-2 px-5 py-2 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
              downloading
                ? 'bg-blue-800 cursor-not-allowed opacity-90'
                : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-600/30'
            }`}
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Téléchargement en cours...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger le PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
