export type CallStatus =
  | 'ממתין להספקת ציוד'
  | 'להאם'
  | 'בטיפול'
  | 'הושלם'
  | 'בוטל';

export type CallPriority =
  | 'אדום'
  | 'סגרי'
  | 'בדיקה'
  | 'ממתין'
  | 'לאום'
  | 'רגיל';

export interface ServiceCall {
  id?: string;
  customerName: string;
  customerNumber: string;
  technician: string;
  status: CallStatus;
  deviceType: string;
  description: string;
  callNumber: string;
  visitDate?: string | null;
  closingDate?: string | null;
  priority: CallPriority;
  createdAt?: string;
  updatedAt?: string;
}

export const STATUS_COLORS: Record<CallStatus, string> = {
  'ממתין להספקת ציוד': 'bg-blue-100 text-blue-800 border-blue-300',
  'להאם': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'בטיפול': 'bg-orange-100 text-orange-800 border-orange-300',
  'הושלם': 'bg-green-100 text-green-800 border-green-300',
  'בוטל': 'bg-gray-100 text-gray-600 border-gray-300',
};

export const PRIORITY_COLORS: Record<CallPriority, string> = {
  'אדום': 'bg-red-500 text-white',
  'סגרי': 'bg-orange-500 text-white',
  'בדיקה': 'bg-purple-500 text-white',
  'ממתין': 'bg-yellow-400 text-yellow-900',
  'לאום': 'bg-blue-500 text-white',
  'רגיל': 'bg-gray-400 text-white',
};

export const DEVICE_TYPES = [
  'PRIMESCAN AC',
  'INLAB MC XL',
  'INLAB MC X5',
  'Speed Fire',
  'Sidekix',
  'אחר',
];

export const TECHNICIANS = [
  'טכנאי 1',
  'טכנאי 2',
  'טכנאי 3',
];
