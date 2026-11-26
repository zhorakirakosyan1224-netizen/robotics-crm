import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  X,
  Calendar,
  CheckCircle,
  XCircle,
  Phone,
  BookOpen,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ARMENIAN_MONTHS = [
  'Հունվար',
  'Փետրվար',
  'Մարտ',
  'Ապրիլ',
  'Մայիս',
  'Հունիս',
  'Հուլիս',
  'Օգոստոս',
  'Սեպտեմբեր',
  'Հոկտեմբեր',
  'Նոյեմբեր',
  'Դեկտեմբեր',
];

const SHORT_WEEK_DAYS = ['Երկ', 'Երք', 'Չոր', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'];

export default function StudentProfileModal({ studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Օրացույցի ընթացիկ ամիս և տարի
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/students/${studentId}`);
      setStudent(res.data);
    } catch (err) {
      console.error('Աշակերտի տվյալների բեռնման սխալ:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) return null;

  const attendances = student?.attendances || [];
  const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendances.filter((a) => a.status === 'ABSENT').length;

  // Ամսաթիվը YYYY-MM-DD ձևաչափի բերելու ֆունկցիա
  const toDateKey = (dateInput) => {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Հաճախումների քարտեզ ըստ օրերի՝ { "2026-11-13": "PRESENT" }
  const attendanceMap = {};
  attendances.forEach((a) => {
    attendanceMap[toDateKey(a.date)] = a.status;
  });

  // Ամսվա օրացույցի ցանցի կառուցում (Երկուշաբթիից Կիրակի)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Կիր, 1 = Երկ ...
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X size={22} />
        </button>

        {loading ? (
          <div className="py-16 text-center text-slate-500">Բեռնվում է աշակերտի անձնական էջը...</div>
        ) : !student ? (
          <div className="py-16 text-center text-red-500">Աշակերտը չի գտնվել</div>
        ) : (
          <div className="space-y-6">
            {/* Վերնագիր և անձնական տվյալներ */}
            <div className="border-b pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-800">
                  {student.firstName} {student.lastName}
                </h2>
                {student.age && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {student.age} տարեկան
                  </span>
                )}
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {student.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400" />
                  <span>Հիմնական հեռ․՝ <strong>{student.parentPhone}</strong></span>
                </div>
                {student.secondaryPhone && (
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400" />
                    <span>Լրացուցիչ հեռ․՝ <strong>{student.secondaryPhone}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-slate-400" />
                  <span>Խումբ՝ <strong>{student.group ? student.group.name : 'Առանց խմբի'}</strong></span>
                </div>
                {student.group && (
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-slate-400" />
                    <span>
                      Օրեր՝ <strong>{student.group.days}</strong> ({student.group.startTime} - {student.group.endTime})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ընդհանուր վիճակագրություն */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">Մնացած Դասեր</div>
                <div className="text-2xl font-extrabold text-blue-700">{student.remainingClasses}</div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center">
                <div className="text-xs text-emerald-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <CheckCircle size={14} /> Ներկա է եղել
                </div>
                <div className="text-2xl font-extrabold text-emerald-700">{presentCount} դաս</div>
              </div>

              <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl text-center">
                <div className="text-xs text-red-600 font-medium mb-1 flex items-center justify-center gap-1">
                  <XCircle size={14} /> Բացակայել է
                </div>
                <div className="text-2xl font-extrabold text-red-700">{absentCount} դաս</div>
              </div>
            </div>

            {/* ՏԵՍՈՂԱԿԱՆ ՕՐԱՑՈՒՅՑ (Ներկա / Բացակա օրերը տեսնելու համար) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                  <Calendar size={17} className="text-blue-600" /> Հաճախումների Օրացույց
                </h3>

                {/* Ամսվա փոխարկիչ */}
                <div className="flex items-center gap-2 bg-white border rounded-lg px-2 py-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 min-w-[120px] text-center">
                    {ARMENIAN_MONTHS[viewMonth]} {viewYear}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Շաբաթվա օրերի վերնագրեր */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-500 mb-1.5">
                {SHORT_WEEK_DAYS.map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Ամսվա օրերի վանդակներ */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-10 rounded-lg" />;
                  }

                  const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const status = attendanceMap[dateKey];

                  let cellStyle = 'bg-white text-slate-700 border-slate-200';
                  let statusLabel = '';

                  if (status === 'PRESENT') {
                    cellStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-sm';
                    statusLabel = 'Ներկա';
                  } else if (status === 'ABSENT') {
                    cellStyle = 'bg-red-500 text-white border-red-600 font-bold shadow-sm';
                    statusLabel = 'Բացակա';
                  }

                  return (
                    <div
                      key={dateKey}
                      title={statusLabel ? `${dateKey} — ${statusLabel}` : dateKey}
                      className={`h-11 rounded-lg border flex flex-col items-center justify-center text-xs transition-all ${cellStyle}`}
                    >
                      <span>{day}</span>
                      {statusLabel && (
                        <span className="text-[9px] leading-none mt-0.5 opacity-95">
                          {statusLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Գույների բացատրություն */}
              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  <span>Ներկա է եղել</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                  <span>Բացակա է եղել</span>
                </div>
              </div>
            </div>

            {/* Վճարումների պատմություն */}
            {student.payments && student.payments.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-emerald-600" /> Վճարումների Պատմություն
                </h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b text-slate-600">
                      <tr>
                        <th className="p-2.5">Ամսաթիվ</th>
                        <th className="p-2.5">Գումար</th>
                        <th className="p-2.5">Ավելացված Դասեր</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {student.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2.5 text-slate-600">
                            {new Date(p.date).toLocaleDateString('hy-AM')}
                          </td>
                          <td className="p-2.5 font-bold text-emerald-600">
                            {p.amount.toLocaleString()} AMD
                          </td>
                          <td className="p-2.5 text-blue-600 font-semibold">+{p.classesAdded} դաս</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}