import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Deck', icon: '📊' },
    { id: 'pairings', label: 'Briefings', icon: '📝' },
    { id: 'matches', label: 'Battle Logs', icon: '⚔️' },
    { id: 'roster', label: 'Roster', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-auspex-bg text-text-primary font-sans flex flex-col">
      {/* Header */}
      <header className="bg-auspex-panel border-b border-auspex-border sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-imperial-gold rounded-full flex items-center justify-center text-auspex-bg font-bold text-xl border-2 border-white">
                I
              </div>
              <h1 className="text-xl font-bold tracking-wider text-imperial-gold uppercase hidden sm:block">
                Strategium Alpha
              </h1>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 uppercase tracking-widest ${
                    activeTab === item.id
                      ? 'bg-auspex-border text-imperial-gold border-b-2 border-imperial-gold'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button (simplified, normally would toggle) */}
            <div className="md:hidden">
                <span className="text-xs text-imperial-gold border border-imperial-gold px-2 py-1 rounded">
                    M42.024
                </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-auspex-panel border-t border-auspex-border pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full ${
                activeTab === item.id ? 'text-imperial-gold' : 'text-text-secondary'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;