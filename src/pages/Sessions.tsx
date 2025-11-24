"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { MadeWithDyad } from "@/components/made-with-dyad";

interface Session {
  id: string;
  name: string;
  date: Date;
  status: 'Active' | 'Completed' | 'Draft';
}

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', name: 'inventaire_PDV Nabeul_2025', date: new Date('2025-01-15'), status: 'Active' },
    { id: '2', name: 'inventaire_Depot Sousse_2024', date: new Date('2024-11-01'), status: 'Completed' },
  ]);
  const [newSessionName, setNewSessionName] = useState<string>('');
  const [newSessionDate, setNewSessionDate] = useState<Date | undefined>(undefined);
  const [newSessionStatus, setNewSessionStatus] = useState<'Active' | 'Completed' | 'Draft'>('Draft');

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName && newSessionDate) {
      const newSession: Session = {
        id: String(sessions.length + 1),
        name: newSessionName,
        date: newSessionDate,
        status: newSessionStatus,
      };
      setSessions([...sessions, newSession]);
      setNewSessionName('');
      setNewSessionDate(undefined);
      setNewSessionStatus('Draft');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-2 md:mb-0">Gestion des Sessions d'Inventaire</h1>
        <nav className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Tableau de Bord</Link>
          <Link to="/sessions" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Sessions</Link>
          <Link to="/zones" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Zones</Link>
          <Link to="/teams" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Équipes</Link>
          <Link to="/data-sync" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">Synchronisation</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 container mx-auto">
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
              <Button type="submit" className="md:col-span-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Ajouter la Session</Button>
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
                  {sessions.map((session) => (
                    <TableRow key={session.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{session.id}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{session.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{format(session.date, "PPP")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          session.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          session.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                        }`}>
                          {session.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Modifier</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white p-4 text-center mt-auto">
        <p className="mb-2">&copy; 2024 Gestion d'Inventaire. Tous droits réservés.</p>
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Sessions;