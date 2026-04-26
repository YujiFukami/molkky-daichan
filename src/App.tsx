import { useGameStore } from './store/gameStore';
import { TabNav } from './components/TabNav';
import { GameTab } from './components/GameTab';
import { RulesTab } from './components/RulesTab';
import { SettingsTab } from './components/SettingsTab';

export default function App() {
  const activeTab = useGameStore((s) => s.activeTab);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-stone-50">
      <header className="bg-molkky-green text-white px-4 py-3 shadow-md">
        <h1 className="text-xl font-extrabold tracking-wide">モルック大ちゃん</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'game' && <GameTab />}
        {activeTab === 'rules' && <RulesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      <TabNav />
    </div>
  );
}
