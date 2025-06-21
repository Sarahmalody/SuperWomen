"use client";

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { assessRisk } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, ShieldCheck, ShieldAlert, Map as MapIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import dynamic from 'next/dynamic';
import type { LatLng } from 'leaflet';
import { Skeleton } from '../ui/skeleton';

const initialState = {
  type: null,
  message: null,
  errors: null,
  data: null,
};

const RiskAssessorMap = dynamic(
  () => import('./RiskAssessorMap'),
  {
    loading: () => <Skeleton className="h-full w-full" />,
    ssr: false
  }
);

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
      Assess Risk
    </Button>
  );
}

export default function RiskAssessor() {
  const [state, formAction] = useActionState(assessRisk, initialState);
  const [location, setLocation] = useState<LatLng | null>(null);

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <form action={formAction as (formData: FormData) => void} className="space-y-4">
        
        <div className="space-y-2">
            <label className="text-sm font-medium">1. Pin your location on the map</label>
            <div className="h-[250px] w-full rounded-md border bg-muted overflow-hidden">
                <RiskAssessorMap onLocationSelect={setLocation} />
            </div>
            {state?.errors?.latitude && (
              <p className="text-sm text-destructive mt-1">Please select a location on the map.</p>
            )}
        </div>
        
        <input type="hidden" name="latitude" value={location?.lat || ''} />
        <input type="hidden" name="longitude" value={location?.lng || ''} />

        <div className="space-y-2">
          <label className="text-sm font-medium">2. Describe your surroundings</label>
          <Textarea
            name="locationDescription"
            placeholder="e.g., 'Walking down a dimly lit alley near Main Street and 3rd Avenue, around 11 PM.'"
            rows={3}
            required
            className="bg-background"
          />
          {state?.errors?.locationDescription && (
            <p className="text-sm text-destructive mt-1">{state.errors.locationDescription[0]}</p>
          )}
        </div>
        <SubmitButton disabled={!location} />
      </form>

      {state?.type === 'error' && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.type === 'success' && state.data && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
             <h3 className="font-semibold text-lg">Safety Report</h3>
             <Badge variant={getRiskBadgeVariant(state.data.riskLevel)}>{state.data.riskLevel}</Badge>
          </div>
         
          {state.data.safetyAdvice?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" />Safety Advice</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-2">
                {state.data.safetyAdvice.map((advice, index) => (
                  <li key={index}>{advice}</li>
                ))}
              </ul>
            </div>
          )}
          {state.data.preferredRoute && (
             <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2"><MapIcon className="h-4 w-4 text-primary" />Preferred Route</h4>
                <p className="text-sm text-muted-foreground pl-2">{state.data.preferredRoute}</p>
            </div>
          )}
           {state.data.areasToAvoid?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4"/>Areas to Avoid</h4>
              <ul className="list-disc list-inside text-sm text-destructive/80 space-y-1 pl-2">
                {state.data.areasToAvoid.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
