import React, { useState, useEffect } from 'react';
import API from '../api';
import {
  Plus,
  Clock,
  X,
  UserPlus,
  UserMinus,
  Check,
  Calendar,
  UserCheck,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
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

  // Խմբի անունը/ժամերը խմբագրելու state-եր
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editDays, setEditDays] = useState([]);

  // Աշակերտի որոնման և ավելացման state-եր
  const [studentSearch, setStudentSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Խմբի ներսում հաճախում նշելու state-եր
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingId, setMarkingId] = useState(null);
  const [markedFeedback, setMarkedFeedback] = useState({});

  // Աշակերտի անձնական էջի մոդալ
  const [profileStudentId, setProfileStudentId] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get('/api/groups');
      setGroups(res.data);
      if (selectedGroup) {
        const updated = res.data.find((g) => g.id === selectedGroup.id);
        setSelectedGroup(updated || null);
      }
    } catch (err) {
      console.error('Խմբերի բեռնման սխալ:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await API.get('/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error('Դասատուների բեռնման սխալ:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get('/api/students');
      setAllStudents(res.data);
    } catch (err) {
      console.error('Աշակերտների բեռնման սխալ:', err);
    }
  };

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleEditDay = (day) => {
    if (editDays.includes(day)) {
      setEditDays(editDays.filter((d) => d !== day));
    } else {
      setEditDays([...editDays, day]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert('Խնդրում ենք ընտրել առնվազն մեկ օր');
      return;
    }
    try {
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
    } catch (err) {
      alert(err.response?.data?.error || 'Սխալ՝ խումբ ստեղծելիս');
    }
  };

  // Բացել խմբի խմբագրման ռեժիմը
  const startEditingGroup = () => {
    setEditGroupName(selectedGroup.name);
    setEditStartTime(selectedGroup.startTime || '15:00');
    setEditEndTime(selectedGroup.endTime || '16:30');
    const currentDays = selectedGroup.days
      ? selectedGroup.days.split(',').map((d) => d.trim()).filter(Boolean)
      : [];
    setEditDays(currentDays);
    setIsEditingGroup(true);
  };

  // Պահպանել խմբի փոփոխված անունը, օրերն ու ժամերը
  const handleSaveGroupEdit = async (e) => {
    e.preventDefault();
    if (!editGroupName.trim()) {
      alert('Խմբի անունը չի կարող դատարկ լինել');
      return;
    }
    if (editDays.length === 0) {
      alert('Խնդրում ենք ընտրել առնվազն մեկ օր');
      return;
    }
    try {
      const res = await API.put(`/api/groups/${selectedGroup.id}`, {
        name: editGroupName,
        days: editDays,
        startTime: editStartTime,
        endTime: editEndTime,
      });
      setSelectedGroup(res.data);
      setIsEditingGroup(false);
      fetchGroups();
    } catch (err) {
      alert('Սխալ՝ խումբը խմբագրելիս');
    }
  };

  // Ջնջել խումբը
  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        `Վստա՞հ եք, որ ուզում եք ջնջել «${selectedGroup.name}» խումբը։ (Աշակերտները չեն ջնջվի, պարզապես կմնան առանց խմբի)`
      )
    ) {
      try {
        await API.delete(`/api/groups/${selectedGroup.id}`);
        setSelectedGroup(null);
        setIsEditingGroup(false);
        fetchGroups();
        fetchStudents();
      } catch (err) {
        alert('Սխալ՝ խումբը ջնջելիս');
      }
    }
  };

  // Խմբի դասատուին փոխել կամ նշանակել
  const handleChangeGroupTeacher = async (newTeacherId) => {
    try {
      const res = await API.put(`/api/groups/${selectedGroup.id}/teacher`, {
        teacherId: newTeacherId,
      });
      setSelectedGroup(res.data);
      fetchGroups();
    } catch (err) {
      alert('Սխալ՝ դասատուին փոխելիս');
    }
  };

  // Աշակերտին կցել խմբին
  const handleAddStudentToGroup = async (studentId) => {
    if (!studentId) return;
    try {
      await API.put(`/api/groups/${selectedGroup.id}/add-student`, { studentId });
      setStudentSearch('');
      setIsDropdownOpen(false);
      fetchGroups();
      fetchStudents();
    } catch (err) {
      alert('Սխալ՝ աշակերտին խմբին կցելիս');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await API.put('/api/groups/remove-student', { studentId });
      fetchGroups();
      fetchStudents();
    } catch (err) {
      alert('Սխալ՝ աշակերտին խմբից հանելիս');
    }
  };

  // Հենց խմբի ներսում Ներկա / Բացակա նշել
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
      alert(err.response?.data?.error || 'Սխալ՝ հաճախումը գրանցելիս');
    } finally {
      setMarkingId(null);
    }
  };

  // Աշակերտների զտում ըստ սկզբի տառերի (անուն, ազգանուն կամ ամբողջական անուն)
  const filteredAvailableStudents = allStudents
    .filter((s) => s.groupId !== selectedGroup?.id)
    .filter((s) => {
      const q = studentSearch.trim().toLowerCase();
      if (!q) return true;
      const first = (s.firstName || '').toLowerCase();
      const last = (s.lastName || '').toLowerCase();
      const full = `${first} ${last}`;
      return first.startsWith(q) || last.startsWith(q) || full.includes(q);
    });

  return (
    <div className="p-5 space-y-5 max-w-full">
      <h2 className="text-2xl font-bold text-slate-800">Խմբեր և Շաբաթական Օրացույց</h2>

      {/* Նոր Խումբ Ստեղծելու Բլոկ */}
      <form
        onSubmit={handleCreateGroup}
        className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm"
      >
        <h3 className="font-bold text-slate-700 text-sm">Ավելացնել Նոր Խումբ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="min-w-0">
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

          <div className="min-w-0">
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

          <div className="min-w-0">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Ժամային Գրաֆիկ (Սկիզբ - Ավարտ)
            </label>
            <div className="flex gap-1.5 items-center">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-w-0 border border-slate-300 p-2 rounded-lg text-sm"
              />
              <span className="text-slate-400 shrink-0">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full min-w-0 border border-slate-300 p-2 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Ընտրել Օրերը․</label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 shadow-sm self-end"
          >
            <Plus size={16} /> Ստեղծել Խումբ
          </button>
        </div>
      </form>

      {/* ԵՐԿՈՒՇԱԲԹԻԻՑ ԿԻՐԱԿԻ ՇԱԲԱԹԱԿԱՆ ՕՐԱՑՈՒՅՑ */}
      <h3 className="text-lg font-bold text-slate-800">Շաբաթական Դասացուցակ</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '8px',
        }}
      >
        {DAYS_OF_WEEK.map((day) => {
          const dayGroups = groups
            .filter((g) => g.days && g.days.includes(day))
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

          return (
            <div
              key={day}
              className="bg-slate-50 p-2 rounded-xl border border-slate-200 min-h-[200px] min-w-0"
            >
              <div className="font-bold text-center text-sm border-b pb-1.5 mb-2 text-slate-700 bg-white py-1 rounded-lg shadow-sm">
                {day} ({dayGroups.length})
              </div>
              <div className="space-y-2">
                {dayGroups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      setSelectedGroup(g);
                      setIsEditingGroup(false);
                      setMarkedFeedback({});
                      setStudentSearch('');
                      setIsDropdownOpen(false);
                    }}
                    className="bg-white p-2 rounded-lg border border-blue-200 shadow-sm cursor-pointer hover:border-blue-500 transition-all"
                  >
                    <div className="font-bold text-xs text-blue-950 truncate" title={g.name}>
                      {g.name}
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
                      <Clock size={11} className="shrink-0" /> {g.startTime}-{g.endTime}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                      👤 {g.students?.length || 0} աշակերտ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ԽՄԲԻ ՊԱՏՈՒՀԱՆ */}
      {selectedGroup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40"
          onClick={() => {
            setSelectedGroup(null);
            setIsEditingGroup(false);
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedGroup(null);
                setIsEditingGroup(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            {/* Խմբի վերնագիր կամ խմբագրման ձև */}
            {!isEditingGroup ? (
              <div className="pr-8 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{selectedGroup.name}</h3>
                    <button
                      type="button"
                      onClick={startEditingGroup}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Փոխել խմբի անունը, օրերը կամ ժամերը"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteGroup}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Ջնջել խումբը"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Օրեր՝ <strong>{selectedGroup.days}</strong> | Ժամեր՝{' '}
                    <strong>
                      {selectedGroup.startTime} - {selectedGroup.endTime}
                    </strong>
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSaveGroupEdit}
                className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3 mr-6"
              >
                <div className="text-xs font-bold text-amber-800 uppercase">
                  Խմբի Տվյալների Խմբագրում
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Խմբի Անուն
                    </label>
                    <input
                      type="text"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="w-full border border-slate-300 bg-white p-2 rounded-lg text-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ժամեր (Սկիզբ - Ավարտ)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="w-full border border-slate-300 bg-white p-2 rounded-lg text-sm"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="w-full border border-slate-300 bg-white p-2 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Օրեր․</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => toggleEditDay(d)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          editDays.includes(d)
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border text-slate-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingGroup(false)}
                    className="px-3 py-1.5 border bg-white rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Չեղարկել
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                  >
                    Պահպանել փոփոխությունը
                  </button>
                </div>
              </form>
            )}

            {/* Դասատու ընտրել կամ փոխել հենց խմբի ներսում */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <UserCheck size={16} className="text-blue-600" />
                <span>Խմբի Դասատուն․</span>
              </div>
              <select
                value={selectedGroup.teacherId || ''}
                onChange={(e) => handleChangeGroupTeacher(e.target.value)}
                className="border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800 min-w-[200px]"
              >
                <option value="">-- Առանց դասատուի --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
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

            {/* Աշակերտ Ավելացնել Խմբում (Որոնում ըստ սկզբի տառերի) */}
            <div className="relative">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ավելացնել աշակերտ խմբին (գրեք անվան կամ ազգանվան սկզբի տառերը)․
              </label>
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Օր․՝ Մար... կամ Աբր..."
                  value={studentSearch}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  className="w-full border border-slate-300 pl-9 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {studentSearch && (
                  <button
                    type="button"
                    onClick={() => setStudentSearch('')}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {isDropdownOpen && (
                <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {filteredAvailableStudents.length > 0 ? (
                    filteredAvailableStudents.map((s) => (
                      <div
                        key={s.id}
                        className="px-3 py-2 flex items-center justify-between hover:bg-blue-50 text-sm"
                      >
                        <div>
                          <span className="font-medium text-slate-800">
                            {s.firstName} {s.lastName}
                          </span>
                          {s.group && (
                            <span className="ml-2 text-xs text-amber-600">
                              (խումբ՝ {s.group.name})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStudentToGroup(s.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <UserPlus size={13} /> Ավելացնել
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Այդ տառերով աշակերտ չի գտնվել
                    </div>
                  )}
                  <div className="p-1.5 bg-slate-50 text-right">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 px-2 py-0.5"
                    >
                      Փակել ցուցակը
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Խմբի Աշակերտների Ցուցակ */}
            <div className="border rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-100 font-semibold text-xs text-slate-600 flex justify-between">
                <span>
                  Խմբի Աշակերտներ ({selectedGroup.students?.length || 0}) — սեղմեք անվան վրա օրացույցի համար
                </span>
                <span>Հաճախում</span>
              </div>
              <div className="divide-y text-sm max-h-72 overflow-y-auto">
                {selectedGroup.students && selectedGroup.students.length > 0 ? (
                  selectedGroup.students.map((s) => {
                    const feedback = markedFeedback[s.id];
                    return (
                      <div
                        key={s.id}
                        className="p-3 flex flex-wrap justify-between items-center gap-2 hover:bg-slate-50"
                      >
                        <div>
                          <button
                            type="button"
                            onClick={() => setProfileStudentId(s.id)}
                            className="font-bold text-blue-700 hover:text-blue-900 underline text-left cursor-pointer"
                          >
                            {s.firstName} {s.lastName}
                          </button>
                          <div className="text-xs text-slate-500">
                            Հեռ՝ {s.parentPhone} • Մնացած դասեր՝{' '}
                            <strong className="text-slate-700">{s.remainingClasses}</strong>
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
                          >
                            <Check size={14} /> Ներկա
                          </button>

                          <button
                            type="button"
                            disabled={markingId === s.id}
                            onClick={() => handleQuickAttendance(s.id, 'ABSENT')}
                            className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
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
                  <div className="p-6 text-center text-slate-400 text-sm">
                    Այս խմբում դեռ աշակերտներ չկան
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ԱՇԱԿԵՐՏԻ ԱՆՁՆԱԿԱՆ ԷՋ ԵՎ ՕՐԱՑՈՒՅՑ */}
      {profileStudentId && (
        <StudentProfileModal
          studentId={profileStudentId}
          onClose={() => setProfileStudentId(null)}
        />
      )}
    </div>
  );
}