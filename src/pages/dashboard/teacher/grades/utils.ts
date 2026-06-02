export const getGradeMention = (value: number, max: number) => {
    if (isNaN(value)) return null;
    const score = (value / max) * 20; // Normalize to 20 for standard logic
    
    if (score >= 18) return { label: 'Excellent', color: 'bg-emerald-600' };
    if (score >= 16) return { label: 'Très Bien', color: 'bg-blue-600' };
    if (score >= 14) return { label: 'Bien', color: 'bg-indigo-600' };
    if (score >= 12) return { label: 'Assez Bien', color: 'bg-amber-600' };
    if (score >= 10) return { label: 'Passable', color: 'bg-slate-500' };
    if (score >= 8) return { label: 'Insuffisant', color: 'bg-orange-500' };
    return { label: 'Médiocre', color: 'bg-red-600' };
};
