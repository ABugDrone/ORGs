import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMessages } from '@/context/MessagesContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Search, Plus, Circle, Paperclip, FileText, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDepartment } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Message } from '@/types/messages';

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    conversations,
    sendMessage: sendMsg,
    markAsRead,
    createConversation,
    getMessages,
    getUserStatus
  } = useMessages();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      const msgs = getMessages(selectedConversation);
      setMessages(msgs);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation, getMessages, markAsRead]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMsg(selectedConversation, newMessage);
    setNewMessage('');
    
    // Reload messages
    const msgs = getMessages(selectedConversation);
    setMessages(msgs);
    
    toast({
      title: 'Message sent',
      description: 'Your message has been delivered'
    });
  };

  const handleSendReport = (reportId: string, reportTitle: string) => {
    if (!selectedConversation) return;

    const reportLink = `/reports/${reportId}`;
    const message = `📄 Shared Report: "${reportTitle}"\n\nClick to view: ${reportLink}`;
    
    sendMsg(selectedConversation, message);
    
    const msgs = getMessages(selectedConversation);
    setMessages(msgs);
    
    setShowReportDialog(false);
    toast({
      title: 'Report shared',
      description: 'Report link sent successfully'
    });
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedConversation) {
      // In a real app, upload file to server
      const message = `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      sendMsg(selectedConversation, message);
      
      const msgs = getMessages(selectedConversation);
      setMessages(msgs);
      
      toast({
        title: 'File shared',
        description: `${file.name} sent successfully`
      });
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const participantNames = selectedUsers.map(id => {
      const u = users.find((user: any) => user.id === id);
      return u?.name || 'Unknown';
    });

    const convId = createConversation(selectedUsers, participantNames);
    setSelectedConversation(convId);
    setNewChatOpen(false);
    setSelectedUsers([]);
    
    toast({
      title: 'Conversation created',
      description: 'You can now start messaging'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantNames.some(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const allUsers = JSON.parse(localStorage.getItem('users') || '[]')
    .filter((u: any) => u.id !== user?.id)
    .filter((u: any) => {
      const status = getUserStatus(u.id);
      return status?.status === 'online'; // Only show online users
    })
    .map((u: any) => {
      const dept = getDepartment(u.departmentId);
      return {
        ...u,
        departmentName: dept?.name || 'No Department'
      };
    });

  const allReports = JSON.parse(localStorage.getItem('reports') || '[]');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-4 p-4">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>
                    Select online colleagues to start a conversation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {allUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No colleagues are currently online
                    </p>
                  ) : (
                    <ScrollArea className="h-64">
                      {allUsers.map((u: any) => {
                        const status = getUserStatus(u.id);
                        return (
                          <div key={u.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-lg">
                            <Checkbox
                              checked={selectedUsers.includes(u.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, u.id]);
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                                }
                              }}
                            />
                            <div className="relative">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <Circle className={`absolute bottom-0 right-0 h-3 w-3 fill-current border-2 border-background rounded-full text-green-500`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{u.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {u.departmentName} • {u.jobTitle}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                            >
                              <Link to={`/profile/${u.id}`}>
                                <UserIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  )}
                  <Button onClick={handleCreateConversation} className="w-full" disabled={selectedUsers.length === 0}>
                    Create Conversation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map(conv => {
              const firstParticipant = conv.participants.find(p => p !== user?.id);
              const status = firstParticipant ? getUserStatus(firstParticipant) : undefined;
              const participantUser = firstParticipant ? 
                JSON.parse(localStorage.getItem('users') || '[]').find((u: any) => u.id === firstParticipant) : null;
              const participantDept = participantUser ? getDepartment(participantUser.departmentId) : null;
              
              return (
                <div
                  key={conv.id}
                  className={`w-full p-3 rounded-lg transition-colors ${
                    selectedConversation === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Link 
                      to={firstParticipant ? `/profile/${firstParticipant}` : '#'}
                      className="relative"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.participantNames[0]?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <Circle 
                        className={`absolute bottom-0 right-0 h-3 w-3 fill-current border-2 border-background rounded-full ${getStatusColor(status?.status || 'offline')}`}
                      />
                    </Link>
                    <button
                      onClick={() => setSelectedConversation(conv.id)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {conv.participantNames.join(', ')}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {participantDept && (
                        <p className="text-xs text-muted-foreground truncate">
                          {participantDept.name} • {participantUser?.jobTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessageTime).toLocaleTimeString()}
                      </p>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>
                      {conversations.find(c => c.id === selectedConversation)
                        ?.participantNames[0]?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {(() => {
                    const conv = conversations.find(c => c.id === selectedConversation);
                    const firstParticipant = conv?.participants.find(p => p !== user?.id);
                    const status = firstParticipant ? getUserStatus(firstParticipant) : undefined;
                    return (
                      <Circle 
                        className={`absolute bottom-0 right-0 h-3 w-3 fill-current border-2 border-background rounded-full ${getStatusColor(status?.status || 'offline')}`}
                      />
                    );
                  })()}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {conversations.find(c => c.id === selectedConversation)
                      ?.participantNames.join(', ')}
                  </h3>
                  {(() => {
                    const conv = conversations.find(c => c.id === selectedConversation);
                    const firstParticipant = conv?.participants.find(p => p !== user?.id);
                    const status = firstParticipant ? getUserStatus(firstParticipant) : undefined;
                    return (
                      <p className="text-xs text-muted-foreground">
                        {status?.status === 'online' ? 'Active now' : 
                         status?.status === 'away' ? 'Away' : 
                         `Last seen ${new Date(status?.lastSeen || '').toLocaleTimeString()}`}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.senderId !== user?.id && (
                        <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFileAttach}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowReportDialog(true)}
                  title="Share report"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No conversation selected</p>
              <p className="text-sm">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Select a report to share in this conversation
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {allReports.map((report: any) => (
                <button
                  key={report.id}
                  onClick={() => handleSendReport(report.id, report.title)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.period} • {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
