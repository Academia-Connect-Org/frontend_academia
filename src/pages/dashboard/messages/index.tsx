import React from 'react';
import { MessagesProvider } from './MessagesContext';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { Modals } from './Modals';
import { Notifications } from './Notifications';
import { MembersPanel } from './MembersPanel';

const Messages: React.FC<{ role: string }> = ({ role }) => {
    return (
        <MessagesProvider role={role}>
            <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative shadow-sm">
                <Notifications />
                <Sidebar />
                <ChatArea />
                <MembersPanel />
                <Modals />
            </div>
        </MessagesProvider>
    );
};

export default Messages;
