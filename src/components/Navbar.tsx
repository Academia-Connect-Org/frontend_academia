import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'Support', path: '/support' },
    ];

    const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER || location.pathname === ROUTES.PAYMENT;
    const isContactPage = location.pathname === ROUTES.CONTACT;

    let navClasses = scrolled || isAuthPage ? 'bg-blue-900/95 backdrop-blur-lg shadow-xl py-3' : 'bg-transparent py-6';
    if (isContactPage) {
        navClasses = 'bg-emerald-600/95 backdrop-blur-lg shadow-xl py-3';
    }

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-white p-1.5  shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">NB-MIND School</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-bold text-sm uppercase tracking-widest transition-all hover:text-blue-400 ${location.pathname === link.path ? 'text-blue-400' : 'text-blue-100'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-white/20 ml-4"></div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard" className="flex items-center gap-2 px-6 py-2.5  bg-blue-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-400 shadow-lg shadow-blue-500/30 transition-all  ">
                                    <LayoutDashboard size={18} />
                                    {user ? user.firstName : 'Dashboard'}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2.5 text-blue-100 hover:text-white hover:bg-white/10  transition-all"
                                    title="Déconnexion"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN} className="text-white font-bold hover:text-blue-300 transition-colors text-sm uppercase tracking-widest">
                                    Connexion
                                </Link>
                                <Link to={ROUTES.REGISTER} className="px-6 py-2.5  bg-blue-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-400 shadow-lg shadow-blue-500/30 transition-all  ">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white hover:bg-white/10  transition-colors">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-blue-900   p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block text-xl font-bold text-blue-100 hover:text-white"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-4 pt-4  ">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 py-4  bg-blue-500 text-white font-bold">
                                    <LayoutDashboard size={20} />
                                    {user ? `Espace ${user.firstName}` : 'Accéder au Dashboard'}
                                </Link>
                                <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center justify-center gap-3 py-4    text-red-400 font-bold">
                                    <LogOut size={20} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-center py-4    text-white font-bold">
                                    Connexion
                                </Link>
                                <Link to={ROUTES.REGISTER} onClick={() => setIsOpen(false)} className="text-center py-4  bg-blue-500 text-white font-bold">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
