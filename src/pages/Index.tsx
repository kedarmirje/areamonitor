import { useState, useRef, memo, useMemo } from 'react';
import { Play, Square, Shield, Volume2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import CameraFeed from '@/components/CameraFeed';
import StatusIndicator from '@/components/StatusIndicator';
import CaptureGallery from '@/components/CaptureGallery';
import { usePersonDetection } from '@/hooks/usePersonDetection';
import { useAlarm } from '@/hooks/useAlarm';
import { useScreenshotCapture } from '@/hooks/useScreenshotCapture';

const Index = memo(() => {
  const { toast } = useToast();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const handleStreamReady = (stream: MediaStream) => {
    const videoElement = document.querySelector('video') as HTMLVideoElement;
    videoElementRef.current = videoElement;
  };

  const { isDetecting, isModelLoading } = usePersonDetection(videoElementRef.current, isCameraActive);
  const { captures, deleteCapture } = useScreenshotCapture(videoElementRef.current, isDetecting && isCameraActive);
  
  const shouldPlayAlarm = isDetecting && alarmEnabled && isCameraActive;
  useAlarm(shouldPlayAlarm);

  const handleStartCamera = () => {
    setIsCameraActive(true);
    toast({
      title: "Camera Started",
      description: "Area monitoring system is now active",
    });
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
    toast({
      title: "Camera Stopped",
      description: "Area monitoring system has been deactivated",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-lg">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Area Monitoring System</h1>
              <p className="text-muted-foreground">Real-time person detection with automatic alerts</p>
            </div>
          </div>
          {isModelLoading && (
            <div className="text-sm text-muted-foreground">Loading AI model...</div>
          )}
        </div>

        {/* Status Bar */}
        <StatusIndicator
          cameraActive={isCameraActive}
          detecting={isDetecting}
          alarmActive={shouldPlayAlarm}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2 space-y-4">
            <CameraFeed isActive={isCameraActive} onStreamReady={handleStreamReady} facingMode={facingMode} />
            
            {/* Controls */}
            <div className="flex gap-4">
              <Button
                onClick={handleStartCamera}
                disabled={isCameraActive}
                size="lg"
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Monitoring
              </Button>
              <Button
                onClick={handleStopCamera}
                disabled={!isCameraActive}
                size="lg"
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Monitoring
              </Button>
              <Button
                onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                disabled={!isCameraActive}
                size="lg"
                variant="outline"
              >
                <Smartphone className="w-5 h-5" />
              </Button>
            </div>

            {/* Alarm Toggle */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className={`w-5 h-5 ${alarmEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Alarm Control</span>
                </div>
                <Button
                  onClick={() => setAlarmEnabled(!alarmEnabled)}
                  variant={alarmEnabled ? "default" : "secondary"}
                  size="sm"
                >
                  {alarmEnabled ? 'Alarm ON' : 'Alarm OFF'}
                </Button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-lg">System Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AI model detects persons in real-time</li>
                <li>• Alarm sounds continuously when person detected</li>
                <li>• Screenshots captured every 3 seconds during detection</li>
                <li>• All captures saved with timestamps</li>
              </ul>
            </div>
          </div>

          {/* Capture Gallery */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold">Captured Screenshots</h2>
              <p className="text-sm text-muted-foreground">{captures.length} total captures</p>
            </div>
            <div className="h-[600px]">
              <CaptureGallery captures={captures} onDelete={deleteCapture} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
