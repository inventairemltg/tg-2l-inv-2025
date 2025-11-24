"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from '@/components/SessionContextProvider'; // Import useSession
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities
import { format } from "date-fns"; // Import format for created_at display

interface Team {
  id: string;
  user_id: string; // Added user_id to match Supabase schema
  name: string;
  created_at: string; // Added created_at
}

const Teams = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [loadingTeams, setLoadingTeams] = useState<boolean>(true);
  const [addingTeam, setAddingTeam] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch teams from Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      if (!session?.user?.id) {
        setLoadingTeams(false);
        return;
      }

      setLoadingTeams(true);
      setError(null);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        showError('Erreur lors du chargement des équipes.');
        setError(error.message);
      } else {
        setTeams(data as Team[]);
      }
      setLoadingTeams(false);
    };

    if (!sessionLoading && session) {
      fetchTeams();
    }
  }, [session, sessionLoading, supabase]);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !session?.user?.id) {
      showError('Veuillez remplir le nom de l\'équipe et être connecté.');
      return;
    }

    setAddingTeam(true);
    setError(null);

    const { data, error } = await supabase
      .from('teams')
      .insert({
        user_id: session.user.id,
        name: newTeamName.trim(),
      })
      .select(); // Select the inserted data to get the full object

    if (error) {
      console.error('Error adding team:', error);
      showError('Erreur lors de l\'ajout de l\'équipe.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setTeams((prevTeams) => [data[0] as Team, ...prevTeams]); // Add new team to the top
      setNewTeamName('');
      showSuccess('Équipe ajoutée avec succès !');
    }
    setAddingTeam(false);
  };

  if (sessionLoading || loadingTeams) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement des équipes...</p>
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
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir les équipes.</p>
      </div>
    );
  }

  return (
    <>
      {/* Section: Create New Team */}
      <Card className="shadow-md mb-6 dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Créer une Nouvelle Équipe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTeam} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="teamName">Nom de l'Équipe</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ex: Équipe Alpha"
                required
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={addingTeam}>
              {addingTeam ? 'Ajout en cours...' : 'Ajouter l\'Équipe'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section: Existing Teams */}
      <Card className="shadow-md dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Équipes Existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-gray-600">
                  <TableHead className="w-[100px] text-gray-600 dark:text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Nom de l'Équipe</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Créée le</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">
                      Aucune équipe trouvée. Créez-en une nouvelle !
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{team.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{team.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{format(new Date(team.created_at), "PPP")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Modifier</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Teams;