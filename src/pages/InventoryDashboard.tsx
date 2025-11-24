"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InventoryDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Total Sessions */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Sessions Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5</p>
          </CardContent>
        </Card>
        {/* Card 2: Total Zones */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">50</p>
          </CardContent>
        </Card>
        {/* Card 3: Zones Complétées */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zones Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">30</p>
          </CardContent>
        </Card>
      </div>

      {/* Section: Recent Sessions */}
      <Card className="shadow-md mb-6 dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Sessions d'Inventaire Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-gray-700 dark:text-gray-300">inventaire_PDV Nabeul_2025 <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge></li>
            <li className="text-gray-700 dark:text-gray-300">inventaire_Depot Sousse_2024 <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Complétée</Badge></li>
          </ul>
        </CardContent>
      </Card>

      {/* Section: Zone Status */}
      <Card className="shadow-md dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Aperçu du Statut des Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">A1: Active</Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">A2: Complétée</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">D1: En Cours</Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default InventoryDashboard;