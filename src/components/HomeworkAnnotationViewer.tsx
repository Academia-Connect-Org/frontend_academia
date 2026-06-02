import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, Save, Undo, Trash, Plus, Minus } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface StrokePoint {
    x: number;
    y: number;
}

interface Stroke {
    points: StrokePoint[];
    color: string;
    width: number;
}

interface PageAnnotations {
    strokes: Stroke[];
}

interface HomeworkAnnotationViewerProps {
    fileUrl: string;
    initialAnnotations?: string; // JSON string
    onSave?: (annotations: string) => void;
    onClose: () => void;
    readOnly?: boolean;
}

const AnnotatableCanvas = ({
    width,
    height,
    initialStrokes,
    onStrokesChange,
    readOnly
}: {
    width: number;
    height: number;
    initialStrokes: Stroke[];
    onStrokesChange?: (strokes: Stroke[]) => void;
    readOnly?: boolean;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [cursorPos, setCursorPos] = useState<StrokePoint | null>(null);

    // Render all strokes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        const allStrokes = [...initialStrokes, ...(currentStroke ? [currentStroke] : [])];

        allStrokes.forEach(stroke => {
            if (stroke.points.length === 0) return;

            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;

            ctx.moveTo(stroke.points[0].x * width, stroke.points[0].y * height);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * width, stroke.points[i].y * height);
            }
            ctx.stroke();
        });
    }, [initialStrokes, currentStroke, width, height]);

    const getMousePos = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches[0]) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height
        };
    };

    const handlePointerDown = (e: any) => {
        if (readOnly) return;
        setIsDrawing(true);
        const pos = getMousePos(e);
        setCurrentStroke({
            points: [pos],
            color: '#FF0000', // Solid vibrant red
            width: 4 // slightly thicker
        });
    };

    const handlePointerMove = (e: any) => {
        const pos = getMousePos(e);
        setCursorPos(pos);
        if (!isDrawing || !currentStroke || readOnly) return;
        setCurrentStroke(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                points: [...prev.points, pos]
            };
        });
    };

    const handlePointerUp = () => {
        if (!isDrawing || readOnly) return;
        setIsDrawing(false);
        if (currentStroke && onStrokesChange) {
            onStrokesChange([...initialStrokes, currentStroke]);
        }
        setCurrentStroke(null);
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: readOnly ? 'none' : 'auto'
            }}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={() => { handlePointerUp(); setCursorPos(null); }}
                onTouchStart={(e) => { e.preventDefault(); handlePointerDown(e); }}
                onTouchMove={(e) => { e.preventDefault(); handlePointerMove(e); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePointerUp(); }}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    cursor: readOnly ? 'default' : 'none',
                    touchAction: readOnly ? 'auto' : 'none',
                    pointerEvents: readOnly ? 'none' : 'auto'
                }}
            />
            {/* Custom Pen Cursor */}
            {!readOnly && cursorPos && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${cursorPos.x * 100}%`,
                        top: `${cursorPos.y * 100}%`,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 0, 0, 0.3)',
                        border: '2px solid red',
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 100
                    }}
                />
            )}
        </div>
    );
};

const PdfPageWithAnnotations = ({
    pageNumber,
    pageKey,
    strokes,
    onStrokesChange,
    readOnly,
    handleUndo,
    handleClear,
    scale
}: {
    pageNumber: number;
    pageKey: string;
    strokes: Stroke[];
    onStrokesChange: (strokes: Stroke[]) => void;
    readOnly?: boolean;
    handleUndo: (key: string) => void;
    handleClear: (key: string) => void;
    scale: number;
}) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const onRenderSuccess = () => {
        if (containerRef.current) {
            const canvas = containerRef.current.querySelector('canvas');
            if (canvas) {
                setDimensions({
                    width: canvas.offsetWidth,
                    height: canvas.offsetHeight
                });
            }
        }
    };

    return (
        <div ref={containerRef} className="relative bg-white shadow-2xl mb-8 mx-auto w-fit custom-pdf-page">
            {!readOnly && (
                <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-60 hover:opacity-100 transition-opacity">
                    <button onClick={() => handleUndo(pageKey)} className="p-1.5 bg-white rounded-md shadow text-slate-600 hover:text-blue-600" title="Annuler le dernier trait">
                        <Undo size={14} />
                    </button>
                    <button onClick={() => handleClear(pageKey)} className="p-1.5 bg-white rounded-md shadow text-slate-600 hover:text-red-600" title="Tout effacer">
                        <Trash size={14} />
                    </button>
                </div>
            )}
            <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={Math.min(window.innerWidth - 100, 1000) * scale}
                onRenderSuccess={onRenderSuccess}
            />
            {dimensions.height > 0 && (
                <AnnotatableCanvas
                    width={dimensions.width}
                    height={dimensions.height}
                    initialStrokes={strokes}
                    onStrokesChange={onStrokesChange}
                    readOnly={readOnly}
                />
            )}
        </div>
    );
};

const HomeworkAnnotationViewer: React.FC<HomeworkAnnotationViewerProps> = ({ fileUrl, initialAnnotations, onSave, onClose, readOnly }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [annotations, setAnnotations] = useState<Record<string, PageAnnotations>>({});
    const [imageSize, setImageSize] = useState<{ width: number, height: number } | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [scale, setScale] = useState(1.0);

    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

    useEffect(() => {
        if (initialAnnotations) {
            try {
                const parsed = JSON.parse(initialAnnotations);
                console.log("[Web Viewer] Loading annotations for:", fileUrl);

                if (parsed[fileUrl]) {
                    setAnnotations(parsed[fileUrl]);
                    console.log("[Web Viewer] Exact match found");
                } else {
                    // Try robust matching by filename (handles absolute vs relative URLs)
                    const cleanFileName = (url: string) => {
                        try {
                            return decodeURIComponent(url.split('/').pop()?.split('?')[0] || '').toLowerCase();
                        } catch (e) {
                            return url.toLowerCase();
                        }
                    };
                    const targetName = cleanFileName(fileUrl);
                    const matchedKey = Object.keys(parsed).find(key => cleanFileName(key) === targetName);

                    if (matchedKey) {
                        setAnnotations(parsed[matchedKey]);
                        console.log("[Web Viewer] Match found by filename:", matchedKey);
                    } else {
                        console.warn("[Web Viewer] No annotations found for:", targetName);
                    }
                }
            } catch (e) {
                console.error("Failed to parse annotations", e);
            }
        }
    }, [initialAnnotations, fileUrl]);

    const handleStrokesChange = (pageOrImageKey: string, strokes: Stroke[]) => {
        setAnnotations(prev => ({
            ...prev,
            [pageOrImageKey]: { strokes }
        }));
        setHasUnsavedChanges(true);
    };

    const handleUndo = (pageOrImageKey: string) => {
        setAnnotations(prev => {
            const pageAnns = prev[pageOrImageKey] || { strokes: [] };
            return {
                ...prev,
                [pageOrImageKey]: {
                    ...pageAnns,
                    strokes: pageAnns.strokes.slice(0, -1)
                }
            };
        });
        setHasUnsavedChanges(true);
    };

    const handleClear = (pageOrImageKey: string) => {
        setAnnotations(prev => ({
            ...prev,
            [pageOrImageKey]: { strokes: [] }
        }));
        setHasUnsavedChanges(true);
    };

    const handleSaveClick = () => {
        if (onSave) {
            let fullAnnotations: Record<string, any> = {};
            if (initialAnnotations) {
                try {
                    fullAnnotations = JSON.parse(initialAnnotations);
                } catch (e) { }
            }
            fullAnnotations[fileUrl] = annotations;
            onSave(JSON.stringify(fullAnnotations));
            setHasUnsavedChanges(false);
        }
    };

    const handleClose = () => {
        if (!readOnly && hasUnsavedChanges) {
            if (window.confirm("Vous avez des modifications non enregistrées (les traces du stylo). Voulez-vous vraiment fermer sans enregistrer ?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col h-screen w-screen animate-in fade-in duration-200">
            {/* Header Toolbar */}
            <div className="bg-white px-8 py-4 flex justify-between items-center shadow-2xl shrink-0 border-b border-slate-100">
                <div className="flex items-center gap-6">
                    <div>
                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight truncate max-w-sm">
                            {fileUrl.split('/').pop()}
                        </h3>
                        {!readOnly ? (
                            <div className="flex items-center gap-4 mt-1">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-red-600">Correction Active</span>
                                </div>
                                <div className="h-3 w-px bg-slate-200"></div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setScale(prev => Math.max(prev - 0.5, 0.5))} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors cursor-pointer"><Minus size={14} /></button>
                                    <span className="text-[9px] font-black text-slate-500 min-w-[28px] text-center">{Math.round(scale * 100)}%</span>
                                    <button onClick={() => setScale(prev => Math.min(prev + 0.5, 3.0))} className="p-1 hover:bg-slate-100 rounded text-blue-500 transition-colors cursor-pointer"><Plus size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600">Consultation des Traces</span>
                                <div className="h-3 w-px bg-slate-200"></div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setScale(prev => Math.max(prev - 0.5, 0.5))} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors cursor-pointer"><Minus size={14} /></button>
                                    <span className="text-[9px] font-black text-slate-500 min-w-[28px] text-center">{Math.round(scale * 100)}%</span>
                                    <button onClick={() => setScale(prev => Math.min(prev + 0.5, 3.0))} className="p-1 hover:bg-slate-100 rounded text-blue-500 transition-colors cursor-pointer"><Plus size={14} /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {!readOnly && (
                        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl mr-4">
                            <div className="px-4 py-2 bg-white rounded-xl shadow-sm flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
                                <span className="text-[10px] font-black uppercase text-slate-700">Stylo</span>
                            </div>
                        </div>
                    )}

                    {!readOnly && (
                        <button onClick={handleSaveClick} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/30 active:scale-95">
                            <Save size={18} /> Enregistrer
                        </button>
                    )}
                    <button onClick={handleClose} className="p-3.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-2xl transition-all border border-slate-100 active:scale-90">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-auto bg-slate-800 relative scroll-smooth">
                <div className="min-h-full w-full flex flex-col items-center p-10">
                    {isPdf ? (
                        <div className="flex flex-col gap-10 min-w-max">
                            <Document
                                file={fileUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={<div className="text-white font-black animate-pulse flex flex-col items-center gap-4 mt-20"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Chargement du document...</div>}
                                error={<div className="text-white font-black bg-rose-500/10 p-10 rounded-3xl border border-rose-500/20">Oups ! Erreur lors du chargement du PDF.</div>}
                            >
                                {Array.from(new Array(numPages), (_, index) => {
                                    const pageKey = `page-${index + 1}`;
                                    return (
                                        <PdfPageWithAnnotations
                                            key={index}
                                            pageNumber={index + 1}
                                            pageKey={pageKey}
                                            strokes={annotations[pageKey]?.strokes || []}
                                            onStrokesChange={(s) => handleStrokesChange(pageKey, s)}
                                            readOnly={readOnly}
                                            handleUndo={handleUndo}
                                            handleClear={handleClear}
                                            scale={scale}
                                        />
                                    );
                                })}
                            </Document>
                        </div>
                    ) : (
                        <div
                            className="bg-white shadow-3xl inline-block rounded-sm overflow-hidden min-w-max relative"
                            style={{ width: imageSize ? `${imageSize.width * scale}px` : 'auto', height: 'fit-content' }}
                        >
                            {!readOnly && (
                                <div className="absolute top-6 right-6 flex gap-3 z-10 opacity-70 hover:opacity-100 transition-opacity bg-white/90 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md border border-white/50">
                                    <button onClick={() => handleUndo('image')} className="p-2.5 bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-all font-black text-[10px] uppercase gap-2 flex items-center">
                                        <Undo size={16} /> Annuler
                                    </button>
                                    <button onClick={() => handleClear('image')} className="p-2.5 bg-white rounded-xl shadow-sm text-slate-700 hover:text-red-600 transition-all font-black text-[10px] uppercase gap-2 flex items-center border border-slate-50">
                                        <Trash size={16} /> Effacer tout
                                    </button>
                                </div>
                            )}
                            <img
                                src={fileUrl}
                                alt="Soumission"
                                className="w-full h-auto block"
                                onLoad={(e) => {
                                    // Default width should be responsive but we store original for scaling
                                    setImageSize({
                                        width: e.currentTarget.naturalWidth > 1000 ? 1000 : e.currentTarget.naturalWidth,
                                        height: e.currentTarget.naturalHeight
                                    });
                                }}
                            />
                            {imageSize && (
                                <AnnotatableCanvas
                                    width={imageSize.width * scale}
                                    height={(imageSize.height * (imageSize.width * scale / imageSize.width))}
                                    initialStrokes={annotations['image']?.strokes || []}
                                    onStrokesChange={(s) => handleStrokesChange('image', s)}
                                    readOnly={readOnly}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Inject small style so react-pdf page containers have relative positioning naturally */}
            <style>{`
                .custom-pdf-page { position: relative; }
                .custom-pdf-page canvas { display: block !important; margin: 0 auto; }
                .react-pdf__Page, .react-pdf__Document { 
                    max-width: none !important; 
                    min-width: none !important;
                }
                /* Ensure the container doesn't clip the zoomed content */
                .react-pdf__Page__canvas {
                    max-width: none !important;
                    height: auto !important;
                }
            `}</style>
        </div>
    );
};

export default HomeworkAnnotationViewer;
