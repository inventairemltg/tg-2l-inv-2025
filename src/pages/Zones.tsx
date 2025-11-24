"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface Zone {
  id: string;
  name: string;
  type: 'PDV Surface' | 'Dépôt';
  status: 'Active' | 'In Progress' | 'Completed';
}

const Zones = () => {
  const [zones, setZones] = useState<Zone[]>([
    { id: '1', name: 'A1', type: 'PDV Surface', status: 'Active' },
    { id: '2', name: 'D10', type: 'Dépôt', status: 'In Progress' },
    { id: '3', name: 'A5', type: 'PDV Surface', status: 'Completed' },
  ]);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState<'PDV Surface' | 'Dépôt'>('PDV Surface');
  const [newZoneStatus, setNewZoneStatus] = useState<'Active' | 'In Progress' | 'Completed'>('Active');

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newZoneName) {
      const newZone: Zone = {
        id: String(zones.length + 1),
        name: newZoneName,
        type: newZoneType,
        status: newZoneStatus,
      };
      setZones([...zones, newZone]);
      setNewZoneName('');
      setNewZoneType('PDV Surface');
      setNewZoneStatus('Active');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50 mb-2 md:mb-0">Gestion des Zones d'Inventaire</h1>
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
        {/* Section: Create New Zone */}
        <Card className="shadow-md mb-6 dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Créer une Nouvelle Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddZone} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Nom de la Zone</Label>
                <Input
                  id="zoneName"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Ex: A1, D10"
                  required
                  className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneType">Type de Zone</Label>
                <Select value={newZoneType} onValueChange={(value: 'PDV Surface' | 'Dépôt') => setNewZoneType(value)}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="PDV Surface">PDV Surface (A1-A9999)</SelectItem>
                    <SelectItem value="Dépôt">Dépôt (D1-D9999)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneStatus">Statut</Label>
                <Select value={newZoneStatus} onValueChange={(value: 'Active' | 'In Progress' | 'Completed') => setNewZoneStatus(value)}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="In Progress">En Cours</SelectItem>
                    <SelectItem value="Completed">Complétée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="md:col-span-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">Ajouter la Zone</Button>
            </form>
          </CardContent>
        </Card>

        {/* Section: Existing Zones */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zones Existantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:hover:bg-gray-600">
                    <TableHead className="w-[100px] text-gray-600 dark:text-gray-300">ID</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Nom de la Zone</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Statut</TableHead>
                    <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones.map((zone) => (
                    <TableRow key={zone.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{zone.id}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{zone.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{zone.type}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          zone.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          zone.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {zone.status === 'Active' ? 'Active' : zone.status === 'In Progress' ? 'En Cours' : 'Complétée'}
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

export default Zones;