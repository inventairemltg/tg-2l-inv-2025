"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
import { format } from "date-fns";
import { Edit, Trash2, ChevronDown } from "lucide-react"; // Import ChevronDown for collapsible
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"; // Import Collapsible components
import { Badge } from "@/components/ui/badge"; // Import Badge for item display

interface Zone {
  id: string;
  user_id: string;
  name: string;
  type: 'PDV Surface' | 'Dépôt';
  status: 'Active' | 'In Progress' | 'Completed';
  session_id: string | null;
  created_at: string;
  session_name?: string; // For display
  items?: Item[]; // New: Add items to zone interface
}

interface Item {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface SessionOption {
  id: string;
  name: string;
}

const Zones = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [zones, setZones] = useState<Zone[]>([]);
  const [sessionsOptions, setSessionsOptions] = useState<SessionOption[]>([]); // For session dropdown
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState<'PDV Surface' | 'Dépôt'>('PDV Surface');
  const [newZoneStatus, setNewZoneStatus] = useState<'Active' | 'In Progress' | 'Completed'>('Active');
  const [newZoneSessionId, setNewZoneSessionId] = useState<string | null>(null);
  const [loadingZones, setLoadingZones] = useState<boolean>(true);
  const [addingZone, setAddingZone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [editZoneName, setEditZoneName] = useState<string>('');
  const [editZoneType, setEditZoneType] = useState<'PDV Surface' | 'Dépôt'>('PDV Surface');
  const [editZoneStatus, setEditZoneStatus] = useState<'Active' | 'In Progress' | 'Completed'>('Active');
  const [editZoneSessionId, setEditZoneSessionId] = useState<string | null>(null);
  const [updatingZone, setUpdatingZone] = useState<boolean>(false);

  // State for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [deletingZone, setDeletingZone] = useState<boolean>(false);

  // Fetch sessions for dropdown
  useEffect(() => {
    const fetchSessionsOptions = async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name')
        .eq('user_id', session.user.id)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching sessions for dropdown:', error);
      } else {
        setSessionsOptions(data as SessionOption[]);
      }
    };

    if (!sessionLoading && session) {
      fetchSessionsOptions();
    }
  }, [session, sessionLoading, supabase]);

  // Fetch zones and their associated sessions and items from Supabase
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
        .select('*, sessions(name), items(id, name, sku, quantity)') // Select session name and associated items
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching zones:', error);
        showError('Erreur lors du chargement des zones.');
        setError(error.message);
      } else {
        setZones(data.map(zone => ({
          ...zone,
          session_name: zone.sessions?.name || 'Non assignée', // Add session_name for display
          items: zone.items || [] // Ensure items is an array
        })) as Zone[]);
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
        session_id: newZoneSessionId,
      })
      .select('*, sessions(name), items(id, name, sku, quantity)'); // Select the inserted data to get the full object and related data

    if (error) {
      console.error('Error adding zone:', error);
      showError('Erreur lors de l\'ajout de la zone.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setZones((prevZones) => [{
        ...data[0] as Zone,
        session_name: (data[0] as any).sessions?.name || 'Non assignée',
        items: (data[0] as any).items || []
      }, ...prevZones]);
      setNewZoneName('');
      setNewZoneType('PDV Surface');
      setNewZoneStatus('Active');
      setNewZoneSessionId(null);
      showSuccess('Zone ajoutée avec succès !');
    }
    setAddingZone(false);
  };

  const handleEditClick = (zoneItem: Zone) => {
    setCurrentZone(zoneItem);
    setEditZoneName(zoneItem.name);
    setEditZoneType(zoneItem.type);
    setEditZoneStatus(zoneItem.status);
    setEditZoneSessionId(zoneItem.session_id);
    setIsEditDialogOpen(true);
  };

  const handleUpdateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentZone || !editZoneName.trim() || !session?.user?.id) {
      showError('Veuillez remplir tous les champs et être connecté.');
      return;
    }

    setUpdatingZone(true);
    setError(null);

    const { data, error } = await supabase
      .from('zones')
      .update({
        name: editZoneName.trim(),
        type: editZoneType,
        status: editZoneStatus,
        session_id: editZoneSessionId,
      })
      .eq('id', currentZone.id)
      .eq('user_id', session.user.id)
      .select('*, sessions(name), items(id, name, sku, quantity)'); // Select updated data and related data

    if (error) {
      console.error('Error updating zone:', error);
      showError('Erreur lors de la mise à jour de la zone.');
      setError(error.message);
    } else if (data && data.length > 0) {
      setZones((prevZones) =>
        prevZones.map((z) => (z.id === currentZone.id ? {
          ...data[0] as Zone,
          session_name: (data[0] as any).sessions?.name || 'Non assignée',
          items: (data[0] as any).items || []
        } : z))
      );
      showSuccess('Zone mise à jour avec succès !');
      setIsEditDialogOpen(false);
      setCurrentZone(null);
    }
    setUpdatingZone(false);
  };

  const handleDeleteClick = (zoneId: string) => {
    setZoneToDelete(zoneId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteZone = async () => {
    if (!zoneToDelete || !session?.user?.id) {
      showError('Aucune zone sélectionnée pour la suppression ou non connecté.');
      return;
    }

    setDeletingZone(true);
    setError(null);

    const { error } = await supabase
      .from('zones')
      .delete()
      .eq('id', zoneToDelete)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting zone:', error);
      showError('Erreur lors de la suppression de la zone.');
      setError(error.message);
    } else {
      setZones((prevZones) => prevZones.filter((z) => z.id !== zoneToDelete));
      showSuccess('Zone supprimée avec succès !');
      setIsDeleteDialogOpen(false);
      setZoneToDelete(null);
    }
    setDeletingZone(false);
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
            <div className="space-y-2">
              <Label htmlFor="zoneSession">Session (optionnel)</Label>
              <Select value={newZoneSessionId || ''} onValueChange={(value) => setNewZoneSessionId(value === 'null' ? null : value)}>
                <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                  <SelectValue placeholder="Assigner à une session" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                  <SelectItem value="null">Non assignée</SelectItem>
                  {sessionsOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="md:col-span-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={addingZone}>
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
                  <TableHead className="text-gray-600 dark:text-gray-300">Session</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Créée le</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400">
                      Aucune zone trouvée. Créez-en une nouvelle !
                    </TableCell>
                  </TableRow>
                ) : (
                  zones.map((zone) => (
                    <Collapsible asChild key={zone.id}>
                      <>
                        <TableRow className="dark:hover:bg-gray-600">
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
                          <TableCell className="text-gray-700 dark:text-gray-300">{zone.session_name}</TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{format(new Date(zone.created_at), "PPP")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2 dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500" onClick={() => handleEditClick(zone)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(zone.id)} disabled={deletingZone}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {zone.items && zone.items.length > 0 && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="ml-2">
                                  <ChevronDown className="h-4 w-4" />
                                  <span className="sr-only">Voir les articles</span>
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </TableCell>
                        </TableRow>
                        {zone.items && zone.items.length > 0 && (
                          <CollapsibleContent asChild>
                            <TableRow className="bg-gray-50 dark:bg-gray-750">
                              <TableCell colSpan={7} className="py-2 pl-10 pr-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Articles associés :</h4>
                                <div className="flex flex-wrap gap-2">
                                  {zone.items.map((item) => (
                                    <Badge key={item.id} variant="secondary" className="dark:bg-gray-600 dark:text-gray-50">
                                      {item.name} (SKU: {item.sku}, Qty: {item.quantity})
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        )}
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Zone Dialog */}
      {currentZone && (
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Modifier la Zone</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Apportez des modifications à la zone d'inventaire. Cliquez sur enregistrer lorsque vous avez terminé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleUpdateZone} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editZoneName">Nom de la Zone</Label>
                <Input
                  id="editZoneName"
                  value={editZoneName}
                  onChange={(e) => setEditZoneName(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZoneType">Type de Zone</Label>
                <Select value={editZoneType} onValueChange={(value: 'PDV Surface' | 'Dépôt') => setEditZoneType(value)}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="PDV Surface">PDV Surface (A1-A9999)</SelectItem>
                    <SelectItem value="Dépôt">Dépôt (D1-D9999)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZoneStatus">Statut</Label>
                <Select value={editZoneStatus} onValueChange={(value: 'Active' | 'In Progress' | 'Completed') => setEditZoneStatus(value)}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="In Progress">En Cours</SelectItem>
                    <SelectItem value="Completed">Complétée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editZoneSession">Session (optionnel)</Label>
                <Select value={editZoneSessionId || ''} onValueChange={(value) => setEditZoneSessionId(value === 'null' ? null : value)}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600">
                    <SelectValue placeholder="Assigner à une session" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600">
                    <SelectItem value="null">Non assignée</SelectItem>
                    {sessionsOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={updatingZone} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {updatingZone ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Zone Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre zone
              et supprimera vos données de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteZone} disabled={deletingZone} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
              {deletingZone ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Zones;