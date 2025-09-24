import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Plus,
  Wallet,
  User,
  Gift,
  X,
  Activity,
  TrendingUp,
  Zap,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/Button';
import { CompactTradingStats } from '../features/trading/CompactTradingStats';

interface TerminalLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/portfolio', label: 'Portfolio', icon: Wallet },
  { path: '/create', label: 'Create Token', icon: Plus },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/profile', label: 'Profile', icon: User },
];

const statsItems = [
  { label: 'Market Cap', value: '$2.4M', icon: BarChart3, trend: '+12.5%' },
  { label: 'Active Users', value: '1,247', icon: Activity, trend: '+8.2%' },
  { label: 'Volume 24h', value: '$847K', icon: TrendingUp, trend: '+23.1%' },
  { label: 'Total Tokens', value: '156', icon: Zap, trend: '+5.7%' },
];

export function TerminalLayout({ children }: TerminalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : 'lg:translate-x-0 -translate-x-full'}
      `}>
        {/* Mobile overlay blur effect */}
        {sidebarOpen && (
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent lg:hidden" />
        )}

        <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl lg:shadow-none">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border/50">
            <Link to="/" className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient-primary">LaunchPad</h1>
                <p className="text-xs text-muted-foreground terminal-text">Meme Terminal v2.0</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation - Fixed */}
          <nav className="flex-shrink-0 px-3 sm:px-4 py-4 sm:py-6 space-y-2 border-b border-border/20">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-primary text-white shadow-lg glow-cyan'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover-glow'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-primary'}`} />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-background scrollbar-thumb-muted-foreground/20 scrollbar-thumb-rounded-full">
            {/* Stats Section */}
            <div className="p-3 sm:p-4 border-t border-border/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">Market Stats</h3>
            <div className="space-y-3">
              {statsItems.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="glass rounded-lg p-3 hover-lift transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{stat.label}</p>
                          <p className="text-xs text-muted-foreground">{stat.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-green-400">{stat.trend}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trading Stats */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 px-2">Live Price</h3>
              <div className="glass rounded-lg p-3">
                <CompactTradingStats />
              </div>
            </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-border/50">
            <div className="glass rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">System Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last update: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-80">
        {/* Mobile Top Bar */}
        <div className="lg:hidden h-14 bg-card/95 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent/50"
              onClick={() => setSidebarOpen(true)}
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
              </div>
            </Button>
            <h1 className="text-lg font-bold text-gradient-primary">LaunchPad</h1>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
