import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, RefreshCw, Trash2, Pencil, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { userService, type AdminUserRecord } from '@/services/userService';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface Props {
  onAdd: () => void;
  onEdit: (id: string) => void;
}

export default function AdminUserList({ onAdd, onEdit }: Props) {
  const { user: currentUser } = useAuth();
  const [users,   setUsers]   = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId,  setDeletingId] = useState<string | null>(null);

  const isSuperadmin = currentUser?.role === 'superadmin';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.list({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.users);
      setTotal(res.pagination.total);
      setPages(res.pagination.pages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleRole   = (v: string) => { setRoleFilter(v); setPage(1); };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      const updated = await userService.toggleActive(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: updated.isActive } : u));
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setTotal(t => t - 1);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Delete failed.';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users & Permissions</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} user{total !== 1 ? 's' : ''} registered</p>
        </div>
        {isSuperadmin && (
          <Button onClick={onAdd} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => handleRole(e.target.value)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#560ce3]/30"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5 text-gray-500">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Last Login</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
                {isSuperadmin && (
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => {
                const isSelf = u._id === currentUser?.id || u.id === currentUser?.id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0',
                          u.role === 'superadmin' ? 'bg-[#560ce3]' : 'bg-gray-400'
                        )}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-1.5">
                            {u.name}
                            {isSelf && <span className="text-[10px] text-gray-400 font-normal">(you)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {u.role === 'superadmin'
                          ? <ShieldCheck className="w-3.5 h-3.5 text-[#560ce3]" />
                          : <Shield className="w-3.5 h-3.5 text-gray-400" />
                        }
                        <Badge variant={u.role === 'superadmin' ? 'purple' : 'outline'}>
                          {u.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    {isSuperadmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle active */}
                          {!isSelf && (
                            <button
                              onClick={() => handleToggle(u._id)}
                              disabled={togglingId === u._id}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                                u.isActive
                                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                                'disabled:opacity-50'
                              )}
                            >
                              {togglingId === u._id ? '…' : (u.isActive ? 'Active' : 'Inactive')}
                            </button>
                          )}
                          {/* Edit */}
                          <Button variant="ghost" size="icon" onClick={() => onEdit(u._id)} title="Edit user">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {/* Delete */}
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(u._id, u.name)}
                              disabled={deletingId === u._id}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
