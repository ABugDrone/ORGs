import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Image, Video, Archive, FolderOpen, ExternalLink, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fileIndexService } from '@/lib/fileIndex/fileIndexService';
import { deleteFileEntry } from '@/lib/documentManager/documentManager';
import { FileIndexEntry, FormatCategory } from '@/lib/fileIndex/types';
import { openWithDefault } from '@/lib/electron/electronBridge';
import { useSearchContext } from '@/context/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CAT_ICONS: Record<string, React.ElementType> = {
  Documents: FileText, Spreadsheets: FileText, Presentations: FileText,
  Images: Image, Videos: Video, Archives: Archive, 'ORGs Files': FolderOpen, Other: FileText,
};

const CAT_COLORS: Record<string, string> = {
  Documents: 'hsl(217 91% 60%)', Spreadsheets: 'hsl(142 76% 36%)',
  Presentations: 'hsl(25 95% 53%)', Images: 'hsl(280 89% 60%)',
  Videos: 'hsl(340 82% 52%)', Archives: 'hsl(199 89% 48%)',
  'ORGs Files': 'hsl(262 83% 58%)', Other: 'hsl(0 0% 50%)',
};

export default function SearchPage() {
  const { query, updateQuery } = useSearchContext();
  const [localQuery, setLocalQuery] = useState(query);
  const [allFiles, setAllFiles] = useState<FileIndexEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<FormatCategory | 'All'>('All');

  useEffect(() => {
    const loadFiles = () => setAllFiles(fileIndexService.getAll());
    loadFiles();
    // Reload file list when the window regains focus so newly uploaded files appear
    window.addEventListener('focus', loadFiles);
    return () => window.removeEventListener('focus', loadFiles);
  }, []);

  const results = useMemo(() => {
    let list = localQuery.trim() ? fileIndexService.search(localQuery) : allFiles;
    if (activeCategory !== 'All') list = list.filter(f => f.category === activeCategory);
    return list.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [localQuery, allFiles, activeCategory]);

  const categories = useMemo(() => Array.from(new Set(allFiles.map(f => f.category))), [allFiles]);

  const handleOpen = async (entry: FileIndexEntry) => {
    if (entry.localPath) await openWithDefault(entry.localPath);
    else if (entry.url) window.open(entry.url, '_blank');
  };

  const handleDelete = async (entry: FileIndexEntry) => {
    await deleteFileEntry(entry.id);
    setAllFiles(fileIndexService.getAll());
    toast.success(`${entry.name} removed`);
  };

  const handleSearch = (val: string) => { setLocalQuery(val); updateQuery(val); };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          autoFocus
          value={localQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search files by name, type, date..."
          className="pl-11 pr-10 h-12 text-base"
        />
        {localQuery && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => handleSearch('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['All', ...categories] as const).map(cat => {
            const Icon = cat !== 'All' ? CAT_ICONS[cat] : null;
            const color = cat !== 'All' ? CAT_COLORS[cat] : undefined;
            const count = cat === 'All' ? allFiles.length : allFiles.filter(f => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as FormatCategory | 'All')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all
                  ${activeCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {Icon && <Icon className="h-3 w-3" style={{ color: activeCategory === cat ? 'currentColor' : color }} />}
                {cat} <span className="opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {allFiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No files yet</p>
            <p className="text-sm text-muted-foreground mt-1">Upload files to start searching.</p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No files match "{localQuery}"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''}{localQuery ? ` for "${localQuery}"` : ''}
          </p>
          <AnimatePresence>
            {results.map((entry, i) => {
              const Icon = CAT_ICONS[entry.category] ?? FileText;
              const color = CAT_COLORS[entry.category] ?? 'hsl(0 0% 50%)';
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => handleOpen(entry)}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{entry.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{entry.extension}</Badge>
                      <span className="text-xs text-muted-foreground">{entry.category}</span>
                      <span className="text-xs text-muted-foreground">{entry.sizeFormatted}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.uploadedAt).toLocaleDateString()}{' '}
                        {new Date(entry.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {entry.storageStatus === 'synced' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">Backed up</Badge>
                      )}
                      {entry.storageStatus === 'missing' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-destructive border-destructive/30">Missing</Badge>
                      )}
                    </div>
                    {entry.localPath && (
                      <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{entry.localPath}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8"
                      onClick={e => { e.stopPropagation(); handleOpen(entry); }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                      onClick={e => { e.stopPropagation(); handleDelete(entry); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
