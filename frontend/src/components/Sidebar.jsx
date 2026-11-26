import React from 'react';
import { Users, Calendar, DollarSign, BookOpen, UserCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'students', label: 'Աշակերտներ', icon: Users },
    { id: 'groups', label: 'Խմբեր / Օրացույց', icon: BookOpen },
    { id: 'teachers', label: 'Դասատուներ', icon: UserCheck },
    { id: 'attendance', label: 'Հաճախումներ', icon: Calendar },
    { id: 'finance', label: 'Ֆինանսներ', icon: DollarSign },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 min-h-screen">
      <h1 className="text-xl font-bold mb-8 text-blue-400">Robotics CRM Alpha</h1>
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
              <Icon size={18} /> {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}