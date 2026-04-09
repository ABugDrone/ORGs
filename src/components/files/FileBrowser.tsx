import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, FolderOpen, FileText, Image, Video, Archive,
  SortAsc, SortDesc, Grid3X3, List, Trash2, ExternalLink, ChevronRight,
} from "lucide-react";
import { fileIndexService } from "@/lib/fileIndex/fileIndexService";
import { FileIndexEntry, FormatCategory } from "@/lib/fileIndex/types";
import { openWithDefault } from "@/lib/electron/electronBridge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES: FormatCategory[] = [
  'Documents','Spreadsheets','Presentations','Images','Videos','Archives','ORGs Files','Other',
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Documents: FileText, Spreadsheets: FileText, Presentations: FileText,
  Images: Image, Videos: Video, Archives: Archive, 'ORGs Files': FolderOpen, Other: FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  Documents: 'hsl(217 91% 60%)', Spreadsheets: 'hsl(142 76% 36%)',
  Presentations: 'hsl(25 95% 53%)', Images: 'hsl(280 89% 60%)',
  Videos: 'hsl(340 82% 52%)', Archives: 'hsl(199 89% 48%)',
  'ORGs Files': 'hsl(262 83% 58%)', Other: 'hsl(0 0% 50%)',
};

type SortKey = 'name' | 'date' | 'size' | 'type';
type ViewMode = 'list' | 'grid';

const FileBrowser: React.FC = () => {
  const [allFiles, setAllFiles] = useState<FileIndexEntry[]>([]);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FormatCategory | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const reload = () => setAllFiles(fileIndexService.getAll());
  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    let list = query ? fileIndexService.search(query) : allFiles;
    if (activeCategory !== 'All') list = list.filter(f => f.category === activeCategory);
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'date') cmp = a.uploadedAt.localeCompare(b.uploadedAt);
      else if (sortKey === 'size') cmp = a.sizeBytes - b.sizeBytes;
      else if (sortKey === 'type') cmp = a.extension.localeCompare(b.extension);
      return sortAsc ? cmp : -cmp;
    });
  }, [allFiles, query, activeCategory, sortKey, sortAsc]);

  const grouped = useMemo(() => {
    if (activeCategory !== 'All' || query) return null;
    return fileIndexService.groupByCategory();
  }, [allFiles, activeCategory, query]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allFiles.length };
    for (const cat of CATEGORIES) counts[cat] = allFiles.filter(f => f.category === cat).length;
    return counts;
  }, [allFiles]);

  const handleOpen = async (entry: FileIndexEntry) => {
    if (entry.localPath) await openWithDefault(entry.localPath);
    else if (entry.url) window.open(entry.url, '_blank');
  };

  const handleDelete = (entry: FileIndexEntry) => {
    fileIndexService.remove(entry.id);
    reload();
    toast.success(`${entry.name} removed`);
  };

  const FileRow = ({ entry }: { entry: FileIndexEntry }) => {
    const Icon = CATEGORY_ICONS[entry.category] ?? FileText;
    const color = CATEGORY_COLORS[entry.category] ?? 'hsl(0 0% 50%)';
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group cursor-pointer"
        onClick={() => handleOpen(entry)}
      >
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{entry.extension}</Badge>
            <span className="text-xs text-muted-foreground">{entry.sizeFormatted}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(entry.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7"
            onClick={e => { e.stopPropagation(); handleOpen(entry); }}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
            onClick={e => { e.stopPropagation(); handleDelete(entry); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  };

  const FileCard = ({ entry }: { entry: FileIndexEntry }) => {
    const Icon = CATEGORY_ICONS[entry.category] ?? FileText;
    const color = CATEGORY_COLORS[entry.category] ?? 'hsl(0 0% 50%)';
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"
        onClick={() => handleOpen(entry)}
      >
        <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}20` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{entry.extension}</Badge>
          <span className="text-xs text-muted-foreground">{entry.sizeFormatted}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(entry.uploadedAt).toLocaleDateString()}
        </p>
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-6 w-6"
            onClick={e => { e.stopPropagation(); handleDelete(entry); }}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, type, or date..." value={query}
            onChange={e => setQuery(e.target.value)} className="pl-9" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {sortAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Sort: {sortKey}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(['name','date','size','type'] as SortKey[]).map(k => (
              <DropdownMenuItem key={k} onClick={() => {
                if (sortKey === k) setSortAsc(a => !a); else { setSortKey(k); setSortAsc(false); }
              }}>
                {k.charAt(0).toUpperCase() + k.slice(1)}{sortKey === k && (sortAsc ? ' ↑' : ' ↓')}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'}
            className="rounded-none h-8 px-2" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'}
            className="rounded-none h-8 px-2" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['All', ...CATEGORIES] as const).map(cat => {
          const count = categoryCounts[cat as string] ?? 0;
          if (cat !== 'All' && count === 0) return null;
          const Icon = cat !== 'All' ? CATEGORY_ICONS[cat] : null;
          const color = cat !== 'All' ? CATEGORY_COLORS[cat] : undefined;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat as FormatCategory | 'All')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all
                ${activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
              {Icon && <Icon className="h-3 w-3" style={{ color: activeCategory === cat ? 'currentColor' : color }} />}
              {cat}
              <span className={`px-1 rounded-full text-[10px] ${activeCategory === cat ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {allFiles.length === 0 ? (
        <Card><CardContent className="py-16 text-center">
          <FolderOpen className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-foreground">No files yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload files from the Upload tab.</p>
        </CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm text-muted-foreground">No files match your search.</p>
        </CardContent></Card>
      ) : grouped && !query ? (
        <div className="space-y-6">
          {CATEGORIES.map(cat => {
            const files = grouped[cat];
            if (!files || files.length === 0) return null;
            const Icon = CATEGORY_ICONS[cat];
            const color = CATEGORY_COLORS[cat];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{cat}</h3>
                  <Badge variant="secondary" className="text-xs">{files.length}</Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                </div>
                <AnimatePresence>
                  {viewMode === 'list' ? (
                    <div className="space-y-1.5">
                      {files.map(f => <FileRow key={f.id} entry={f} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {files.map(f => <FileCard key={f.id} entry={f} />)}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        viewMode === 'list' ? (
          <div className="space-y-1.5">{filtered.map(f => <FileRow key={f.id} entry={f} />)}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(f => <FileCard key={f.id} entry={f} />)}
          </div>
        )
      )}
    </div>
  );
};

export default FileBrowser;
