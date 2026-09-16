import { observer } from 'mobx-react-lite';
import { appStore } from './stores/BoardStore';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Board } from './components/Board/Board';
import { TemplatesPage } from './components/Templates/TemplatesPage';
import { SettingsPanel } from './components/Settings/SettingsPanel';
import { AppView } from './types/kanban';

const MainView = observer(function MainView() {
  if (appStore.view === AppView.Templates) return <TemplatesPage />;

  if (appStore.view === AppView.Settings) return <SettingsPanel />;

  return <Board />;
});

const App = observer(function App() {
  return (
    <>
      <Sidebar />
      <MainView />
    </>
  );
});

export default App;
