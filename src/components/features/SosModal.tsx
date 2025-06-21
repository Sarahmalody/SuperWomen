"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Siren } from 'lucide-react';

type SosModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

const SosModal = ({ isOpen, onClose, onConfirm }: SosModalProps) => {
  const handleConfirm = () => {
    // In a real app, this would trigger emergency services, contact sharing, etc.
    console.log("SOS Confirmed!");
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Siren className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Activate SOS?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This will immediately alert your emergency contacts and share your location. Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Yes, Activate SOS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SosModal;
