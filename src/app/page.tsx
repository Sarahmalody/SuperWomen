"use client";

import React, { useState, useCallback } from 'react';
import { Shield, Footprints, Mic, MapPin, SmartphoneNfc, UserRound } from 'lucide-react';
import { useShake } from '@/hooks/useShake';
import SosModal from '@/components/features/SosModal';
import FeatureCard from '@/components/features/FeatureCard';
import RiskAssessor from '@/components/features/RiskAssessor';
import FollowDetector from '@/components/features/FollowDetector';
import DistressDetector from '@/components/features/DistressDetector';
import LocationSharer from '@/components/features/LocationSharer';
import Bodyguard from '@/components/features/Bodyguard';
import { Button } from '@/components/ui/button';
import { EmergencyButton } from '@/components/features/EmergencyButton';

export default function Home() {
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const handleShake = useCallback(() => {
    if (permissionGranted) {
      console.log('Shake detected!');
      setIsSosModalOpen(true);
    }
  }, [permissionGranted]);

  const { requestPermission } = useShake(handleShake, { threshold: 15, timeout: 1000 });

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setPermissionGranted(granted);
    if (!granted) {
      alert("Permission for motion sensors was denied. Shake to SOS will not work.");
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Super Women</h1>
            <EmergencyButton />
          </div>
        </header>

        <main className="flex-1 container py-8">
          <div className="space-y-6">
            {!permissionGranted && (
              <div className="bg-card p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SmartphoneNfc className="w-6 h-6 text-primary" />
                  <p className="text-card-foreground">Enable shake detection for SOS activation.</p>
                </div>
                <Button onClick={handleRequestPermission}>Grant Permission</Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="Risk Assessment"
                icon={<Shield className="w-6 h-6 text-primary" />}
                description="Get safety advice based on your current location's risk level."
              >
                <RiskAssessor />
              </FeatureCard>

              <FeatureCard
                title="Bodyguard"
                icon={<UserRound className="w-6 h-6 text-primary" />}
                description="Simulate a call with an AI companion to feel safer."
              >
                <Bodyguard />
              </FeatureCard>

              <FeatureCard
                title="Location Sharing"
                icon={<MapPin className="w-6 h-6 text-primary" />}
                description="Share your real-time location with trusted contacts."
              >
                <LocationSharer />
              </FeatureCard>

              <FeatureCard
                title="Follow Detection"
                icon={<Footprints className="w-6 h-6 text-primary" />}
                description="Analyze movement patterns to see if you might be followed."
              >
                <FollowDetector />
              </FeatureCard>

              <FeatureCard
                title="Distress Detection"
                icon={<Mic className="w-6 h-6 text-primary" />}
                description="Monitor your voice for signs of distress via tone and emotion analysis."
              >
                <DistressDetector />
              </FeatureCard>
            </div>
          </div>
        </main>
      </div>
      <SosModal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)} />
    </>
  );
}
