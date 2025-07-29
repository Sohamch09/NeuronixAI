import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ParticleBackground } from '@/components/ui/particle-background';
import { ChatMessage } from '@/components/ui/chat-message';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { Message, Conversation } from '@shared/schema';
import { Bot, Send, Paperclip, Menu, MessageSquare, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageResponse {
  userMessage: Message;
  botMessage: Message;
  aiData?: any;
  aiType?: string;
}

export default function Chat() {
  const [conversationId, setConversationId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create initial conversation
  useEffect(() => {
    const createInitialConversation = async () => {
      try {
        const response = await apiRequest('POST', '/api/conversations', {
          title: 'New Chat'
        });
        const conversation: Conversation = await response.json();
        setConversationId(conversation.id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive"
        });
      }
    };

    createInitialConversation();
  }, [toast]);

  // Fetch all conversations for sidebar
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  // Fetch messages for the conversation
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        content,
        isUser: "true"
      });
      return response.json() as Promise<MessageResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId, 'messages'] });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId) return;
    
    const messageToSend = message;
    setMessage('');
    await sendMessageMutation.mutateAsync(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just show a message about the file
      // In a real implementation, you'd upload to a server
      setMessage(`[File: ${file.name} (${file.type})] - File upload ready for processing`);
      toast({
        title: "File Selected",
        description: `${file.name} is ready to upload`,
      });
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'New Chat'
      });
      const conversation: Conversation = await response.json();
      setConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
  };

  const switchConversation = (id: string) => {
    setConversationId(id);
    setShowSidebar(false);
  };



  if (!conversationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <div className="text-white text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-inter">
      <ParticleBackground />
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-20 bg-dark-navy/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowSidebar(!showSidebar)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold font-poppins bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Neuronix AI
            </h1>
          </div>
          <Button
            onClick={createNewConversation}
            variant="outline"
            size="sm"
            className="bg-darker-navy/50 text-gray-300 border-white/10 hover:border-primary hover:text-primary"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-full w-80 bg-dark-navy/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 z-10 ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Chat History</h2>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  conv.id === conversationId 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="text-sm font-medium text-white truncate">
                  {conv.title || 'New Chat'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-5 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-20 relative z-10">
        {/* Chat Header */}
        <div className="w-full max-w-4xl mb-6 animate-in slide-in-from-top duration-500">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-4 animate-pulse shadow-lg shadow-primary/30">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Neuronix AI
            </h1>
            <p className="text-gray-300 text-lg">Your intelligent conversation partner</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="w-full max-w-4xl h-[600px] bg-dark-navy/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {/* Welcome message */}
            {messages.length === 0 && !isLoading && (
              <ChatMessage 
                message={{
                  id: 'welcome',
                  content: "Hello! I'm Neuronix AI, your intelligent assistant powered by Google's Gemini. I can help you with anything - answer questions, write code, explain concepts, be creative, solve problems, and much more. What would you like to chat about?",
                  isUser: "false",
                  timestamp: new Date(),
                  conversationId
                }}
              />
            )}

            {/* Chat messages */}
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg}
              />
            ))}

            {/* Typing indicator */}
            <TypingIndicator visible={isTyping} />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full bg-black/30 text-white placeholder-gray-400 rounded-xl px-4 py-3 pr-12 border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                  disabled={sendMessageMutation.isPending}
                  style={{ color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                />
                <button 
                  onClick={handleFileUpload}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="*/*"
                  multiple={false}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>


          </div>
        </div>

        {/* Status Bar */}
        <div className="w-full max-w-4xl mt-4 text-center text-gray-400 text-sm animate-in slide-in-from-bottom duration-700">
          <p>
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Connected • Real-time data enabled
          </p>
        </div>
      </div>
    </div>
  );
}
