import { useState, useEffect, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

export const usePersonDetection = (videoElement: HTMLVideoElement | null, isActive: boolean) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const detectorRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      if (!isActive || detectorRef.current) return;
      
      setIsModelLoading(true);
      try {
        console.log('Loading object detection model...');
        detectorRef.current = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        console.log('Model loaded successfully');
      } catch (error) {
        console.error('Error loading model:', error);
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, [isActive]);

  const detectPerson = useCallback(async () => {
    if (!videoElement || !detectorRef.current || videoElement.readyState !== 4) {
      return false;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      ctx.drawImage(videoElement, 0, 0);
      
      const results = await detectorRef.current(canvas);
      
      const personDetected = results.some(
        (result: any) => result.label === 'person' && result.score > 0.5
      );

      setIsDetecting(personDetected);
      return personDetected;
    } catch (error) {
      console.error('Detection error:', error);
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
