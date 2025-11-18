import { Download, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Capture {
  id: string;
  dataUrl: string;
  timestamp: Date;
}

interface CaptureGalleryProps {
  captures: Capture[];
  onDelete: (id: string) => void;
}

const CaptureGallery = ({ captures, onDelete }: CaptureGalleryProps) => {
  const downloadCapture = (capture: Capture) => {
    const link = document.createElement('a');
    link.href = capture.dataUrl;
    link.download = `intruder_${capture.timestamp.toISOString().replace(/[:.]/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (captures.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No captures yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {captures.map((capture) => (
          <div key={capture.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <img src={capture.dataUrl} alt="Capture" className="w-full h-32 object-cover" />
            <div className="p-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                {capture.timestamp.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => downloadCapture(capture)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(capture.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default memo(CaptureGallery);
