"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from '@/components/SessionContextProvider'; // Import useSession
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities
import { format } from "date-fns"; // Import format for created_at display

interface Zone {
  id: string;
  user_id: string; // Added user_id to match Supabase schema
  name: string;
  type: 'PDV Surface' | 'Dépôt';
  status: 'Active' | 'In Progress' | 'Completed';
  created_at: string; // Added created_at
}

const Zones = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [zones, setZones] = useState<Zone[]>([]);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState<'PDV Surface' | 'Dépôt'>('PDV Surface');
  const [newZoneStatus, setNewZoneStatus] = useState<'Active' | 'In Progress' | 'Completed'>('Active');
  const [loadingZones, setLoadingZones] = useState<boolean>(true);
  const [addingZone, setAddingZone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch zones from Supabase
  useEffect(() => {
    const fetchZones = async () => {
      if (!session?.user?.id) {
        setLoadingZones(false);
        return;
      }

      setLoadingZones(true);
      setError(null);
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching zones:', error);
        showError('Erreur lors du chargement des zones.');
        setError(error.message);
      } else {
        setZones(data as Zone[]);
      }
      setLoadingZones(false);
    };

    if (!sessionLoading && session) {
      fetchZones();
    }
  }, [session, sessionLoading, supabase]);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !session?.user?.id) {
      showError('Veuillez remplir le nom de la zone et être connecté.');
      return;
    }

    setAddingZone(true);
    setError(null);

    const { data, error } = await supabase
      .from('zones')
      .insert({
        user_id: session.user.id,
        name: newZoneName.trim(),
        type: newZoneType,
        status: newZoneStatus,
      })
      .select(); // Select the inserted data to get the full object

    if (error) {
      console.error('Error adding zone:', error);
      showError('Erreur lors de l\'ajout de la zone.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setZones((prevZones) => [data[0] as Zone, ...prevZones]); // Add new zone to the top
      setNewZoneName('');
      setNewZoneType('PDV Surface');
      setNewZoneStatus('Active');
      showSuccess('Zone ajoutée avec succès !');
    }
    setAddingZone(false);
  };

  if (sessionLoading || loadingZones) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement des zones...</p>
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
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir les zones.</p>
      </div>
    );
  }

  return (
    <>
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
            <Button type="submit" className="md:col-span-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={addingZone}>
              {addingZone ? 'Ajout en cours...' : 'Ajouter la Zone'}
            </Button>
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
                  <TableHead className="text-gray-600 dark:text-gray-300">Créée le</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400">
                      Aucune zone trouvée. Créez-en une nouvelle !
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <TableRow key={zone.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{zone.id.substring(0, 8)}...</TableCell>
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
                      <TableCell className="text-gray-700 dark:text-gray-300">{format(new Date(zone.created_at), "PPP")}</TableCell>
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

export default Zones;