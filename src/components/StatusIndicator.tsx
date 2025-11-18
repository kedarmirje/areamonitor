import { Camera, AlertCircle, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  cameraActive: boolean;
  detecting: boolean;
  alarmActive: boolean;
}

const StatusIndicator = ({ cameraActive, detecting, alarmActive }: StatusIndicatorProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Camera className={`w-5 h-5 ${cameraActive ? 'text-success' : 'text-muted-foreground'}`} />
        <Badge variant={cameraActive ? 'default' : 'secondary'} className="bg-success text-success-foreground">
          {cameraActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <AlertCircle className={`w-5 h-5 ${detecting ? 'text-alert animate-pulse-alert' : 'text-muted-foreground'}`} />
        <Badge variant={detecting ? 'destructive' : 'secondary'} className={detecting ? 'bg-alert text-alert-foreground animate-pulse-alert' : ''}>
          {detecting ? 'Person Detected' : 'No Detection'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className={`w-5 h-5 ${alarmActive ? 'text-alert animate-pulse-alert' : 'text-muted-foreground'}`} />
        <Badge variant={alarmActive ? 'destructive' : 'secondary'} className={alarmActive ? 'bg-alert text-alert-foreground animate-pulse-alert' : ''}>
          {alarmActive ? 'Alarm On' : 'Alarm Off'}
        </Badge>
      </div>
    </div>
  );
};

export default StatusIndicator;
