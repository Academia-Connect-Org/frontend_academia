import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getFileUrl } from '../api/axios';
import HomeworkAnnotationViewer from '../components/HomeworkAnnotationViewer';

const MobileAnnotationViewer: React.FC = () => {
    const [searchParams] = useSearchParams();
    const submissionId = searchParams.get('submissionId');
    const token = searchParams.get('token');

    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }

        const fetchSubmission = async () => {
            if (!submissionId) {
                setError("ID de soumission manquant");
                setLoading(false);
                return;
            }

            try {
                const res = await api.get(`/submissions/${submissionId}`);
                setSubmission(res.data);
            } catch (err: any) {
                console.error("Error fetching submission:", err);
                setError("Impossible de charger la soumission");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [submissionId, token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white font-black text-xl animate-pulse">
                Chargement de la correction...
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-10 text-center">
                <div className="text-rose-500 text-6xl mb-6">⚠️</div>
                <h1 className="text-2xl font-black mb-4">{error || "Erreur"}</h1>
                <p className="text-slate-400">Veuillez réessayer depuis l'application mobile.</p>
            </div>
        );
    }

    // Submission has multiple files? We might need to handle which one to show.
    // However, the mobile app usually passes the specific file URL or expects the viewer to handle it.
    // In our case, the HomeworkAnnotationViewer handles one fileUrl at a time.
    // But since the teacher's annotations are stored for all files in the submission, 
    // we take the first fileUrl from the submission if none provided.
    const fileUrl = searchParams.get('fileUrl') || (submission.fileUrl ? submission.fileUrl.split(',')[0] : '');

    return (
        <div className="fixed inset-0 bg-slate-900 overflow-hidden">
            <HomeworkAnnotationViewer
                fileUrl={getFileUrl(fileUrl)}
                initialAnnotations={submission.teacherAnnotations}
                readOnly={true}
                onClose={() => {
                    // This will be called if the user clicks close.
                    // We can tell the mobile app via a message or just let the user close the native view.
                    console.log("Viewer closed");
                }}
            />
            {/* Custom overlay style for mobile hide UI elements we don't need */}
            <style>{`
                /* Hide the header save button as we are in read-only mobile view */
                button:has(svg[class*="Save"]) { display: none !important; }
                /* Adjust spacing for mobile */
                .shadow-2xl { box-shadow: none !important; }
            `}</style>
        </div>
    );
};

export default MobileAnnotationViewer;
