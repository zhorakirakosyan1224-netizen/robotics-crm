import React, { useState, useEffect } from 'react';
import API from '../api';
import { DollarSign, CheckCircle } from 'lucide-react';

export default function Finance() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [classesAdded, setClassesAdded] = useState(8);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/api/students')
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount) {
      alert('Խնդրում ենք ընտրել աշակերտին և նշել գումարը');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/finance/pay', {
        studentId: selectedStudent,
        amount: Number(amount),
        classesAdded: Number(classesAdded),
      });
      alert('Վճարումը հաջողությամբ գրանցվեց, դասերն ավելացվեցին:');
      setSelectedStudent('');
      setAmount('');
    } catch (err) {
      console.error(err);
      alert('Սխալ վճարումը գրանցելիս');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <DollarSign className="text-green-600" /> Ֆինանսներ / Վճարման Գրանցում
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ընտրել Աշակերտին</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Ընտրեք աշակերտ --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (Առկա դասեր՝ {s.remainingClasses})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Վճարված Գումար (AMD)</label>
            <input
              type="number"
              placeholder="Օրինակ՝ 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ավելացվող Դասերի Քանակ</label>
            <input
              type="number"
              value={classesAdded}
              onChange={(e) => setClassesAdded(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} /> {loading ? 'Գրանցվում է...' : 'Գրանցել Վճարումը'}
          </button>
        </form>
      </div>
    </div>
  );
}