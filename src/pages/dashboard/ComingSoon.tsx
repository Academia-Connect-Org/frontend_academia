import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon: React.FC<{ role: string, title: string }> = ({ role, title }) => {
    return (
        <>
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
                    <Construction size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Cette page est en cours de développement</h2>
                <p className="text-slate-400 max-w-md mx-auto font-medium">
                    Nous travaillons activement sur le module <span className="text-blue-600 font-bold">{title}</span> pour vous offrir la meilleure expérience possible.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all"
                >
                    Retourner
                </button>
            </div>
        </>
    );
};

export default ComingSoon;
