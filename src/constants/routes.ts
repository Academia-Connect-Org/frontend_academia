/**
 * Centralized Route Management (Frontend Pages)
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY: '/verify',
    SUPPORT: '/support',
    PRICING: '/pricing',
    CONTACT: '/contact',
    FEATURES: '/features',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    COOKIES: '/cookies',
    PAYMENT: '/payment',
    SUBSCRIPTION_EXPIRED: '/subscription-expired',
    PROFILE: '/dashboard/profile',

    DASHBOARD: {
        ADMIN: {
            HOME: '/dashboard/admin',
            INSTITUTIONS: '/dashboard/admin/institutions',
            USERS: '/dashboard/admin/users',
            SETTINGS: '/dashboard/admin/settings',
        },
        PDG: {
            HOME: '/dashboard/pdg',
            STATS: '/dashboard/pdg/stats',
            SCHOOLS: '/dashboard/pdg/schools',
            SCHOOL_DETAILS: '/dashboard/pdg/schools/:id',
            STUDENTS: '/dashboard/pdg/students',
            TEACHERS: '/dashboard/pdg/teachers',

            MESSAGES: '/dashboard/pdg/messages',
            NOTIFICATIONS: '/dashboard/pdg/notifications',
            SETTINGS: '/dashboard/pdg/settings',
            CYCLES: '/dashboard/pdg/cycles',
            ENROLL: '/dashboard/pdg/enroll',
            ATTENDANCE: '/dashboard/pdg/attendance',
        },
        DIRECTION: {
            HOME: '/dashboard/direction',
            CYCLES: '/dashboard/direction/cycles',
            CLASSES: '/dashboard/direction/classes',
            SUBJECTS: '/dashboard/direction/subjects',
            ENROLL: '/dashboard/direction/enroll',
            STAFF: '/dashboard/direction/staff',
            TEACHERS: '/dashboard/direction/teachers',
            STUDENTS: '/dashboard/direction/students',
            SCHEDULE: '/dashboard/direction/schedule',
            ROOMS: '/dashboard/direction/rooms',
            MESSAGES: '/dashboard/direction/messages',
            NOTIFICATIONS: '/dashboard/direction/notifications',
            ANNOUNCEMENTS: '/dashboard/direction/announcements',
            REPORT_CARDS: '/dashboard/direction/report-cards',
        },
        SECRETARIAT: {
            HOME: '/dashboard/secretariat',
            CYCLES: '/dashboard/secretariat/cycles',
            CLASSES: '/dashboard/secretariat/classes',
            SUBJECTS: '/dashboard/secretariat/subjects',
            ENROLL: '/dashboard/secretariat/enroll',
            TEACHERS: '/dashboard/secretariat/teachers',
            STUDENTS: '/dashboard/secretariat/students',
            PARENTS: '/dashboard/secretariat/parents',
            ATTENDANCE: '/dashboard/secretariat/attendance',
            SCHEDULE: '/dashboard/secretariat/schedule',
            ROOMS: '/dashboard/secretariat/rooms',
            MESSAGES: '/dashboard/secretariat/messages',
            NOTIFICATIONS: '/dashboard/secretariat/notifications',
            ANNOUNCEMENTS: '/dashboard/secretariat/announcements',
            REPORT_CARDS: '/dashboard/secretariat/report-cards',
        },
        TEACHER: {
            HOME: '/dashboard/teacher',
            BOOK: '/dashboard/teacher/book',
            HOMEWORK: '/dashboard/teacher/homework',
            GRADES: '/dashboard/teacher/grades',
            CLASSES: '/dashboard/teacher/classes',
            SCHEDULE: '/dashboard/teacher/schedule',
            MESSAGES: '/dashboard/teacher/messages',
            NOTIFICATIONS: '/dashboard/teacher/notifications',
            REPORT_CARDS: '/dashboard/teacher/report-cards',
        },
        PARENT: {
            HOME: '/dashboard/parent',
            RESULTS: '/dashboard/parent/results',
            SCHEDULE: '/dashboard/parent/schedule',
            PAYMENTS: '/dashboard/parent/payments',
            MESSAGES: '/dashboard/parent/messages',
            NOTIFICATIONS: '/dashboard/parent/notifications',
        },
        STUDENT: {
            HOME: '/dashboard/student',
            COURSES: '/dashboard/student/courses',
            RESULTS: '/dashboard/student/results',
            HOMEWORK: '/dashboard/student/homework',
            SCHEDULE: '/dashboard/student/schedule',
            MESSAGES: '/dashboard/student/messages',
            NOTIFICATIONS: '/dashboard/student/notifications',
        }
    }
};

/**
 * Centralized API Endpoint Management (Backend Routes)
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY: '/auth/verify',
        RESEND_VERIFICATION: '/auth/resend-verification',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
    },
    DASHBOARD: {
        STATS: '/stats',
    }
};
