import React, { useState } from 'react';
import { X, UploadCloud, ArrowRight, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../../api/axios';
import { useEffect } from 'react';

const TARGET_FIELDS = [
    { key: 'firstName', label: 'Prénom (Requis)' },
    { key: 'lastName', label: 'Nom (Requis)' },
    { key: 'gender', label: 'Genre (M/F)' },
    { key: 'birthDate', label: 'Date Naissance (YYYY-MM-DD)' },
    { key: 'studentIdNumber', label: 'Matricule' },
    { key: 'address', label: 'Adresse' },
    { key: 'phone', label: 'Téléphone Élève' },
    { key: 'email', label: 'Email Élève' },
    { key: 'motherFirstName', label: 'Prénom Mère' },
    { key: 'motherLastName', label: 'Nom Mère' },
    { key: 'motherPhone', label: 'Tél Mère' },
    { key: 'fatherFirstName', label: 'Prénom Père' },
    { key: 'fatherLastName', label: 'Nom Père' },
    { key: 'fatherPhone', label: 'Tél Père' },
];

const normalizeDate = (dateVal: any): string => {
    if (dateVal === undefined || dateVal === null || dateVal === '') return '';
    
    if (typeof dateVal === 'number' || (typeof dateVal === 'string' && !isNaN(Number(dateVal)) && Number(dateVal) > 10000 && !dateVal.includes('-') && !dateVal.includes('/') && !dateVal.includes('.'))) {
        const serial = Number(dateVal);
        const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    }
    
    let str = String(dateVal).trim();
    
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(str)) {
        const parts = str.split(/[-/.]/);
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    
    if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(str)) {
        const parts = str.split(/[-/.]/);
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    
    return str;
};

interface CsvImporterModalProps {
    onClose: () => void;
    onSuccess: () => void;
    institutionId?: number;
    classeId?: number;
}

const CsvImporterModal: React.FC<CsvImporterModalProps> = ({ onClose, onSuccess, institutionId, classeId }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [fileHeaders, setFileHeaders] = useState<string[]>([]);
    const [fileData, setFileData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [institutions, setInstitutions] = useState<any[]>([]);
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | undefined>(institutionId);
    const [selectedClasseId, setSelectedClasseId] = useState<number | undefined>(classeId);

    useEffect(() => {
        if (!institutionId) {
            api.get('/institutions')
               .then(res => setInstitutions(res.data))
               .catch(err => console.error("Error fetching institutions", err));
        }
    }, [institutionId]);

    useEffect(() => {
        const targetInst = institutionId || selectedInstitutionId;
        if (targetInst) {
            api.get(`/classes?institutionId=${targetInst}`)
               .then(res => setClasses(res.data))
               .catch(err => console.error("Error fetching classes", err));
        } else {
            setClasses([]);
        }
    }, [institutionId, selectedInstitutionId]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                let wb;
                if (file.name.toLowerCase().endsWith('.csv')) {
                    const text = evt.target?.result;
                    wb = XLSX.read(text, { type: 'string' });
                } else {
                    const buffer = evt.target?.result;
                    wb = XLSX.read(buffer, { type: 'array' });
                }
                
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
                
                if (data.length < 2) {
                    setError("Le fichier semble vide ou ne contient pas de données.");
                    return;
                }

                const headers = data[0].map(h => String(h).trim());
                const rows = data.slice(1).filter(row => row.length > 0 && row.some(cell => cell));

                const mappedData = rows.map(row => {
                    let obj: any = {};
                    headers.forEach((h, i) => {
                        obj[h] = row[i];
                    });
                    return obj;
                });

                setFileHeaders(headers);
                setFileData(mappedData);
                
                // Auto-map based on similar names
                const autoMap: Record<string, string> = {};
                TARGET_FIELDS.forEach(tf => {
                    const match = headers.find(h => h.toLowerCase().includes(tf.key.toLowerCase()) || tf.label.toLowerCase().includes(h.toLowerCase()));
                    if (match) {
                        autoMap[tf.key] = match;
                    }
                });
                setMapping(autoMap);

                setStep(2);
                setError(null);
            } catch (err) {
                setError("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier CSV ou Excel valide.");
            }
        };
        
        if (file.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    const handleMappingChange = (targetKey: string, fileHeader: string) => {
        setMapping(prev => ({
            ...prev,
            [targetKey]: fileHeader
        }));
    };

    const getPreviewData = () => {
        return fileData.slice(0, 3).map(row => {
            const newObj: any = {};
            Object.keys(mapping).forEach(targetKey => {
                const fileHeader = mapping[targetKey];
                if (fileHeader && row[fileHeader] !== undefined) {
                    let val = row[fileHeader];
                    if (targetKey === 'birthDate') {
                        val = normalizeDate(val);
                    }
                    newObj[targetKey] = String(val);
                }
            });
            return newObj;
        });
    };

    const handleSubmit = async () => {
        const targetInstitutionId = institutionId || selectedInstitutionId;
        if (!targetInstitutionId || (!classeId && !selectedClasseId)) {
            setError("L'institution et la classe cible doivent être définies.");
            return;
        }

        const targetClasseId = classeId || selectedClasseId;

        const finalPayload = fileData.map(row => {
            const student: any = {
                institutionId: targetInstitutionId,
                classeId: targetClasseId
            };
            Object.keys(mapping).forEach(targetKey => {
                const fileHeader = mapping[targetKey];
                if (fileHeader && row[fileHeader] !== undefined) {
                    let val = row[fileHeader];
                    if (targetKey === 'birthDate') {
                        val = normalizeDate(val);
                    }
                    student[targetKey] = String(val);
                }
            });
            return student;
        }).filter(s => s.firstName && s.lastName); // Ensure required fields exist

        if (finalPayload.length === 0) {
            setError("Aucun étudiant valide trouvé après le mapping. Vérifiez Prénom et Nom.");
            return;
        }

        try {
            setLoading(true);
            const targetInst = institutionId || selectedInstitutionId;
            await api.post('/students/enroll/bulk', {
                institutionId: targetInst,
                students: finalPayload
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de l'importation");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2">
            <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-none shadow-2xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Importer depuis CSV / Excel</h2>
                        <p className="text-slate-500 text-sm mt-1">Étape {step} sur 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-none transition-all hover:bg-red-50 border-0">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-none flex items-center gap-2 font-bold text-sm shrink-0 border-0">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {step === 1 && (
                        <div className="h-full flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-none border-0">
                            <FileSpreadsheet size={56} className="text-indigo-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 mb-1">Sélectionnez votre fichier</h3>
                            <p className="text-slate-500 mb-6 text-sm text-center max-w-md">Formats supportés: .csv, .xlsx, .xls.<br />La première ligne doit contenir les en-têtes de colonnes.</p>
                            
                            {!institutionId && (
                                <div className="mb-4 w-full max-w-md">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-center">Sélectionnez l'établissement cible</label>
                                    <select
                                        value={selectedInstitutionId || ''}
                                        onChange={(e) => {
                                            setSelectedInstitutionId(Number(e.target.value));
                                            setSelectedClasseId(undefined);
                                        }}
                                        className="w-full px-4 py-2.5 bg-slate-100 rounded-none text-sm font-bold text-slate-700 outline-none focus:bg-slate-200 text-center border-0"
                                    >
                                        <option value="">-- Choisir un établissement --</option>
                                        {institutions.map(inst => (
                                            <option key={inst.id} value={inst.id}>{inst.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {!classeId && (
                                <div className="mb-6 w-full max-w-md">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block text-center">Sélectionnez la classe cible</label>
                                    <select
                                        value={selectedClasseId || ''}
                                        onChange={(e) => setSelectedClasseId(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 bg-slate-100 rounded-none text-sm font-bold text-slate-700 outline-none focus:bg-slate-200 text-center border-0"
                                    >
                                        <option value="">-- Choisir une classe --</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.cycle?.name})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <label className={`bg-indigo-600 text-white px-6 py-3 rounded-none font-black shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm border-0 ${(!classeId && !selectedClasseId) || (!institutionId && !selectedInstitutionId) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}`}>
                                <UploadCloud size={18} />
                                Parcourir les fichiers
                                <input type="file" accept=".csv, .xlsx, .xls" className="hidden" disabled={(!classeId && !selectedClasseId) || (!institutionId && !selectedInstitutionId)} onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-none text-sm font-bold border-0">
                                Associez les colonnes de votre fichier aux champs du système.
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {TARGET_FIELDS.map(field => (
                                    <div key={field.key} className="bg-slate-50 p-4 rounded-none flex justify-between items-center gap-4 border-0">
                                        <label className="text-xs font-bold text-slate-700 w-1/2 truncate" title={field.label}>
                                            {field.label}
                                        </label>
                                        <select
                                            className="w-1/2 p-2 rounded-none bg-slate-200 text-xs outline-none focus:bg-slate-300 border-0"
                                            value={mapping[field.key] || ''}
                                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                        >
                                            <option value="">Ignorer</option>
                                            {fileHeaders.map(h => (
                                                <option key={h} value={h}>{h}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-none text-sm font-bold flex items-center gap-2 border-0 shrink-0">
                                <CheckCircle2 size={18} />
                                {fileData.length} étudiants prêts à être importés. Voici un aperçu des 3 premiers :
                            </div>
                            <div className="flex-1 overflow-auto bg-slate-50 rounded-none border-0">
                                <table className="w-full text-left bg-white">
                                    <thead className="bg-slate-100 text-[11px] uppercase font-black text-slate-500 tracking-widest sticky top-0">
                                        <tr>
                                            {TARGET_FIELDS.filter(f => mapping[f.key]).map(f => (
                                                <th key={f.key} className="p-3 whitespace-nowrap">{f.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
                                        {getPreviewData().map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                {TARGET_FIELDS.filter(f => mapping[f.key]).map(f => (
                                                    <td key={f.key} className="p-3 whitespace-nowrap">{row[f.key] || '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t-0 shrink-0">
                    {step > 1 ? (
                        <button onClick={() => setStep((step - 1) as any)} className="px-5 py-2 font-bold text-slate-500 bg-slate-200 rounded-none hover:bg-slate-300 transition-all text-sm border-0">
                            Retour
                        </button>
                    ) : <div></div>}
                    
                    {step === 2 && (
                        <button 
                            onClick={() => {
                                if(!mapping['firstName'] || !mapping['lastName']) {
                                    setError("Prénom et Nom sont requis.");
                                    return;
                                }
                                setError(null);
                                setStep(3);
                            }} 
                            className="px-6 py-2 bg-indigo-600 text-white rounded-none font-black shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm border-0"
                        >
                            Suivant <ArrowRight size={18} />
                        </button>
                    )}
                    {step === 3 && (
                        <button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-none font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 text-sm border-0"
                        >
                            {loading ? 'Importation...' : 'Confirmer l\'importation'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CsvImporterModal;
