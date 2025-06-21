"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { checkFollowing } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Footprints, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  type: null,
  message: null,
  errors: null,
  data: null,
};

const movementPlaceholder = `[
  {"latitude": 34.0522, "longitude": -118.2437, "timestamp": "2023-10-27T10:00:00Z"},
  {"latitude": 34.0525, "longitude": -118.2440, "timestamp": "2023-10-27T10:01:00Z"},
  {"latitude": 34.0520, "longitude": -118.2445, "timestamp": "2023-10-27T10:05:00Z"}
]`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Footprints className="mr-2 h-4 w-4" />}
      Analyze Movement
    </Button>
  );
}

export default function FollowDetector() {
  const [state, formAction] = useFormState(checkFollowing, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div>
          <Textarea
            name="movementData"
            placeholder={movementPlaceholder}
            rows={5}
            required
            className="font-code text-xs bg-background"
          />
           {state?.errors?.movementData && (
            <p className="text-sm text-destructive mt-1">{state.errors.movementData[0]}</p>
          )}
        </div>
        <div>
          <Textarea
            name="typicalRoute"
            placeholder="e.g., 'I usually walk from my office on 5th Ave to the subway station on 42nd St, passing by the public library.'"
            rows={3}
            required
             className="bg-background"
          />
           {state?.errors?.typicalRoute && (
            <p className="text-sm text-destructive mt-1">{state.errors.typicalRoute[0]}</p>
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
        <div className="pt-4 border-t">
          {state.data.isFollowing ? (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Follower Detected</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{state.data.explanation}</p>
                <div>
                  <h4 className="font-semibold">Suggested Actions:</h4>
                  <p className="text-destructive-foreground/80">{state.data.suggestedActions}</p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No Follower Detected</AlertTitle>
              <AlertDescription>
                {state.data.explanation}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
