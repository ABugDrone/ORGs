import { useRef } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isElectron, selectDirectory } from '@/lib/electron/electronBridge';

interface FolderPickerZoneProps {
  value: string;
  onChange: (path: string) => void;
  placeholder?: string;
}

export function FolderPickerZone({ value, onChange, placeholder = 'Click to select a folder...' }: FolderPickerZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = async () => {
    if (isElectron()) {
      const path = await selectDirectory();
      if (path) onChange(path);
    } else {
      inputRef.current?.click();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const rel = (files[0] as any).webkitRelativePath as string;
      const folder = rel.split('/')[0];
      onChange(folder);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
      >
        <FolderOpen className={`h-5 w-5 shrink-0 ${value ? 'text-primary' : 'text-muted-foreground'}`} />
        <div className="flex-1 min-w-0">
          {value
            ? <p className="text-sm font-medium text-foreground truncate">{value}</p>
            : <p className="text-sm text-muted-foreground">{placeholder}</p>
          }
        </div>
        {value && (
          <Button size="sm" variant="ghost" className="shrink-0 text-xs h-7"
            onClick={e => { e.stopPropagation(); handleClick(); }}>
            Change
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={handleInput}
      />
    </div>
  );
}
