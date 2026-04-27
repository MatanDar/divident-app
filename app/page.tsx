'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { ServiceCall, CallStatus, CallPriority } from '@/lib/types';
import Link from 'next/link';

const STATUS_FILTER_OPTIONS: (CallStatus | 'הכל')[] = [
  'הכל',
  'ממתין להספקת ציוד',
  'להאם',
  'בטיפול',
  'הושלם',
  'בוטל',
];

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [calls, setCalls] = useState<ServiceCall[]>([]);
  const [fetching, setFetching] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'הכל'>('הכל');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'calls'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: ServiceCall[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ServiceCall, 'id'>),
      }));
      setCalls(data);
      setFetching(false);
    });
    return unsub;
  }, [user]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    await deleteDoc(doc(db, 'calls', id));
    setDeleteConfirm(null);
  };

  const filtered = calls.filter((c) => {
    const matchStatus = statusFilter === 'הכל' || c.status === statusFilter;
    const matchSearch =
      !search ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.callNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceType?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('he-IL', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-14 bg-teal-800" />
        <div className="flex items-center justify-center h-64 text-teal-700 text-lg">
          טוען קריאות...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-teal-800">לוח קריאות שירות</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {calls.length} קריאות בסך הכל
              {filtered.length !== calls.length && ` · ${filtered.length} מסוננות`}
            </p>
          </div>
          <Link
            href="/new-call"
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
          >
            <span>+</span> קריאה חדשה
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'ממתין לציוד', value: calls.filter(c => c.status === 'ממתין להספקת ציוד').length, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            { label: 'בטיפול', value: calls.filter(c => c.status === 'בטיפול').length, color: 'text-orange-600 bg-orange-50 border-orange-200' },
            { label: 'להאם', value: calls.filter(c => c.status === 'להאם').length, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
            { label: 'הושלם', value: calls.filter(c => c.status === 'הושלם').length, color: 'text-green-600 bg-green-50 border-green-200' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="חיפוש לפי שם לקוח, מס׳ קריאה, מוצר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-800 text-white">
                  <th className="text-right px-4 py-3 font-semibold">#</th>
                  <th className="text-right px-4 py-3 font-semibold">שם לקוח</th>
                  <th className="text-right px-4 py-3 font-semibold">מס׳ לקוח</th>
                  <th className="text-right px-4 py-3 font-semibold">מוצר</th>
                  <th className="text-right px-4 py-3 font-semibold">מצב</th>
                  <th className="text-right px-4 py-3 font-semibold">עדיפות</th>
                  <th className="text-right px-4 py-3 font-semibold">טכנאי</th>
                  <th className="text-right px-4 py-3 font-semibold">תאריך ביקור</th>
                  <th className="text-right px-4 py-3 font-semibold">הערות</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      {calls.length === 0 ? 'אין קריאות עדיין. לחץ "+ קריאה חדשה" כדי להתחיל.' : 'לא נמצאו קריאות מתאימות לסינון.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((call, idx) => (
                    <tr key={call.id} className="call-row transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{call.callNumber || idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{call.customerName}</td>
                      <td className="px-4 py-3 text-gray-500">{call.customerNumber || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                          {call.deviceType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={call.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={call.priority} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{call.technician || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(call.visitDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                        <p className="truncate text-xs" title={call.description}>
                          {call.description || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Link
                            href={`/call/${call.id}`}
                            className="text-xs px-2 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded transition-colors"
                          >
                            ערוך
                          </Link>
                          <button
                            onClick={() => handleDelete(call.id!)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              deleteConfirm === call.id
                                ? 'bg-red-500 text-white'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {deleteConfirm === call.id ? 'בטוח?' : 'מחק'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          DIVIDENT · מערכת ניהול קריאות שירות
        </p>
      </main>
    </div>
  );
}
