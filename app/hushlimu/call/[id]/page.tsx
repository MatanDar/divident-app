'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { DEVICE_TYPES, TECHNICIANS } from '@/lib/types';

const STATUSES = ['ממתין להמשך טיפול', 'לתאם', 'בטיפול', 'הושלמה', 'ממתין לחיוב'];

export default function EditHushlimuCallPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerNumber: '',
    phone: '',
    technician: '',
    status: 'הושלמה',
    deviceType: '',
    description: '',
    visitDate: '',
    closingDate: '',
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!params?.id) return;
    const load = async () => {
      const res = await fetch('/api/hushlimu');
      const calls = await res.json();
      const call = calls.find((c: any) => c.id === params.id);
      if (call) {
        setForm({
          customerName: call.customerName || '',
          customerNumber: call.customerNumber || '',
          phone: call.phone || '',
          technician: call.technician || '',
          status: call.status || 'הושלמה',
          deviceType: call.deviceType || '',
          description: call.description || '',
          visitDate: call.visitDate || '',
          closingDate: call.closingDate || '',
        });
      }
      setFetching(false);
    };
    load();
  }, [params?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/hushlimu/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const result = await res.json();
      setSuccess(true);
      if (result.moved && result.destination === 'main') {
        setTimeout(() => router.push('/'), 1000);
      } else {
        setTimeout(() => router.push('/hushlimu'), 1500);
      }
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) {
    return <div className="min-h-screen flex items-center justify-center text-sky-700">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.push('/hushlimu')} className="text-sky-600 hover:text-sky-800 text-sm">
            ← חזרה
          </button>
          <div>
            <h1 className="text-2xl font-bold text-sky-800">עריכת קריאה — הושלמו</h1>
            <p className="text-gray-400 text-xs mt-0.5">#{params?.id}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            ✓ הקריאה עודכנה בהצלחה!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">פרטי לקוח</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם לקוח *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר לקוח</label>
                <input name="customerNumber" value={form.customerNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="מספר טלפון" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">פרטי קריאה</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג מוצר/התקן</label>
                <select name="deviceType" value={form.deviceType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">בחר מוצר...</option>
                  {DEVICE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מצב קריאה</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טכנאי</label>
                <select name="technician" value={form.technician} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">בחר טכנאי...</option>
                  {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">תאריכים</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ביקור</label>
                <input type="datetime-local" name="visitDate" value={form.visitDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סגירה</label>
                <input type="datetime-local" name="closingDate" value={form.closingDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">תיאור / הערות</h2>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y" />
          </section>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {saving ? 'שומר...' : 'עדכן קריאה'}
            </button>
            <button type="button" onClick={() => router.push('/hushlimu')} className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm">
              ביטול
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
