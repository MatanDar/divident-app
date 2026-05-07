'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { ServiceCall, TECHNICIANS } from '@/lib/types';
import Link from 'next/link';
import BottomTabs from '@/components/BottomTabs';

const STATUS_FILTER_OPTIONS = [
  'הכל',
  'ממתין להמשך טיפול',
  'לתאם',
  'בטיפול',
  'הושלם',
  'ממתין לחיוב',
];

function formatDate(d?: string | null): string {
  if (!d) return '—';
  // Try to parse as ISO / standard format
  const date = new Date(d);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('he-IL', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }
  // Return as-is if can't parse (e.g. already formatted Hebrew date from sheet)
  return d;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justAdded = searchParams.get('added') === '1';
  const { user, loading } = useAuth();
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState('הכל');
  const [technicianFilter, setTechnicianFilter] = useState('הכל');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [stats, setStats] = useState({ lachiyuv: 0, hushlimu: 0 });
  const lastRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const fetchCalls = useCallback(async () => {
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      setCalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load calls:', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCalls();
      fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
    }
  }, [user, fetchCalls]);

  // Scroll to last row when returning from new-call
  useEffect(() => {
    if (justAdded && !fetching && lastRowRef.current) {
      setTimeout(() => {
        lastRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [justAdded, fetching]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    try {
      await fetch(`/api/calls/${id}`, { method: 'DELETE' });
      setCalls((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('שגיאה במחיקה');
    }
    setDeleteConfirm(null);
  };

  const filtered = calls.filter((c) => {
    const matchStatus = statusFilter === 'הכל' || c.status === statusFilter;
    const matchTechnician = technicianFilter === 'הכל' || (c.technician || '').includes(technicianFilter);
    const matchSearch =
      !search ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceType?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchTechnician && matchSearch;
  });

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-14 bg-sky-800" />
        <div className="flex items-center justify-center h-64 text-sky-700 text-lg">
          טוען קריאות מ-Google Sheets...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
        {justAdded && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm font-medium">
            ✓ הקריאה נוספה בהצלחה — מוצגת בתחתית הרשימה
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-sky-800">לוח קריאות שירות</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {calls.length} קריאות בסך הכל
              {filtered.length !== calls.length && ` · ${filtered.length} מסוננות`}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCalls} className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-lg text-sm transition-colors">
              ↻ רענן
            </button>
            <Link href="/new-call" className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">
              + קריאה חדשה
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'ממתין להמשך טיפול', value: calls.filter(c => c.status === 'ממתין להמשך טיפול').length, color: 'text-sky-700 bg-sky-50 border-sky-200' },
            { label: 'לתאם', value: calls.filter(c => c.status === 'לתאם').length, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
            { label: 'ממתין לחיוב', value: stats.lachiyuv, color: 'text-orange-600 bg-orange-50 border-orange-200' },
            { label: 'הושלמו', value: stats.hushlimu, color: 'text-green-600 bg-green-50 border-green-200' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="חיפוש לפי שם לקוח, טלפון, מוצר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-80"
          />
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-500 font-medium">מצב:</span>
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusFilter === s ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-300 hover:border-sky-400'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-500 font-medium">טכנאי:</span>
            <button onClick={() => setTechnicianFilter('הכל')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${technicianFilter === 'הכל' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-300 hover:border-sky-400'}`}>
              הכל
            </button>
            {TECHNICIANS.map((t) => (
              <button key={t} onClick={() => setTechnicianFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${technicianFilter === t ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-300 hover:border-sky-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sky-800 text-white">
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">שם לקוח</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">מס׳ לקוח</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">טלפון</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">מוצר</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">מצב</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">טכנאי</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">תאריך ביקור</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">הערות</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">
                      {calls.length === 0 ? 'אין קריאות עדיין. לחץ "+ קריאה חדשה" כדי להתחיל.' : 'לא נמצאו קריאות מתאימות לסינון.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((call, idx) => {
                    const isLast = idx === filtered.length - 1;
                    const isNew = justAdded && isLast;
                    return (
                      <tr
                        key={call.id}
                        ref={isLast ? lastRowRef : undefined}
                        className={`transition-colors ${isNew ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{call.customerName}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{call.customerNumber || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{call.phone || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                            {call.deviceType || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={call.status} /></td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{call.technician || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(call.visitDate)}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                          <p className="truncate text-xs" title={call.description}>{call.description || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Link href={`/call/${call.id}`}
                              className="text-xs px-2 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded transition-colors">
                              ערוך
                            </Link>
                            <button onClick={() => handleDelete(call.id!)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${deleteConfirm === call.id ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                              {deleteConfirm === call.id ? 'בטוח?' : 'מחק'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4 mb-2">
          DIVIDENT · מערכת ניהול קריאות שירות
        </p>
      </main>
      <BottomTabs />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
