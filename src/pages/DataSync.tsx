"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataSync = () => {
  return (
    <Card className="shadow-md dark:bg-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Statut de Synchronisation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 dark:text-gray-300">
          Cette page affichera le statut de la synchronisation des données et les options pour initier ou configurer les processus de synchronisation.
        </p>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          (Fonctionnalité à venir)
        </p>
      </CardContent>
    </Card>
  );
};

export default DataSync;