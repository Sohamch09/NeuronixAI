import { Message } from '@shared/schema';
import { Bot, User, Sun, CloudSun, Newspaper, Calculator, Languages, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  aiData?: any;
  aiType?: string;
}

export function ChatMessage({ message, aiData, aiType }: ChatMessageProps) {
  const isUser = message.isUser === "true";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const renderAIData = () => {
    // Since we're using pure AI responses, we don't need structured data rendering
    return null;
  };

  return (
    <div className={cn(
      "flex items-start space-x-3 animate-in slide-in-from-bottom-4 duration-300",
      isUser ? "justify-end" : ""
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "message-bubble backdrop-blur-lg border border-white/10 rounded-2xl p-4 max-w-md",
        isUser 
          ? "bg-gradient-to-r from-primary to-secondary rounded-tr-sm" 
          : "bg-gradient-to-r from-primary/20 to-secondary/20 rounded-tl-sm"
      )}>
        <p className="text-white whitespace-pre-wrap">{message.content}</p>
        {renderAIData()}
        <span className={cn(
          "text-xs mt-2 block",
          isUser ? "text-gray-200 opacity-75" : "text-gray-400"
        )}>
          {timestamp}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
