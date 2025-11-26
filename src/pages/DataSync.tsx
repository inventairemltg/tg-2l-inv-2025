"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from '@/components/SessionContextProvider';
import { showSuccess, showError } from '@/utils/toast';
import { Download } from 'lucide-react';

// Utility function to convert JSON to CSV
const convertToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    showError('Aucune donnée à exporter.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(',')); // Add headers

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const DataSync = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [loadingExport, setLoadingExport] = useState(false);

  const handleExport = async (tableName: 'sessions' | 'zones' | 'items', filename: string) => {
    if (!session?.user?.id) {
      showError('Vous devez être connecté pour exporter des données.');
      return;
    }

    setLoadingExport(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        throw error;
      }

      convertToCsv(data || [], filename);
      showSuccess(`${filename} exporté avec succès !`);
    } catch (error: any) {
      console.error(`Error exporting ${tableName}:`, error);
      showError(`Erreur lors de l'exportation des ${filename}: ${error.message}`);
    } finally {
      setLoadingExport(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour accéder à la synchronisation des données.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-md dark:bg-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Synchronisation des Données</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Utilisez les options ci-dessous pour exporter vos données d'inventaire.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleExport('sessions', 'sessions_inventaire')}
            disabled={loadingExport}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingExport ? 'Exportation...' : 'Exporter les Sessions'}
          </Button>
          <Button
            onClick={() => handleExport('zones', 'zones_inventaire')}
            disabled={loadingExport}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingExport ? 'Exportation...' : 'Exporter les Zones'}
          </Button>
          <Button
            onClick={() => handleExport('items', 'articles_inventaire')}
            disabled={loadingExport}
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          >
            <Download className="mr-2 h-4 w-4" />
            {loadingExport ? 'Exportation...' : 'Exporter les Articles'}
          </Button>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Les données seront exportées au format CSV et téléchargées sur votre appareil.
        </p>
      </CardContent>
    </Card>
  );
};

export default DataSync;