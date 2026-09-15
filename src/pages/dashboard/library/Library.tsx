import React, { useState, useEffect, useMemo } from 'react';
import {
    BookOpen,
    Headphones,
    Video,
    Search,
    Filter,
    Heart,
    Bookmark,
    Download,
    Sparkles,
    PlusCircle,
    Building2,
    GraduationCap,
    Star,
    Globe,
    CheckCircle2,
    X,
    Play,
    Pause,
    Volume2,
    Send,
    Bot,
    User as UserIcon,
    ArrowUpRight,
    FileText,
    Share2,
    Check,
    Layers,
    Clock,
    Upload,
    Loader2,
    FileCheck,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    AlertCircle,
    Eye,
    Trash2,
    Info,
    FolderUp,
    CheckCircle,
    XCircle,
    Copy,
    Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import api, { getFileUrl } from '../../../api/axios';

// Domain Disciplines List
const DISCIPLINES = [
    'Tous les domaines',
    'Informatique & Code',
    'Mathématiques',
    'Physique',
    'Chimie',
    'Biologie & SVT',
    'Français',
    'Grammaire & Orthographe',
    'Conjugaison',
    'Philosophie',
    'Histoire',
    'Géographie',
    'Sociologie',
    'Business & Économie',
    'Dessin & Arts',
    'Anglais',
    'Allemand',
    'Arabe',
    'Chinois',
    'Espagnol'
];

// Target Levels
const LEVELS = ['Tous niveaux', 'Primaire', 'Collège (6e-3e)', 'Lycée (2nd-Tle)', 'Supérieur / Université'];

// Languages
const LANGUAGES = ['Toutes les langues', 'Français', 'Anglais', 'Arabe', 'Allemand', 'Chinois', 'Espagnol'];

// Items per page
const ITEMS_PER_PAGE = 15;

const Library: React.FC = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
    const [pendingBooks, setPendingBooks] = useState<any[]>([]);

    const [activeFormatTab, setActiveFormatTab] = useState<'ALL' | 'PDF' | 'AUDIO' | 'VIDEO'>('ALL');
    const [selectedDiscipline, setSelectedDiscipline] = useState('Tous les domaines');
    const [selectedLevel, setSelectedLevel] = useState('Tous niveaux');
    const [selectedLanguage, setSelectedLanguage] = useState('Toutes les langues');
    const [selectedInstitution, setSelectedInstitution] = useState('Tous les établissements');
    const [selectedSort, setSelectedSort] = useState<'NEWEST' | 'POPULAR' | 'RATED' | 'TITLE'>('NEWEST');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState<'EXPLORE' | 'MY_LIBRARY' | 'ADMIN_APPROVAL'>('EXPLORE');
    const [myLibrarySubTab, setMyLibrarySubTab] = useState<'SAVED' | 'LIKED' | 'DOWNLOADED' | 'MY_SUBMISSIONS'>('MY_SUBMISSIONS');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Personal user library states
    const [likedDocIds, setLikedDocIds] = useState<number[]>([]);
    const [savedDocIds, setSavedDocIds] = useState<number[]>([]);
    const [downloadedDocIds, setDownloadedDocIds] = useState<number[]>([]);

    // Download Confirmation & State & Real-time Progress (%)
    const [confirmDownloadDoc, setConfirmDownloadDoc] = useState<any | null>(null);
    const [downloadingState, setDownloadingState] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadingDocName, setDownloadingDocName] = useState<string>('');

    // Rich Book Details Modal State (Grand Pop-up with Media Player)
    const [selectedDetailDoc, setSelectedDetailDoc] = useState<any | null>(null);

    // Active Audio Player State
    const [activeAudioDoc, setActiveAudioDoc] = useState<any | null>(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // AI Assistant Side Panel State
    const [showAiAssistant, setShowAiAssistant] = useState(false);
    const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user', text: string }>>([
        { sender: 'ai', text: `Bonjour ${user?.firstName || ''} ! Je suis votre Assistant IA ACADEMIA Library. Comment puis-je vous aider dans vos révisions ou vos recherches aujourd'hui ?` }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiThinking, setAiThinking] = useState(false);

    // Publish Document Modal & Upload State
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string>('');

    // Rejection & Deletion Popup States
    const [rejectingBook, setRejectingBook] = useState<any | null>(null);
    const [rejectionReasonInput, setRejectionReasonInput] = useState('Non conforme au programme ou fichier incomplet.');
    const [deletingBookId, setDeletingBookId] = useState<number | null>(null);

    const [publishForm, setPublishForm] = useState({
        title: '',
        author: '',
        publisherName: '',
        publicationYear: new Date().getFullYear(),
        isbn: '',
        discipline: 'Informatique & Code',
        format: 'PDF',
        language: 'Anglais',
        level: 'Supérieur / Université',
        pagesCount: 456,
        duration: '',
        description: '',
        coverUrl: '',
        fileUrl: '',
        fileSize: 0
    });

    const isStaffOrAdmin = ['APP_ADMIN', 'PDG', 'DIRECTION', 'PROVISORIAT', 'SECRETARIAT', 'ENSEIGNANT'].includes(user?.role || '');
    const isAdmin = user?.role === 'APP_ADMIN';

    const [pdgInstitutions, setPdgInstitutions] = useState<any[]>([]);
    const [selectedPublishInstId, setSelectedPublishInstId] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (user?.role === 'PDG' && user?.id) {
            api.get(`/institutions/ceo/${user.id}`)
                .then(res => {
                    if (Array.isArray(res.data) && res.data.length > 0) {
                        setPdgInstitutions(res.data);
                        setSelectedPublishInstId(res.data[0].id);
                    }
                })
                .catch(err => console.warn('Could not fetch PDG institutions', err));
        }
    }, [user?.id, user?.role]);

    const userInstName = user?.role === 'APP_ADMIN' ? 'Academia Connect' : (typeof user?.institution === 'object' ? user?.institution?.name : (user as any)?.institutionName);
    const instName = userInstName || (pdgInstitutions.length > 0 ? pdgInstitutions[0].name : 'Academia Connect');
    const userInstId = user?.role === 'APP_ADMIN' ? undefined : (selectedPublishInstId || user?.institution?.id || (pdgInstitutions.length > 0 ? pdgInstitutions[0].id : undefined));

    // Fetch books from Spring Boot backend using relative endpoints
    const loadBackendBooks = async () => {
        try {
            const resApproved = await api.get('/books');
            if (resApproved.data && Array.isArray(resApproved.data)) {
                setDocuments(resApproved.data);
            }
        } catch (err) {
            console.warn('Could not fetch public books from backend.', err);
        }

        try {
            if (user?.id) {
                const resSubmissions = await api.get('/books/my-submissions');
                if (resSubmissions.data && Array.isArray(resSubmissions.data)) {
                    setUserSubmissions(resSubmissions.data);
                }
            }
        } catch (err) {
            console.warn('Could not fetch user submissions.', err);
        }

        try {
            if (isAdmin) {
                const resPending = await api.get('/books/pending');
                if (resPending.data && Array.isArray(resPending.data)) {
                    setPendingBooks(resPending.data);
                }
            }
        } catch (err) {
            console.warn('Could not fetch pending books.', err);
        }
    };

    useEffect(() => {
        loadBackendBooks();
    }, [user?.id, user?.role]);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFormatTab, selectedDiscipline, selectedLevel, selectedLanguage, searchQuery]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Dynamic list of available institutions across catalog
    const availableInstitutions = useMemo(() => {
        const set = new Set<string>();
        documents.forEach(d => {
            const inst = d.institutionName || d.publisherName || d.publisher;
            if (inst) set.add(inst);
        });
        return ['Tous les établissements', ...Array.from(set)];
    }, [documents]);

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (activeFormatTab !== 'ALL') count++;
        if (selectedDiscipline !== 'Tous les domaines') count++;
        if (selectedLevel !== 'Tous niveaux') count++;
        if (selectedLanguage !== 'Toutes les langues') count++;
        if (selectedInstitution !== 'Tous les établissements') count++;
        if (searchQuery.trim() !== '') count++;
        return count;
    }, [activeFormatTab, selectedDiscipline, selectedLevel, selectedLanguage, selectedInstitution, searchQuery]);

    // Reset All Filters
    const handleResetFilters = () => {
        setActiveFormatTab('ALL');
        setSelectedDiscipline('Tous les domaines');
        setSelectedLevel('Tous niveaux');
        setSelectedLanguage('Toutes les langues');
        setSelectedInstitution('Tous les établissements');
        setSearchQuery('');
        setSelectedSort('NEWEST');
    };

    // Filter & Sort Logic
    const filteredDocuments = useMemo(() => {
        let result = documents.filter(doc => {
            const matchesFormat = activeFormatTab === 'ALL' || doc.format === activeFormatTab;
            const matchesDiscipline = selectedDiscipline === 'Tous les domaines' || doc.discipline === selectedDiscipline;
            const matchesLevel = selectedLevel === 'Tous niveaux' || doc.level === selectedLevel;
            const matchesLanguage = selectedLanguage === 'Toutes les langues' || doc.language === selectedLanguage;

            const docInst = doc.institutionName || doc.publisherName || doc.publisher || 'Academia Connect';
            const matchesInstitution = selectedInstitution === 'Tous les établissements' || docInst === selectedInstitution;

            const matchesSearch = `${doc.title} ${doc.author} ${docInst} ${doc.isbn || ''} ${doc.discipline} ${doc.level} ${doc.description || ''} ${doc.submittedByName || ''} ${doc.publicationYear || ''}`.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesFormat && matchesDiscipline && matchesLevel && matchesLanguage && matchesInstitution && matchesSearch;
        });

        // Apply Sorting
        return [...result].sort((a, b) => {
            if (selectedSort === 'POPULAR') {
                return (b.downloadsCount || 0) - (a.downloadsCount || 0);
            }
            if (selectedSort === 'RATED') {
                return (b.rating || 0) - (a.rating || 0);
            }
            if (selectedSort === 'TITLE') {
                return a.title.localeCompare(b.title);
            }
            return (b.id || 0) - (a.id || 0);
        });
    }, [documents, activeFormatTab, selectedDiscipline, selectedLevel, selectedLanguage, selectedInstitution, searchQuery, selectedSort]);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE) || 1;
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredDocuments, currentPage]);

    // Toggle Like
    const toggleLike = (docId: number) => {
        if (likedDocIds.includes(docId)) {
            setLikedDocIds(likedDocIds.filter(id => id !== docId));
            setDocuments(docs => docs.map(d => d.id === docId ? { ...d, likesCount: (d.likesCount || 0) - 1 } : d));
        } else {
            setLikedDocIds([...likedDocIds, docId]);
            setDocuments(docs => docs.map(d => d.id === docId ? { ...d, likesCount: (d.likesCount || 0) + 1 } : d));
        }
    };

    // Toggle Saved
    const toggleSave = (docId: number) => {
        if (savedDocIds.includes(docId)) {
            setSavedDocIds(savedDocIds.filter(id => id !== docId));
        } else {
            setSavedDocIds([...savedDocIds, docId]);
        }
    };

    // Trigger Direct File Download with Real-time Percentage Progress (%)
    const triggerDownload = async (doc: any) => {
        if (!doc) return;
        setDownloadingState(true);
        setDownloadProgress(0);
        setDownloadingDocName(doc.title || 'Document');

        try {
            if (typeof doc.id === 'number' && doc.id > 1000) {
                await api.post(`/books/${doc.id}/download`);
            }
        } catch (e) {
            console.error('Download increment error', e);
        }

        if (!downloadedDocIds.includes(doc.id)) {
            setDownloadedDocIds(prev => [...prev, doc.id]);
            setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, downloadsCount: (d.downloadsCount || 0) + 1 } : d));
        }

        if (doc.fileUrl) {
            const fullUrl = getFileUrl(doc.fileUrl);
            try {
                // Track real-time byte progress via XMLHttpRequest
                const blob = await new Promise<Blob>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('GET', fullUrl, true);
                    xhr.responseType = 'blob';

                    xhr.onprogress = (event) => {
                        if (event.lengthComputable && event.total > 0) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setDownloadProgress(percent);
                        } else {
                            setDownloadProgress(prev => Math.min((prev || 0) + 12, 92));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            setDownloadProgress(100);
                            resolve(xhr.response);
                        } else {
                            reject(new Error(`HTTP ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network error'));
                    xhr.send();
                });

                const blobUrl = window.URL.createObjectURL(blob);
                const fileExt = doc.fileUrl.split('.').pop()?.split('?')[0] || (doc.format === 'VIDEO' ? 'mp4' : doc.format === 'AUDIO' ? 'mp3' : 'pdf');
                const fileName = `${doc.title || 'document'}.${fileExt}`;

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);

                toast.success(`Téléchargement de "${doc.title}" réussi !`);
            } catch (err) {
                console.warn('Fallback direct link download', err);
                const link = document.createElement('a');
                link.href = fullUrl;
                link.download = doc.title || 'document';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`Téléchargement de "${doc.title}" démarré !`);
            }
        }

        setTimeout(() => {
            setDownloadingState(false);
            setDownloadProgress(null);
            setDownloadingDocName('');
            setConfirmDownloadDoc(null);
        }, 600);
    };

    // AI Assistant Send Message
    const handleSendAiMessage = () => {
        if (!aiInput.trim()) return;
        const userMsg = aiInput;
        setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setAiInput('');
        setAiThinking(true);

        setTimeout(() => {
            let aiReply = "Je peux vous aider à comprendre ce concept. Souhaitez-vous un résumé court ou des exercices d'application ?";
            const lower = userMsg.toLowerCase();
            if (lower.includes('résumé') || lower.includes('resume')) {
                aiReply = "Voici un résumé des points clés : 1. Concepts théoriques fondamentaux. 2. Formules et méthodologies. 3. Conseils pour réussir vos examens.";
            } else if (lower.includes('math') || lower.includes('physique') || lower.includes('code')) {
                aiReply = "Pour ce domaine, je vous recommande de consulter les manuels PDF recommandés dans la bibliothèque et d'effectuer les exercices corrigés associés.";
            } else if (lower.includes('quiz') || lower.includes('exercice')) {
                aiReply = "Question Quiz : Quelle est la formule essentielle liée à cette notion ? A) Option 1 B) Option 2. Répondez pour tester vos connaissances !";
            }

            setAiMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
            setAiThinking(false);
        }, 1000);
    };

    // Handle Cover Image Selection
    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedCoverFile(file);
        setCoverPreviewUrl(URL.createObjectURL(file));
    };

    // Handle Primary File Selection (up to 300MB)
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxBytes = 300 * 1024 * 1024; // 300 MB
        if (file.size > maxBytes) {
            toast.error("Le fichier dépasse la taille maximale autorisée de 300 Mo.");
            return;
        }

        setSelectedFile(file);

        // Auto-detect format from file extension
        let detectedFormat = publishForm.format;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'pdf' || ext === 'epub' || ext === 'mobi') detectedFormat = 'PDF';
        else if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') detectedFormat = 'AUDIO';
        else if (ext === 'mp4' || ext === 'avi' || ext === 'mkv') detectedFormat = 'VIDEO';

        setPublishForm(prev => ({
            ...prev,
            fileSize: file.size,
            format: detectedFormat,
            title: prev.title || file.name.replace(/\.[^/.]+$/, "")
        }));
    };

    // Publish New Document
    const handlePublishSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadingFile(true);

        try {
            let finalCoverUrl = publishForm.coverUrl;
            let finalFileUrl = publishForm.fileUrl;

            // 1. Upload Cover Image if selected
            if (selectedCoverFile) {
                const coverFormData = new FormData();
                coverFormData.append('file', selectedCoverFile);
                const coverRes = await api.post('/files/upload', coverFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalCoverUrl = coverRes.data.url || coverRes.data.fileUrl || coverRes.data.path;
            }

            // 2. Upload Digital Book File if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalFileUrl = uploadRes.data.url || uploadRes.data.fileUrl || uploadRes.data.path;
            }

            let targetInstId: number | undefined = undefined;
            let targetInstName = 'Academia Connect';

            if (user?.role === 'APP_ADMIN') {
                targetInstId = undefined;
                targetInstName = 'Academia Connect';
            } else if (user?.role === 'PDG') {
                targetInstId = selectedPublishInstId || (pdgInstitutions.length > 0 ? pdgInstitutions[0].id : undefined);
                const selectedInstObj = pdgInstitutions.find(i => i.id === targetInstId);
                targetInstName = selectedInstObj ? selectedInstObj.name : (pdgInstitutions[0]?.name || 'Établissement ACADEMIA');
            } else {
                targetInstId = user?.institution?.id;
                targetInstName = typeof user?.institution === 'object' ? user?.institution?.name : ((user as any)?.institutionName || 'Établissement ACADEMIA');
            }

            const payload = {
                ...publishForm,
                coverUrl: finalCoverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
                fileUrl: finalFileUrl,
                publisherName: publishForm.publisherName || targetInstName,
                institutionId: targetInstId,
                likesCount: 0,
                downloadsCount: 0,
                rating: 5.0
            };

            const res = await api.post('/books', payload);
            const createdBook = res.data;

            setUserSubmissions(prev => [createdBook, ...prev]);

            setShowPublishModal(false);
            setSelectedFile(null);
            setSelectedCoverFile(null);
            setCoverPreviewUrl('');
            setPublishForm({
                title: '',
                author: '',
                publisherName: '',
                publicationYear: new Date().getFullYear(),
                isbn: '',
                discipline: 'Informatique & Code',
                format: 'PDF',
                language: 'Anglais',
                level: 'Supérieur / Université',
                pagesCount: 456,
                duration: '',
                description: '',
                coverUrl: '',
                fileUrl: '',
                fileSize: 0
            });

            if (user?.role === 'APP_ADMIN') {
                toast.success('Ouvrage publié directement dans la Bibliothèque !');
                loadBackendBooks();
            } else {
                toast.success('Ouvrage soumis avec succès ! Traitement sous 48h ouvrables par l’administrateur.');
            }
        } catch (err: any) {
            console.error('Publish error:', err);
            toast.error(err.response?.data?.message || "Erreur lors de la publication de l'ouvrage.");
        } finally {
            setUploadingFile(false);
        }
    };

    // Admin Approve Book
    const handleApproveBook = async (id: number) => {
        try {
            await api.put(`/books/${id}/approve`);
            toast.success("Ouvrage approuvé et publié sur le catalogue !");
            loadBackendBooks();
        } catch (err: any) {
            console.error("Approve error", err);
            toast.error(err.response?.data?.message || "Erreur lors de l'approbation de l'ouvrage.");
        }
    };

    // Admin Reject Book Popup Action
    const handleConfirmRejectBook = async () => {
        if (!rejectingBook) return;
        try {
            await api.put(`/books/${rejectingBook.id}/reject`, { reason: rejectionReasonInput });
            toast.success("Ouvrage refusé.");
            setRejectingBook(null);
            setRejectionReasonInput('Non conforme au programme ou fichier incomplet.');
            loadBackendBooks();
        } catch (err: any) {
            console.error("Reject error", err);
            toast.error(err.response?.data?.message || "Erreur lors du refus de l'ouvrage.");
        }
    };

    // Delete Book Submission Action
    const handleConfirmDeleteSubmission = async () => {
        if (!deletingBookId) return;
        try {
            await api.delete(`/books/${deletingBookId}`);
            setUserSubmissions(prev => prev.filter(b => b.id !== deletingBookId));
            toast.success("Soumission supprimée.");
            setDeletingBookId(null);
        } catch (err: any) {
            console.error("Delete error", err);
            toast.error(err.response?.data?.message || "Erreur lors de la suppression de la soumission.");
        }
    };

    // Helper formatting size in MB
    const formatSizeMb = (bytes?: number) => {
        if (!bytes) return null;
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    // Reusable Pagination Bar Component
    const renderPaginationBar = () => (
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Affichage de <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à{' '}
                <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)}</span> sur{' '}
                <span className="font-bold text-slate-900 dark:text-white">{filteredDocuments.length}</span> ouvrages
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-200/50 dark:border-blue-900/50">
                    Page {currentPage} sur {totalPages}
                </span>

                <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 pb-20">
            {/* HERO BANNER & HEADER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent)] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                            <GraduationCap size={16} />
                            <span>Bibliothèque Nationale & Internationale Numérique</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                            Manuels, Livres Audio & Cours Vidéo Officiels
                        </h1>
                        <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
                            Accédez aux programmes scolaires du Primaire, Collège, Lycée et Supérieur. Consultez, téléchargez ou alimentez la bibliothèque.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
                            <Building2 size={20} className="text-blue-200" />
                            <div>
                                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Mon Établissement</p>
                                <p className="text-xs font-bold text-white truncate max-w-[180px]">{instName}</p>
                            </div>
                        </div>

                        {/* Publish Button for Staff / Direction / Admin */}
                        {isStaffOrAdmin && (
                            <button
                                onClick={() => {
                                    setActiveSection('MY_LIBRARY');
                                    setMyLibrarySubTab('MY_SUBMISSIONS');
                                    setShowPublishModal(true);
                                }}
                                className="px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            >
                                <PlusCircle size={18} /> Publier un Ouvrage
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs (Explorer vs Ma Bibliothèque vs Validation Admin) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-start flex-wrap">
                    <button
                        onClick={() => setActiveSection('EXPLORE')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'EXPLORE'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Globe size={16} /> Explorer le Catalogue ({documents.length})
                    </button>
                    <button
                        onClick={() => setActiveSection('MY_LIBRARY')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'MY_LIBRARY'
                            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        <Bookmark size={16} /> Ma Bibliothèque ({likedDocIds.length + savedDocIds.length + userSubmissions.length})
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => setActiveSection('ADMIN_APPROVAL')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'ADMIN_APPROVAL'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40'
                                }`}
                        >
                            <ShieldCheck size={16} /> Validation des Ouvrages
                            {pendingBooks.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full">
                                    {pendingBooks.length}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* AI Assistant Trigger Button */}
                <button
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${showAiAssistant
                        ? 'bg-purple-600 text-white shadow-purple-500/20'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60 hover:bg-purple-600 hover:text-white'
                        }`}
                >
                    <Sparkles size={16} /> Assistant IA d'Apprentissage
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Filters Sidebar (Left Column) */}
                {activeSection === 'EXPLORE' && (
                    <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 z-10 self-start">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Filter size={16} className="text-blue-600 dark:text-blue-400" /> Filtres
                                    {activeFiltersCount > 0 && (
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </h3>
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={handleResetFilters}
                                        className="text-[11px] font-bold text-rose-500 hover:underline"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>

                            {/* Format Filter Buttons */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Format de Média</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button
                                        onClick={() => setActiveFormatTab('ALL')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${activeFormatTab === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        Tous
                                    </button>
                                    <button
                                        onClick={() => setActiveFormatTab('PDF')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-1.5 ${activeFormatTab === 'PDF' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <BookOpen size={14} /> PDF
                                    </button>
                                    <button
                                        onClick={() => setActiveFormatTab('AUDIO')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-1.5 ${activeFormatTab === 'AUDIO' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <Headphones size={14} /> Audio
                                    </button>
                                    <button
                                        onClick={() => setActiveFormatTab('VIDEO')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all flex items-center gap-1.5 ${activeFormatTab === 'VIDEO' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <Video size={14} /> Vidéo
                                    </button>
                                </div>
                            </div>

                            {/* Institution / Établissement Select Filter */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Établissement / Éditeur</label>
                                <select
                                    value={selectedInstitution}
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                >
                                    {availableInstitutions.map((inst, idx) => (
                                        <option key={idx} value={inst}>{inst}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Discipline Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Domaine / Discipline</label>
                                <select
                                    value={selectedDiscipline}
                                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                >
                                    {DISCIPLINES.map((d, idx) => (
                                        <option key={idx} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Level Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Niveau Scolaire</label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                >
                                    {LEVELS.map((lvl, idx) => (
                                        <option key={idx} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Select */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Langue</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                >
                                    {LANGUAGES.map((lang, idx) => (
                                        <option key={idx} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Documents Grid (Right Columns) */}
                <div className={`${activeSection === 'EXPLORE' ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
                    {/* Section: EXPLORE CATALOG */}
                    {activeSection === 'EXPLORE' && (
                        <div className="space-y-6">
                            {/* Search Input Bar with Clear Button & Sort Selector */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher par titre, auteur, établissement, discipline, année..."
                                        className="w-full pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white shadow-sm outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Sort Selector */}
                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
                                    <label className="text-xs font-bold text-slate-400 shrink-0 hidden md:block">Trier :</label>
                                    <select
                                        value={selectedSort}
                                        onChange={(e: any) => setSelectedSort(e.target.value)}
                                        className="w-full sm:w-auto px-3.5 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-white shadow-sm outline-none cursor-pointer"
                                    >
                                        <option value="NEWEST">Plus Récents</option>
                                        <option value="POPULAR">Plus Populaires</option>
                                        <option value="RATED">Mieux Notés</option>
                                        <option value="TITLE">Titre (A-Z)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Top Pagination Bar */}
                            {filteredDocuments.length > ITEMS_PER_PAGE && renderPaginationBar()}

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {paginatedDocuments.map((doc) => {
                                    const isLiked = likedDocIds.includes(doc.id);
                                    const isSaved = savedDocIds.includes(doc.id);

                                    return (
                                        <div
                                            key={doc.id}
                                            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                                        >
                                            <div
                                                onClick={() => setSelectedDetailDoc(doc)}
                                                className="cursor-pointer"
                                            >
                                                {/* Cover & Badges */}
                                                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                    <img
                                                        src={doc.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                                                        alt={doc.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                                    {/* Format Tag */}
                                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-[10px] font-black text-slate-900 dark:text-white flex items-center gap-1 shadow-sm uppercase tracking-wider">
                                                        {doc.format === 'PDF' && <BookOpen size={12} className="text-blue-500" />}
                                                        {doc.format === 'AUDIO' && <Headphones size={12} className="text-amber-500" />}
                                                        {doc.format === 'VIDEO' && <Video size={12} className="text-rose-500" />}
                                                        <span>{doc.format}</span>
                                                    </div>

                                                    {/* Action Icons */}
                                                    <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => toggleLike(doc.id)}
                                                            className={`p-2 rounded-xl backdrop-blur-md transition-all ${isLiked ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-500'}`}
                                                        >
                                                            <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleSave(doc.id)}
                                                            className={`p-2 rounded-xl backdrop-blur-md transition-all ${isSaved ? 'bg-amber-500 text-white' : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-amber-500'}`}
                                                        >
                                                            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                                                        </button>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-amber-400 text-xs font-bold">
                                                        <Star size={14} fill="currentColor" />
                                                        <span>{doc.rating}</span>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="p-4 space-y-2">
                                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <span>{doc.discipline}</span>
                                                        <span className="text-blue-600 dark:text-blue-400">{doc.level}</span>
                                                    </div>
                                                    <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                                        {doc.title}
                                                    </h3>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium space-y-0.5">
                                                        <p>Auteur: <strong className="text-slate-800 dark:text-slate-200">{doc.author}</strong></p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <Building2 size={11} className="text-blue-500 shrink-0" />
                                                            <span>{doc.institutionName || doc.publisherName || doc.publisher || 'Établissement ACADEMIA'}</span>
                                                            {doc.publicationYear ? ` (${doc.publicationYear})` : ''}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1 whitespace-pre-line">
                                                        {doc.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Footer with Technical Details (Pages, Size, Format) */}
                                            <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between text-xs pt-3">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        {doc.pagesCount ? `${doc.pagesCount} pages` : doc.duration ? doc.duration : 'Document'} • {doc.language || 'Français'}
                                                    </p>
                                                    {doc.fileSize && (
                                                        <p className="text-[9px] text-slate-500 font-mono">Taille: {formatSizeMb(doc.fileSize)}</p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => setSelectedDetailDoc(doc)}
                                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                                                >
                                                    {doc.format === 'AUDIO' ? <Play size={12} fill="currentColor" /> : doc.format === 'VIDEO' ? <Video size={12} /> : <Eye size={12} />}
                                                    Consulter
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Pagination Bar */}
                            {filteredDocuments.length > ITEMS_PER_PAGE && renderPaginationBar()}
                        </div>
                    )}

                    {/* Section: MY PERSONAL LIBRARY */}
                    {activeSection === 'MY_LIBRARY' && (
                        <div className="space-y-6">
                            {/* Sub-navigation Tabs inside My Library */}
                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-wrap gap-2">
                                <div className="flex items-center gap-1 flex-wrap">
                                    <button
                                        onClick={() => setMyLibrarySubTab('MY_SUBMISSIONS')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${myLibrarySubTab === 'MY_SUBMISSIONS'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <FolderUp size={14} /> Mes Publications ({userSubmissions.length})
                                    </button>
                                    <button
                                        onClick={() => setMyLibrarySubTab('SAVED')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${myLibrarySubTab === 'SAVED'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Bookmark size={14} /> Enregistrés ({savedDocIds.length})
                                    </button>
                                    <button
                                        onClick={() => setMyLibrarySubTab('LIKED')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${myLibrarySubTab === 'LIKED'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Heart size={14} /> Favoris ({likedDocIds.length})
                                    </button>
                                    <button
                                        onClick={() => setMyLibrarySubTab('DOWNLOADED')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${myLibrarySubTab === 'DOWNLOADED'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Download size={14} /> Téléchargements ({downloadedDocIds.length})
                                    </button>
                                </div>

                                {isStaffOrAdmin && (
                                    <button
                                        onClick={() => setShowPublishModal(true)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                                    >
                                        <PlusCircle size={15} /> Publier un Ouvrage
                                    </button>
                                )}
                            </div>

                            {/* SUB-TAB: MY SUBMISSIONS */}
                            {myLibrarySubTab === 'MY_SUBMISSIONS' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
                                        <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold mb-0.5">Procédure de Publication & Examen</h4>
                                            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                                Lorsque vous soumettez un livre, document ou cours (jusqu'à 300 Mo), celui-ci est transmis à l'administrateur principal de la plateforme. Traitement et examen effectués sous <strong>48h ouvrables</strong>. Dès validation, votre ouvrage sera publié sur le catalogue général.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <FolderUp size={18} className="text-blue-600" /> Ouvrages Soumis par Vous
                                        </h3>

                                        {userSubmissions.length === 0 ? (
                                            <div className="text-center py-10 space-y-3">
                                                <FolderUp size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                                                <p className="text-xs text-slate-500 font-medium">Vous n'avez pas encore posté d'ouvrage.</p>
                                                {isStaffOrAdmin && (
                                                    <button
                                                        onClick={() => setShowPublishModal(true)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5"
                                                    >
                                                        <PlusCircle size={14} /> Soumettre un premier livre
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {userSubmissions.map(book => (
                                                    <div key={book.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-xs">
                                                                <img src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="space-y-1 min-w-0">
                                                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{book.title}</h4>
                                                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-wrap">
                                                                    <span>Auteur: {book.author}</span> •
                                                                    <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                                                        <Building2 size={11} /> {book.institutionName || book.publisherName || instName}
                                                                    </span>
                                                                    • ({book.publicationYear || '2024'}) • {book.language}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 font-mono">
                                                                    {book.format} • {book.pagesCount ? `${book.pagesCount} pages` : book.duration ? book.duration : ''} {book.fileSize ? `• Taille: ${formatSizeMb(book.fileSize)}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 shrink-0">
                                                            {/* Status Badge */}
                                                            {book.status === 'PENDING' && (
                                                                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-xl flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                                                                    <Clock size={12} className="animate-spin" /> En attente de validation (48h max)
                                                                </span>
                                                            )}
                                                            {book.status === 'APPROVED' && (
                                                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-xl flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                                                                    <CheckCircle size={12} /> Approuvé & Publié
                                                                </span>
                                                            )}
                                                            {book.status === 'REJECTED' && (
                                                                <div className="text-right">
                                                                    <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-xl flex items-center gap-1 border border-rose-200 dark:border-rose-800">
                                                                        <XCircle size={12} /> Refusé
                                                                    </span>
                                                                    {book.rejectionReason && (
                                                                        <p className="text-[9px] text-rose-500 max-w-xs mt-0.5 italic">{book.rejectionReason}</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => setDeletingBookId(book.id)}
                                                                className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                                title="Supprimer la soumission"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SUB-TABS: SAVED, LIKED, DOWNLOADED */}
                            {myLibrarySubTab === 'SAVED' && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Bookmark size={18} className="text-amber-500" /> Mes Ouvrages Enregistrés
                                    </h3>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {documents.filter(d => savedDocIds.includes(d.id)).map(doc => (
                                            <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                        <img src={doc.coverUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h4>
                                                        <p className="text-[10px] text-slate-400">{doc.author} • {doc.publisherName || doc.publisher} ({doc.publicationYear || ''})</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => triggerDownload(doc)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                                                    >
                                                        <Download size={12} /> Télécharger
                                                    </button>
                                                    <button
                                                        onClick={() => toggleSave(doc.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                                        title="Retirer"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {myLibrarySubTab === 'LIKED' && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Heart size={18} className="text-rose-500" fill="currentColor" /> Mes Ouvrages Favoris
                                    </h3>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {documents.filter(d => likedDocIds.includes(d.id)).map(doc => (
                                            <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                        <img src={doc.coverUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h4>
                                                        <p className="text-[10px] text-slate-400">{doc.author} • {doc.discipline}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => triggerDownload(doc)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                                                >
                                                    <Download size={12} /> Télécharger
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {myLibrarySubTab === 'DOWNLOADED' && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Download size={18} className="text-emerald-500" /> Historique de Téléchargement
                                    </h3>

                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {documents.filter(d => downloadedDocIds.includes(d.id)).map(doc => (
                                            <div key={doc.id} className="py-3 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                                        <img src={doc.coverUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</h4>
                                                        <p className="text-[10px] text-slate-400">{doc.author} • {doc.format} {doc.fileSize ? `(${formatSizeMb(doc.fileSize)})` : ''}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => triggerDownload(doc)}
                                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                                                >
                                                    <Download size={12} /> Re-télécharger
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section: ADMIN APPROVAL WORKFLOW */}
                    {activeSection === 'ADMIN_APPROVAL' && isAdmin && (
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                                <ShieldCheck size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold mb-0.5">Console de Validation des Ouvrages par l'Administrateur</h4>
                                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                                        Examinez et téléchargez les fichiers soumis par les enseignants et les établissements avant de les approuver pour publication sur le catalogue général.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Clock size={18} className="text-amber-500" /> Ouvrages en Attente de Modération ({pendingBooks.length})
                                </h3>

                                {pendingBooks.length === 0 ? (
                                    <div className="text-center py-12 space-y-2">
                                        <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Aucun ouvrage en attente</h4>
                                        <p className="text-xs text-slate-400">Tous les ouvrages soumis ont été examinés et traités.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {pendingBooks.map(book => (
                                            <div key={book.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-18 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-xs border border-slate-200 dark:border-slate-700">
                                                        <img src={book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-[10px] rounded-md uppercase">
                                                                {book.format}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] rounded-md">
                                                                {book.discipline}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold text-[10px] rounded-md">
                                                                Niveau: {book.level}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{book.title}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            Auteur: <strong>{book.author}</strong> • Éditeur/Établissement: <strong>{book.institutionName || book.publisherName || 'N/C'}</strong> ({book.publicationYear || ''}) • Langue: {book.language}
                                                        </p>
                                                        {book.isbn && <p className="text-[10px] text-slate-400 font-mono">ISBN: {book.isbn}</p>}
                                                        {book.description && (
                                                            <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 line-clamp-3 whitespace-pre-wrap">{book.description}</p>
                                                        )}
                                                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 flex-wrap">
                                                            <span>{book.pagesCount ? `${book.pagesCount} pages` : book.duration ? book.duration : ''} {book.fileSize ? `• Taille: ${formatSizeMb(book.fileSize)}` : ''}</span> •
                                                            <span>Soumis par : <strong>{book.submittedByName || 'Enseignant/Direction'}</strong></span>
                                                            {book.institutionName && (
                                                                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                                                                    (<Building2 size={10} /> {book.institutionName})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                                    {/* Pre-approval Download / Inspect Button */}
                                                    {book.fileUrl && (
                                                        <a
                                                            href={getFileUrl(book.fileUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700"
                                                            title="Inspecter le fichier avant de valider"
                                                        >
                                                            <Eye size={15} /> Examiner Fichier
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => handleApproveBook(book.id)}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle size={15} /> Approuver & Publier
                                                    </button>

                                                    <button
                                                        onClick={() => setRejectingBook(book)}
                                                        className="px-3 py-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1"
                                                    >
                                                        <XCircle size={15} /> Refuser
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RICH BOOK DETAILS & BUILT-IN MEDIA PLAYER MODAL (GRAND POP-UP) */}
            <AnimatePresence>
                {selectedDetailDoc && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto custom-scrollbar">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                                <div className="flex items-center gap-2 flex-wrap min-w-0 pr-4">
                                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                        {selectedDetailDoc.format === 'PDF' && <BookOpen size={12} />}
                                        {selectedDetailDoc.format === 'AUDIO' && <Headphones size={12} />}
                                        {selectedDetailDoc.format === 'VIDEO' && <Video size={12} />}
                                        {selectedDetailDoc.format}
                                    </span>
                                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-[10px] font-bold">
                                        {selectedDetailDoc.discipline}
                                    </span>
                                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-xl text-[10px] font-bold">
                                        {selectedDetailDoc.level}
                                    </span>
                                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1">
                                        RÉF: {selectedDetailDoc.isbn || `REF-${selectedDetailDoc.id}`}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedDetailDoc(null)}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content Grid */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Left Column: Cover & Integrated Media Player */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="relative aspect-[3/4] w-full rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 group">
                                        <img
                                            src={selectedDetailDoc.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
                                            alt={selectedDetailDoc.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Star size={14} fill="currentColor" /> {selectedDetailDoc.rating || 5.0}
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-mono">
                                                {selectedDetailDoc.downloadsCount || 0} téléchargements
                                            </span>
                                        </div>
                                    </div>

                                    {/* Integrated Media Player based on format */}
                                    {selectedDetailDoc.format === 'VIDEO' && (
                                        <div className="space-y-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                                            <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                                <Video size={14} className="text-rose-500" /> Lecteur Vidéo Intégré
                                            </p>
                                            {selectedDetailDoc.fileUrl ? (
                                                <video
                                                    controls
                                                    poster={selectedDetailDoc.coverUrl}
                                                    src={getFileUrl(selectedDetailDoc.fileUrl)}
                                                    className="w-full rounded-xl aspect-video bg-black object-contain shadow-md"
                                                >
                                                    Votre navigateur ne supporte pas la lecture vidéo.
                                                </video>
                                            ) : (
                                                <div className="p-4 bg-slate-900 rounded-xl text-center text-xs text-slate-400">
                                                    <Video size={28} className="mx-auto mb-1 text-rose-500/70" />
                                                    Vidéo accessible après téléchargement.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedDetailDoc.format === 'AUDIO' && (
                                        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-amber-500 rounded-xl text-white shadow-md">
                                                    <Headphones size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold truncate">{selectedDetailDoc.title}</p>
                                                    <p className="text-[10px] text-slate-400">{selectedDetailDoc.author}</p>
                                                </div>
                                            </div>
                                            {selectedDetailDoc.fileUrl ? (
                                                <audio
                                                    controls
                                                    src={getFileUrl(selectedDetailDoc.fileUrl)}
                                                    className="w-full rounded-lg h-9"
                                                />
                                            ) : (
                                                <p className="text-[10px] text-slate-400 text-center">Fichier audio disponible.</p>
                                            )}
                                        </div>
                                    )}

                                    {selectedDetailDoc.format === 'PDF' && selectedDetailDoc.fileUrl && (
                                        <a
                                            href={getFileUrl(selectedDetailDoc.fileUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Eye size={16} /> Lire / Aperçu PDF Plein Écran
                                        </a>
                                    )}
                                </div>

                                {/* Right Column: Detailed Info & Actions */}
                                <div className="lg:col-span-7 space-y-5">
                                    {/* Title & Author & Institution */}
                                    <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                                            {selectedDetailDoc.title}
                                        </h2>
                                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                                            <p className="font-semibold">Auteur: <strong className="text-slate-900 dark:text-white">{selectedDetailDoc.author}</strong></p>
                                            <span>•</span>
                                            <p className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                                                <Building2 size={13} />
                                                <span>{selectedDetailDoc.institutionName || selectedDetailDoc.publisherName || selectedDetailDoc.publisher || 'Établissement ACADEMIA'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Résumé / Description</h4>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                                            {selectedDetailDoc.description || "Aucune description détaillée n'a été fournie pour cet ouvrage."}
                                        </p>
                                    </div>

                                    {/* Meta Badges Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Discipline</span>
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{selectedDetailDoc.discipline}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Niveau</span>
                                            <p className="font-bold text-blue-600 dark:text-blue-400 truncate">{selectedDetailDoc.level}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Langue</span>
                                            <p className="font-bold text-slate-900 dark:text-white truncate">{selectedDetailDoc.language || 'Français'}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Volume / Durée</span>
                                            <p className="font-bold text-slate-900 dark:text-white truncate">
                                                {selectedDetailDoc.pagesCount ? `${selectedDetailDoc.pagesCount} pages` : selectedDetailDoc.duration || 'N/C'}
                                            </p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Taille Fichier</span>
                                            <p className="font-bold text-slate-900 dark:text-white font-mono truncate">
                                                {selectedDetailDoc.fileSize ? formatSizeMb(selectedDetailDoc.fileSize) : 'N/C'}
                                            </p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium">Publication</span>
                                            <p className="font-bold text-slate-900 dark:text-white font-mono truncate">
                                                {selectedDetailDoc.publicationYear || '2024'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submitter Info */}
                                    {selectedDetailDoc.submittedByName && (
                                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/50 flex items-center gap-2 text-xs text-purple-900 dark:text-purple-200">
                                            <UserIcon size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                            <span>Document vérifié et publié par <strong>{selectedDetailDoc.submittedByName}</strong></span>
                                        </div>
                                    )}

                                    {/* Action Buttons Bar */}
                                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                                        <button
                                            disabled={downloadingState}
                                            onClick={() => triggerDownload(selectedDetailDoc)}
                                            className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {downloadingState ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={16} />
                                                    <span>Téléchargement {downloadProgress !== null ? `${downloadProgress}%` : ''}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={16} />
                                                    <span>Télécharger le Fichier</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => toggleLike(selectedDetailDoc.id)}
                                            className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${likedDocIds.includes(selectedDetailDoc.id)
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                                                }`}
                                        >
                                            <Heart size={16} fill={likedDocIds.includes(selectedDetailDoc.id) ? 'currentColor' : 'none'} />
                                            {likedDocIds.includes(selectedDetailDoc.id) ? 'Aimé' : 'J\'aime'}
                                        </button>

                                        <button
                                            onClick={() => toggleSave(selectedDetailDoc.id)}
                                            className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 ${savedDocIds.includes(selectedDetailDoc.id)
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                                }`}
                                        >
                                            <Bookmark size={16} fill={savedDocIds.includes(selectedDetailDoc.id) ? 'currentColor' : 'none'} />
                                            {savedDocIds.includes(selectedDetailDoc.id) ? 'Enregistré' : 'Sauvegarder'}
                                        </button>

                                        <button
                                            onClick={() => {
                                                const promptMsg = `Pouvez-vous m'expliquer les points clés du document "${selectedDetailDoc.title}" de la discipline ${selectedDetailDoc.discipline} ?`;
                                                setAiInput(promptMsg);
                                                setSelectedDetailDoc(null);
                                                setShowAiAssistant(true);
                                            }}
                                            className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5"
                                        >
                                            <Sparkles size={16} /> Demander à l'IA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ANIMATED DOWNLOAD PROGRESS OVERLAY MODAL */}
            <AnimatePresence>
                {downloadProgress !== null && (
                    <div className="fixed bottom-6 right-6 z-[10000] w-80 sm:w-96">
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.9 }}
                            className="bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700 rounded-3xl p-4 shadow-2xl backdrop-blur-xl space-y-3"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 bg-blue-600 rounded-2xl shrink-0 text-white animate-pulse shadow-md">
                                        <Download size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{downloadingDocName || 'Téléchargement...'}</h4>
                                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                            {downloadProgress < 100 ? 'En cours de transfert...' : 'Finalisation...'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-blue-400 font-mono shrink-0 px-2.5 py-1 bg-blue-950/80 rounded-xl border border-blue-800">
                                    {downloadProgress}%
                                </span>
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="space-y-1">
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-md"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${downloadProgress}%` }}
                                        transition={{ ease: 'easeOut', duration: 0.2 }}
                                    />
                                </div>
                                <div className="flex justify-between text-[9px] text-slate-400 font-mono px-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DOWNLOAD CONFIRMATION MODAL */}
            <AnimatePresence>
                {confirmDownloadDoc && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Download size={20} />
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Confirmation de Téléchargement</h3>
                                </div>
                                <button onClick={() => setConfirmDownloadDoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="w-14 h-18 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 shadow-sm">
                                    <img src={confirmDownloadDoc.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{confirmDownloadDoc.title}</h4>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Auteur: <strong>{confirmDownloadDoc.author}</strong> • Éditeur: {confirmDownloadDoc.publisherName || confirmDownloadDoc.publisher || 'N/C'} ({confirmDownloadDoc.publicationYear || ''})
                                    </p>
                                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase">
                                            {confirmDownloadDoc.format}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {confirmDownloadDoc.language} • {confirmDownloadDoc.pagesCount ? `${confirmDownloadDoc.pagesCount} pages` : confirmDownloadDoc.duration} {confirmDownloadDoc.fileSize ? `(${formatSizeMb(confirmDownloadDoc.fileSize)})` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                Êtes-vous sûr de vouloir enregistrer cet ouvrage pédagogique sur votre appareil ?
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    disabled={downloadingState}
                                    onClick={() => setConfirmDownloadDoc(null)}
                                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    disabled={downloadingState}
                                    onClick={() => triggerDownload(confirmDownloadDoc)}
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {downloadingState ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                    Télécharger
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AUDIO PLAYER BAR */}
            <AnimatePresence>
                {activeAudioDoc && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 z-50 flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                                <Headphones size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{activeAudioDoc.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">{activeAudioDoc.author}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md hover:bg-amber-600 transition-colors"
                            >
                                {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                            </button>
                            <button
                                onClick={() => setActiveAudioDoc(null)}
                                className="text-slate-400 hover:text-white p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI ASSISTANT SIDE PANEL */}
            <AnimatePresence>
                {showAiAssistant && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs">Assistant IA ACADEMIA Library</h4>
                                    <p className="text-[10px] text-purple-100">Aide aux révisions & résumés</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiAssistant(false)} className="text-white/80 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'ai' && (
                                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                            IA
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {aiThinking && (
                                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                                    <Bot size={14} className="animate-bounce text-purple-500" />
                                    <span>L'IA réfléchit...</span>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
                                placeholder="Posez une question ou demandez un résumé..."
                                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />
                            <button
                                onClick={handleSendAiMessage}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RICH PUBLISH DOCUMENT MODAL (For Teachers, Staff & Admins) */}
            <AnimatePresence>
                {showPublishModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        <PlusCircle size={18} /> Soumettre un Document dans la Bibliothèque
                                    </h3>
                                    <p className="text-[11px] text-blue-100">Renseignez toutes les métadonnées de l'ouvrage pour l'indexation.</p>
                                </div>
                                <button onClick={() => setShowPublishModal(false)} className="text-white/80 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handlePublishSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {/* Section 1: Informations Générales */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText size={14} /> 1. Identité de l'Ouvrage
                                    </h4>

                                    {user?.role === 'PDG' && pdgInstitutions.length > 0 && (
                                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                                            <label className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                                                <Building2 size={15} className="text-blue-600 dark:text-blue-400" /> Établissement Rattaché à l'Ouvrage *
                                            </label>
                                            <select
                                                value={selectedPublishInstId || (pdgInstitutions[0]?.id)}
                                                onChange={(e) => setSelectedPublishInstId(Number(e.target.value))}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {pdgInstitutions.map((inst) => (
                                                    <option key={inst.id} value={inst.id}>
                                                        {inst.name} {inst.city ? `(${inst.city})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-blue-700 dark:text-blue-300">Par défaut, votre premier établissement est associé. Vous pouvez choisir l'établissement auquel vous souhaitez rattacher cet ouvrage.</p>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Titre de l'ouvrage (Préciser la classe: 6e, 3e, Terminale...)</label>
                                        <input
                                            required
                                            type="text"
                                            value={publishForm.title}
                                            onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                                            placeholder="Ex: Computer Security (3rd Edition)"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auteur(s) *</label>
                                            <input
                                                required
                                                type="text"
                                                value={publishForm.author}
                                                onChange={(e) => setPublishForm({ ...publishForm, author: e.target.value })}
                                                placeholder="Ex: Pr NASSARAMADJI Nasaire"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Éditeur / Maison d'Édition</label>
                                            <input
                                                type="text"
                                                value={publishForm.publisherName}
                                                onChange={(e) => setPublishForm({ ...publishForm, publisherName: e.target.value })}
                                                placeholder="Ex: Wiley, Nathan, Hachette..."
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Année de Publication</label>
                                            <input
                                                type="number"
                                                value={publishForm.publicationYear}
                                                onChange={(e) => setPublishForm({ ...publishForm, publicationYear: parseInt(e.target.value) || new Date().getFullYear() })}
                                                placeholder="Ex: 2011"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Langue</label>
                                            <select
                                                value={publishForm.language}
                                                onChange={(e) => setPublishForm({ ...publishForm, language: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            >
                                                {LANGUAGES.filter(l => l !== 'Toutes les langues').map((lang, idx) => (
                                                    <option key={idx} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Code ISBN / Réf</label>
                                            <input
                                                type="text"
                                                value={publishForm.isbn}
                                                onChange={(e) => setPublishForm({ ...publishForm, isbn: e.target.value })}
                                                placeholder="Ex: 978-0470741849"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Section 2: Format & Classification */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers size={14} /> 2. Classification & Caractéristiques Techniques
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Format de média</label>
                                            <select
                                                value={publishForm.format}
                                                onChange={(e) => setPublishForm({ ...publishForm, format: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            >
                                                <option value="PDF">PDF (Document / Manuel Texte)</option>
                                                <option value="AUDIO">AUDIO (Livre Audio MP3)</option>
                                                <option value="VIDEO">VIDÉO (Cours Vidéo MP4)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Domaine / Discipline *</label>
                                            <input
                                                required
                                                type="text"
                                                value={publishForm.discipline}
                                                onChange={(e) => setPublishForm({ ...publishForm, discipline: e.target.value })}
                                                placeholder="Entrez le nom du domaine (ex: Informatique, Sécurité, Droit, Mathématiques...)"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Niveau Scolaire visé</label>
                                            <select
                                                value={publishForm.level}
                                                onChange={(e) => setPublishForm({ ...publishForm, level: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                            >
                                                {LEVELS.map((lvl, idx) => (
                                                    <option key={idx} value={lvl}>{lvl}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {publishForm.format === 'PDF' ? (
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nombre de Pages (Pages)</label>
                                                <input
                                                    type="number"
                                                    value={publishForm.pagesCount}
                                                    onChange={(e) => setPublishForm({ ...publishForm, pagesCount: parseInt(e.target.value) || 0 })}
                                                    placeholder="Ex: 456"
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Durée (Durée Média)</label>
                                                <input
                                                    type="text"
                                                    value={publishForm.duration}
                                                    onChange={(e) => setPublishForm({ ...publishForm, duration: e.target.value })}
                                                    placeholder="Ex: 1h 45min"
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Section 3: Visuel de Couverture & Document Numérique */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Upload size={14} /> 3. Fichiers Numériques (Couverture & Fichier 300 Mo)
                                    </h4>

                                    {/* Cover Image Upload Area */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Image de Couverture du Livre</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                                {coverPreviewUrl || publishForm.coverUrl ? (
                                                    <img src={coverPreviewUrl || publishForm.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={20} className="text-slate-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="file"
                                                    onChange={handleCoverSelect}
                                                    accept="image/*"
                                                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={publishForm.coverUrl}
                                                    onChange={(e) => {
                                                        setPublishForm({ ...publishForm, coverUrl: e.target.value });
                                                        setCoverPreviewUrl(e.target.value);
                                                    }}
                                                    placeholder="Ou collez une URL d'image de couverture (https://...)"
                                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-900 dark:text-white outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Digital File Upload Area (Max 300MB) */}
                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                            <span>Fichier Numérique Principal (PDF, MP3, MP4) *</span>
                                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Max: 300 Mo</span>
                                        </label>
                                        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                accept=".pdf,.mp3,.wav,.mp4,.epub,.mobi"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                            <div className="space-y-2 pointer-events-none">
                                                <Upload className="mx-auto text-blue-500" size={24} />
                                                {selectedFile ? (
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                        <p className="truncate max-w-xs mx-auto">{selectedFile.name}</p>
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                                            Taille: {formatSizeMb(selectedFile.size)} • Extension: {selectedFile.name.split('.').pop()?.toUpperCase()} (Prêt pour téléversement)
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Cliquez ou glissez votre fichier ici</p>
                                                        <p className="text-[10px] text-slate-400">PDF, Audio MP3/WAV, Cours Vidéo MP4 (jusqu'à 300 Mo)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Section 4: Description */}
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description détaillée & Résumé de l'ouvrage</label>
                                    <textarea
                                        rows={4}
                                        value={publishForm.description}
                                        onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                                        placeholder="Présentez le résumé de l'ouvrage, ses chapitres ou ses objectifs pédagogiques (les sauts de ligne et retours à la ligne sont conservés)..."
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>

                                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                                    <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
                                    <span>
                                        Votre soumission sera révisée et examinée sous <strong>48h ouvrables</strong> par l'administrateur principal avant sa publication officielle sur le catalogue.
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={uploadingFile}
                                        onClick={() => setShowPublishModal(false)}
                                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploadingFile}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        {uploadingFile ? <Loader2 size={16} className="animate-spin" /> : <Upload size={14} />}
                                        {uploadingFile ? 'Téléversement...' : 'Soumettre pour Validation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADMIN REJECTION POPUP MODAL */}
            <AnimatePresence>
                {rejectingBook && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                                    <XCircle size={20} />
                                    <span>Refus d'un ouvrage</span>
                                </div>
                                <button onClick={() => setRejectingBook(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                Indiquez le motif du refus pour l'auteur de <strong>"{rejectingBook.title}"</strong> :
                            </p>

                            <textarea
                                rows={3}
                                value={rejectionReasonInput}
                                onChange={(e) => setRejectionReasonInput(e.target.value)}
                                placeholder="Motif du refus..."
                                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setRejectingBook(null)}
                                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmRejectBook}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md"
                                >
                                    Confirmer le Refus
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE SUBMISSION CONFIRMATION MODAL */}
            <AnimatePresence>
                {deletingBookId && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                                    <Trash2 size={20} />
                                    <span>Confirmation de suppression</span>
                                </div>
                                <button onClick={() => setDeletingBookId(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                Voulez-vous vraiment supprimer définitivement cette soumission d'ouvrage ? Cette action est irréversible.
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setDeletingBookId(null)}
                                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmDeleteSubmission}
                                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Library;
