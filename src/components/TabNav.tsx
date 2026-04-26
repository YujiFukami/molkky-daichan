import { useGameStore, type TabId } from '../store/gameStore';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'game', label: '試合', icon: '🎯' },
  { id: 'rules', label: 'ルール', icon: '📖' },
  { id: 'settings', label: '設定', icon: '⚙️' },
];

export function TabNav() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 max-w-md mx-auto">
      <ul className="flex">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex flex-col items-center justify-center py-2 transition ${
                  isActive
                    ? 'text-molkky-green font-bold'
                    : 'text-stone-500'
                }`}
              >
                <span className="text-2xl leading-none">{tab.icon}</span>
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
