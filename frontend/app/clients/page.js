'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    raison_sociale: '', secteur: '', contact: '', email: '', telephone: '', pays: ''
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/'); return; }
    setUser(JSON.parse(userData));
    chargerClients();
  }, []);

  const chargerClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch (err) {
      if (err.response?.status === 401) router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      setShowForm(false);
      setForm({ raison_sociale: '', secteur: '', contact: '', email: '', telephone: '', pays: '' });
      chargerClients();
    } catch (err) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await api.delete(`/clients/${id}`);
      chargerClients();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
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
              <a href="/dashboard" className="text-gray-500 hover:text-purple-700">Dashboard</a>
              <a href="/clients" className="text-purple-700 font-medium">Clients</a>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Clients</h2>
            <p className="text-sm text-gray-500 mt-1">{clients.length} client(s) enregistre(s)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-800"
          >
            {showForm ? 'Annuler' : '+ Nouveau client'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Nouveau client</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale *</label>
                <input required value={form.raison_sociale} onChange={(e) => setForm({...form, raison_sociale: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
                <input value={form.secteur} onChange={(e) => setForm({...form, secteur: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                <input value={form.telephone} onChange={(e) => setForm({...form, telephone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                <input value={form.pays} onChange={(e) => setForm({...form, pays: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-800">
                  Creer le client
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Chargement...</div>
          ) : clients.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Aucun client. Cliquez "+ Nouveau client" pour commencer.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison sociale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Secteur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pays</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map((c) => (
                  <tr key={c.client_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.raison_sociale}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.secteur || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.pays || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(c.client_id)} className="text-red-600 hover:text-red-800 text-sm">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}