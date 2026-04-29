import { AdminLogin } from '@/components/admin/AdminLogin';
import { ReviewRequestsAdminUtility } from '@/components/admin/ReviewRequestsAdminUtility';
import { getAdminSessionUser } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function ReviewRequestsPage() {
  const sessionUser = await getAdminSessionUser();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto w-full max-w-6xl">{sessionUser ? <ReviewRequestsAdminUtility /> : <AdminLogin />}</div>
    </main>
  );
}
