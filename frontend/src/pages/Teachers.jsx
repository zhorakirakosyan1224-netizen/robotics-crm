import React, { useState, useEffect } from 'react';
import API from '../api';
import { Plus, Phone, Edit, Trash2, X } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await API.get('/api/teachers');
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/teachers', { firstName, lastName, phone });
      setFirstName('');
      setLastName('');
      setPhone('');
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Սխալ՝ դասատու ավելացնելիս');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/api/teachers/${editingTeacher.id}`, editingTeacher);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      alert('Սխալ՝ դասատուի տվյալները թարմացնելիս');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Վստա՞հ եք, որ ուզում եք ջնջել դասատուին:')) {
      await API.delete(`/api/teachers/${id}`);
      fetchTeachers();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Դասատուների Ցուցակ ({teachers.length})</h2>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3 items-end shadow-sm">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Անուն</label>
          <input
            type="text"
            placeholder="Անուն"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            required
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Ազգանուն</label>
          <input
            type="text"
            placeholder="Ազգանուն"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            required
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Հեռախոսահամար</label>
          <input
            type="text"
            placeholder="Օր․՝ 099123456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-300 p-2 rounded-lg text-sm"
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Plus size={18} /> Ավելացնել Դասատու
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teachers.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-800">{t.firstName} {t.lastName}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingTeacher(t)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="Խմբագրել"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Ջնջել"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                <Phone size={14} /> {t.phone}
              </p>
            </div>
            <div className="mt-3 text-xs bg-blue-50 text-blue-700 p-2 rounded-md font-medium">
              Խմբերի քանակը՝ {t.groups?.length || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Դասատուի խմբագրման պատուհան */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            <button onClick={() => setEditingTeacher(null)} className="absolute right-4 top-4 text-slate-400">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Խմբագրել Դասատուին</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editingTeacher.firstName}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, firstName: e.target.value })}
                className="w-full border p-2 rounded-lg"
                required
              />
              <input
                type="text"
                value={editingTeacher.lastName}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, lastName: e.target.value })}
                className="w-full border p-2 rounded-lg"
                required
              />
              <input
                type="text"
                value={editingTeacher.phone}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                className="w-full border p-2 rounded-lg"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingTeacher(null)} className="px-4 py-2 border rounded-lg">Չեղարկել</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Պահպանել</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}