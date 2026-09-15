import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants/routes';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
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
        { name: 'Bibliothèque', path: '/bibliotheque' },
        { name: 'Tarif', path: '/pricing' },
        { name: 'Support', path: '/support' },
    ];

    const isHomePage = location.pathname === '/';
    const isTransparent = isHomePage && !scrolled;

    const navClasses = isTransparent
        ? 'bg-transparent py-3.5 border-b border-transparent'
        : 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-slate-800/80 py-2.5';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="p-1 bg-transparent dark:bg-white rounded-xl transition-transform duration-300 group-hover:scale-105">
                            <img 
                                src={logo} 
                                alt="Logo Academia Connect" 
                                className="h-9 w-9 object-contain rounded-lg" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-base font-bold tracking-tight leading-tight transition-colors duration-300 ${isTransparent ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                                Academia<span className="text-sky-500">Connect</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-normal -mt-0.5">
                                Écosystème scolaire
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`font-medium text-xs transition-colors duration-200 ${location.pathname === link.path
                                        ? 'text-sky-600 dark:text-sky-400 font-semibold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

                        {/* Theme Toggle & Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="Changer le thème"
                            >
                                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                            </button>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium text-xs rounded-xl shadow-sm hover:shadow-md transition-all"
                                    >
                                        <LayoutDashboard size={15} />
                                        {user ? user.firstName : 'Dashboard'}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                        title="Déconnexion"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 font-medium text-xs transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="px-4.5 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium text-xs rounded-xl shadow-sm hover:shadow-md transition-all"
                                    >
                                        S'inscrire
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle & Theme */}
                    <div className="md:hidden flex items-center gap-1.5">
                        <button onClick={toggleTheme} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 space-y-4 shadow-xl border-t border-slate-200/60 dark:border-slate-800 absolute w-full left-0 top-full animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-sky-600 text-white font-medium text-xs rounded-xl shadow-sm"
                                >
                                    <LayoutDashboard size={16} />
                                    {user ? `Espace ${user.firstName}` : 'Accéder au Dashboard'}
                                </Link>
                                <button
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="flex items-center justify-center gap-2 py-2.5 text-red-500 font-medium text-xs hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                                >
                                    <LogOut size={16} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link
                                    to={ROUTES.LOGIN}
                                    onClick={() => setIsOpen(false)}
                                    className="text-center py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to={ROUTES.REGISTER}
                                    onClick={() => setIsOpen(false)}
                                    className="text-center py-2.5 bg-sky-600 text-white font-medium text-xs rounded-xl shadow-sm"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
