'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history and check user
  useEffect(() => {
    async function loadChat() {
      setChatLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Failed to authenticate user');
        router.push('/login');
        setChatLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('chats')
        .select('messages')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        setError('Failed to load chat: ' + error.message);
      } else if (data) {
        setMessages(data.messages || []);
      }
      setChatLoading(false);
    }
    loadChat();
  }, [router]);

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        const updatedMessages = [...newMessages, { role: 'ai', content: data.reply }];
        setMessages(updatedMessages);
        await saveChat(updatedMessages);
      }
    } catch (err) {
      setError('Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  // Save chat to Supabase
  const saveChat = async (chatMessages: { role: string; content: string }[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chats')
      .upsert({
        user_id: user.id,
        messages: chatMessages,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });  // Explicitly specify onConflict for unique user_id

    if (error) {
      setError('Failed to save chat: ' + error.message);
    }
  };

  // Handle reset chat
  const handleReset = async () => {
    setMessages([]);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      setError('Failed to reset chat: ' + error.message);
    }
  };

  // Handle save chat
  const handleSave = async () => {
    setError(null);
    await saveChat(messages);
    alert('Chat saved!');
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Handle study tips preset
  const handleStudyTips = () => {
    setInput('Give me study tips for CS exams');
  };

  // Render Markdown safely
  const renderMarkdown = (text: string) => {
    // Handle both Promise and string return types from marked
    const htmlOrPromise = marked(text);
    if (typeof htmlOrPromise === 'string') {
      return { __html: DOMPurify.sanitize(htmlOrPromise) };
    } else if (htmlOrPromise instanceof Promise) {
      return { __html: '' };
    }
    return { __html: '' };
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gradient-to-br from-gray-900 to-blue-900">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-cyan-400">Study Chatbot</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-gray-900 px-4 py-2 rounded-lg glow-button hover:bg-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-800/80 rounded-lg shadow-lg backdrop-blur-sm">
        {chatLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-400"></div>
          </div>
        )}
        {!chatLoading && messages.length === 0 && !loading && (
          <p className="text-gray-300 text-center text-lg">
            Ask a CS or study question to get started!
          </p>
        )}
        {!chatLoading &&
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-4 rounded-lg max-w-[80%] shadow-sm transition-all duration-200 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-gray-100 ml-auto'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <strong className="block font-semibold">
                {msg.role === 'user' ? 'You' : 'AI'}:
              </strong>
              <div
                className="mt-1 whitespace-pre-wrap"
                dangerouslySetInnerHTML={renderMarkdown(msg.content)}
              />
            </div>
          ))}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-400"></div>
          </div>
        )}
        {error && <p className="text-red-400 text-center font-medium">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleReset}
          className="bg-gray-500 text-gray-100 px-4 py-2 rounded-lg glow-button hover:bg-gray-400 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="bg-green-500 text-gray-900 px-4 py-2 rounded-lg glow-button hover:bg-green-400 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleStudyTips}
          className="bg-purple-500 text-gray-900 px-4 py-2 rounded-lg glow-button hover:bg-purple-400 transition-colors"
        >
          Study Tips
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Ask about CS or study tips..."
          className="flex-1 p-3 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none placeholder-gray-400 italic"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-cyan-500 text-gray-900 px-6 py-3 rounded-lg glow-button hover:bg-cyan-400 disabled:bg-gray-500 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}