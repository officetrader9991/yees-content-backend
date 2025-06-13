import { useMemo } from 'react';
import themeSettings from './settings/theme';
import { Theme } from './settings/types';
import TweetAnalysisDashboard from './components/generated/TweetAnalysisDashboard.tsx';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(themeSettings.theme);

  const generatedComponent = useMemo(() => {
    // THIS IS WHERE THE TOP LEVEL GENRATED COMPONENT WILL BE RETURNED!
    return <TweetAnalysisDashboard /> // %EXPORT_STATEMENT%
  }, []);

  if (themeSettings.container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  } else {
    return generatedComponent;
  }
}

export default App;
