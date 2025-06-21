"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Siren, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmergencyButton() {
  const [isSirenOn, setIsSirenOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const toggleSiren = () => {
    if (isSirenOn) {
      // Stop siren
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
        });
      }
      setIsSirenOn(false);
    } else {
      // Start siren
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = 'sine';
      oscillator.connect(gain);
      gain.connect(context.destination);

      // Create an alarming, oscillating sound
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1200, context.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(800, context.currentTime + 1);

      gain.gain.setValueAtTime(0.5, context.currentTime);

      oscillator.start();
      oscillator.onended = () => {
        if (audioContextRef.current && isSirenOn) {
          // Loop the sound
          toggleSiren(); // Stop the old one
          setTimeout(()=> toggleSiren(), 10) // Start a new one
        }
      };

      oscillatorRef.current = oscillator;
      gainRef.current = gain;
      setIsSirenOn(true);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        onClick={toggleSiren}
        className="gap-2 font-bold shadow-lg"
      >
        {isSirenOn ? <X /> : <Siren />}
        {isSirenOn ? 'Deactivate' : 'Emergency'}
      </Button>
      {isSirenOn && (
        <div 
          className="fixed inset-0 z-50 bg-white animate-pulse" 
          style={{ 
            animationDuration: '700ms',
            pointerEvents: 'none' 
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
