import { useState, useEffect, useCallback, useRef } from 'react';

export type SentienceEvent = 
  | { type: 'VIEW_PLANET'; name: string }
  | { type: 'HOVER_BUY'; name: string }
  | { type: 'IDLE'; duration: number }
  | { type: 'SWITCH_VIEW'; view: string };

export const useSentience = () => {
  const [narration, setNarration] = useState<string>("Initializing Sentient Void Protocol...");
  const [isThinking, setIsThinking] = useState(false);
  const eventHistory = useRef<string[]>([]);
  const lastNarratedCount = useRef(0);

  const reportEvent = useCallback((event: SentienceEvent) => {
    let eventString = "";
    switch (event.type) {
      case 'VIEW_PLANET': eventString = `viewed_${event.name.toLowerCase()}`; break;
      case 'HOVER_BUY': eventString = `hovered_buy_${event.name.toLowerCase()}`; break;
      case 'IDLE': eventString = `idled_for_${event.duration}s`; break;
      case 'SWITCH_VIEW': eventString = `switched_to_${event.view}`; break;
    }
    
    eventHistory.current = [...eventHistory.current, eventString].slice(-10); // Keep last 10
  }, []);

  const fetchNarration = useCallback(async () => {
    if (eventHistory.current.length === 0 || isThinking) return;
    if (eventHistory.current.length === lastNarratedCount.current) return;

    setIsThinking(true);
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'narrate',
          history: eventHistory.current 
        }),
      });
      const data = await response.json();
      if (data.narration) {
        setNarration(data.narration);
        lastNarratedCount.current = eventHistory.current.length;
      }
    } catch (err) {
      console.error("The Void is speechless.", err);
    } finally {
      setIsThinking(false);
    }
  }, [isThinking]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (eventHistory.current.length > lastNarratedCount.current) {
        fetchNarration();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchNarration]);

  return { narration, reportEvent, isThinking };
};
