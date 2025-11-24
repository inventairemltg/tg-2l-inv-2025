"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Team {
  id: string;
  name: string;
  members: string[]; // Placeholder for future member management
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Équipe Alpha', members: ['John Doe', 'Jane Smith'] },
    { id: '2', name: 'Équipe Beta', members: ['Peter Jones'] },
  ]);
  const [newTeamName, setNewTeamName] = useState<string>('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: String(teams.length + 1),
        name: newTeamName.trim(),
        members: [], // New teams start with no members
      };
      setTeams([...teams, newTeam]);
      setNewTeamName('');
    }
  };

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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Ajouter l'Équipe</Button>
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
                  <TableHead className="text-gray-600 dark:text-gray-300">Membres</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} className="dark:hover:bg-gray-600">
                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">{team.id}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{team.name}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {team.members.length > 0 ? team.members.join(', ') : 'Aucun membre'}
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
    </>
  );
};

export default Teams;