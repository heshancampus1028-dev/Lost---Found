import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

// ---------- Avatar helpers ----------
// Each contact gets a stable color derived from their name, so people are
// visually distinguishable at a glance even without a photo.
const AVATAR_PALETTE = [
  { bg: 'bg-rose-500', ring: 'ring-rose-200 dark:ring-rose-500/30' },
  { bg: 'bg-orange-500', ring: 'ring-orange-200 dark:ring-orange-500/30' },
  { bg: 'bg-amber-500', ring: 'ring-amber-200 dark:ring-amber-500/30' },
  { bg: 'bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
  { bg: 'bg-teal-500', ring: 'ring-teal-200 dark:ring-teal-500/30' },
  { bg: 'bg-sky-500', ring: 'ring-sky-200 dark:ring-sky-500/30' },
  { bg: 'bg-indigo-500', ring: 'ring-indigo-200 dark:ring-indigo-500/30' },
  { bg: 'bg-violet-500', ring: 'ring-violet-200 dark:ring-violet-500/30' },
  { bg: 'bg-pink-500', ring: 'ring-pink-200 dark:ring-pink-500/30' },
];

function colorFor(name) {
  const key = name || '?';
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initialsFor(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function Avatar({ name, image, size = 40 }) {
  const { bg, ring } = colorFor(name);
  const dim = { width: size, height: size };
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={dim}
        className={`rounded-full object-cover flex-shrink-0 ring-2 ${ring}`}
      />
    );
  }
  return (
    <span
      style={dim}
      className={`rounded-full ${bg} text-white flex items-center justify-center flex-shrink-0 font-semibold ring-2 ${ring}`}
    >
      <span style={{ fontSize: size * 0.38 }}>{initialsFor(name)}</span>
    </span>
  );
}

function formatClock(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const today = new Date();
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (isSameDay(d, today)) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [search, setSearch] = useState('');

  // Active conversation being viewed
  const [active, setActive] = useState(null); // { itemId, itemTitle, itemImage, otherUserId, otherUserName }
  const [thread, setThread] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [newText, setNewText] = useState('');
  const [sending, setSending] = useState(false);


  // `silent: true` is used by the background polling below — it refreshes data
  // without flipping the loading spinners on, so the UI doesn't flicker every
  // few seconds.
  const fetchConversations = async ({ silent = false } = {}) => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching conversations:', err);
      return [];
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const fetchThread = async (itemId, otherUserId, { silent = false } = {}) => {
    if (!silent) setLoadingThread(true);
    try {
      const response = await api.get(`/messages/thread/${itemId}/${otherUserId}`);
      setThread(response.data);
    } catch (err) {
      console.error('Error fetching thread:', err);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  };

  // On load: fetch conversation list, and if the URL has ?item=&user=&title= (from an
  // "💬 Message" button on an item card), open that conversation right away.
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
        fetchThread(itemId, otherUserId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll-to-bottom was removed entirely - even scoped to just this
  // container, jumping the chat pane on every new/polled message was more
  // disruptive than helpful. Scrolling in the thread is now fully manual.

  // Poll the open thread every few seconds so incoming replies show up without
  // a page refresh. This is a lightweight stand-in for real-time push; a
  // WebSocket (e.g. socket.io) would be instant, but that needs backend
  // changes to emit events, so polling is the drop-in fix on the frontend alone.
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchThread(active.itemId, active.otherUserId, { silent: true });
      }
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.itemId, active?.otherUserId]);

  // Poll the conversation list a bit less often, to keep unread counts and
  // last-message previews fresh for chats that aren't currently open.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchConversations({ silent: true });
      }
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = (convo) => {
    setActive(convo);
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

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.trim().toLowerCase();
    return conversations.filter(
      (c) =>
        c.otherUserName?.toLowerCase().includes(q) ||
        c.itemTitle?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  // Group thread messages by day so we can show "Today" / "Yesterday" dividers,
  // the way WhatsApp does.
  const groupedThread = useMemo(() => {
    const groups = [];
    thread.forEach((m) => {
      const label = formatDayLabel(m.createdAt) || null;
      const lastGroup = groups[groups.length - 1];
      if (label && lastGroup && lastGroup.label === label) {
        lastGroup.items.push(m);
      } else if (label) {
        groups.push({ label, items: [m] });
      } else {
        // No timestamp on this message — attach to previous group, or a bare one.
        if (lastGroup && lastGroup.label === '__no_date__') {
          lastGroup.items.push(m);
        } else {
          groups.push({ label: '__no_date__', items: [m] });
        }
      }
    });
    return groups;
  }, [thread]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader icon="💬" title="Messages" subtitle="Chat with finders and owners, no phone number needed." accent="from-blue-600 to-indigo-500" />

        <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 overflow-hidden h-[75vh]">

          {/* Conversation list */}
          <div className="md:col-span-1 border-r border-gray-100 dark:border-slate-800 flex flex-col min-h-0">
            <div className="p-3 border-b border-gray-100 dark:border-slate-800">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition text-gray-700 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
                        <div className="h-2 w-4/5 rounded bg-gray-100 dark:bg-slate-800/70" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 p-4 text-center">
                  {conversations.length === 0 ? 'No conversations yet.' : 'No matches found.'}
                </p>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = active && active.itemId === c.itemId && active.otherUserId === c.otherUserId;
                  return (
                    <button
                      key={`${c.itemId}-${c.otherUserId}`}
                      onClick={() => openConversation(c)}
                      className={`relative w-full text-left px-3 py-3 flex gap-3 items-center border-b border-gray-50 dark:border-slate-800/70 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition ${
                        isActive ? 'bg-emerald-50/70 dark:bg-emerald-500/10' : ''
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r" />
                      )}
                      <Avatar name={c.otherUserName} image={c.itemImage ? getImageUrl(c.itemImage) : null} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.otherUserName}</p>
                          {c.lastMessageAt && (
                            <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                              {formatClock(c.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.itemTitle}</p>
                        <p className={`text-xs truncate ${c.unreadCount > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {c.lastMessage}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="text-[11px] font-bold bg-emerald-500 text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active thread */}
          <div className="md:col-span-2 flex flex-col min-h-0">
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-sm gap-2 bg-gray-50/60 dark:bg-slate-900/40">
                <span className="text-4xl">💬</span>
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
                  <Avatar name={active.otherUserName} image={active.itemImage ? getImageUrl(active.itemImage) : null} size={38} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{active.otherUserName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">Re: {active.itemTitle}</p>
                  </div>
                </div>

                <div
                  className="flex-1 overflow-y-auto p-4 space-y-1"
                  style={{
                    backgroundColor: 'var(--chat-bg, transparent)',
                    backgroundImage:
                      'radial-gradient(currentColor 0.5px, transparent 0.5px)',
                    backgroundSize: '16px 16px',
                    color: 'rgba(120,120,120,0.06)'
                  }}
                >
                  {loadingThread ? (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-gray-500">
                      Loading...
                    </div>
                  ) : thread.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-1">
                      <span className="text-2xl">👋</span>
                      <p className="text-xs">No messages yet — say hello!</p>
                    </div>
                  ) : (
                    groupedThread.map((group, gi) => (
                      <div key={gi}>
                        {group.label && group.label !== '__no_date__' && (
                          <div className="flex justify-center my-3">
                            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-full shadow-sm">
                              {group.label}
                            </span>
                          </div>
                        )}
                        {group.items.map((m) => {
                          const isMine = m.sender === user.id || m.sender?._id === user.id;
                          const time = formatClock(m.createdAt);
                          return (
                            <div key={m._id} className={`flex mb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`relative max-w-[75%] px-3 py-2 text-sm shadow-sm ${
                                  isMine
                                    ? 'bg-emerald-500 text-white rounded-2xl rounded-br-md'
                                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-md'
                                }`}
                              >
                                <span className="whitespace-pre-wrap break-words">{m.text}</span>
                                {time && (
                                  <span
                                    className={`block text-[10px] mt-1 text-right ${
                                      isMine ? 'text-emerald-50/80' : 'text-gray-400 dark:text-gray-500'
                                    }`}
                                  >
                                    {time}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newText.trim()}
                    className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 transition flex-shrink-0"
                    aria-label="Send message"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.4 2.5a.75.75 0 01.9-.1l14 8.5a.75.75 0 010 1.3l-14 8.5a.75.75 0 01-1.1-.85L5.8 11 3.2 3.35a.75.75 0 01.2-.85z" />
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
