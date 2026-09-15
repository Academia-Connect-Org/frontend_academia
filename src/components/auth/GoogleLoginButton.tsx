import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, X, Check } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface GoogleLoginButtonProps {
    role?: string;
    schoolCode?: string;
    label?: string;
    askRole?: boolean;
    onSuccess?: () => void;
    onError?: (message: string) => void;
}

const DEFAULT_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "843918751662-qlkgiphspuk4jee240b3adf9jpog2eb2.apps.googleusercontent.com";

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
    role: initialRole,
    schoolCode,
    label = "Continuer avec Google",
    askRole = false,
    onSuccess,
    onError
}) => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [clientId, setClientId] = useState<string>(DEFAULT_GOOGLE_CLIENT_ID);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | undefined>(initialRole);

    useEffect(() => {
        // Fetch official Google Client ID configured in backend application.properties
        api.get('/auth/google-client-id')
            .then(res => {
                if (res.data?.clientId) {
                    setClientId(res.data.clientId);
                }
            })
            .catch(() => { });

        // Load Google Identity Services script dynamically if not loaded
        if (typeof window !== 'undefined' && !(window as any).google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    }, []);

    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const handleGoogleResponseWithRole = async (response: any, roleToAssign?: string) => {
        if (!response.credential) {
            if (onError) onError("Échec de l'authentification Google.");
            return;
        }

        const payload = parseJwt(response.credential);
        if (!payload || !payload.email) {
            if (onError) onError("Impossible de lire le compte Google.");
            return;
        }

        setLoading(true);
        try {
            const authRes = await api.post('/auth/google', {
                idToken: response.credential,
                email: payload.email,
                firstName: payload.given_name || payload.name?.split(' ')[0] || 'Utilisateur',
                lastName: payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Google',
                profileImage: payload.picture,
                role: roleToAssign || selectedRole || initialRole,
                schoolCode: schoolCode
            });

            if (authRes.data && authRes.data.token) {
                // Store user and tokens, clearing old ones first
                login(authRes.data.token, authRes.data, authRes.data.refreshToken);
                if (onSuccess) onSuccess();
            } else {
                if (onError) onError("Connexion Google refusée.");
            }
        } catch (err: any) {
            console.error("Google Auth error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Erreur lors de la connexion Google.";
            if (onError) onError(msg);
        } finally {
            setLoading(false);
        }
    };

    const startGoogleSignInFlow = (roleChoice?: string) => {
        if (typeof window === 'undefined' || !(window as any).google) {
            if (onError) onError("Le service Google Sign-In est en cours de chargement. Réessayez dans un instant.");
            return;
        }

        const google = (window as any).google;
        google.accounts.id.initialize({
            client_id: clientId,
            callback: (res: any) => handleGoogleResponseWithRole(res, roleChoice)
        });

        google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // Fallback to one-tap button trigger
                const btnDiv = document.createElement('div');
                google.accounts.id.renderButton(btnDiv, { theme: 'outline', size: 'large' });
                const clickEl = btnDiv.querySelector('div[role=button]') as HTMLElement;
                if (clickEl) clickEl.click();
            }
        });
    };

    const handleButtonClick = () => {
        if (askRole) {
            setShowRoleModal(true);
        } else {
            startGoogleSignInFlow(initialRole);
        }
    };

    const handleConfirmAndProceed = () => {
        const roleToUse = selectedRole || initialRole || 'PDG';
        setShowRoleModal(false);
        startGoogleSignInFlow(roleToUse);
    };

    const currentRole = selectedRole || initialRole || 'PDG';

    return (
        <>
            <button
                type="button"
                onClick={handleButtonClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
                <span>{loading ? 'Connexion en cours...' : label}</span>
            </button>

            {/* Modal de sélection de rôle */}
            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
                        >
                            <button
                                type="button"
                                onClick={() => setShowRoleModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Sélectionnez votre profil
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Choisissez votre rôle pour personnaliser votre espace sur Academia Connect
                                </p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('PDG')}
                                    className={`w-full flex items-center gap-4 p-4 border rounded-2xl text-left transition-all group cursor-pointer ${currentRole === 'PDG'
                                            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'
                                        }`}
                                >
                                    <div className="p-3 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 rounded-xl group-hover:scale-105 transition-transform">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                            Fondateur / Directeur d'Établissement
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Créer, administrer et gérer mes établissements scolaires
                                        </p>
                                    </div>
                                    <Check size={16} className={`text-sky-600 transition-opacity ${currentRole === 'PDG' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('PARENT')}
                                    className={`w-full flex items-center gap-4 p-4 border rounded-2xl text-left transition-all group cursor-pointer ${currentRole === 'PARENT'
                                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                                            : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                                        }`}
                                >
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                                        <Users size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                            Parent d'Élève
                                        </h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Suivre les notes, absences et paiements de mes enfants
                                        </p>
                                    </div>
                                    <Check size={16} className={`text-emerald-600 transition-opacity ${currentRole === 'PARENT' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowRoleModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmAndProceed}
                                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                                >
                                    S'inscrire
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GoogleLoginButton;
