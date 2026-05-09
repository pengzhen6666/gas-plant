import React, { useState } from 'react';
import { Lock, X, Loader2 } from 'lucide-react';

export const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟验证延迟，增加真实感
    setTimeout(() => {
      if (username === 'Pz' && password === '123321') {
        localStorage.setItem('gus_plant_auth', 'true');
        onLogin();
        setUsername('');
        setPassword('');
        setLoading(false);
      } else {
        setError('账号或密码错误');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[2000] p-4">
      <div className="glass-card w-full max-w-sm p-8 animate-in zoom-in-95 duration-200 border-brand-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-primary/20 rounded-lg">
              <Lock className="text-brand-primary" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">管理身份验证</h2>
          </div>
          <X size={24} onClick={onClose} className="cursor-pointer text-slate-500 hover:text-white transition-colors" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400">管理账号</label>
            <input 
              type="text" 
              autoFocus
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              placeholder="请输入账号..."
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400">验证密码</label>
            <input 
              type="password" 
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 outline-none focus:border-brand-primary transition-colors text-white"
              placeholder="请输入密码..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-rose-400 text-sm text-center animate-bounce">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-lg font-bold"
          >
            {loading ? <Loader2 className="animate-spin" /> : '立即进入管理模式'}
          </button>
          
          <p className="text-center text-slate-500 text-xs mt-4">
            仅管理员 Pz 可进行数据修改操作
          </p>
        </form>
      </div>
    </div>
  );
};
