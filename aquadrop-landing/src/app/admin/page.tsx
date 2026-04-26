import { isAdminSessionValid } from '@/lib/admin/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuthenticated = await isAdminSessionValid();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
      </div>
    </main>
  );
}
