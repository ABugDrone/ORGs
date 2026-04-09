import { useState } from 'react';
import { useMessages } from '@/context/MessagesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StickyNote, Plus, Trash2, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesPage() {
  const { messages, unreadCount, addMessage, markAllRead, deleteMessage } = useMessages();
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    addMessage(text);
    setDraft('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <StickyNote className="h-6 w-6 text-primary" />
            Notes
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Personal notes and quick memos.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
            <Badge variant="secondary">{unreadCount}</Badge>
          </Button>
        )}
      </div>

      {/* New note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAdd(); }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Ctrl+Enter to save</p>
            <Button onClick={handleAdd} disabled={!draft.trim()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes list */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add a note above to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 pr-2">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-4 rounded-xl border transition-colors group
                    ${msg.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground flex-1 whitespace-pre-wrap">{msg.content}</p>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleDateString()}{' '}
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {!msg.read && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">New</Badge>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
