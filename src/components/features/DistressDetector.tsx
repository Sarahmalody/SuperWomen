"use client";

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { checkDistress } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Loader2, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const initialState = {
  type: null,
  message: null,
  errors: null,
  data: null,
};

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;

export default function DistressDetector() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isApiSupported, setIsApiSupported] = useState(true);
  
  const formRef = useRef<HTMLFormElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [state, formAction] = useFormState(checkDistress, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsApiSupported(false);
    }
  }, []);

  const startListening = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Media Devices API not supported.");
      return;
    }
    
    setIsListening(true);
    setTranscript('');
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.start();
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscript(currentTranscript);
    };
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && recognitionRef.current) {
      mediaRecorderRef.current.stop();
      recognitionRef.current.stop();
      setIsListening(false);
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const formData = new FormData(formRef.current!);
          formData.set('audioDataUri', base64Audio);
          formData.set('transcript', transcript);
          formAction(formData);
        };
      };
    }
  };

  if (!isApiSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Browser Not Supported</AlertTitle>
        <AlertDescription>
          The Web Speech API is not supported by your browser. Please try Chrome or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction as (formData: FormData) => void} className="hidden">
        <input type="hidden" name="audioDataUri" />
        <input type="hidden" name="transcript" />
      </form>
      
      <div className="flex flex-col items-center gap-4">
        <Button onClick={isListening ? stopListening : startListening} disabled={pending} className="w-full">
          {isListening ? <StopCircle className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
          {isListening ? 'Stop Listening' : 'Start Analysis'}
        </Button>
        {isListening && <Progress value={undefined} className="h-2 animate-pulse" />}
      </div>

      {transcript && (
        <div className="bg-secondary p-3 rounded-md">
          <p className="text-sm italic text-secondary-foreground">"{transcript}"</p>
        </div>
      )}
      
      {pending && (
        <div className="flex items-center justify-center text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin"/>
            <p>Analyzing audio...</p>
        </div>
      )}

      {state?.type === 'error' && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.type === 'success' && state.data && (
        <div className="pt-4 border-t">
          {state.data.isDistressed ? (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Distress Detected (Confidence: {Math.round(state.data.confidence * 100)}%)</AlertTitle>
              <AlertDescription>{state.data.reason}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No Distress Detected (Confidence: {Math.round(state.data.confidence * 100)}%)</AlertTitle>
              <AlertDescription>{state.data.reason}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
