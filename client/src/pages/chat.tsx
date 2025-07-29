import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ParticleBackground } from '@/components/ui/particle-background';
import { ChatMessage } from '@/components/ui/chat-message';
import { TypingIndicator } from '@/components/ui/typing-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { Message, Conversation } from '@shared/schema';
import { Bot, Send, Paperclip, CloudSun, Newspaper, Calculator, Languages } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      weather: "What's the weather like today?",
      news: "Show me the latest news",
      calculate: "Calculate 15% tip on $85",
      translate: 'Translate "Hello, how are you?" to Spanish'
    };
    
    const quickMessage = quickMessages[action as keyof typeof quickMessages];
    if (quickMessage) {
      setMessage(quickMessage);
    }
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
      
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        {/* Chat Header */}
        <div className="w-full max-w-4xl mb-6 animate-in slide-in-from-top duration-500">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-4 animate-pulse shadow-lg shadow-primary/30">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Assistant
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
                  content: "Hello! I'm your AI assistant. I can help you with various tasks, provide real-time information, and answer your questions. How can I assist you today?",
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
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200">
                  <Paperclip className="h-4 w-4" />
                </button>
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

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('weather')}
                className="bg-darker-navy/50 text-gray-300 border-white/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <CloudSun className="h-3 w-3 mr-1" />
                Weather
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('news')}
                className="bg-darker-navy/50 text-gray-300 border-white/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Newspaper className="h-3 w-3 mr-1" />
                News
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('calculate')}
                className="bg-darker-navy/50 text-gray-300 border-white/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Calculator className="h-3 w-3 mr-1" />
                Calculate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('translate')}
                className="bg-darker-navy/50 text-gray-300 border-white/10 hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Languages className="h-3 w-3 mr-1" />
                Translate
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
