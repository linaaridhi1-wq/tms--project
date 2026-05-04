'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ clients: 0, ao: 0, soumissions: 0 });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/'); return; }
    setUser(JSON.parse(userData));
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const res = await api.get('/clients');
      setStats({ clients: res.data.length, ao: 0, soumissions: 0 });
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center text-white font-bold">Y</div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Yellomind TMS</h1>
            <div className="flex gap-3 text-sm mt-1">
              <a href="/dashboard" className="text-purple-700 font-medium">Dashboard</a>
              <a href="/clients" className="text-gray-500 hover:text-purple-700">Clients</a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Deconnexion</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bonjour {user.prenom} !</h2>
        <p className="text-gray-600 mb-8">Bienvenue dans votre espace de gestion des appels d offres</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/clients" className="bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-500 hover:shadow-md transition cursor-pointer">
            <div className="text-sm text-gray-500 mb-1">Clients</div>
            <div className="text-3xl font-bold text-gray-900">{stats.clients}</div>
            <div className="text-xs text-purple-700 mt-2">Voir la liste →</div>
          </a>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Appels d offres</div>
            <div className="text-3xl font-bold text-gray-900">{stats.ao}</div>
            <div className="text-xs text-gray-400 mt-2">Bientot disponible</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Soumissions</div>
            <div className="text-3xl font-bold text-gray-900">{stats.soumissions}</div>
            <div className="text-xs text-gray-400 mt-2">Bientot disponible</div>
          </div>
        </div>
      </main>
    </div>
  );
}