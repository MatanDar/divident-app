'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
  CallStatus,
  CallPriority,
  DEVICE_TYPES,
  TECHNICIANS,
} from '@/lib/types';

const STATUSES: CallStatus[] = [
  'ממתין להספקת ציוד',
  'להאם',
  'בטיפול',
  'הושלם',
  'בוטל',
];

const PRIORITIES: CallPriority[] = ['רגיל', 'ממתין', 'בדיקה', 'לאום', 'סגרי', 'אדום'];

export default function NewCallPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerNumber: '',
    technician: '',
    status: 'בטיפול' as CallStatus,
    deviceType: '',
    description: '',
    callNumber: '',
    visitDate: '',
    closingDate: '',
    priority: 'רגיל' as CallPriority,
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-700">טוען...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">קריאה חדשה</h1>
          <p className="text-gray-500 text-sm mt-1">מלא את הפרטים לפתיחת קריאת שירות חדשה</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            ✓ הקריאה נשמרה בהצלחה! מעביר לדף הראשי...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

          {/* Section: Customer details */}
          <section>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
              פרטי לקוח
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם לקוח *</label>
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  placeholder="שם מלא"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר לקוח</label>
                <input
                  name="customerNumber"
                  value={form.customerNumber}
                  onChange={handleChange}
                  placeholder="מס׳ בספק"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Section: Call details */}
          <section>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
              פרטי קריאה
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר קריאה</label>
                <input
                  name="callNumber"
                  value={form.callNumber}
                  onChange={handleChange}
                  placeholder="מס׳ קריאה"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סוג מוצר/התקן *</label>
                <select
                  name="deviceType"
                  value={form.deviceType}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">בחר מוצר...</option>
                  {DEVICE_TYPES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מצב קריאה</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">טכנאי</label>
                <select
                  name="technician"
                  value={form.technician}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">בחר טכנאי...</option>
                  {TECHNICIANS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section: Dates */}
          <section>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
              תאריכים
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ביקור</label>
                <input
                  type="datetime-local"
                  name="visitDate"
                  value={form.visitDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך סגירה</label>
                <input
                  type="datetime-local"
                  name="closingDate"
                  value={form.closingDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">
              תיאור / הערות
            </h2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="תאר את התקלה או הערות נוספות..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
            />
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {saving ? 'שומר...' : 'שמור קריאה'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              ביטול
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
