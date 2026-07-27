import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import nbLogo from '../assets/logo.png';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

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

const formatPeriod = (start: any, end: any) => {
    if (start && end) return `${formatDisplayDate(start)} au ${formatDisplayDate(end)}`;
    if (end) return `Avant le ${formatDisplayDate(end)}`;
    if (start) return `Depuis le ${formatDisplayDate(start)}`;
    return '-';
};

export const generateReceipt = async (tx: any, inst: any, user: any, isGlobal: boolean = false, group: any = null) => {
    const downloadToast = toast.loading("Génération du reçu sécurisé A5...");
    try {
        const doc = new jsPDF('p', 'mm', 'a5'); // A5 format
        const s = (val: number) => val * (148.5 / 210); // scale factor from A4 to A5

        const schoolName = inst.enrollment?.classe?.institution?.name || user?.institution?.name || "ÉTABLISSEMENT SCOLAIRE";
        const institutionId = inst.enrollment?.classe?.institution?.id || user?.institution?.id;
        const logoUrl = inst.enrollment?.classe?.institution?.logoUrl || user?.institution?.logoUrl;
        
        let secretariatName = "La Direction";
        if (institutionId) {
            try {
                const staffRes = await api.get(`/institutions/${institutionId}/staff`);
                const secretariat = staffRes.data.find((s: any) => s.role === 'SECRETARIAT');
                if (secretariat) {
                    secretariatName = `${secretariat.firstName} ${secretariat.lastName}`;
                }
            } catch (e) {
                console.error("Could not fetch staff", e);
            }
        }

        const bgColor = [240, 248, 255];
        const headerColor = [37, 99, 235];

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.rect(0, 0, 148.5, 210, 'F');

        doc.setFontSize(s(50));
        doc.setTextColor(bgColor[0] - 15, bgColor[1] - 15, bgColor[2] - 15);
        doc.setFont('helvetica', 'bold');
        for(let i=0; i<6; i++) {
            doc.text(schoolName.toUpperCase(), 148.5 / 2, s(40 + (i * 45)), { align: 'center', angle: 45 });
        }

        doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.setLineWidth(s(1.5));
        doc.rect(s(5), s(5), s(200), s(287));
        doc.setLineWidth(s(0.3));
        doc.rect(s(7), s(7), s(196), s(283));

        doc.setFontSize(s(4));
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        let microText = "";
        for(let i=0; i<25; i++) microText += "DOCUMENT AUTHENTIQUE SÉCURISÉ - ";
        doc.text(microText, s(10), s(9));
        doc.text(microText, s(10), s(289));

        const suffix = schoolName.substring(0, 3).toUpperCase().padEnd(3, 'X');
        const dateStr = new Date(tx?.transactionDate || Date.now()).getTime().toString().slice(-8);
        const idStr = isGlobal ? 'GLOBAL' : tx?.id?.toString().padStart(5, '0');
        const reference = `REC${dateStr}${idStr}${suffix}`.substring(0, 19);
        
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(s(10), s(15), s(190), s(35), 'F');
        
        if (logoUrl) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';
                const fullLogoUrl = logoUrl.startsWith('http') ? logoUrl : `${baseUrl}${logoUrl}`;
                const img = await loadImage(fullLogoUrl);
                doc.addImage(img, 'PNG', s(15), s(17), s(30), s(30));
            } catch (e) {
                console.error("Could not load school logo", e);
            }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(s(22));
        doc.setFont('helvetica', 'bold');
        doc.text(isGlobal ? "REÇU GLOBAL SÉCURISÉ" : "REÇU DE PAIEMENT SÉCURISÉ", 148.5 / 2, s(28), { align: 'center' });
        
        doc.setFontSize(s(10));
        doc.setFont('helvetica', 'normal');
        doc.text(schoolName.toUpperCase(), 148.5 / 2, s(42), { align: 'center' });
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(s(10));
        doc.setFont('helvetica', 'bold');
        doc.text("INFORMATIONS DU PARENT", s(15), s(65));
        doc.setFont('helvetica', 'normal');
        doc.text(`Nom : ${user?.firstName || ''} ${user?.lastName || ''}`, s(15), s(72));
        doc.text(`Email : ${user?.email || 'N/A'}`, s(15), s(78));
        
        doc.setFont('helvetica', 'bold');
        doc.text("INFORMATIONS DE L'ÉLÈVE", s(15), s(90));
        doc.setFont('helvetica', 'normal');
        doc.text(`Matricule : ${inst.enrollment?.student?.studentIdNumber || 'N/A'}`, s(15), s(97));
        doc.text(`Nom : ${inst.enrollment?.student?.firstName || ''} ${inst.enrollment?.student?.lastName || ''}`, s(15), s(103));
        doc.text(`Classe : ${inst.enrollment?.classe?.name || 'N/A'}`, s(15), s(109));
        
        doc.setFont('helvetica', 'bold');
        doc.text("DÉTAILS DU REÇU", s(120), s(65));
        doc.setFont('helvetica', 'normal');
        doc.text(`Référence : ${reference}`, s(120), s(72));
        doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, s(120), s(78));
        doc.text(`Type : ${isGlobal ? 'Paiement Intégral' : "Paiement d'acompte/frais"}`, s(120), s(84));
        
        let tableBody = [];
        if (isGlobal && group) {
            tableBody = group.installments.map((i: any) => [
                i.feeType?.name || 'Frais de scolarité',
                formatPeriod(i.startDate, i.dueDate),
                `${i.paidAmount} FCFA`
            ]);
        } else {
            tableBody = [[
                inst.feeType?.name || 'Frais de scolarité',
                formatPeriod(inst.startDate, inst.dueDate),
                `${tx?.amount || 0} FCFA`
            ]];
        }

        autoTable(doc, {
            startY: s(120),
            head: [['Désignation', 'Période', 'Montant Payé']],
            body: tableBody,
            headStyles: { fillColor: headerColor as [number, number, number], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            styles: { fontSize: s(10), cellPadding: s(6), fillColor: [250, 250, 250] },
            margin: { left: s(15), right: s(15) }
        });
        
        const finalY = (doc as any).lastAutoTable.finalY || s(140);
        doc.setFontSize(s(14));
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        
        const totalToDisplay = isGlobal 
            ? (group?.totalPaid !== undefined ? group.totalPaid : group?.installments?.reduce((sum: number, i: any) => sum + (i.paidAmount || 0), 0))
            : tx?.amount;
            
        doc.text(`Total Payé : ${totalToDisplay} FCFA`, s(195), finalY + s(15), { align: 'right' });

        doc.setDrawColor(220, 38, 38);
        doc.setLineWidth(s(0.5));
        doc.roundedRect(s(15), finalY + s(25), s(60), s(25), s(2), s(2));
        
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(s(8));
        doc.setFont('helvetica', 'bold');
        doc.text("CACHET DU SECRÉTARIAT", s(45), finalY + s(30), { align: 'center' });
        
        doc.setFontSize(s(6));
        doc.setFont('helvetica', 'normal');
        let truncatedSchoolName = schoolName.length > 35 ? schoolName.substring(0, 32) + "..." : schoolName;
        doc.text(truncatedSchoolName.toUpperCase(), s(45), finalY + s(34), { align: 'center' });
        
        doc.setLineWidth(s(0.2));
        doc.line(s(20), finalY + s(36), s(70), finalY + s(36));

        doc.setTextColor(37, 99, 235);
        doc.setFontSize(s(20));
        doc.setFont('helvetica', 'italic');
        doc.text(secretariatName, s(45), finalY + s(46), { align: 'center', angle: -8 });

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(s(7));
        doc.setFont('helvetica', 'normal');
        doc.text(`Validé par : ${secretariatName}`, s(45), finalY + s(54), { align: 'center' });

        doc.setFillColor(15, 23, 42);
        doc.rect(s(130), finalY + s(30), s(65), s(22), 'F');
        
        try {
            const nbLogoImg = await loadImage(nbLogo);
            // Add a white background behind the logo for contrast against the dark background
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(s(131), finalY + s(33), s(16), s(16), s(2), s(2), 'F');
            doc.addImage(nbLogoImg, 'PNG', s(132), finalY + s(34), s(14), s(14));
        } catch (e) {
            console.error("Could not load ACADEMIA CONNECT logo", e);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(s(7));
        doc.setFont('helvetica', 'normal');
        doc.text("SYSTÈME SÉCURISÉ PAR", s(172), finalY + s(38), { align: 'center' });
        doc.setFontSize(s(10));
        doc.setFont('helvetica', 'bold');
        doc.text("ACADEMIA CONNECT", s(172), finalY + s(44), { align: 'center' });
        doc.setFontSize(s(6));
        doc.setTextColor(148, 163, 184);
        doc.text("TECHNOLOGIE D'INFALSIFICATION", s(172), finalY + s(49), { align: 'center' });

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(s(8));
        doc.setFont('helvetica', 'italic');
        doc.text("Merci pour votre paiement. Conservez ce reçu précieusement en cas de réclamation.", 148.5 / 2, s(275), { align: 'center' });
        doc.text(`Document généré le ${new Date().toLocaleString('fr-FR')} - Validité garantie numériquement.`, 148.5 / 2, s(280), { align: 'center' });
        
        doc.save(`Recu_${reference}.pdf`);
        toast.dismiss(downloadToast);
        toast.success("Reçu A5 téléchargé avec succès !");
    } catch (err) {
        console.error("Error generating receipt PDF", err);
        toast.dismiss(downloadToast);
        toast.error("Erreur lors de la génération du reçu");
    }
};
