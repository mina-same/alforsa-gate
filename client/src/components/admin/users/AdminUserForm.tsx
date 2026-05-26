import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Save, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { userService } from '@/services/userService';
import { cn } from '@/lib/utils';

interface Props {
  userId?: string;
  onSaved: () => void;
  onCancel: () => void;
}

interface FormState {
  name:     string;
  email:    string;
  password: string;
  role:     'admin' | 'superadmin';
}

interface FieldErrors {
  name?:     string;
  email?:    string;
  password?: string;
  role?:     string;
}

const ROLES: { value: 'admin' | 'superadmin'; label: string; description: string }[] = [
  { value: 'admin',      label: 'Admin',      description: 'Can manage tours, bookings, and content.' },
  { value: 'superadmin', label: 'Super Admin', description: 'Full access including user management.' },
];

export default function AdminUserForm({ userId, onSaved, onCancel }: Props) {
  const isEdit = Boolean(userId);

  const [form,    setForm]    = useState<FormState>({ name: '', email: '', password: '', role: 'admin' });
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [showPw,  setShowPw]  = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!userId) return;
    userService.get(userId)
      .then(u => setForm({ name: u.name, email: u.email, password: '', role: u.role }))
      .catch(() => setApiError('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!isEdit && !form.password) e.password = 'Password is required for new users.';
    if (form.password && form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && userId) {
        const payload: { name: string; email: string; role: string; password?: string } = {
          name: form.name, email: form.email, role: form.role,
        };
        if (form.password) payload.password = form.password;
        await userService.update(userId, payload);
      } else {
        await userService.create({ name: form.name, email: form.email, password: form.password, role: form.role });
      }
      onSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Save failed.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    },
  });

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Loading user…</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? 'Edit User' : 'Add New User'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Update user details and permissions.' : 'Create an admin account with role-based access.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <CardContent className="pt-6 space-y-5">
            {apiError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="u-name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="u-name"
                placeholder="e.g. Ahmed Hassan"
                {...field('name')}
                className={cn(errors.name && 'border-red-400 focus-visible:ring-red-400')}
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="u-email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="u-email"
                type="email"
                placeholder="user@example.com"
                {...field('email')}
                className={cn(errors.email && 'border-red-400 focus-visible:ring-red-400')}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="u-password">
                Password {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-gray-400 font-normal text-xs ml-1">(leave blank to keep current)</span>}
              </Label>
              <div className="relative">
                <Input
                  id="u-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
                  {...field('password')}
                  className={cn('pr-10', errors.password && 'border-red-400 focus-visible:ring-red-400')}
                  autoComplete={isEdit ? 'new-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>
                Role <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={cn(
                      'text-left p-4 rounded-xl border-2 transition-all',
                      form.role === r.value
                        ? 'border-[#560ce3] bg-[#560ce3]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <p className={cn('font-semibold text-sm', form.role === r.value ? 'text-[#560ce3]' : 'text-gray-800')}>
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{r.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex gap-3 justify-end pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2 min-w-28">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Create User'}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
