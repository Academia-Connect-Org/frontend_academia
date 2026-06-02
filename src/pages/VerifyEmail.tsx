import React, { useState } from 'react';
import { Mail, Lock, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, API_ENDPOINTS } from '../constants/routes';
import api from '../api/axios';
import loginBg from '../assets/login-bg.png';
import logo from '../assets/logo.png';

const VerifyEmail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Get email from location state (passed from Register page)
    const email = location.state?.email || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email manquant. Veuillez vous réinscrire.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post(API_ENDPOINTS.AUTH.VERIFY, {
                email,
                code
            });

            const data = response.data;
            setSuccess(true);

            // Short delay to show success message before redirecting/logging in
            setTimeout(() => {
                login(data.token, {
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    classe: data.classe,
                    classes: data.classes
                });
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Code invalide");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: `url(${loginBg})` }}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"></div>

            <div className="bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/20">
                <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 text-sm font-semibold">
                    <ArrowLeft size={16} /> Retour à la connexion
                </Link>

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                        <Mail className="w-12 h-12 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-blue-900">Vérifiez votre email</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Nous avons envoyé un code de confirmation à <br />
                        <span className="text-blue-600 font-bold">{email || "votre email"}</span>
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-500">
                        <div className="bg-green-100 p-4 rounded-full mb-4">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Email vérifié !</h2>
                        <p className="text-slate-500 text-center mt-2 font-medium">
                            Votre compte a été activé avec succès. <br />
                            Redirection en cours...
                        </p>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">Code de confirmation</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-center tracking-[0.5em] text-xl font-bold"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-800 to-indigo-700 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                "Vérifier mon compte"
                            )}
                        </button>

                        <p className="text-center text-slate-500 text-sm">
                            Vous n'avez pas reçu le code ? <br />
                            <button type="button" className="text-blue-700 font-bold mt-1 hover:underline">Renvoyer l'email</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
