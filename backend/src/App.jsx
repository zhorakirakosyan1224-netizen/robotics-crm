import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';

export default function App() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {activeTab === 'students' && <Students />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'finance' && <Finance />}
      </main>
    </div>
  );
}