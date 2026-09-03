import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

// Palette used to color-code contact avatars, picked deterministically from the name
// so the same person always gets the same color across the app.
const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500',
  'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-pink-500'
];

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Small colored circle showing a person's initials - used everywhere a contact photo would go.
function Avatar({ name, size = 'w-11 h-11 text-sm' }) {
  return (
    <span className={`${size} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm`}>
      {getInitials(name)}
    </span>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Active conversation being viewed
  const [active, setActive] = useState(null); // { itemId, itemTitle, itemImage, otherUserId, otherUserName }
  const [thread, setThread] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [newText, setNewText] = useState('');
  const [sending, setSending] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  const bottomRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchThread = async (itemId, otherUserId) => {
    setLoadingThread(true);
    try {
      const response = await api.get(`/messages/thread/${itemId}/${otherUserId}`);
      setThread(response.data);
    } catch (err) {
      console.error('Error fetching thread:', err);
    } finally {
      setLoadingThread(false);
    }
  };

  // On load: fetch conversation list, and if the URL has ?item=&user=&title= (from a
  // "Message" button on an item card), open that conversation right away.
  useEffect(() => {
    const init = async () => {
      const list = await fetchConversations();

      const itemId = searchParams.get('item');
      const otherUserId = searchParams.get('user');
      const itemTitle = searchParams.get('title');
      const otherUserName = searchParams.get('name');

      if (itemId && otherUserId) {
        const existing = list.find((c) => c.itemId === itemId && c.otherUserId === otherUserId);
        const convo = existing || {
          itemId,
          otherUserId,
          itemTitle: itemTitle || 'Item',
          otherUserName: otherUserName || 'User',
          itemImage: null
        };
        setActive(convo);
        setShowListOnMobile(false);
        fetchThread(itemId, otherUserId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const openConversation = (convo) => {
    setActive(convo);
    setShowListOnMobile(false);
    fetchThread(convo.itemId, convo.otherUserId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newText.trim() || !active) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        itemId: active.itemId,
        receiverId: active.otherUserId,
        text: newText.trim()
      });
      setThread([...thread, response.data]);
      setNewText('');
      fetchConversations(); // refresh last-message preview + unread counts
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-[38px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Messages" subtitle="Chat with finders and owners, no phone number needed." accent="from-blue-600 to-indigo-500" />

        <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 overflow-hidden h-[70vh]">

          {/* Conversation list */}
          <div className={`md:col-span-1 border-r border-gray-100 dark:border-slate-800 overflow-y-auto ${!showListOnMobile ? 'hidden md:block' : ''}`}>
            {loadingConversations ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 p-4">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 p-4">No conversations yet.</p>
            ) : (
              conversations.map((c) => {
                const isActive = active && active.itemId === c.itemId && active.otherUserId === c.otherUserId;
                return (
                  <button
                    key={`${c.itemId}-${c.otherUserId}`}
                    onClick={() => openConversation(c)}
                    className={`w-full text-left p-3 flex gap-3 items-center border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition ${
                      isActive ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                    }`}
                  >
                    <Avatar name={c.otherUserName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.otherUserName}</p>
                        {c.unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center flex-shrink-0">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.itemTitle}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active thread */}
          <div className={`md:col-span-2 flex flex-col bg-gray-50/60 dark:bg-slate-950/40 ${showListOnMobile ? 'hidden md:flex' : 'flex'}`}>
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
                  <button
                    onClick={() => setShowListOnMobile(true)}
                    className="md:hidden text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Back to conversations"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Avatar name={active.otherUserName} size="w-9 h-9 text-xs" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{active.otherUserName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Re: {active.itemTitle}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                  {loadingThread ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                  ) : thread.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">No messages yet — say hello!</p>
                  ) : (
                    thread.map((m) => {
                      const isMine = m.sender === user.id || m.sender?._id === user.id;
                      return (
                        <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] px-3.5 py-2 text-sm shadow-sm ${
                              isMine
                                ? 'bg-emerald-500 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm'
                            }`}
                          >
                            <p>{m.text}</p>
                            {m.createdAt && (
                              <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-emerald-50/80' : 'text-gray-400 dark:text-gray-500'}`}>
                                {formatTime(m.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newText.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 transition flex-shrink-0"
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 translate-x-[1px]">
                      <path d="M3.4 20.4l17.45-8.4a1 1 0 000-1.8L3.4 1.8a1 1 0 00-1.4 1.1L4.5 12l-2.5 9.1a1 1 0 001.4 1.1z" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
