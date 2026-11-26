import React, { useState, useEffect } from 'react';
import API from '../api';
import { DollarSign, CheckCircle, TrendingUp } from 'lucide-react';

export default function Finance() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [classesAdded, setClassesAdded] = useState(8);
  const [totalIncome, setTotalIncome] = useState(0);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchSummary();
  }, []);

  const fetchStudents = async () => {
    const res = await API.get('/api/students');
    setStudents(res.data);
  };

  const fetchSummary = async () => {
    const res = await API.get('/api/finance/summary');
    setTotalIncome(res.data.totalIncome);
    setPayments(res.data.payments);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    await API.post('/api/finance/pay', {
      studentId: selectedStudent,
      amount: Number(amount),
      classesAdded: Number(classesAdded),
    });
    alert('Վճարումը հաջողությամբ գրանցվեց');
    setSelectedStudent('');
    setAmount('');
    fetchSummary();
    fetchStudents();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Ֆինանսական Հաշվետվություն</h2>

      {/* Ընդհանուր մուտքագրված գումարի քարտ */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Ընդհանուր Մուտքագրված Գումար</p>
          <h3 className="text-3xl font-extrabold">{totalIncome.toLocaleString()} AMD</h3>
        </div>
        <div className="bg-white/20 p-4 rounded-xl">
          <TrendingUp size={32} />
        </div>
      </div>

      {/* Վճարում գրանցելու ձև */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Գրանցել Նոր Վճարում</h3>
        <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="border rounded-lg p-2.5"
            required
          >
            <option value="">-- Ընտրել Աշակերտին --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Գումար (AMD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded-lg p-2.5"
            required
          />
          <input
            type="number"
            placeholder="Դասերի քանակ"
            value={classesAdded}
            onChange={(e) => setClassesAdded(e.target.value)}
            className="border rounded-lg p-2.5"
            required
          />
          <button type="submit" className="bg-green-600 text-white rounded-lg p-2.5 font-medium hover:bg-green-700">
            Գրանցել
          </button>
        </form>
      </div>

      {/* Վճարումների Պատմություն */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b font-semibold text-slate-700">Վճարումների Մատյան</div>
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Ամսաթիվ</th>
              <th className="p-3">Աշակերտ</th>
              <th className="p-3">Գումար</th>
              <th className="p-3">Ավելացված Դասեր</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="p-3 text-slate-500">{new Date(p.date).toLocaleDateString('hy-AM')}</td>
                <td className="p-3 font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                <td className="p-3 font-bold text-green-600">+{p.amount.toLocaleString()} AMD</td>
                <td className="p-3 text-blue-600 font-semibold">+{p.classesAdded} դաս</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}