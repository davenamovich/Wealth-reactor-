'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ADMIN_KEY = 'wr_admin_2026'; // Simple admin key

interface User {
  username: string;
  wallet_address: string | null;
  has_paid: boolean;
  created_at: string;
  links: Record<string, string>;
}

interface RotatorEntry {
  username: string;
  active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [key, setKey] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [rotator, setRotator] = useState<RotatorEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, paidUsers: 0, rotatorCount: 0, revenue: 0 });

  useEffect(() => {
    const urlKey = searchParams.get('key');
    if (urlKey === ADMIN_KEY) {
      setAuthenticated(true);
      loadData();
    }
  }, [searchParams]);

  const handleLogin = () => {
    if (key === ADMIN_KEY) {
      setAuthenticated(true);
      loadData();
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rotatorRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/rotator'),
      ]);
      
      const usersData = await usersRes.json();
      const rotatorData = await rotatorRes.json();
      
      setUsers(usersData.users || []);
      setRotator(rotatorData.rotator || []);
      
      const paidUsers = (usersData.users || []).filter((u: User) => u.has_paid).length;
      setStats({
        totalUsers: usersData.users?.length || 0,
        paidUsers,
        rotatorCount: rotatorData.rotator?.length || 0,
        revenue: paidUsers * 30,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const toggleRotator = async (username: string, active: boolean) => {
    try {
      await fetch('/api/admin/rotator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, active, key: ADMIN_KEY }),
      });
      loadData();
    } catch (error) {
      console.error('Failed to update rotator:', error);
    }
  };

  const removeFromRotator = async (username: string) => {
    if (!confirm(`Remove ${username} from rotator?`)) return;
    try {
      await fetch('/api/admin/rotator', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, key: ADMIN_KEY }),
      });
      loadData();
    } catch (error) {
      console.error('Failed to remove from rotator:', error);
    }
  };

  const addToRotator = async (username: string) => {
    try {
      await fetch('/api/admin/rotator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, key: ADMIN_KEY }),
      });
      loadData();
    } catch (error) {
      console.error('Failed to add to rotator:', error);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black mb-6 text-center">🔐 Admin Access</h1>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin key"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-yellow-500 text-black font-bold rounded-xl"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black">⚙️ Admin Dashboard</h1>
          <button onClick={loadData} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-blue-400">{stats.totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-green-400">{stats.paidUsers}</div>
            <div className="text-sm text-gray-500">Paid Users</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-purple-400">{stats.rotatorCount}</div>
            <div className="text-sm text-gray-500">In Rotator</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-3xl font-black text-yellow-400">${stats.revenue}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>

        {/* Rotator Management */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🔄 Rotator Management</h2>
          
          {rotator.length === 0 ? (
            <p className="text-gray-500">No users in rotator yet</p>
          ) : (
            <div className="space-y-2">
              {rotator.map((entry, i) => (
                <div key={entry.username} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">#{i + 1}</span>
                    <Link href={`/u/${entry.username}`} className="font-medium hover:text-yellow-400">
                      @{entry.username}
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded ${entry.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {entry.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRotator(entry.username, !entry.active)}
                      className={`px-3 py-1 rounded text-sm ${entry.active ? 'bg-yellow-600' : 'bg-green-600'}`}
                    >
                      {entry.active ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => removeFromRotator(entry.username)}
                      className="px-3 py-1 bg-red-600 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">👥 All Users</h2>
          
          {users.length === 0 ? (
            <p className="text-gray-500">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-3">Username</th>
                    <th className="pb-3">Wallet</th>
                    <th className="pb-3">Paid</th>
                    <th className="pb-3">Rotator</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const inRotator = rotator.some(r => r.username === user.username);
                    return (
                      <tr key={user.username} className="border-b border-gray-800/50">
                        <td className="py-3">
                          <Link href={`/u/${user.username}`} className="hover:text-yellow-400">
                            @{user.username}
                          </Link>
                        </td>
                        <td className="py-3 font-mono text-xs text-gray-500">
                          {user.wallet_address ? `${user.wallet_address.slice(0,6)}...${user.wallet_address.slice(-4)}` : '-'}
                        </td>
                        <td className="py-3">
                          {user.has_paid ? (
                            <span className="text-green-400">✓ Paid</span>
                          ) : (
                            <span className="text-gray-600">No</span>
                          )}
                        </td>
                        <td className="py-3">
                          {inRotator ? (
                            <span className="text-purple-400">✓ Yes</span>
                          ) : (
                            <span className="text-gray-600">No</span>
                          )}
                        </td>
                        <td className="py-3">
                          {!inRotator && user.has_paid && (
                            <button
                              onClick={() => addToRotator(user.username)}
                              className="px-2 py-1 bg-purple-600 rounded text-xs"
                            >
                              Add to Rotator
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link href="/" className="block text-center mt-6 text-sm text-gray-600 hover:text-white">
          ← Back to Site
        </Link>
      </div>
    </main>
  );
}
