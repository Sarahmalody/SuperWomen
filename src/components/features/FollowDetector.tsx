"use client";

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { checkFollowing } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Footprints, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Footprints className="mr-2 h-4 w-4" />}
      Analyze Movement
    </Button>
  );
}

export default function FollowDetector() {
  const [state, formAction] = useActionState(checkFollowing, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="liveLocationUrl">Paste your live location URL</Label>
          <Input
            id="liveLocationUrl"
            name="liveLocationUrl"
            type="url"
            placeholder="e.g., https://maps.app.goo.gl/..."
            required
          />
           {state?.errors?.liveLocationUrl && (
            <p className="text-sm text-destructive mt-1">{state.errors.liveLocationUrl[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="typicalRoute">Describe your typical route</Label>
          <Textarea
            id="typicalRoute"
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
