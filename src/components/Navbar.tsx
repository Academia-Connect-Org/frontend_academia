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

    const isAuthPage = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER || location.pathname === ROUTES.PAYMENT || location.pathname === ROUTES.PRIVACY || location.pathname === ROUTES.TERMS || location.pathname === ROUTES.COOKIES;
    const isContactPage = location.pathname === ROUTES.CONTACT;
    const isHomePage = location.pathname === '/';
    const isTransparent = isHomePage && !scrolled;

    let navClasses = scrolled || isAuthPage
        ? 'bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-lg dark:shadow-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 py-1.5'
        : 'bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm py-3 border-b border-transparent dark:border-transparent';

    if (isContactPage) {
        navClasses = 'bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-lg dark:shadow-slate-900/50 border-b border-slate-200/50 dark:border-slate-800 py-1.5';
    }

    if (isTransparent) {
        navClasses = 'bg-transparent py-4 border-b border-transparent';
    }

    return (
        <nav className={`fixed w-full z-60 transition-all duration-500 ${navClasses}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className={`shadow-lg inline-block rounded-full p-1 backdrop-blur-sm transition-colors duration-300 ${isTransparent ? 'bg-white/20 dark:bg-white' : 'bg-white/20 dark:bg-white'}`}>
                            <img src={logo} alt="Logo" className="h-13 w-13 object-contain rounded-full" />
                        </div>
                        <span className={`text-xl font-black tracking-tight leading-tight transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-blue-900 dark:text-white'}`}>ACADEMIA<br />connect</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-bold text-sm uppercase tracking-widest transition-all ${isTransparent ? 'text-white/90 hover:text-white' : 'hover:text-blue-600 dark:hover:text-blue-400 text-blue-900 dark:text-slate-200'} ${location.pathname === link.path && !isTransparent ? 'text-blue-600 dark:text-blue-400' : ''}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className={`h-6 w-px ml-4 transition-colors duration-300 ${isTransparent ? 'bg-white/30' : 'bg-blue-900/20 dark:bg-white/20'}`}></div>

                        <div className="flex items-center gap-4 md:gap-6">
                            {/* Theme Toggle Desktop */}
                            <button onClick={toggleTheme} className={`p-2 transition-all rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'text-blue-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-900/5 dark:hover:bg-white/10'}`} title="Changer le thème">
                                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/dashboard" className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all rounded-lg">
                                        <LayoutDashboard size={18} />
                                        {user ? user.firstName : 'Dashboard'}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className={`p-2.5 transition-all rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'text-blue-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-900/5 dark:hover:bg-white/10'}`}
                                        title="Déconnexion"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link to={ROUTES.LOGIN} className={`font-bold transition-colors text-sm uppercase tracking-widest ${isTransparent ? 'text-white hover:text-white/80' : 'text-blue-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                                        Connexion
                                    </Link>
                                    <Link to={ROUTES.REGISTER} className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all rounded-lg">
                                        S'inscrire
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Toggle & Theme */}
                    <div className="md:hidden flex items-center gap-2">
                        <button onClick={toggleTheme} className={`p-2 transition-colors rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'text-blue-900 dark:text-slate-200 hover:bg-blue-900/5 dark:hover:bg-white/10'}`}>
                            {isDark ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className={`p-2 transition-colors rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'text-blue-900 dark:text-slate-200 hover:bg-blue-900/5 dark:hover:bg-white/10'}`}>
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300 border-t border-slate-100 dark:border-slate-800 absolute w-full left-0 top-full">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block text-xl font-bold text-blue-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">
                                    <LayoutDashboard size={20} />
                                    {user ? `Espace ${user.firstName}` : 'Accéder au Dashboard'}
                                </Link>
                                <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center justify-center gap-3 py-4 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                                    <LogOut size={20} />
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)} className="text-center py-4 text-blue-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Connexion
                                </Link>
                                <Link to={ROUTES.REGISTER} onClick={() => setIsOpen(false)} className="text-center py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">
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
