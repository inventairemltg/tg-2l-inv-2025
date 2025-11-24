"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
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

interface Session {
  id: string;
  user_id: string;
  name: string;
  date: string;
  status: 'Active' | 'Completed' | 'Draft';
  created_at: string;
}

const Sessions = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionName, setNewSessionName] = useState<string>('');
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(undefined);
  const [newSessionStatus, setNewSessionStatus] = useState<'Active' | 'Completed' | 'Draft'>('Draft');
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [addingSession, setAddingSession] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [editSessionName, setEditSessionName] = useState<string>('');
  const [editSessionDate, setEditSessionDate] = useState<Date | undefined>(undefined);
  const [editSessionStatus, setEditSessionStatus] = useState<'Active' | 'Completed' | 'Draft'>('Draft');
  const [updatingSession, setUpdatingSession] = useState<boolean>(false);

  // State for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<boolean>(false);

  // Fetch sessions from Supabase
  useEffect(() => {
    const fetchSessions = async () => {
      if (!session?.user?.id) {
        setLoadingSessions(false);
        return;
      }

      setLoadingSessions(true);
      setError(null);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        showError('Erreur lors du chargement des sessions.');
        setError(error.message);
      } else {
        setSessions(data as Session[]);
      }
      setLoadingSessions(false);
    };

    if (!sessionLoading && session) {
      fetchSessions();
    }
  }, [session, sessionLoading, supabase]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName || !newSessionDate || !session?.user?.id) {
      showError('Veuillez remplir tous les champs et être connecté.');
      return;
    }

    setAddingSession(true);
    setError(null);

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: session.user.id,
        name: newSessionName,
        date: newSessionDate.toISOString(),
        status: newSessionStatus,
      })
      .select();

    if (error) {
      console.error('Error adding session:', error);
      showError('Erreur lors de l\'ajout de la session.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setSessions((prevSessions) => [data[0] as Session, ...prevSessions]);
      setNewSessionName('');
      setNewSessionDate(undefined);
      setNewSessionStatus('Draft');
      showSuccess('Session ajoutée avec succès !');
    }
    setAddingSession(false);
  };

  const handleEditClick = (sessionItem: Session) => {
    setCurrentSession(sessionItem);
    setEditSessionName(sessionItem.name);
    setEditSessionDate(new Date(sessionItem.date));
    setEditSessionStatus(sessionItem.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !editSessionName || !editSessionDate || !session?.user?.id) {
      showError('Veuillez remplir tous les champs et être connecté.');
      return;
    }

    setUpdatingSession(true);
    setError(null);

    const { data, error } = await supabase
      .from('sessions')
      .update({
        name: editSessionName,
        date: editSessionDate.toISOString(),
        status: editSessionStatus,
      })
      .eq('id', currentSession.id)
      .eq('user_id', session.user.id)
      .select();

    if (error) {
      console.error('Error updating session:', error);
      showError('Erreur lors de la mise à jour de la session.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setSessions((prevSessions) =>
        prevSessions.map((s) => (s.id === currentSession.id ? (data[0] as Session) : s))
      );
      showSuccess('Session mise à jour avec succès !');
      setIsEditDialogOpen(false);
      setCurrentSession(null);
    }
    setUpdatingSession(false);
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete || !session?.user?.id) {
      showError('Aucune session sélectionnée pour la suppression ou non connecté.');
      return;
    }

    setDeletingSession(true);
    setError(null);

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionToDelete)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting session:', error);
      showError('Erreur lors de la suppression de la session.');
      setError(error.message);
    } else {
      setSessions((prevSessions) => prevSessions.filter((s) => s.id !== sessionToDelete));
      showSuccess('Session supprimée avec succès !');
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
    setDeletingSession(false);
  };

  if (sessionLoading || loadingSessions) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement des sessions...</p>
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
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir les sessions.</p>
      </div>
    );
  }

  return (
    <>
      {/* Section: Create New Session */}
      <Card className="shadow-md mb-6 dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Créer une Nouvelle Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSession} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Nom de la Session</Label>
              <Input
                id="sessionName"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Ex: inventaire_PDV Nabeul_2025"
                required
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Date de la Session</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600",
                      !newSessionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newSessionDate ? format(newSessionDate, "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-600">
                  <Calendar
                    mode="single"
                    selected={newSessionDate}
                    onSelect={setNewSessionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionStatus">Statut</Label>
              <Select value={newSessionStatus} onValueChange={(value: 'Active' | 'Completed' | 'Draft') => setNewSessionStatus(value)}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Complétée</SelectItem>
                  <SelectItem value="Draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={addingSession}>
              {addingSession ? 'Ajout en cours...' : 'Ajouter la Session'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section: Existing Sessions */}
      <Card className="shadow-md dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Sessions Existantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-gray-600">
                  <TableHead className="w-[100px] text-gray-600 dark:text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Nom de la Session</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Statut</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                      Aucune session trouvée. Créez-en une nouvelle !
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((sessionItem) => (
                    <TableRow key={sessionItem.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{sessionItem.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{sessionItem.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{format(new Date(sessionItem.date), "PPP")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sessionItem.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          sessionItem.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                        }`}>
                          {sessionItem.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500" onClick={() => handleEditClick(sessionItem)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(sessionItem.id)} disabled={deletingSession}>
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

      {/* Edit Session Dialog */}
      {currentSession && (
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Modifier la Session</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Apportez des modifications à la session d'inventaire. Cliquez sur enregistrer lorsque vous avez terminé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleUpdateSession} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editSessionName">Nom de la Session</Label>
                <Input
                  id="editSessionName"
                  value={editSessionName}
                  onChange={(e) => setEditSessionName(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSessionDate">Date de la Session</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600",
                        !editSessionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editSessionDate ? format(editSessionDate, "PPP") : <span>Choisir une date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-600">
                    <Calendar
                      mode="single"
                      selected={editSessionDate}
                      onSelect={setEditSessionDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSessionStatus">Statut</Label>
                <Select value={editSessionStatus} onValueChange={(value: 'Active' | 'Completed' | 'Draft') => setEditSessionStatus(value)}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Complétée</SelectItem>
                    <SelectItem value="Draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={updatingSession} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {updatingSession ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Session Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre session
              et supprimera vos données de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} disabled={deletingSession} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
              {deletingSession ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sessions;