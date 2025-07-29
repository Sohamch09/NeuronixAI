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
    if (!aiData || !aiType) return null;

    switch (aiType) {
      case 'weather':
        return (
          <div className="bg-darker-navy/50 rounded-lg p-3 border border-white/10 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">{aiData.location}</span>
              {aiData.icon === 'sun' ? (
                <Sun className="text-yellow-400 h-6 w-6" />
              ) : (
                <CloudSun className="text-yellow-400 h-6 w-6" />
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-2xl font-bold">{aiData.temperature}</span>
                <p className="text-sm text-gray-400">{aiData.condition}</p>
              </div>
              <div className="text-sm text-gray-300">
                <p>Humidity: {aiData.humidity}</p>
                <p>Wind: {aiData.wind}</p>
              </div>
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="bg-darker-navy/50 rounded-lg p-3 border border-white/10 mt-3">
            <div className="flex items-start space-x-2">
              <Newspaper className="text-blue-400 h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">{aiData.headline}</h4>
                <p className="text-sm text-gray-300 mb-2">{aiData.summary}</p>
                <p className="text-xs text-gray-400">Source: {aiData.source}</p>
              </div>
            </div>
          </div>
        );

      case 'calculation':
        return (
          <div className="bg-darker-navy/50 rounded-lg p-3 border border-white/10 mt-3">
            <div className="flex items-center space-x-2">
              <Calculator className="text-green-400 h-5 w-5" />
              <div>
                <p className="text-white">
                  <span className="text-gray-400">{aiData.expression} = </span>
                  <span className="font-bold text-green-400">{aiData.result}</span>
                </p>
              </div>
            </div>
          </div>
        );

      case 'translation':
        return (
          <div className="bg-darker-navy/50 rounded-lg p-3 border border-white/10 mt-3">
            <div className="flex items-start space-x-2">
              <Languages className="text-purple-400 h-5 w-5 mt-1" />
              <div>
                <p className="text-gray-300 mb-1">Original: "{aiData.original}"</p>
                <p className="text-white font-semibold">Translation: "{aiData.translated}"</p>
                <p className="text-xs text-gray-400 mt-1">Language: {aiData.targetLanguage}</p>
              </div>
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="bg-darker-navy/50 rounded-lg p-3 border border-white/10 mt-3">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-400 h-5 w-5" />
              <p className="text-white font-mono text-lg">{aiData.time}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
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
