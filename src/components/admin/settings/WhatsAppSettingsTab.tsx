import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Wifi, RefreshCw, Bell, QrCode, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppConfig {
  id: string;
  instance_name: string | null;
  instance_status: string;
  qr_code: string | null;
  notifications_enabled: boolean;
  notify_new_lead: boolean;
  notify_new_chat: boolean;
  notify_form_submission: boolean;
}

const WhatsAppSettingsTab = () => {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'get_config' },
      });
      if (error) throw error;
      if (data?.config) {
        const cfg = data.config as WhatsAppConfig;
        setConfig(cfg);
        setQrCode(cfg.qr_code || null);
      }
    } catch (err) {
      console.error('Fetch config error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // Auto-poll status when connecting
  useEffect(() => {
    if (config?.instance_status !== 'connecting') return;
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('whatsapp-manager', {
          body: { action: 'check_status' },
        });
        if (data?.status === 'connected') {
          setQrCode(null);
          fetchConfig();
        }
      } catch (_) {}
    }, 8000);
    return () => clearInterval(interval);
  }, [config?.instance_status, fetchConfig]);

  const handleConnect = async () => {
    setActionLoading('connect');
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'create_instance' },
      });
      if (error) throw error;
      if (data?.status === 'connected') {
        showMsg('WhatsApp já está conectado!');
        setQrCode(null);
      } else if (data?.qr_code) {
        setQrCode(data.qr_code);
        showMsg('Escaneie o QR Code para conectar.');
      }
      fetchConfig();
    } catch (err: any) {
      console.error('Connect error:', err);
      showMsg(`Erro: ${err.message || 'Falha ao conectar.'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshQR = async () => {
    setActionLoading('qr');
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'refresh_qr' },
      });
      if (error) throw error;
      if (data?.status === 'connected') {
        setQrCode(null);
        showMsg('WhatsApp conectado!');
      } else if (data?.qr_code) {
        setQrCode(data.qr_code);
      }
      fetchConfig();
    } catch (err) {
      console.error('QR error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Desconectar e excluir esta instância do WhatsApp?')) return;
    setActionLoading('delete');
    try {
      await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'delete_instance' },
      });
      setQrCode(null);
      showMsg('Instância removida com sucesso.');
      fetchConfig();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleNotification = async (field: string, value: boolean) => {
    if (!config?.id) return;
    await supabase.from('whatsapp_config' as any).update({ [field]: value } as any).eq('id', config.id);
    fetchConfig();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isConnected = config?.instance_status === 'connected';
  const isConnecting = config?.instance_status === 'connecting';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-foreground">Integração WhatsApp</h3>
        <p className="text-sm text-muted-foreground mt-1">Conecte via Evolution API para receber notificações e gerenciar instâncias.</p>
      </div>

      {savedMsg && (
        <div className={`p-3 rounded-xl text-sm font-bold ${savedMsg.includes('Erro') ? 'bg-destructive/10 border border-destructive/30 text-destructive' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'}`}>
          {savedMsg}
        </div>
      )}

      {/* Status */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Instância WhatsApp
          </h4>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isConnected ? 'bg-emerald-500/10 text-emerald-500' :
            isConnecting ? 'bg-amber-500/10 text-amber-500' :
            'bg-muted text-muted-foreground'
          }`}>
            {isConnected ? '🟢 Conectado' :
             isConnecting ? '🟡 Conectando...' :
             '🔴 Desconectado'}
          </span>
        </div>

        {config?.instance_name && (
          <p className="text-xs text-muted-foreground">
            Instância: <span className="font-mono font-bold">{config.instance_name}</span>
          </p>
        )}

        {isConnected ? (
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> WhatsApp conectado com sucesso!
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={actionLoading === 'delete'}
              className="p-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              title="Desconectar"
            >
              {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <button
                onClick={handleConnect}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                {actionLoading === 'connect' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                {isConnecting ? 'Reconectar' : 'Conectar WhatsApp'}
              </button>
              {isConnecting && (
                <button
                  onClick={handleRefreshQR}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground font-bold text-sm hover:bg-secondary/80 disabled:opacity-50"
                >
                  {actionLoading === 'qr' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Atualizar QR
                </button>
              )}
            </div>

            {qrCode && (
              <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white">
                <p className="text-sm font-bold text-gray-800">Escaneie o QR Code com seu WhatsApp</p>
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                <p className="text-xs text-gray-500">Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
                {isConnecting && (
                  <p className="text-xs text-amber-600 font-bold animate-pulse">⏳ Verificando conexão automaticamente...</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Notifications */}
      {config && (
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notificações
          </h4>
          <p className="text-xs text-muted-foreground">Receba notificações no WhatsApp quando eventos acontecerem no site.</p>

          {[
            { field: 'notifications_enabled', label: 'Ativar notificações', value: config.notifications_enabled },
            { field: 'notify_new_lead', label: 'Novo lead capturado', value: config.notify_new_lead },
            { field: 'notify_new_chat', label: 'Nova conversa no chat', value: config.notify_new_chat },
            { field: 'notify_form_submission', label: 'Envio de formulário', value: config.notify_form_submission },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-foreground">{item.label}</span>
              <button
                onClick={() => handleToggleNotification(item.field, !item.value)}
                className={`w-12 h-6 rounded-full transition-colors relative ${item.value ? 'bg-emerald-500' : 'bg-border'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${item.value ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhatsAppSettingsTab;
