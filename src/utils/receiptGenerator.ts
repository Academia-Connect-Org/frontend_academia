import React from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import type { ReceiptConfig } from '../types/receiptConfig';
import { ReceiptPreviewCard } from '../components/dashboard/finance/ReceiptPreviewCard';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const formatDisplayDate = (date: any) => {
  if (!date) return '-';
  if (Array.isArray(date)) {
    const [year, month, day] = date;
    return new Date(year, month - 1, day).toLocaleDateString('fr-FR');
  }
  return new Date(date).toLocaleDateString('fr-FR');
};

export const generateReceipt = async (
  tx: any,
  inst: any,
  user: any,
  isGlobal: boolean = false,
  group: any = null,
  configProp?: ReceiptConfig | null
): Promise<boolean> => {
  const downloadToast = toast.loading("Génération du reçu PDF haute résolution...");
  let tempDiv: HTMLElement | null = null;
  let root: any = null;

  try {
    const institutionId =
      inst?.enrollment?.classe?.institution?.id ||
      inst?.institution?.id ||
      user?.institution?.id;

    // Load saved config if not passed directly
    let activeConfig: ReceiptConfig = configProp || {
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

    if (!configProp && institutionId) {
      try {
        const configRes = await api.get(`/institutions/${institutionId}/receipt-config`);
        if (configRes.data) {
          activeConfig = { ...activeConfig, ...configRes.data };
        }
      } catch (err) {
        console.warn("Could not fetch institution receipt config, using defaults", err);
      }
    }

    // Determine Paper Size & Orientation
    let baseWidth = 210;
    let baseHeight = 99;

    if (activeConfig.paperSize === 'THERMAL_80MM') {
      baseWidth = 80;
      baseHeight = 200;
    } else if (activeConfig.paperSize === 'LANDSCAPE_A5') {
      baseWidth = 210;
      baseHeight = 148.5;
    } else if (activeConfig.paperSize === 'PORTRAIT_A5') {
      baseWidth = 148.5;
      baseHeight = 210;
    } else if (activeConfig.paperSize === 'CUSTOM' && activeConfig.customWidthMm && activeConfig.customHeightMm) {
      baseWidth = activeConfig.customWidthMm;
      baseHeight = activeConfig.customHeightMm;
    }

    const isDual = activeConfig.layoutType === 'DUAL_SLIP';
    const totalPdfHeight = isDual ? baseHeight * 2 : baseHeight;
    const isLandscape = baseWidth >= totalPdfHeight;

    // Create an isolated container for rendering the receipt card
    tempDiv = document.createElement('div');
    tempDiv.id = 'temp-pdf-render-area';
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = `${baseWidth * 3.7795275591}px`; // Convert mm to px at 96 DPI
    tempDiv.style.backgroundColor = '#FFFFFF';
    tempDiv.style.zIndex = '-9999';
    tempDiv.style.padding = '12px';
    document.body.appendChild(tempDiv);

    const schoolName =
      inst?.enrollment?.classe?.institution?.name ||
      inst?.institution?.name ||
      user?.institution?.name ||
      "COLLÈGE BILINGUE EXCELLENCE";

    const logoUrl =
      inst?.enrollment?.classe?.institution?.logoUrl ||
      inst?.institution?.logoUrl ||
      user?.institution?.logoUrl;

    root = createRoot(tempDiv);
    root.render(
      React.createElement(ReceiptPreviewCard, {
        config: activeConfig,
        schoolName,
        logoUrl,
        transaction: tx,
        student: inst,
        user,
        interactive: false,
      })
    );

    // Wait 250ms for React rendering and layout calculation
    await new Promise((res) => setTimeout(res, 250));

    // Capture using html2canvas with Proxy getComputedStyle interceptor
    const canvas = await html2canvas(tempDiv, {
      scale: 2.5, // 2.5x crisp DPI rendering
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      onclone: (clonedDoc) => {
        // Intercept getComputedStyle in cloned window so oklch/oklab color values are automatically converted to standard rgb strings
        if (clonedDoc.defaultView) {
          const win = clonedDoc.defaultView;
          const origGetComputedStyle = win.getComputedStyle;

          win.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
            const style = origGetComputedStyle.call(win, el, pseudoElt);
            return new Proxy(style, {
              get(target: any, prop: string | symbol) {
                const val = target[prop];
                if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                  const pStr = String(prop).toLowerCase();
                  if (pStr.includes('background')) return 'rgb(255, 255, 255)';
                  if (pStr.includes('border')) return 'rgb(203, 213, 225)';
                  return 'rgb(30, 41, 59)';
                }
                return typeof val === 'function' ? val.bind(target) : val;
              },
            });
          } as any;
        }

        // Strip all external & Vite CSSOM style tags containing Tailwind v4 oklab/oklch rules
        const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach((s) => s.remove());

        // Inject clean, standard CSS layout rules for html2canvas
        const cleanStyle = clonedDoc.createElement('style');
        cleanStyle.textContent = `
          * { box-sizing: border-box; margin: 0; padding: 0; }
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
          .mt-0\.5 { margin-top: 2px !important; }
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
          .pointer-events-none { pointer-events: none !important; }
          .space-y-1 > * + * { margin-top: 4px !important; }
          .space-y-4 > * + * { margin-top: 16px !important; }
        `;
        clonedDoc.head.appendChild(cleanStyle);
      },
    });

    const imgData = canvas.toDataURL('image/png');

    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [baseWidth, totalPdfHeight],
    });

    doc.addImage(imgData, 'PNG', 0, 0, baseWidth, totalPdfHeight);

    const refStr = tx?.reference || tx?.id || Date.now();
    doc.save(`Recu_${refStr}.pdf`);

    toast.dismiss(downloadToast);
    toast.success("Reçu téléchargé avec succès en PDF !");
    return true;
  } catch (err) {
    console.error("Error generating receipt PDF", err);
    toast.dismiss(downloadToast);
    toast.error("Erreur lors du téléchargement du PDF.");
    return false;
  } finally {
    if (root) {
      try {
        root.unmount();
      } catch (e) {
        // ignore unmount errors
      }
    }
    if (tempDiv && document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};
