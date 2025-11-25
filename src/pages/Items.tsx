"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
import { format } from "date-fns";
import { Edit, Trash2, Package } from "lucide-react";
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

interface Item {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sku: string;
  quantity: number;
  price: number | null;
  created_at: string;
}

const Items = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemDescription, setNewItemDescription] = useState<string>('');
  const [newItemSku, setNewItemSku] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(0);
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [editItemName, setEditItemName] = useState<string>('');
  const [editItemDescription, setEditItemDescription] = useState<string>('');
  const [editItemSku, setEditItemSku] = useState<string>('');
  const [editItemQuantity, setEditItemQuantity] = useState<number>(0);
  const [editItemPrice, setEditItemPrice] = useState<string>('');
  const [updatingItem, setUpdatingItem] = useState<boolean>(false);

  // State for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<boolean>(false);

  // Fetch items from Supabase
  useEffect(() => {
    const fetchItems = async () => {
      if (!session?.user?.id) {
        setLoadingItems(false);
        return;
      }

      setLoadingItems(true);
      setError(null);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching items:', error);
        showError('Erreur lors du chargement des articles.');
        setError(error.message);
      } else {
        setItems(data as Item[]);
      }
      setLoadingItems(false);
    };

    if (!sessionLoading && session) {
      fetchItems();
    }
  }, [session, sessionLoading, supabase]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemSku.trim() || !session?.user?.id) {
      showError('Veuillez remplir le nom et le SKU de l\'article et être connecté.');
      return;
    }

    setAddingItem(true);
    setError(null);

    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: session.user.id,
        name: newItemName.trim(),
        description: newItemDescription.trim() || null,
        sku: newItemSku.trim(),
        quantity: newItemQuantity,
        price: newItemPrice ? parseFloat(newItemPrice) : null,
      })
      .select();

    if (error) {
      console.error('Error adding item:', error);
      showError('Erreur lors de l\'ajout de l\'article: ' + error.message);
      setError(error.message);
    } else if (data && data.length > 0) {
      setItems((prevItems) => [data[0] as Item, ...prevItems]);
      setNewItemName('');
      setNewItemDescription('');
      setNewItemSku('');
      setNewItemQuantity(0);
      setNewItemPrice('');
      showSuccess('Article ajouté avec succès !');
    }
    setAddingItem(false);
  };

  const handleEditClick = (item: Item) => {
    setCurrentItem(item);
    setEditItemName(item.name);
    setEditItemDescription(item.description || '');
    setEditItemSku(item.sku);
    setEditItemQuantity(item.quantity);
    setEditItemPrice(item.price !== null ? item.price.toString() : '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !editItemName.trim() || !editItemSku.trim() || !session?.user?.id) {
      showError('Veuillez remplir tous les champs requis et être connecté.');
      return;
    }

    setUpdatingItem(true);
    setError(null);

    const { data, error } = await supabase
      .from('items')
      .update({
        name: editItemName.trim(),
        description: editItemDescription.trim() || null,
        sku: editItemSku.trim(),
        quantity: editItemQuantity,
        price: editItemPrice ? parseFloat(editItemPrice) : null,
      })
      .eq('id', currentItem.id)
      .eq('user_id', session.user.id)
      .select();

    if (error) {
      console.error('Error updating item:', error);
      showError('Erreur lors de la mise à jour de l\'article: ' + error.message);
      setError(error.message);
    } else if (data && data.length > 0) {
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === currentItem.id ? (data[0] as Item) : i))
      );
      showSuccess('Article mis à jour avec succès !');
      setIsEditDialogOpen(false);
      setCurrentItem(null);
    }
    setUpdatingItem(false);
  };

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete || !session?.user?.id) {
      showError('Aucun article sélectionné pour la suppression ou non connecté.');
      return;
    }

    setDeletingItem(true);
    setError(null);

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemToDelete)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting item:', error);
      showError('Erreur lors de la suppression de l\'article: ' + error.message);
      setError(error.message);
    } else {
      setItems((prevItems) => prevItems.filter((i) => i.id !== itemToDelete));
      showSuccess('Article supprimé avec succès !');
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
    setDeletingItem(false);
  };

  if (sessionLoading || loadingItems) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement des articles...</p>
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
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir les articles.</p>
      </div>
    );
  }

  return (
    <>
      {/* Section: Create New Item */}
      <Card className="shadow-md mb-6 dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Ajouter un Nouvel Article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="itemName">Nom de l'Article</Label>
              <Input
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ex: Smartphone X"
                required
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemDescription">Description</Label>
              <Input
                id="itemDescription"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Description de l'article"
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemSku">SKU (Code Article)</Label>
              <Input
                id="itemSku"
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                placeholder="Ex: SMX-001"
                required
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemQuantity">Quantité</Label>
              <Input
                id="itemQuantity"
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 0)}
                min="0"
                required
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemPrice">Prix (optionnel)</Label>
              <Input
                id="itemPrice"
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Ex: 999.99"
                className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-600"
              />
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" disabled={addingItem}>
              {addingItem ? 'Ajout en cours...' : 'Ajouter l\'Article'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section: Existing Items */}
      <Card className="shadow-md dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Articles Existants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="dark:hover:bg-gray-600">
                  <TableHead className="w-[100px] text-gray-600 dark:text-gray-300">ID</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Quantité</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Prix</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Créé le</TableHead>
                  <TableHead className="text-right text-gray-600 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400">
                      Aucun article trouvé. Créez-en un nouveau !
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="dark:hover:bg-gray-600">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{item.id.substring(0, 8)}...</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{item.name}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{item.sku}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{item.quantity}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{item.price !== null ? `${item.price.toFixed(2)} €` : 'N/A'}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{format(new Date(item.created_at), "PPP")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="mr-2 dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500" onClick={() => handleEditClick(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(item.id)} disabled={deletingItem}>
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

      {/* Edit Item Dialog */}
      {currentItem && (
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Modifier l'Article</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Apportez des modifications à l'article d'inventaire. Cliquez sur enregistrer lorsque vous avez terminé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form onSubmit={handleUpdateItem} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editItemName">Nom de l'Article</Label>
                <Input
                  id="editItemName"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemDescription">Description</Label>
                <Input
                  id="editItemDescription"
                  value={editItemDescription}
                  onChange={(e) => setEditItemDescription(e.target.value)}
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemSku">SKU (Code Article)</Label>
                <Input
                  id="editItemSku"
                  value={editItemSku}
                  onChange={(e) => setEditItemSku(e.target.value)}
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemQuantity">Quantité</Label>
                <Input
                  id="editItemQuantity"
                  type="number"
                  value={editItemQuantity}
                  onChange={(e) => setEditItemQuantity(parseInt(e.target.value) || 0)}
                  min="0"
                  required
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemPrice">Prix (optionnel)</Label>
                <Input
                  id="editItemPrice"
                  type="number"
                  step="0.01"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  placeholder="Ex: 999.99"
                  className="dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={updatingItem} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {updatingItem ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800 dark:text-gray-50">Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Cette action ne peut pas être annulée. Cela supprimera définitivement votre article
              et supprimera ses données de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-600 dark:text-gray-50 dark:border-gray-500 hover:dark:bg-gray-500">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={deletingItem} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
              {deletingItem ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Items;