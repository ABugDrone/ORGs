import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HardDrive, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FolderPickerZone } from '@/components/ui/FolderPickerZone';
import { toast } from 'sonner';

interface FirstRunSetupProps {
  onComplete: () => void;
}

const DRIVE_OPTIONS = ['C:', 'D:', 'E:', 'F:'];

const FirstRunSetup: React.FC<FirstRunSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [primaryFolder, setPrimaryFolder] = useState('');
  const [syncFolder, setSyncFolder] = useState('');
  const [selectedDrive, setSelectedDrive] = useState('C:');
  const [useDefault, setUseDefault] = useState(true);

  useEffect(() => {
    if (useDefault) {
      setPrimaryFolder(`${selectedDrive}\\Users\\Documents\\ORGs`);
    }
  }, [selectedDrive, useDefault]);

  const handleDriveSelect = (drive: string) => {
    setSelectedDrive(drive);
    setUseDefault(true);
  };

  const handleFinish = () => {
    if (!primaryFolder) {
      toast.error('Please select a storage folder first.');
      return;
    }
    localStorage.setItem('orgs_primary_folder', primaryFolder);
    if (syncFolder) localStorage.setItem('orgs_sync_folder', syncFolder);
    localStorage.setItem('orgs_setup_complete', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/ORGs.png" alt="ORGs" className="h-12 w-12 rounded-2xl object-cover" />
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground">ORGs</h1>
            <p className="text-xs text-muted-foreground">Organizational Reports Gathering System</p>
          </div>
        </div>

        {step === 1 ? (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">Welcome — let's get set up</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  ORGs will create an <strong>ORGs</strong> folder in your Documents automatically.
                </p>
              </div>

              {/* Drive selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Choose a drive
                </p>
                <div className="flex gap-2">
                  {DRIVE_OPTIONS.map(drive => (
                    <button
                      key={drive}
                      onClick={() => handleDriveSelect(drive)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all
                        ${selectedDrive === drive && useDefault
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {drive}
                    </button>
                  ))}
                </div>
              </div>

              {/* Folder picker */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Storage location</p>
                <FolderPickerZone
                  value={primaryFolder}
                  onChange={path => { setPrimaryFolder(path); setUseDefault(false); }}
                  placeholder="Click to select a folder..."
                />
                {useDefault && primaryFolder && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Check className="h-3 w-3" /> Will be auto-created at this path
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  ORGs will create format subfolders here (PDF/, DOCX/, MP4/, etc.)
                </p>
              </div>

              <Button className="w-full gap-2" onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 space-y-6">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">Set up cloud backup</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Optional. Point ORGs to your Google Drive or OneDrive local sync folder for automatic backup.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  Sync / Backup Folder
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </p>
                <FolderPickerZone
                  value={syncFolder}
                  onChange={setSyncFolder}
                  placeholder="e.g. Google Drive\ORGs Backup"
                />
                <p className="text-xs text-muted-foreground">
                  Your cloud sync client handles the upload — ORGs just copies files there.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleFinish}>
                  Skip for now
                </Button>
                <Button className="flex-1 gap-2" onClick={handleFinish}>
                  Finish <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-6 bg-primary' : 'w-3 bg-muted'}`} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FirstRunSetup;
