import { useState, useEffect, useRef, useCallback } from 'react';

interface Capture {
  id: string;
  dataUrl: string;
  timestamp: Date;
}

const MAX_CAPTURES = 10;

export const useScreenshotCapture = (
  videoElement: HTMLVideoElement | null,
  shouldCapture: boolean
) => {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureScreenshot = useCallback(() => {
    if (!videoElement || videoElement.readyState !== 4) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth / 2;
    canvas.height = videoElement.videoHeight / 2;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    const newCapture: Capture = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date(),
    };

    setCaptures(prev => [newCapture, ...prev].slice(0, MAX_CAPTURES));
  }, [videoElement]);

  useEffect(() => {
    if (shouldCapture && videoElement) {
      captureScreenshot();
      intervalRef.current = setInterval(captureScreenshot, 8000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shouldCapture, videoElement, captureScreenshot]);

  const deleteCapture = useCallback((id: string) => {
    setCaptures(prev => prev.filter(capture => capture.id !== id));
  }, []);

  return { captures, deleteCapture };
};
