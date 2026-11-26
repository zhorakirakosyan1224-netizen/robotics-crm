import React, { useState, useEffect } from 'react';
import API from '../api';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Աշակերտների բեռնման սխալ:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get('/api/attendance');
      setAttendanceList(res.data);
    } catch (err) {
      console.error('Հաճախումների բեռնման սխալ:', err);
    }
  };

  const handleMark = async (status) => {
    if (!selectedStudent) {
      alert('Խնդրում ենք ընտրել աշակերտին');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/attendance', {
        studentId: selectedStudent,
        date,
        status,
      });
      setSelectedStudent('');
      fetchAttendance();
      fetchStudents();
    } catch (err) {
      console.error('Հաճախման գրանցման սխալ:', err);
      alert('Սխալ՝ հաճախումը գրանցելիս');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Հաճախումների Գրանցում</h2>

      {/* Հաճախում նշելու բլոկ */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ընտրել Ամսաթիվը</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ընտրել Աշակերտին</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Ընտրեք աշակերտ --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (Մնացած դասեր՝ {s.remainingClasses})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              disabled={loading}
              onClick={() => handleMark('PRESENT')}
              className="flex-1 bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} /> Ներկա
            </button>
            <button
              disabled={loading}
              onClick={() => handleMark('ABSENT')}
              className="flex-1 bg-red-600 text-white font-medium py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <X size={18} /> Բացակա
            </button>
          </div>
        </div>
      </div>

      {/* Հաճախումների Պատմություն */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-semibold text-slate-700 flex items-center gap-2">
          <CalendarIcon size={18} /> Հաճախումների Պատմություն
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
            <tr>
              <th className="p-4">Ամսաթիվ</th>
              <th className="p-4">Աշակերտ</th>
              <th className="p-4">Կարգավիճակ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {attendanceList.length > 0 ? (
              attendanceList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-600">
                    {new Date(item.date).toLocaleDateString('hy-AM')}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {item.student?.firstName} {item.student?.lastName}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status === 'PRESENT' ? 'ՆԵՐԿԱ' : 'ԲԱՑԱԿԱ'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-slate-400">
                  Հաճախումների պատմություն դեռ չկա
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}