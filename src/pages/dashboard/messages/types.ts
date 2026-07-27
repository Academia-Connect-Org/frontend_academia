export interface ChatRoom {
    id: number;
    name: string | null;
    description?: string;
    type: 'PRIVATE' | 'GROUP' | 'COMMUNITY';
    imageUrl: string | null;
    inviteLink: string | null;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

export interface Message {
    id: number;
    sender: {
        id: number;
        firstName: string;
        lastName: string;
        role: string;
    };
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'STICKER' | 'VOICE';
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    duration: number | null;
    sentAt: string;
    parentMessage?: {
        id: number;
        content: string;
        sender: {
            firstName: string;
        };
    } | null;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    signature: string;
    createdAt: string;
    targetRole?: string;
}
