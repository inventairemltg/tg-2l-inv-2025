"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InventoryDashboard = () => {
  // State for dashboard statistics
  const [totalSessions, setTotalSessions] = useState(5);
  const [totalZones, setTotalZones] = useState(50);
  const [completedZones, setCompletedZones] = useState(30);

  // State for recent sessions
  const [recentSessions, setRecentSessions] = useState([
    { name: 'inventaire_PDV Nabeul_2025', status: 'Active' },
    { name: 'inventaire_Depot Sousse_2024', status: 'Complétée' },
    { name: 'inventaire_Magasin Tunis_2024', status: 'Brouillon' },
  ]);

  // State for zone statuses overview
  const [zoneStatuses, setZoneStatuses] = useState([
    { name: 'A1', status: 'Active', type: 'PDV Surface' },
    { name: 'A2', status: 'Complétée', type: 'PDV Surface' },
    { name: 'D1', status: 'En Cours', type: 'Dépôt' },
    { name: 'B5', status: 'Active', type: 'PDV Surface' },
  ]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Total Sessions */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Sessions Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalSessions}</p>
          </CardContent>
        </Card>
        {/* Card 2: Total Zones */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalZones}</p>
          </CardContent>
        </Card>
        {/* Card 3: Zones Complétées */}
        <Card className="shadow-md dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">Zones Complétées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{completedZones}</p>
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
            {recentSessions.map((session, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {session.name}{' '}
                <Badge
                  variant="secondary"
                  className={`ml-2 ${
                    session.status === 'Active'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : session.status === 'Complétée'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                  }`}
                >
                  {session.status}
                </Badge>
              </li>
            ))}
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
            {zoneStatuses.map((zone, index) => (
              <Badge
                key={index}
                className={`${
                  zone.status === 'Active'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : zone.status === 'En Cours'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}
              >
                {zone.name}: {zone.status}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default InventoryDashboard;