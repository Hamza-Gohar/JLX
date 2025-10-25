import React from 'react';
import type { ChatSession } from '../types';
import { PlusIcon, TrashIcon, XIcon } from './icons';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onLoadChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onClearAll: () => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onClose,
  subjectName,
  chatHistory,
  activeChatId,
  onLoadChat,
  onNewChat,
  onDeleteChat,
  onClearAll,
}) => {
  const getPreview = (chat: ChatSession) => {
    const firstUserMessage = chat.messages.find(m => m.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    const textPart = firstUserMessage.parts.find(p => 'text' in p);
    return textPart && 'text' in textPart ? textPart.text : 'Image message';
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 md:w-80 bg-gradient-to-b from-[#0B1220] to-[#172033] border-r border-white/10 text-white shadow-2xl z-40
                   transform transition-transform duration-300 ease-in-out flex flex-col
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-bold">Chat History</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-sm text-slate-300 bg-slate-900/50">{subjectName}</p>

        <div className="p-4 flex-shrink-0">
            <button
                onClick={onNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-transform transform hover:scale-105"
            >
                <PlusIcon className="w-5 h-5" />
                <span>New Chat</span>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200
                          ${chat.id === activeChatId ? 'bg-blue-600' : 'hover:bg-slate-700/60'}`}
            >
              <button
                onClick={() => onLoadChat(chat.id)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm font-medium truncate">{getPreview(chat)}</p>
                <p className={`text-xs mt-1 ${chat.id === activeChatId ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(chat.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="p-2 rounded-full text-slate-400 hover:bg-rose-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                aria-label="Delete chat"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {chatHistory.length > 0 && (
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={onClearAll}
              className="w-full text-sm py-2 px-4 rounded-lg text-rose-100 bg-rose-500/80 hover:bg-rose-500 transition-colors"
            >
              Clear All Chats
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default ChatHistorySidebar;