"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from '@/components/SessionContextProvider'; // Import useSession
import { showError } from '@/utils/toast'; // Import toast utilities

interface SessionData {
  name: string;
  status: 'Active' | 'Completed' | 'Draft';
}

interface ZoneData {
  name: string;
  status: 'Active' | 'In Progress' | 'Completed';
  type: 'PDV Surface' | 'Dépôt';
}

const InventoryDashboard = () => {
  const { supabase, session, loading: sessionLoading } = useSession();
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalZones, setTotalZones] = useState(0);
  const [completedZones, setCompletedZones] = useState(0);
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [zoneStatuses, setZoneStatuses] = useState<ZoneData[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) {
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);
      setError(null);

      try {
        // Fetch total sessions
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact' })
          .eq('user_id', session.user.id);

        if (sessionsError) throw sessionsError;
        setTotalSessions(sessionsCount || 0);

        // Fetch total zones
        const { count: zonesCount, error: zonesError } = await supabase
          .from('zones')
          .select('*', { count: 'exact' })
          .eq('user_id', session.user.id);

        if (zonesError) throw zonesError;
        setTotalZones(zonesCount || 0);

        // Fetch completed zones
        const { count: completedZonesCount, error: completedZonesError } = await supabase
          .from('zones')
          .select('*', { count: 'exact' })
          .eq('user_id', session.user.id)
          .eq('status', 'Completed');

        if (completedZonesError) throw completedZonesError;
        setCompletedZones(completedZonesCount || 0);

        // Fetch recent sessions (e.g., last 3)
        const { data: recentSessionsData, error: recentSessionsError } = await supabase
          .from('sessions')
          .select('name, status')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentSessionsError) throw recentSessionsError;
        setRecentSessions(recentSessionsData as SessionData[]);

        // Fetch zone statuses (e.g., first 4)
        const { data: zoneStatusesData, error: zoneStatusesError } = await supabase
          .from('zones')
          .select('name, status, type')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        if (zoneStatusesError) throw zoneStatusesError;
        setZoneStatuses(zoneStatusesData as ZoneData[]);

      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        showError('Erreur lors du chargement du tableau de bord: ' + err.message);
        setError(err.message);
      } finally {
        setLoadingDashboard(false);
      }
    };

    if (!sessionLoading && session) {
      fetchDashboardData();
    } else if (!sessionLoading && !session) {
      setLoadingDashboard(false); // Stop loading if no session
    }
  }, [session, sessionLoading, supabase]);

  if (sessionLoading || loadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-gray-600 dark:text-gray-300">Chargement du tableau de bord...</p>
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
        <p className="text-gray-600 dark:text-gray-300">Veuillez vous connecter pour voir le tableau de bord.</p>
      </div>
    );
  }

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
            {recentSessions.length === 0 ? (
              <li className="text-gray-500 dark:text-gray-400">Aucune session récente trouvée.</li>
            ) : (
              recentSessions.map((sessionItem, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {sessionItem.name}{' '}
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${
                      sessionItem.status === 'Active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : sessionItem.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                    }`}
                  >
                    {sessionItem.status === 'Active' ? 'Active' : sessionItem.status === 'Completed' ? 'Complétée' : 'Brouillon'}
                  </Badge>
                </li>
              ))
            )}
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
            {zoneStatuses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Aucune zone trouvée.</p>
            ) : (
              zoneStatuses.map((zone, index) => (
                <Badge
                  key={index}
                  className={`${
                    zone.status === 'Active'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : zone.status === 'In Progress'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {zone.name}: {zone.status === 'Active' ? 'Active' : zone.status === 'In Progress' ? 'En Cours' : 'Complétée'} ({zone.type})
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default InventoryDashboard;