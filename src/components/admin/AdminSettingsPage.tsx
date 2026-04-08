import React, { useState } from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import AISettingsTab from './settings/AISettingsTab';
import WhatsAppSettingsTab from './settings/WhatsAppSettingsTab';

type Tab = 'ai' | 'whatsapp';

const AdminSettingsPage = () => {
  const [tab, setTab] = useState<Tab>('ai');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border pb-4">
        {([
          { id: 'ai' as Tab, label: 'Configurações de IA', icon: Brain },
          { id: 'whatsapp' as Tab, label: 'WhatsApp', icon: MessageSquare },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.id ? 'text-white shadow-lg' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            style={tab === t.id ? { background: 'linear-gradient(135deg, #5766fe, #820dd1)' } : undefined}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ai' && <AISettingsTab />}
      {tab === 'whatsapp' && <WhatsAppSettingsTab />}
    </div>
  );
};

export default AdminSettingsPage;
