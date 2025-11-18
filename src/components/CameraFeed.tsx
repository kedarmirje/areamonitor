import { useRef, useEffect, memo } from 'react';

interface CameraFeedProps {
  isActive: boolean;
  onStreamReady: (stream: MediaStream) => void;
  facingMode?: 'user' | 'environment';
  onFacingModeChange?: (mode: 'user' | 'environment') => void;
}

const CameraFeed = ({ isActive, onStreamReady, facingMode = 'user', onFacingModeChange }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          onStreamReady(stream);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, onStreamReady, facingMode]);

  return (
    <div className="relative w-full aspect-video bg-card rounded-lg overflow-hidden border-2 border-border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <p className="text-muted-foreground text-lg">Camera Off</p>
        </div>
      )}
    </div>
  );
};

export default memo(CameraFeed);
