import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MessageSquare, Send } from 'lucide-react';

// 定义消息类型
interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 加载聊天历史
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get('/api/chat/history');
        if (response.data.messages && Array.isArray(response.data.messages)) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const callChatGPT = async (newMessages: ChatMessage[]) => {
    // 转换消息格式，只发送最近的100条消息
    const recentMessages = newMessages.slice(-100).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const response = await api.post('/api/chat', {
      messages: recentMessages,
    });
    return response.data.reply;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const userMsg: ChatMessage = { role: 'user', content: message };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages); // 先更新本地记录
    setMessage('');
    setLoading(true);
  
    try {
      const aiReply = await callChatGPT(updatedMessages); // 传递完整上下文
      const assistantMsg: ChatMessage = { role: 'assistant', content: aiReply };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('API error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: failed to get response.' }]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 md:relative md:h-[calc(100vh-4.5rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Chat With Your AI Nutrition Helper
          </h1>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 mx-4 md:mx-6 lg:mx-8 bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 space-y-4">
          {initialLoading ? (
            <div className="text-center text-gray-500 py-8">
              <p>Loading chat history...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages yet</p>
              <p className="text-sm">Start a conversation with your team</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-orange-100 text-right'
                      : 'bg-gray-100 text-left'
                  }`}
                >
                  <p className="text-sm text-gray-800">{msg.content}</p>
                </div>
              </div>
            ))            
          )}

          {loading && (
            <div className="text-sm text-gray-400">AI is typing...</div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white p-4 md:p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex space-x-2 md:space-x-4 max-w-[1200px] mx-auto"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-sm md:text-base"
              disabled={!message.trim() || loading}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
