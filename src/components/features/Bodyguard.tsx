"use client";

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getFakeCall } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const initialState = {
  type: null,
  message: null,
  errors: null,
  data: null,
};

const dadScript = "Hello beta, are you okay? I was just thinking about you. Make sure you are safe. Let me know when you reach home. Okay? I will call you back later. Bye.";

function SubmitButton({ isCalling, onClick }: { isCalling: boolean, onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isCalling} className="w-full" onClick={onClick}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Phone className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Connecting...' : 'Call Dad'}
    </Button>
  );
}

export default function Bodyguard() {
  const [state, formAction] = useFormState(getFakeCall, initialState);
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const endCall = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsCalling(false);
    setCallDuration(0);
  };

  useEffect(() => {
    if (state?.type === 'success' && state.data?.audioDataUri) {
      const audio = new Audio(state.data.audioDataUri);
      audioRef.current = audio;
      
      audio.play().then(() => {
        setIsCalling(true);
        setCallDuration(0);

        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

        audio.onended = () => {
          endCall();
        };
      }).catch(err => {
        console.error("Audio play failed:", err);
        setError("Could not play audio. Your browser might be blocking automatic playback.");
        setIsCalling(false);
      });
    } else if (state?.type === 'error') {
      setError(state.message);
    }
  }, [state]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (isCalling) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg text-white flex flex-col items-center justify-center space-y-6 aspect-[9/16] max-h-[400px]">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-24 h-24 border-4 border-slate-600">
            <AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="indian father" />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">Dad</h2>
          <p className="text-sm text-slate-400 flex items-center gap-1">
             <Clock className="w-3 h-3" /> 
             <span>{formatTime(callDuration)}</span>
          </p>
        </div>
        <div className="w-full pt-4">
           <Button onClick={endCall} variant="destructive" size="lg" className="w-full rounded-full h-16">
              <PhoneOff />
           </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <form action={formAction as (formData: FormData) => void}>
        <input type="hidden" name="script" value={dadScript} />
        <SubmitButton isCalling={isCalling} onClick={() => setError(null)} />
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
