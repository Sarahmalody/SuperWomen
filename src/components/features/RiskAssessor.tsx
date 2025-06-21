"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { assessRisk } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck, ShieldAlert, Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  type: null,
  message: null,
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
      Assess Risk
    </Button>
  );
}

export default function RiskAssessor() {
  const [state, formAction] = useFormState(assessRisk, initialState);

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
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
      <form action={formAction} className="space-y-4">
        <div>
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
        <SubmitButton />
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
                <h4 className="font-medium flex items-center gap-2"><Map className="h-4 w-4 text-primary" />Preferred Route</h4>
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
