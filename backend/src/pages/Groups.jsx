import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, Clock, X, UserPlus, UserMinus, Check, Calendar } from 'lucide-react';
import StudentProfileModal from '../components/StudentProfileModal';

const DAYS_OF_WEEK = ['Երկ', 'Երք', 'Չոր', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'];

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('16:30');
  const [teacherId, setTeacherId] = useState('');

  // Բացված խմբի մոդալ
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [studentToAdd, setStudentToAdd] = useState('');

  // Խմբի ներսում հաճախում նշելու state-եր
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingId, setMarkingId] = useState(null);
  const [markedFeedback, setMarkedFeedback] = useState({}); // { [studentId]: 'PRESENT' | 'ABSENT' }

  // Աշակերտի անձնական էջի մոդալ
  const [profileStudentId, setProfileStudentId] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    const res = await API.get('/api/groups');
    setGroups(res.data);
    if (selectedGroup) {
      const updated = res.data.find((g) => g.id === selectedGroup.id);
      setSelectedGroup(updated || null);
    }
  };

  const fetchTeachers = async () => {
    const res = await API.get('/api/teachers');
    setTeachers(res.data);
  };

  const fetchStudents = async () => {
    const res = await API.get('/api/students');
    setAllStudents(res.data);
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Խնդրում ենք ընտրել առնվազն մեկ օր');
      return;
    }
    await API.post('/api/groups', {
      name,
      days: selectedDays,
      startTime,
      endTime,
      teacherId,
    });
    setName('');
    setSelectedDays([]);
    fetchGroups();
  };

  const handleAddStudentToGroup = async () => {
    if (!studentToAdd) return;
    await API.put(`/api/groups/${selectedGroup.id}/add-student`, { studentId: studentToAdd });
    setStudentToAdd('');
    fetchGroups();
    fetchStudents();
  };

  const handleRemoveStudent = async (studentId) => {
    await API.put('/api/groups/remove-student', { studentId });
    fetchGroups();
    fetchStudents();
  };

  // Անմիջապես խմբի ներսում Ներկա / Բացակա նշել
  const handleQuickAttendance = async (studentId, status) => {
    setMarkingId(studentId);
    try {
      await API.post('/api/attendance', {
        studentId,
        date: attendanceDate,
        status,
      });
      setMarkedFeedback((prev) => ({ ...prev, [studentId]: status }));
      fetchGroups();
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert('Սխալ՝ հաճախումը գրանցելիս');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Խմբեր և Շաբաթական Օրացույց</h2>

      {/* Նոր Խումբ Ստեղծելու Բլոկ (Հավասարաչափ դասավորությամբ) */}
      <form onSubmit={handleCreateGroup} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-700">Ավելացնել Նոր Խումբ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Խմբի Անվանում</label>
            <input
              type="text"
              placeholder="Օր․՝ Ռոբոտիկա 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 p-2 rounded-lg text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Դասատու</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            >
              <option value="">-- Ընտրել Դասատու --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Ժամային Գրաֆիկ (Սկիզբ - Ավարտ)</label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg text-sm"
              />
              <span className="text-slate-400">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Շաբաթվա օրերի կոճակներ */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Ընտրել Օրերը․</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    selectedDays.includes(d)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 shadow-sm self-end"
          >
            <Plus size={18} /> Ստեղծել Խումբ
          </button>
        </div>
      </form>

      {/* ԵՐԿՈՒՇԱԲԹԻԻՑ ԿԻՐԱԿԻ ՇԱԲԱԹԱԿԱՆ ՕՐԱՑՈՒՅՑ (Դասավորված ըստ ժամերի) */}
      <h3 className="text-xl font-bold text-slate-800">Շաբաթական Դասացուցակ</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS_OF_WEEK.map((day) => {
          const dayGroups = groups
            .filter((g) => g.days && g.days.includes(day))
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

          return (
            <div key={day} className="bg-slate-50 p-3 rounded-xl border border-slate-200 min-h-[200px]">
              <div className="font-bold text-center border-b pb-2 mb-2 text-slate-700 bg-white py-1.5 rounded-lg shadow-sm">
                {day} ({dayGroups.length})
              </div>
              <div className="space-y-2">
                {dayGroups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedGroup(g);
                      setMarkedFeedback({});
                    }}
                    className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm cursor-pointer hover:border-blue-500 hover:shadow transition-all"
                  >
                    <div className="font-bold text-sm text-blue-950">{g.name}</div>
                    <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                      <Clock size={12} /> {g.startTime} - {g.endTime}
                    </div>
                    <div className="text-xs text-slate-600 font-medium mt-1">
                      👤 {g.students?.length || 0} աշակերտ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ԽՄԲԻ ՄԱՆՐԱՄԱՍՆԵՐԻ ՊԱՏՈՒՀԱՆ (Հաճախումներով և Անձնական Էջի Հղումով) */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedGroup(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-800">{selectedGroup.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Ժամեր՝ <strong>{selectedGroup.startTime} - {selectedGroup.endTime}</strong> | Դասատու՝{' '}
                <strong>
                  {selectedGroup.teacher
                    ? `${selectedGroup.teacher.firstName} ${selectedGroup.teacher.lastName}`
                    : 'Նշված չէ'}
                </strong>
              </p>
            </div>

            {/* Հաճախման ամսաթվի ընտրություն */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                <Calendar size={16} className="text-blue-600" />
                <span>Նշել հաճախումը ամսաթվով․</span>
              </div>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => {
                  setAttendanceDate(e.target.value);
                  setMarkedFeedback({});
                }}
                className="border border-blue-200 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700"
              />
            </div>

            {/* Աշակերտ Ավելացնել Խմբում */}
            <div className="flex gap-2">
              <select
                value={studentToAdd}
                onChange={(e) => setStudentToAdd(e.target.value)}
                className="border border-slate-300 p-2 rounded-lg flex-1 text-sm"
              >
                <option value="">-- Ընտրել աշակերտ խմբին կցելու համար --</option>
                {allStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} {s.groupId ? '(արդեն խմբում է)' : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStudentToGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 text-sm font-medium"
              >
                <UserPlus size={16} /> Ավելացնել
              </button>
            </div>

            {/* Խմբի Աշակերտների Ցուցակ */}
            <div className="border rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-100 font-semibold text-xs text-slate-600 flex justify-between">
                <span>Խմբի Աշակերտներ ({selectedGroup.students?.length || 0}) — սեղմեք անվան վրա անձնական էջի համար</span>
                <span>Հաճախում / Գործողություն</span>
              </div>
              <div className="divide-y text-sm max-h-72 overflow-y-auto">
                {selectedGroup.students && selectedGroup.students.length > 0 ? (
                  selectedGroup.students.map((s) => {
                    const feedback = markedFeedback[s.id];
                    return (
                      <div key={s.id} className="p-3 flex flex-wrap justify-between items-center gap-2 hover:bg-slate-50">
                        <div>
                          <button
                            type="button"
                            onClick={() => setProfileStudentId(s.id)}
                            className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-left"
                            title="Բացել աշակերտի անձնական էջը"
                          >
                            {s.firstName} {s.lastName}
                          </button>
                          <div className="text-xs text-slate-500">
                            Հեռ՝ {s.parentPhone} • Մնացած դասեր՝ <strong className="text-slate-700">{s.remainingClasses}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {feedback && (
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded mr-1 ${
                                feedback === 'PRESENT'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {feedback === 'PRESENT' ? '✓ Ներկա' : '✕ Բացակա'}
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={markingId === s.id}
                            onClick={() => handleQuickAttendance(s.id, 'PRESENT')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                            title="Նշել Ներկա (կպակասի 1 դաս)"
                          >
                            <Check size={14} /> Ներկա
                          </button>

                          <button
                            type="button"
                            disabled={markingId === s.id}
                            onClick={() => handleQuickAttendance(s.id, 'ABSENT')}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                            title="Նշել Բացակա"
                          >
                            <X size={14} /> Բացակա
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(s.id)}
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg ml-1"
                            title="Հանել խմբից"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 text-sm">Այս խմբում դեռ աշակերտներ չկան</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ԱՇԱԿԵՐՏԻ ԱՆՁՆԱԿԱՆ ԷՋԻ ՊԱՏՈՒՀԱՆ */}
      {profileStudentId && (
        <StudentProfileModal
          studentId={profileStudentId}
          onClose={() => setProfileStudentId(null)}
        />
      )}
    </div>
  );
}