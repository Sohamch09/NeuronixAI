import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  visible: boolean;
}

export function TypingIndicator({ visible }: TypingIndicatorProps) {
  return (
    <div className={cn(
      "flex items-start space-x-3 transition-opacity duration-300",
      visible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="message-bubble backdrop-blur-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/10 rounded-2xl rounded-tl-sm p-4">
        <div className="flex space-x-1">
          <div 
            className="w-2 h-2 bg-white rounded-full animate-pulse"
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="w-2 h-2 bg-white rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <div 
            className="w-2 h-2 bg-white rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
}
