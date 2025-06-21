"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, Send } from 'lucide-react';

export default function Superwomen() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSendSos = () => {
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {status === 'idle' && (
        <Button onClick={handleSendSos} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          Alert Nearby Helpers
        </Button>
      )}

      {status === 'sending' && (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sending SOS...
        </Button>
      )}
      
      {status === 'sent' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>SOS Sent!</AlertTitle>
          <AlertDescription>
            Nearby Super Women have been alerted and your location has been shared with them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
