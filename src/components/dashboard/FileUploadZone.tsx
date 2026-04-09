import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/documentManager/documentManager';

interface PendingFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
}

const SUPPORTED = [
  'pdf','doc','docx','xls','xlsx','ppt','pptx','txt','csv',
  'png','jpg','jpeg','gif','svg','webp',
  'mp4','mov','avi','webm','mkv',
  'zip','rar','7z',
];

function isSupported(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return SUPPORTED.includes(ext);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileUploadZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [pending, setPending] = useState<PendingFile[]>([]);

  const addFiles = (files: File[]) => {
    const valid = files.filter(f => {
      if (!isSupported(f)) {
        toast.error(`${f.name} — unsupported format`);
        return false;
      }
      return true;
    });
    const items: PendingFile[] = valid.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      status: 'pending',
      progress: 0,
    }));
    setPending(prev => [...prev, ...items]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const remove = (id: string) => setPending(prev => prev.filter(p => p.id !== id));

  const uploadAll = async () => {
    const toUpload = pending.filter(p => p.status === 'pending');
    if (!toUpload.length) return;

    for (const item of toUpload) {
      // Set uploading
      setPending(prev => prev.map(p => p.id === item.id ? { ...p, status: 'uploading', progress: 30 } : p));

      try {
        await uploadFile(item.file);
        setPending(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', progress: 100 } : p));
      } catch (err: any) {
        setPending(prev => prev.map(p =>
          p.id === item.id ? { ...p, status: 'error', error: err?.message ?? 'Upload failed' } : p
        ));
        toast.error(`Failed: ${item.file.name}`);
      }
    }

    const doneCount = toUpload.length;
    toast.success(`${doneCount} file${doneCount > 1 ? 's' : ''} uploaded`);

    // Clear done items after 2s
    setTimeout(() => {
      setPending(prev => prev.filter(p => p.status !== 'done'));
    }, 2000);
  };

  const pendingCount = pending.filter(p => p.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 transition-all text-center
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drag & drop files here</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, XLSX, PNG, MP4, ZIP and more
              </p>
            </div>
            <label htmlFor="file-input">
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              accept={SUPPORTED.map(e => `.${e}`).join(',')}
              onChange={handleInput}
            />
          </div>
        </div>

        {/* Pending list */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {pending.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {item.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                    {item.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
                    {(item.status === 'pending' || item.status === 'uploading') && (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(item.file.size)}</p>
                    {item.status === 'uploading' && (
                      <Progress value={item.progress} className="h-1 mt-1" />
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-destructive mt-0.5">{item.error}</p>
                    )}
                  </div>

                  {/* Remove */}
                  {item.status === 'pending' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => remove(item.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}

              {pendingCount > 0 && (
                <Button onClick={uploadAll} className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FileUploadZone;
