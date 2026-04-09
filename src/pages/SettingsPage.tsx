import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Palette, FolderOpen, Bell, HardDrive, RotateCcw, Loader2, ExternalLink, Check } from 'lucide-react';
import { isElectron, selectDirectory } from '@/lib/electron/electronBridge';
import { restoreFromSyncFolder } from '@/lib/documentManager/documentManager';
import { THEMES, ThemeId, applyTheme } from '@/lib/themes/themeEngine';

// Cloud backup URLs
const CLOUD_PROVIDERS = [
  {
    name: 'Google Drive',
    url: 'https://drive.google.com',
    logo: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
    color: '#4285F4',
  },
  {
    name: 'Microsoft OneDrive',
    url: 'https://onedrive.live.com',
    logo: 'https://res.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/brand-icons/product/svg/onedrive_32x1.svg',
    color: '#0078D4',
  },
];

// Folder picker that works in both browser and Electron
function FolderPickerZone({
  value,
  onChange,
  placeholder = 'Click to select a folder...',
}: {
  value: string;
  onChange: (path: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = async () => {
    if (isElectron()) {
      const path = await selectDirectory();
      if (path) onChange(path);
    } else {
      // Browser fallback — use webkitdirectory input
      inputRef.current?.click();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Extract folder path from first file's webkitRelativePath
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
      {/* Hidden browser fallback input */}
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

export default function SettingsPage() {
  const { toast } = useToast();
  const [primaryFolder, setPrimaryFolder] = useState(() => localStorage.getItem('orgs_primary_folder') || '');
  const [syncFolder, setSyncFolder] = useState(() => localStorage.getItem('orgs_sync_folder') || '');
  const [themeColor, setThemeColor] = useState(() => localStorage.getItem('orgs_accent') || '#10b981');
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => (localStorage.getItem('orgs_theme') as ThemeId) || 'default');
  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem('orgs_reminders_enabled') !== 'false');
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);

  const savePrimary = (path: string) => {
    setPrimaryFolder(path);
    localStorage.setItem('orgs_primary_folder', path);
    toast({ title: 'Primary folder set', description: path });
  };

  const saveSync = (path: string) => {
    setSyncFolder(path);
    localStorage.setItem('orgs_sync_folder', path);
    toast({ title: 'Sync folder set', description: path });
  };

  const clearSyncFolder = () => {
    setSyncFolder('');
    localStorage.removeItem('orgs_sync_folder');
    toast({ title: 'Sync folder removed' });
  };

  const saveTheme = () => {
    applyTheme(activeTheme, themeColor);
    toast({ title: 'Theme applied' });
  };

  const handleThemeSelect = (id: ThemeId) => {
    setActiveTheme(id);
    applyTheme(id, themeColor);
  };

  const handleColorChange = (hex: string) => {
    setThemeColor(hex);
    applyTheme(activeTheme, hex);
  };

  const toggleReminders = (val: boolean) => {
    setRemindersEnabled(val);
    localStorage.setItem('orgs_reminders_enabled', String(val));
  };

  const handleRestore = async () => {
    if (!syncFolder || !primaryFolder) {
      toast({ title: 'Both folders must be configured to restore', variant: 'destructive' });
      return;
    }
    setRestoring(true);
    setRestoreProgress(0);
    try {
      const result = await restoreFromSyncFolder(syncFolder, primaryFolder, setRestoreProgress);
      toast({ title: `Restored ${result.restored} files${result.failed ? `, ${result.failed} failed` : ''}` });
    } catch {
      toast({ title: 'Restore failed', variant: 'destructive' });
    } finally {
      setRestoring(false);
      setRestoreProgress(0);
    }
  };

  const resetSetup = () => {
    localStorage.removeItem('orgs_primary_folder');
    localStorage.removeItem('orgs_sync_folder');
    localStorage.removeItem('orgs_setup_complete');
    window.location.reload();
  };

  const openCloud = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container max-w-3xl py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="storage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="storage"><HardDrive className="h-4 w-4 mr-2" />Storage</TabsTrigger>
          <TabsTrigger value="backup"><ExternalLink className="h-4 w-4 mr-2" />Cloud Backup</TabsTrigger>
          <TabsTrigger value="reminders"><Bell className="h-4 w-4 mr-2" />Reminders</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-4 w-4 mr-2" />Appearance</TabsTrigger>
        </TabsList>

        {/* Storage */}
        <TabsContent value="storage">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Primary Folder</CardTitle>
                <CardDescription>Where ORGs stores and organizes your files locally.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FolderPickerZone
                  value={primaryFolder}
                  onChange={savePrimary}
                  placeholder="Click to select your storage folder..."
                />
                {!primaryFolder && <p className="text-xs text-destructive">A primary folder is required.</p>}
                <p className="text-xs text-muted-foreground">
                  ORGs will create format subfolders here (PDF/, DOCX/, MP4/, etc.)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync / Backup Folder</CardTitle>
                <CardDescription>
                  Point to your Google Drive or OneDrive local sync folder — ORGs copies files there automatically after each upload.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FolderPickerZone
                  value={syncFolder}
                  onChange={saveSync}
                  placeholder="Click to select your sync folder..."
                />
                {syncFolder && (
                  <Button onClick={clearSyncFolder} variant="ghost" size="sm" className="text-destructive px-0">
                    Remove sync folder
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  e.g. <code>C:\Users\You\Google Drive\ORGs Backup</code>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restore from Sync Folder</CardTitle>
                <CardDescription>On a new device? Restore all files from your sync folder.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {restoring && <Progress value={restoreProgress} className="h-2" />}
                <Button onClick={handleRestore} disabled={restoring || !syncFolder || !primaryFolder} variant="outline" className="gap-2">
                  {restoring
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Restoring...</>
                    : <><RotateCcw className="h-4 w-4" />Restore Files</>}
                </Button>
                {(!syncFolder || !primaryFolder) && (
                  <p className="text-xs text-muted-foreground">Configure both folders above to enable restore.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reset Setup</CardTitle>
                <CardDescription>Clear folder config and re-run the first-run setup wizard.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={resetSetup}>Reset & Re-run Setup</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cloud Backup */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Open Cloud Storage</CardTitle>
              <CardDescription>
                Open your cloud storage in the browser to manually upload, check, or manage your backed-up files.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {CLOUD_PROVIDERS.map(provider => (
                <button
                  key={provider.name}
                  onClick={() => openCloud(provider.url)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/40 transition-all text-left group"
                >
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-white shadow-sm">
                    <img src={provider.logo} alt={provider.name} className="h-6 w-6 object-contain" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">Opens in your default browser</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Tip: Set your Google Drive or OneDrive local sync folder in the Storage tab so ORGs can back up files automatically without opening the browser.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders */}
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Weekend Backup Reminders</CardTitle>
              <CardDescription>Reminds you on weekends if your sync folder hasn't been updated in 7+ days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable weekend reminders</p>
                  <p className="text-xs text-muted-foreground">Shows a banner on Saturday or Sunday when backup is overdue</p>
                </div>
                <Switch checked={remindersEnabled} onCheckedChange={toggleReminders} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="space-y-4">
            {/* Theme picker */}
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose a visual style for the app.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`relative p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                        ${activeTheme === theme.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40'}`}
                    >
                      {/* Preview swatch */}
                      <div
                        className="h-12 rounded-lg mb-2 w-full"
                        style={{ background: theme.preview }}
                      />
                      <p className="text-xs font-semibold text-foreground truncate">{theme.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{theme.description}</p>
                      {activeTheme === theme.id && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      {theme.dark && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 mt-1">Dark</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Accent color */}
            <Card>
              <CardHeader>
                <CardTitle>Accent Color</CardTitle>
                <CardDescription>Applied instantly across the whole app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    value={themeColor}
                    onChange={e => handleColorChange(e.target.value)}
                    className="w-20 h-12 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={themeColor}
                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) handleColorChange(e.target.value); }}
                    className="flex-1 font-mono"
                    placeholder="#10b981"
                  />
                </div>
                {/* Preset swatches */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { hex: '#10b981', label: 'Emerald' },
                    { hex: '#3b82f6', label: 'Blue' },
                    { hex: '#ef4444', label: 'Red' },
                    { hex: '#f59e0b', label: 'Amber' },
                    { hex: '#8b5cf6', label: 'Purple' },
                    { hex: '#ec4899', label: 'Pink' },
                    { hex: '#06b6d4', label: 'Cyan' },
                    { hex: '#f97316', label: 'Orange' },
                    { hex: '#84cc16', label: 'Lime' },
                    { hex: '#6b7280', label: 'Grey' },
                    { hex: '#111827', label: 'Black' },
                    { hex: '#d4f542', label: 'Lemon' },
                  ].map(({ hex, label }) => (
                    <button
                      key={hex}
                      title={label}
                      onClick={() => handleColorChange(hex)}
                      className="relative w-9 h-9 rounded-lg border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: hex,
                        borderColor: themeColor === hex ? '#fff' : 'transparent',
                        boxShadow: themeColor === hex ? `0 0 0 2px ${hex}` : 'none',
                      }}
                    >
                      {themeColor === hex && (
                        <Check className="h-3 w-3 absolute inset-0 m-auto text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
                <Button onClick={saveTheme} className="gap-2">
                  <Palette className="h-4 w-4" /> Save Theme
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
