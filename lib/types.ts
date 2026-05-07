export type CallStatus =
  | 'ממתין להמשך טיפול'
  | 'לתאם'
  | 'בטיפול'
  | 'הושלמה'
  | 'ממתין לחיוב';

export interface ServiceCall {
  id?: string;
  customerName: string;
  customerNumber: string;
  phone: string;
  technician: string;
  status: CallStatus | string;
  deviceType: string;
  description: string;
  visitDate?: string | null;
  closingDate?: string | null;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const STATUS_COLORS: Record<string, string> = {
  'ממתין להמשך טיפול': 'bg-sky-100 text-sky-800 border-sky-300',
  'לתאם': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'הושלמה': 'bg-green-100 text-green-800 border-green-300',
  'ממתין לחיוב': 'bg-orange-100 text-orange-800 border-orange-300',
  'בטיפול': 'bg-purple-100 text-purple-800 border-purple-300',
};

export const DEVICE_TYPES = [
  'PRIMESCAN AC',
  'PRIMESCAN 2',
  'PRIMESCAN CONNECT',
  'INBOX',
  'OMNICAM AC',
  'Primemill',
  'INLAB SW',
  'INLAB MCX',
  'INLAB MC XL',
  'INLAB MC X5',
  'INLAB PROFIRE',
  'Vacuum',
  'DAC Universal',
  'Heliodent',
  'Sidexis',
  'Unit',
  'Axeos',
  'אחר',
];

export const TECHNICIANS = [
  'סרגיי',
  'רונן',
  'אריה',
  'פסקל',
  'חיים',
  'איתי',
  'מתן',
  'יפתח',
];
