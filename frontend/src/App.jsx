import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';
import Groups from './pages/Groups';
import Teachers from './pages/Teachers';

export default function App() {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="flex bg-slate-100 min-h-screen overflow-x-hidden">
      <div className="shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {activeTab === 'students' && <Students />}
        {activeTab === 'groups' && <Groups />}
        {activeTab === 'teachers' && <Teachers />}
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'finance' && <Finance />}
      </main>
    </div>
  );
}