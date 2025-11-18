import { useState, useEffect, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

let globalDetector: any = null;
let globalCanvasCache: HTMLCanvasElement | null = null;

export const usePersonDetection = (videoElement: HTMLVideoElement | null, isActive: boolean) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const detectorRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      if (!isActive || globalDetector) return;
      
      setIsModelLoading(true);
      try {
        globalDetector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        detectorRef.current = globalDetector;
      } catch (error) {
        console.error('Error loading model:', error);
      } finally {
        setIsModelLoading(false);
      }
    };

    if (isActive && !globalDetector) {
      loadModel();
    } else if (!isActive) {
      detectorRef.current = globalDetector;
    }
  }, [isActive]);

  const detectPerson = useCallback(async () => {
    if (!videoElement || !detectorRef.current || videoElement.readyState !== 4) {
      return false;
    }

    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return false;

      ctx.drawImage(videoElement, 0, 0, 320, 240);
      
      const results = await detectorRef.current(canvas);
      
      const personDetected = results.some(
        (result: any) => result.label === 'person' && result.score > 0.5
      );

      setIsDetecting(personDetected);
      return personDetected;
    } catch (error) {
      return false;
    }
  }, [videoElement]);

  useEffect(() => {
    if (isActive && !isModelLoading && detectorRef.current) {
      intervalRef.current = setInterval(() => {
        detectPerson();
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsDetecting(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isModelLoading, detectPerson]);

  return { isDetecting, isModelLoading };
};
