import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import PageLayout from '@/components/layout/PageLayout';
import { mockUser, mockLocations } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Star, 
  MapPin, 
  Settings, 
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  Edit
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/firebase/config';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });
  const { toast } = useToast();

  // Initialize form data with user profile or empty values
  useEffect(() => {
    if (!currentUser) return;

    // Check if user is signed in with Google
    const isGoogleProvider = currentUser.providerData.some(
      (provider) => provider.providerId === 'google.com'
    );
    setIsGoogleUser(isGoogleProvider);

    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
      });
    } else {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
      });
    }
  }, [userProfile, currentUser]);

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsUpdating(true);
      
      await updateUserProfile({
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoogleProfileUpdate = async () => {
    if (!currentUser) return;
    
    try {
      setIsUpdating(true);
      
      // Force refresh the Google profile data
      await currentUser.reload();
      
      // Update the profile with the latest Google data
      await updateUserProfile({
        displayName: currentUser.displayName || formData.displayName,
        photoURL: currentUser.photoURL || userProfile?.photoURL,
        email: currentUser.email || formData.email,
      });
      
      toast({
        title: 'Profile refreshed',
        description: 'Your Google profile information has been updated.',
      });
    } catch (error) {
      console.error('Error refreshing Google profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh Google profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
      });
    }
    setIsEditing(false);
  };

  // Use empty array if no favorite locations
  const favoriteLocations = mockLocations;

  const header = (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      <Button variant="outline" onClick={() => navigate('/login', { state: { from: '/profile' } })} className="w-full md:w-auto">
        Sign Out
      </Button>
    </div>
  );

  return (
    <PageLayout header={header}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            {userProfile?.photoURL ? (
              <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName || 'User'} />
            ) : null}
            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
              {userProfile?.displayName 
                ? userProfile.displayName.split(' ').map(n => n[0]).join('')
                : currentUser?.email?.[0].toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold text-foreground">
            {userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.email || currentUser?.email}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {userProfile?.role || 'user'}
            </Badge>
            {userProfile?.phoneNumber && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {userProfile.phoneNumber}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <div className="flex items-center space-x-2">
                      {isGoogleUser && !isEditing && (
                        <Button 
                          variant="outline" 
                          onClick={handleGoogleProfileUpdate}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Refresh Google Profile'}
                        </Button>
                      )}
                      {isEditing ? (
                        <>
                          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile} disabled={isUpdating}>
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    {isEditing ? (
                      <Input
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="text-sm">
                        {userProfile?.displayName || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">Email</p>
                          {isGoogleUser && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Google Account
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formData.email || 'Not set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        type="tel"
                      />
                    ) : (
                      <p className="text-sm">
                        {userProfile?.phoneNumber || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {currentUser?.metadata?.creationTime 
                          ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                          : 'Member'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Total Bookings</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{favoriteLocations.length}</div>
                    <div className="text-sm text-muted-foreground">Favorite Spots</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Favorite Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteLocations.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {favoriteLocations.map((location) => (
                      <div key={location.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{location.name}</h3>
                          <Button variant="ghost" size="sm">
                            <Star className="h-4 w-4 fill-current text-warning" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          {location.address}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${location.pricePerHour}/hour • {location.distance}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No favorite locations yet</p>
                    <p className="text-sm">Star locations to add them to your favorites</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive booking confirmations and updates</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Get text messages for important updates</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* App Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    App Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-save payment method</p>
                      <p className="text-sm text-muted-foreground">Remember payment details for faster booking</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Location services</p>
                      <p className="text-sm text-muted-foreground">Find nearby parking automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Password</h3>
                    <p className="text-sm text-muted-foreground mb-4">Last changed 3 months ago</p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security to your account</p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground mb-4">Manage your saved payment methods</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/26</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                      <Button variant="outline" size="sm">Add New Payment Method</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Profile;