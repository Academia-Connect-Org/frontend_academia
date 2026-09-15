import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../constants/routes';

import { API_BASE_URL } from '../api/axios';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    address?: string;
    phone?: string;
    profileImage?: string;
    institution?: any;
    classe?: any;
    classes?: any[];
    specialties?: string[];
    cycles?: any[];
    subscriptionType?: string;
    subscriptionPeriod?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    parent?: any;
    motherFirstName?: string;
    motherLastName?: string;
    motherEmail?: string;
    motherPhone?: string;
    fatherFirstName?: string;
    fatherLastName?: string;
    fatherEmail?: string;
    fatherPhone?: string;
    motherAccount?: any;
    fatherAccount?: any;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    refreshToken?: string | null;
    login: (token: string, userData: User, refreshToken?: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        console.log("[AuthContext Initialization] savedUser found:", !!savedUser, "savedToken found:", !!savedToken);

        if (savedUser && savedToken) {
            try {
                const loginTime = localStorage.getItem('loginTime');
                const now = Date.now();
                if (loginTime) {
                    const elapsed = now - parseInt(loginTime);
                    console.log("[AuthContext Initialization] Elapsed time since login:", (elapsed / 3600000).toFixed(2), "hours");
                    if (elapsed > 7 * 24 * 60 * 60 * 1000) {
                        console.warn("[AuthContext Initialization] Session expired (7d+). Clearing storage.");
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('loginTime');
                        return null;
                    }
                }
                const parsed = JSON.parse(savedUser);
                console.log("[AuthContext Initialization] User restored:", parsed.email, "Role:", parsed.role);
                return parsed;
            } catch (e) {
                console.error("[AuthContext Initialization] Failed to parse saved user:", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('loginTime');
                return null;
            }
        }

        if (savedToken && !savedUser) {
            console.warn("[AuthContext Initialization] Token exists but User data is missing. Clearing.");
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }

        console.log("[AuthContext Initialization] No valid session found in localStorage.");
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        return (savedToken && savedUser) ? savedToken : null;
    });
    const [refreshToken, setRefreshToken] = useState<string | null>(() => {
        return localStorage.getItem('refreshToken');
    });
    const navigate = useNavigate();

    const login = (newToken: string, userData: User, newRefreshToken?: string) => {
        console.log("AuthContext: login started with", { newToken, userData });

        if (!userData || !userData.role) {
            console.error("AuthContext: LOGIN FAILED - No user data or role provided!");
            return;
        }

        // Clean any existing token / session data to prevent conflicts between login methods (email vs Google)
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');

        setToken(newToken);
        setUser(userData);
        if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loginTime', Date.now().toString());

        const role = userData.role.toString().toUpperCase();
        console.log("AuthContext: Normalizing role for redirection:", role);

        if (role === 'APP_ADMIN') {
            console.log("Navigating to ADMIN");
            navigate(ROUTES.DASHBOARD.ADMIN.HOME);
        } else if (role === 'PDG') {
            console.log("Navigating to PDG");
            navigate(ROUTES.DASHBOARD.PDG.HOME);
        } else if (role === 'DIRECTION' || role === 'PROVISORIAT') {
            console.log("Navigating to DIRECTION/PROVISORIAT Space");
            navigate(ROUTES.DASHBOARD.DIRECTION.HOME);
        } else if (role === 'SECRETARIAT') {
            console.log("Navigating to SECRETARIAT");
            navigate(ROUTES.DASHBOARD.SECRETARIAT.HOME);
        } else if (role === 'ENSEIGNANT') {
            console.log("Navigating to TEACHER");
            navigate(ROUTES.DASHBOARD.TEACHER.HOME);
        } else if (role === 'PARENT' || role === 'PARENTS') {
            console.log("Navigating to PARENT");
            navigate(ROUTES.DASHBOARD.PARENT.HOME);
        } else if (role === 'ELEVE') {
            console.log("Navigating to STUDENT");
            navigate(ROUTES.DASHBOARD.STUDENT.HOME);
        } else {
            console.warn("AuthContext: Unknown role, navigating to HOME", role);
            navigate(ROUTES.HOME);
        }
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        localStorage.setItem('logout', Date.now().toString()); // Sync tabs
        navigate(ROUTES.LOGIN);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const refreshedUser = await response.json();
                setUser(refreshedUser);
                localStorage.setItem('user', JSON.stringify(refreshedUser));
                console.log("[AuthContext] User refreshed successfully");
            }
        } catch (error) {
            console.error("[AuthContext] Failed to refresh user:", error);
        }
    };

    React.useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'logout' || e.key === 'token') {
                if (!localStorage.getItem('token')) {
                    // Sync logout across tabs
                    setToken(null);
                    setUser(null);
                    navigate(ROUTES.LOGIN);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [navigate]);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
