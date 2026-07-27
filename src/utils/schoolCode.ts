export const encodeSchoolId = (id: number): string => {
    if (!id) return '';
    const val = (id * 65431 + 12345) % 100000;
    return `AC${String(val).padStart(5, '0')}`;
};
