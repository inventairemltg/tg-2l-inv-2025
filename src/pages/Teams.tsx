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
import { Edit, Trash2 } from "lucide-react"; // Import icons
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [editTeamName, setEditTeamName] = useState<string>('');
  const [updatingTeam, setUpdatingTeam] = useState<boolean>(false);

  // State for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<boolean>(false);

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

  const handleEditClick = (teamItem: Team) => {
    setCurrentTeam(teamItem);
    setEditTeamName(teamItem.name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !editTeamName.trim() || !session?.user?.id) {
      showError('Veuillez remplir le nom de l\'équipe et être connecté.');
      return;
    }

    setUpdatingTeam(true);
    setError(null);

    const { data, error } = await supabase
      .from('teams')
      .update({
        name: editTeamName.trim(),
      })
      .eq('id', currentTeam.id)
      .eq('user_id', session.user.id)
      .select();

    if (error) {
      console.error('Error updating team:', error);
      showError('Erreur lors de la mise à jour de l\'équipe.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setTeams((prevTeams) =>
        prevTeams.map((t) => (t.id === currentTeam.id ? (data[0] as Team) : t))
      );
      showSuccess('Équipe mise à jour avec succès !');
      setIsEditDialogOpen(false);
      setCurrentTeam(null);
    }
    setUpdatingTeam(false);
  };

  const handleDeleteClick = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete || !session?.user?.id) {
      showError('Aucune équipe sélectionnée pour la suppression ou non connecté.');
      return;
    }

    setDeletingTeam(true);
    setError(null);

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamToDelete)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting team:', error);
      showError('Erreur lors de la suppression de l\'équipe.');
      setError(error.message);
    } else {
      setTeams((prevTeams) => prevTeams.filter((t) => t.id !== teamToDelete));
      showSuccess('Équipe supprimée avec succès !');
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
    setDeletingTeam(false);
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
                        <Button variant="outline" size="sm" className="mr-2 dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500" onClick={() => handleEditClick(team)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(team.id)} disabled={deletingTeam}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Team Dialog */}
      {currentTeam && (
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Modifier l'Équipe</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Apportez des modifications au nom de l'équipe. Cliquez sur enregistrer lorsque vous avez terminé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleUpdateTeam} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editTeamName">Nom de l'Équipe</Label>
                <Input
                  id="editTeamName"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={updatingTeam} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {updatingTeam ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre équipe
              et supprimera vos données de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} disabled={deletingTeam} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
              {deletingTeam ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Teams;