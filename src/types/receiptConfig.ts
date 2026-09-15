export interface ReceiptConfig {
  id?: number;
  institutionId?: number;
  paperSize: 'RECTANGULAR_SLIP_DL' | 'THERMAL_80MM' | 'LANDSCAPE_A5' | 'PORTRAIT_A5' | 'CUSTOM';
  layoutType: 'SINGLE_SLIP' | 'DUAL_SLIP';
  customWidthMm: number;
  customHeightMm: number;
  headerTitle: string;
  headerSubtitle: string;
  motto: string;
  schoolHeaderDetails?: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  showLogo: boolean;
  showWatermark: boolean;
  watermarkText: string;
  showQrCode: boolean;
  showStampBox: boolean;
  showStudentPhoto: boolean;
  showCumulativeBalance: boolean;
  showPaymentMethod: boolean;
  signatureTitle: string;
  footerNote: string;
}
