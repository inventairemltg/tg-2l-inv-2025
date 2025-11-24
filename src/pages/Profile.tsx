"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, updated_at')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        showError('Erreur lors du chargement du profil: ' + error.message);
        setError(error.message);
      } else {
        setProfile(data as Profile);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      }
      setLoadingProfile(false);
    };

    if (!sessionLoading && session) {
      fetchProfile();
    } else if (!sessionLoading && !session) {
      setLoadingProfile(false);
    }
  }, [session, sessionLoading, supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      showError('Vous devez être connecté pour mettre à jour votre profil.');
      return;
    }

    setUpdatingProfile(true);
    setError(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating profile:', error);
      showError('Erreur lors de la mise à jour du profil: ' + error.message);
      setError(error.message);
    } else {
      showSuccess('Profil mis à jour avec succès !');
      // Optionally refetch profile to ensure state is fully consistent
      // or update local state directly if data is simple
      setProfile(prev => prev ? { ...prev, first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() } : null);
    }
    setUpdatingProfile(false);
  };

  if (sessionLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] text-red-500">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir votre profil.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-md dark:bg-gray-700 max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200">Mon Profil</CardTitle>
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
          <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-700">
            {firstName ? firstName[0].toUpperCase() : ''}{lastName ? lastName[0].toUpperCase() : ''}
            {!firstName && !lastName && <UserIcon className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom de famille</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom de famille"
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 cursor-not-allowed"
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={updatingProfile}>
            {updatingProfile ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Profile;