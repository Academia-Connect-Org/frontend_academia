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
            <div className="flex h-[calc(100vh-2rem)] bg-slate-50 overflow-hidden relative">
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
