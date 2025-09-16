'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load chat history and check user
  useEffect(() => {
    async function loadChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load chat from Supabase
      const { data, error } = await supabase
        .from('chats')
        .select('messages')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        setError('Failed to load chat: ' + error.message);
      } else if (data) {
        setMessages(data.messages || []);
      }
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
        // Auto-save after AI response
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
      });

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

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Study Chatbot</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg shadow">
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 text-center">
            Start by asking a CS or study question!
          </p>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-white text-gray-800'
            }`}
          >
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
          </div>
        ))}
        {loading && (
          <p className="text-gray-500 text-center animate-pulse">Thinking...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleReset}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about CS or study tips..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}