import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MapPin,
    MoreVertical,
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
            setRooms(res.data);
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
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <MapPin className="text-blue-600" size={32} />
                        Gestion des Salles
                    </h2>
                    <p className="text-slate-500 font-medium">Enregistrez et gérez les salles de votre établissement.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-8 py-4 rounded-[32px] font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={20} /> Ajouter une Salle
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <DoorOpen size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Salles</p>
                        <p className="text-2xl font-black text-slate-800">{rooms.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacité Totale</p>
                        <p className="text-2xl font-black text-slate-800">
                            {rooms.reduce((acc, r) => acc + r.capacity, 0)} places
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Types de Salles</p>
                        <p className="text-2xl font-black text-slate-800">
                            {new Set(rooms.map(r => r.type)).size}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-[30px] shadow-sm border border-slate-100 mb-8 flex items-center gap-4">
                <Search size={20} className="text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Rechercher une salle par nom ou type..."
                    className="flex-1 bg-transparent border-none outline-none font-medium text-slate-600 placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Rooms Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement des salles...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="bg-white rounded-[45px] p-20 text-center border-2 border-dashed border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin size={40} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">Aucune salle trouvée</h3>
                    <p className="text-slate-400 font-medium">Commencez par ajouter votre première salle de classe.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredRooms.map((room) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                                            <DoorOpen size={24} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(room)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-black text-slate-800 mb-1">{room.name}</h4>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-6">{room.type}</p>

                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Capacité</p>
                                                <p className="text-sm font-black text-slate-600 leading-none">{room.capacity} places</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

            )
            }

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[50px] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-800">
                                        {editingRoom ? 'Modifier la Salle' : 'Nouvelle Salle'}
                                    </h3>
                                    <button onClick={closeModal} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nom de la Salle</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Ex: Salle 204, Laboratoire A..."
                                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-600 focus:ring-2 focus:ring-blue-600 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Capacité</label>
                                            <input
                                                required
                                                type="number"
                                                value={form.capacity}
                                                onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-600 focus:ring-2 focus:ring-blue-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type de Salle</label>
                                            <select
                                                required
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-600 focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
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
                                        className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all mt-6 flex items-center justify-center gap-2"
                                    >
                                        {editingRoom ? <Check size={20} /> : <Plus size={20} />}
                                        {editingRoom ? 'Mettre à jour' : 'Enregistrer la Salle'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};


export default RoomManagement;
