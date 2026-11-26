import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, Search, X, Edit, Trash2 } from 'lucide-react';
import StudentProfileModal from '../components/StudentProfileModal';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [profileStudentId, setProfileStudentId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    parentPhone: '',
    secondaryPhone: '',
    remainingClasses: 8,
    groupId: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const fetchStudents = async () => {
    const res = await API.get('/api/students');
    setStudents(res.data);
  };

  const fetchGroups = async () => {
    const res = await API.get('/api/groups');
    setGroups(res.data);
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        age: student.age || '',
        parentPhone: student.parentPhone,
        secondaryPhone: student.secondaryPhone || '',
        remainingClasses: student.remainingClasses,
        groupId: student.groupId || '',
        status: student.status
      });
    } else {
      setEditingId(null);
      setFormData({
        firstName: '',
        lastName: '',
        age: '',
        parentPhone: '',
        secondaryPhone: '',
        remainingClasses: 8,
        groupId: '',
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/api/students/${editingId}`, formData);
      } else {
        await API.post('/api/students', formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Սխալ՝ տվյալները պահպանելիս');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Վստա՞հ եք, որ ուզում եք ջնջել այս աշակերտին:')) {
      await API.delete(`/api/students/${id}`);
      fetchStudents();
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Աշակերտների Ցուցակ</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Plus size={18} /> Ավելացնել Աշակերտ
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Որոնել ըստ անվան..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b text-slate-600 text-sm">
            <tr>
              <th className="p-4">Անուն Ազգանուն</th>
              <th className="p-4">Տարիք</th>
              <th className="p-4">Խումբ</th>
              <th className="p-4">Ծնողի Հեռախոս</th>
              <th className="p-4">2-րդ Հեռախոս</th>
              <th className="p-4">Մնացած Դասեր</th>
              <th className="p-4">Գործողություն</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <button
                    type="button"
                    onClick={() => setProfileStudentId(s.id)}
                    className="font-semibold text-blue-700 hover:text-blue-900 hover:underline text-left"
                    title="Բացել անձնական էջը"
                  >
                    {s.firstName} {s.lastName}
                  </button>
                </td>
                <td className="p-4 text-slate-600">{s.age ? `${s.age} տ.` : '-'}</td>
                <td className="p-4 text-slate-600">{s.group?.name || 'Առանց խմբի'}</td>
                <td className="p-4 text-slate-600">{s.parentPhone}</td>
                <td className="p-4 text-slate-500">{s.secondaryPhone || '-'}</td>
                <td className="p-4 font-semibold text-blue-600">{s.remainingClasses} դաս</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleOpenModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Խմբագրել Աշակերտին' : 'Ավելացնել Նոր Աշակերտ'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Անուն"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Ազգանուն"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Տարիք"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">-- Ընտրել Խումբ --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="Ծնողի Հեռախոսահամար *"
                required
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Երկրորդական Հեռախոսահամար (լրացուցիչ)"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Դասերի Քանակ"
                value={formData.remainingClasses}
                onChange={(e) => setFormData({ ...formData, remainingClasses: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Չեղարկել</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Պահպանել</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profileStudentId && (
        <StudentProfileModal
          studentId={profileStudentId}
          onClose={() => setProfileStudentId(null)}
        />
      )}
    </div>
  );
}