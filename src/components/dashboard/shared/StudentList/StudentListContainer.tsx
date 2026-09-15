import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../../../../api/axios';
import BulletinModal from '../BulletinModal';
import { StudentDetailsPopup } from '../StudentDetailsPopup';
import StudentFilters from './StudentFilters';
import StudentTable from './StudentTable';
import StudentEnrollModal from './StudentEnrollModal';

interface StudentListContainerProps {
    role: 'DIRECTION' | 'PROVISORIAT' | 'SECRETARIAT' | 'PDG';
    institutionId?: number;
    ceoId?: number;
}

const StudentListContainer: React.FC<StudentListContainerProps> = ({ role, institutionId, ceoId }) => {
    const [students, setStudents] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [selectedCycle, setSelectedCycle] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCycle, selectedClass, searchQuery, selectedStatus]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });
    const [isBulletinOpen, setIsBulletinOpen] = useState(false);
    const [viewingStudent, setViewingStudent] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        birthDate: '',
        gender: '',
        address: '',
        studentIdNumber: '',
        classeId: '' as string | number,
        cycleId: '' as string | number,
        motherFirstName: '',
        motherLastName: '',
        motherEmail: '',
        motherPhone: '',
        fatherFirstName: '',
        fatherLastName: '',
        fatherEmail: '',
        fatherPhone: ''
    });

    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetchInitialData();
    }, [institutionId, ceoId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (institutionId) params.append('institutionId', institutionId.toString());
            if (ceoId) params.append('ceoId', ceoId.toString());
            const qs = params.toString() ? `?${params.toString()}` : '';

            const [cyclesRes, classesRes, studentsRes] = await Promise.all([
                api.get(`/cycles${qs}`).catch(() => ({ data: [] })),
                api.get(`/classes${qs}`).catch(() => ({ data: [] })),
                api.get(`/students${qs}`).catch(() => ({ data: [] }))
            ]);
            setCycles(cyclesRes.data || []);
            setClasses(classesRes.data || []);
            setStudents(studentsRes.data || []);

            const urlStudentId = searchParams.get('studentId');
            if (urlStudentId && studentsRes.data) {
                const s = studentsRes.data.find((stu: any) => String(stu.id) === urlStudentId);
                if (s) setSelectedStudent(s);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                cycleId: formData.cycleId ? Number(formData.cycleId) : null,
                classeId: formData.classeId ? Number(formData.classeId) : null,
                institutionId: institutionId
            };
            if (isEditing && editingId) {
                await api.put(`/students/${editingId}`, payload);
                setMessage({ type: 'success', text: 'Profil élève mis à jour.' });
            } else {
                if (!payload.password) payload.password = 'Pass1234';
                await api.post('/students/enroll', payload);
                setMessage({ type: 'success', text: 'Élève inscrit avec succès.' });
            }
            setShowModal(false);
            resetForm();
            fetchInitialData();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Une erreur est survenue.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete.id) return;
        try {
            setLoading(true);
            await api.delete(`/students/${confirmDelete.id}`);
            setMessage({ type: 'success', text: 'Élève supprimé.' });
            setConfirmDelete({ isOpen: false, id: null });
            fetchInitialData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            birthDate: '',
            gender: '',
            address: '',
            studentIdNumber: '',
            classeId: '',
            cycleId: '',
            motherFirstName: '',
            motherLastName: '',
            motherEmail: '',
            motherPhone: '',
            fatherFirstName: '',
            fatherLastName: '',
            fatherEmail: '',
            fatherPhone: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const openEditModal = (student: any) => {
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: student.email || '',
            phone: student.phone || '',
            password: '',
            birthDate: student.birthDate || '',
            gender: student.gender || '',
            address: student.address || student.fatherAccount?.address || student.motherAccount?.address || '',
            studentIdNumber: student.studentIdNumber || '',
            classeId: student.classe?.id || '',
            cycleId: student.classe?.cycle?.id || '',
            motherFirstName: student.motherFirstName || '',
            motherLastName: student.motherLastName || '',
            motherEmail: student.motherEmail || '',
            motherPhone: student.motherPhone || '',
            fatherFirstName: student.fatherFirstName || '',
            fatherLastName: student.fatherLastName || '',
            fatherEmail: student.fatherEmail || '',
            fatherPhone: student.fatherPhone || ''
        });
        setIsEditing(true);
        setEditingId(student.id);
        setShowModal(true);
    };

    const filteredClasses = selectedCycle ? classes.filter((c: any) => c.cycle?.name === selectedCycle) : classes;
    const formFilteredClasses = formData.cycleId ? classes.filter((c: any) => String(c.cycle?.id) === String(formData.cycleId)) : classes;

    const filteredStudents = Array.isArray(students) ? students.filter(student => {
        const matchCycle = selectedCycle ? student.classe?.cycle?.name === selectedCycle : true;
        const matchClass = selectedClass ? student.classe?.id?.toString() === selectedClass : true;

        let matchStatus = true;
        if (selectedStatus === 'PENDING') {
            matchStatus = student.enrollmentStatus === 'PENDING_FEE' || student.enrollmentStatus === 'PENDING_DOCS';
        } else if (selectedStatus === 'ENROLLED') {
            matchStatus = student.enrollmentStatus === 'ENROLLED';
        }

        const searchLower = searchQuery.toLowerCase();
        const matchSearch = (student.firstName?.toLowerCase() + ' ' + student.lastName?.toLowerCase()).includes(searchLower) ||
            student.studentIdNumber?.toLowerCase().includes(searchLower);
        return matchCycle && matchClass && matchStatus && matchSearch;
    }) : [];

    return (
        <div className="space-y-6">
            {selectedStudent && (
                <StudentDetailsPopup
                    isOpen={!!selectedStudent && !isBulletinOpen}
                    student={selectedStudent}
                    role={role}
                    onClose={() => setSelectedStudent(null)}
                    onRefresh={fetchInitialData}
                    initialTab={(searchParams.get('tab') as 'info' | 'finance') || 'info'}
                />
            )}
            {isBulletinOpen && viewingStudent && (
                <BulletinModal
                    studentId={viewingStudent}
                    trimester="1er Trimestre"
                    academicYear="2025-2026"
                    onClose={() => setIsBulletinOpen(false)}
                />
            )}
            {message.text && (
                <div className={`p-4 rounded-xl font-bold text-xs flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })}><X size={16} /></button>
                </div>
            )}

            <StudentFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCycle={selectedCycle}
                setSelectedCycle={setSelectedCycle}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                cycles={cycles}
                filteredClasses={filteredClasses}
            />

            <StudentTable 
                loading={loading}
                studentsLength={students.length}
                filteredStudents={filteredStudents}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                setSelectedStudent={setSelectedStudent}
                setViewingStudent={setViewingStudent}
                setIsBulletinOpen={setIsBulletinOpen}
                openEditModal={openEditModal}
                setConfirmDelete={setConfirmDelete}
            />

            <StudentEnrollModal 
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                handleCreateOrUpdate={handleCreateOrUpdate}
                loading={loading}
                cycles={cycles}
                formFilteredClasses={formFilteredClasses}
                studentId={editingId}
            />

            {/* CONFIRM DELETE */}
            {confirmDelete.isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-200">
                        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Supprimer ce dossier ?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Cette action est définitive et supprimera toutes les notes, absences et données liées à cet élève.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDelete({ isOpen: false, id: null })} className="flex-1 py-2 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Annuler</button>
                            <button onClick={handleDelete} className="flex-1 py-2 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-md transition-all">Confirmer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentListContainer;
