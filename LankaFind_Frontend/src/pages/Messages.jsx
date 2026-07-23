import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader icon="💬" title="Messages" subtitle="Chat with finders and owners, no phone number needed." accent="from-blue-600 to-indigo-500" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-gray-100 dark:border-slate-800 overflow-hidden h-[70vh]">

          {/* Conversation list */}
          <div className="md:col-span-1 border-r border-gray-100 dark:border-slate-800 overflow-y-auto">
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
                    {c.itemImage ? (
                      <img src={getImageUrl(c.itemImage)} alt={c.itemTitle} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    ) : (
                      <span className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">📦</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.otherUserName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.itemTitle}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="text-xs font-bold bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Active thread */}
          <div className="md:col-span-2 flex flex-col">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-gray-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{active.otherUserName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Re: {active.itemTitle}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {loadingThread ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Loading...</p>
                  ) : thread.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500">No messages yet - say hello!</p>
                  ) : (
                    thread.map((m) => {
                      const isMine = m.sender === user.id || m.sender?._id === user.id;
                      return (
                        <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                              isMine
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    Send
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
