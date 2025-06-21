"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

type ShakeOptions = {
  threshold?: number;
  timeout?: number;
};

type DeviceMotionEventiOS = DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export const useShake = (
  onShake: () => void,
  options: ShakeOptions = {}
) => {
  const { threshold = 15, timeout = 1000 } = options;
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const lastTime = useRef(0);
  const lastX = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastZ = useRef<number | null>(null);
  
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const handleMotionEvent = useCallback((event: DeviceMotionEvent) => {
    const { acceleration } = event;
    if (!acceleration) return;

    const currentTime = new Date().getTime();
    
    if ((currentTime - lastTime.current) > timeout) {
      const diffTime = currentTime - lastTime.current;
      lastTime.current = currentTime;

      const { x, y, z } = acceleration;

      if (lastX.current === null || lastY.current === null || lastZ.current === null) {
        lastX.current = x;
        lastY.current = y;
        lastZ.current = z;
        return;
      }

      const speed = Math.abs(x + y + z - lastX.current - lastY.current - lastZ.current) / diffTime * 10000;

      if (speed > threshold) {
        onShakeRef.current();
      }

      lastX.current = x;
      lastY.current = y;
      lastZ.current = z;
    }
  }, [threshold, timeout]);

  const requestPermission = useCallback(async () => {
    const motion = window.DeviceMotionEvent as unknown as DeviceMotionEventiOS;
    if (typeof motion.requestPermission === 'function') {
      try {
        const permissionState = await motion.requestPermission();
        if (permissionState === 'granted') {
          setPermission('granted');
          window.addEventListener('devicemotion', handleMotionEvent);
          return true;
        } else {
          setPermission('denied');
          return false;
        }
      } catch (error) {
        console.error("Error requesting motion permission:", error);
        setPermission('denied');
        return false;
      }
    } else {
      // For non-iOS 13+ devices
      setPermission('granted');
      window.addEventListener('devicemotion', handleMotionEvent);
      return true;
    }
  }, [handleMotionEvent]);

  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [handleMotionEvent]);

  return { requestPermission, permissionState: permission };
};
