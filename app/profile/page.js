'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/app/components/Header'; // Adjust path if needed
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Assuming you use sonner for notifications

// npx shadcn-ui@latest add avatar button input label card sonner

export default function ProfilePage() {
  const { data: session, status, update } = useSession(); // Get update function
  const router = useRouter();
  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin'); // Or your custom login page
    }
    if (session?.user?.name) {
        setName(session.user.name);
    }
  }, [status, router, session]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');

    if (!name.trim()) {
        setError('Name cannot be empty.');
        setIsUpdating(false);
        return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update profile.');
      }

      // --- Crucial: Update the session client-side --- 
      // This refreshes the name displayed in the Header immediately
      await update({ name: name.trim() }); 
      
      toast.success("Profile updated successfully!"); // Display success

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'An error occurred.');
       toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  // Should be redirected if unauthenticated, but handle just in case
  if (!session || !session.user) {
     return <div className="flex justify-center items-center min-h-screen">Please log in to view your profile.</div>;
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
               <Avatar className="h-16 w-16">
                 <AvatarImage src={user.image ?? ''} alt={user.name ?? 'User'} />
                 <AvatarFallback className="text-xl">
                   {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                 </AvatarFallback>
               </Avatar>
                <div className="grid gap-1">
                    <CardTitle className="text-lg">{user.name || 'User'}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={name} 
                    onChange={handleNameChange} 
                    placeholder="Your display name"
                    required 
                  />
                </div>
                 {error && <p className="text-sm text-red-500">{error}</p>}
                 <Button type="submit" disabled={isUpdating || name === session.user.name}>
                   {isUpdating ? 'Saving...' : 'Save Changes'}
                 </Button>
              </form>
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground">
                Your email and profile picture are managed through your Google account.
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
