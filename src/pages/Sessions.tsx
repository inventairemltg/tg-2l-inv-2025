"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSession } from '@/components/SessionContextProvider'; // Import useSession
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities

interface Session {
  id: string;
  user_id: string; // Added user_id to match Supabase schema
  name: string;
  date: string; // Changed to string to match Supabase TIMESTAMP WITH TIME ZONE
  status: 'Active' | 'Completed' | 'Draft';
  created_at: string; // Added created_at
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
        date: newSessionDate.toISOString(), // Convert Date object to ISO string
        status: newSessionStatus,
      })
      .select(); // Select the inserted data to get the full object

    if (error) {
      console.error('Error adding session:', error);
      showError('Erreur lors de l\'ajout de la session.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setSessions((prevSessions) => [data[0] as Session, ...prevSessions]); // Add new session to the top
      setNewSessionName('');
      setNewSessionDate(undefined);
      setNewSessionStatus('Draft');
      showSuccess('Session ajoutée avec succès !');
    }
    setAddingSession(false);
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

export default Sessions;