import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MapPin,
    Edit2,
    Trash2,
    Users,
    DoorOpen,
    Building2,
    Loader2,
    X,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

interface Room {
    id: number;
    name: string;
    capacity: number;
    type: string;
    institutionId: number;
}

const RoomManagement: React.FC = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [form, setForm] = useState({
        name: '',
        capacity: 30,
        type: 'Salle de classe'
    });

    useEffect(() => {
        if (user?.institution?.id) {
            fetchRooms();
        }
    }, [user?.institution?.id]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/rooms/institution/${user?.institution?.id}`);
            setRooms(res.data || []);
        } catch (error) {
            console.error("Failed to fetch rooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom.id}`, {
                    ...form,
                    institutionId: user?.institution?.id
                });
            } else {
                await api.post('/rooms', {
                    ...form,
                    institutionId: user?.institution?.id
                });
            }
            fetchRooms();
            closeModal();
        } catch (error) {
            console.error("Failed to save room", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) {
            try {
                await api.delete(`/rooms/${id}`);
                fetchRooms();
            } catch (error) {
                console.error("Failed to delete room", error);
            }
        }
    };

    const openModal = (room: Room | null = null) => {
        if (room) {
            setEditingRoom(room);
            setForm({
                name: room.name,
                capacity: room.capacity,
                type: room.type
            });
        } else {
            setEditingRoom(null);
            setForm({
                name: '',
                capacity: 30,
                type: 'Salle de classe'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
                        Gestion des Salles
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enregistrez et gérez les salles de votre établissement.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start md:self-auto"
                >
                    <Plus size={16} /> Ajouter une Salle
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                        <DoorOpen size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Total Salles</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{rooms.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Capacité Totale</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {rooms.reduce((acc, r) => acc + (r.capacity || 0), 0)} places
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Types de Salles</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {new Set(rooms.map(r => r.type)).size}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher une salle par nom ou type..."
                    className="flex-1 bg-transparent border-none outline-none font-medium text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Rooms Grid */}
            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-3" size={32} />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Chargement des salles...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <MapPin size={28} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Aucune salle trouvée</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Commencez par ajouter votre première salle de classe.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredRooms.map((room) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <DoorOpen size={20} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openModal(room)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">{room.name}</h4>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">{room.type}</p>

                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <Users size={14} className="text-slate-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{room.capacity || 0} places</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingRoom ? 'Modifier la Salle' : 'Nouvelle Salle'}
                                </h3>
                                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de la Salle</label>
                                    <input
                                        required
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Ex: Salle 204, Laboratoire A..."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Capacité</label>
                                        <input
                                            required
                                            type="number"
                                            value={form.capacity}
                                            onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type de Salle</label>
                                        <select
                                            required
                                            value={form.type}
                                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none"
                                        >
                                            <option>Salle de classe</option>
                                            <option>Laboratoire</option>
                                            <option>Informatique</option>
                                            <option>Bibliothèque</option>
                                            <option>Amphithéâtre</option>
                                            <option>Terrain / Sport</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    {editingRoom ? <Check size={16} /> : <Plus size={16} />}
                                    {editingRoom ? 'Mettre à jour' : 'Enregistrer la Salle'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoomManagement;
