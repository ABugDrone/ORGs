import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Briefcase, Building2, Circle } from 'lucide-react';
import { getDepartment } from '@/data/mockData';
import { useMessages } from '@/context/MessagesContext';
import { toast } from 'sonner';

interface ProfileView {
  viewerId: string;
  viewerName: string;
  viewerDepartment: string;
  timestamp: string;
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { getUserStatus, createConversation } = useMessages();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Load user data
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.id === userId);
    setProfileUser(foundUser);

    // Track profile view (unless viewer is super admin)
    if (currentUser && currentUser.id !== userId && currentUser.role !== 'super_admin') {
      trackProfileView(userId, currentUser);
    }

    // Load profile views if viewing own profile
    if (currentUser?.id === userId) {
      loadProfileViews(userId);
    }
  }, [userId, currentUser]);

  const trackProfileView = (profileId: string, viewer: any) => {
    const views = JSON.parse(localStorage.getItem(`profile_views_${profileId}`) || '[]');
    const dept = getDepartment(viewer.departmentId);
    
    const newView: ProfileView = {
      viewerId: viewer.id,
      viewerName: viewer.name,
      viewerDepartment: dept?.name || 'Unknown',
      timestamp: new Date().toISOString()
    };

    views.unshift(newView);
    // Keep only last 50 views
    const limitedViews = views.slice(0, 50);
    localStorage.setItem(`profile_views_${profileId}`, JSON.stringify(limitedViews));

    // Create notification for profile owner
    const notifications = JSON.parse(localStorage.getItem(`notifications_${profileId}`) || '[]');
    notifications.unshift({
      id: Date.now().toString(),
      type: 'profile_view',
      message: `${viewer.name} from ${dept?.name || 'Unknown'} viewed your profile`,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem(`notifications_${profileId}`, JSON.stringify(notifications.slice(0, 100)));
  };

  const loadProfileViews = (profileId: string) => {
    const views = JSON.parse(localStorage.getItem(`profile_views_${profileId}`) || '[]');
    setProfileViews(views);
  };

  const handleStartChat = () => {
    if (!profileUser || !currentUser) return;
    
    const convId = createConversation([profileUser.id], [profileUser.name]);
    navigate('/messages');
    toast.success(`Started conversation with ${profileUser.name}`);
  };

  if (!profileUser) {
    return (
      <div className="container max-w-4xl py-6">
        <p className="text-center text-muted-foreground">User not found</p>
      </div>
    );
  }

  const dept = getDepartment(profileUser.departmentId);
  const status = getUserStatus(profileUser.id);
  const initials = profileUser.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/messages">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {profileUser.avatar ? (
                  <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                ) : (
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                )}
              </Avatar>
              <Circle 
                className={`absolute bottom-0 right-0 h-6 w-6 fill-current border-4 border-background rounded-full ${
                  status?.status === 'online' ? 'text-green-500' :
                  status?.status === 'away' ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profileUser.name}</h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{profileUser.jobTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{dept?.name || 'No Department'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profileUser.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant={status?.status === 'online' ? 'default' : 'secondary'}>
                    {status?.status === 'online' ? 'Online' : 
                     status?.status === 'away' ? 'Away' : 'Offline'}
                  </Badge>
                  <Badge variant="outline">{profileUser.role.replace('_', ' ')}</Badge>
                </div>
              </div>

              {!isOwnProfile && (
                <div className="mt-6">
                  <Button onClick={handleStartChat}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isOwnProfile && profileViews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profileViews.slice(0, 10).map((view, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{view.viewerName}</p>
                    <p className="text-sm text-muted-foreground">{view.viewerDepartment}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(view.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
