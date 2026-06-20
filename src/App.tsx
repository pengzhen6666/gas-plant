import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FlameKindling,
  Settings,
  Activity,
  LogOut,
  Unlock,
  Lock,
  TrendingUp
} from 'lucide-react';
import { LoginModal } from './components/modals/LoginModal';

// --- Components ---
import { FuelCalculator } from './components/common/FuelCalculator';
import { FuelCalculatorInline } from './components/common/FuelCalculatorInline';
import { useFuelCalculator } from './components/common/FuelCalculator/useFuelCalculator';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { states: calcStates, actions: calcActions } = useFuelCalculator();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('gus_plant_auth');
    if (auth === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gus_plant_auth');
    setIsLoggedIn(false);
  };

  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'calculator', label: '价格走势', icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary text-slate-100 pb-20 md:pb-0 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 p-6 flex-col gap-8 fixed left-0 top-0 h-screen z-50">
        <div className="glass-card flex-1 flex flex-col p-6 border-white/[0.05]">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30">
              <FlameKindling color="white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gradient">GUS PLANT</span>
          </div>

          <nav className="flex flex-col gap-1.5 flex-1">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`} 
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-brand-primary' : ''} /> 
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/5 space-y-3 mt-4">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-400/5 text-emerald-400 rounded-2xl border border-emerald-400/10 text-[10px] font-bold uppercase tracking-widest">
                  <Unlock size={14} /> 管理员: Pz
                </div>
                <button onClick={handleLogout} className="nav-item text-rose-400/70 hover:text-rose-400 hover:bg-rose-400/5">
                  <LogOut size={20} /> <span className="font-bold text-sm">退出管理</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="nav-item text-brand-primary hover:bg-brand-primary/5">
                <Lock size={20} /> <span className="font-bold text-sm">管理员登录</span>
              </button>
            )}
            <div className="nav-item hover:bg-white/5"><Settings size={20} /> <span className="font-bold text-sm">系统设置</span></div>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-bg-secondary/80 backdrop-blur-3xl border border-white/10 rounded-3xl flex justify-around items-center px-4 z-[100] shadow-2xl">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-500 flex-1 h-full rounded-2xl ${activeTab === item.id ? 'bg-white/5 text-brand-primary' : 'text-slate-500'}`}
          >
            <item.icon size={18} className={`transition-transform duration-500 ${activeTab === item.id ? 'scale-125' : ''}`} />
            <span className={`text-[9px] font-black tracking-tighter uppercase transition-all duration-500 ${activeTab === item.id ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area - Expanded to fill screen width */}
      <main className="flex-1 p-4 md:p-10 md:ml-72 w-full max-w-[1800px]">
        <div>
          {activeTab === 'dashboard' && (
            <div className="animate-slide-up space-y-6">
              <header className="mb-4 md:mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[9px] font-bold uppercase tracking-widest mb-2">
                  <Activity size={10} /> 智能分析中心
                </div>
                <h1 className="text-xl md:text-3xl font-black text-gradient tracking-tighter">智能报价核算</h1>
                <p className="text-slate-400 text-[10px] md:text-sm mt-1 font-medium">实时进行多维度利润解析与进销报价决策</p>
              </header>

              <div className="grid grid-cols-1 gap-4 md:gap-8">
                <FuelCalculatorInline states={calcStates} actions={calcActions} />
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="animate-slide-up">
              <header className="mb-10">
                <h1 className="text-3xl md:text-5xl font-black text-gradient tracking-tighter">价格趋势与分析</h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">实时核算燃料进货成本与利润预测，分析历史行情走势</p>
              </header>
              <FuelCalculator />
            </div>
          )}
        </div>
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={() => {
          setIsLoggedIn(true);
          setIsLoginModalOpen(false);
        }} 
      />
    </div>
  );
}

export default App;
