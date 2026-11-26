import React from 'react';
import { Users, Calendar, DollarSign, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'students', label: 'Աշակերտներ', icon: Users },
    { id: 'attendance', label: 'Հաճախումներ', icon: Calendar },
    { id: 'finance', label: 'Ֆինանսներ', icon: DollarSign },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-8 text-blue-400">Robotics CRM</h1>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <button 
        onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
      >
        <LogOut size={18} />
        Դուրս գալ
      </button>
    </div>
  );
}