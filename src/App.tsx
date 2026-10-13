import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { useAppStore } from './store/useAppStore';
import { CommandCenterView } from './components/views/CommandCenter/CommandCenterView';
import { SpatialLabView } from './components/views/SpatialLab/SpatialLabView';
import { ScenarioStudioPlaceholder } from './components/views/ScenarioStudio/ScenarioStudioPlaceholder';
import { BenchmarkArenaPlaceholder } from './components/views/BenchmarkArena/BenchmarkArenaPlaceholder';
import { DatasetExplorerPlaceholder } from './components/views/DatasetExplorer/DatasetExplorerPlaceholder';
import { LandingPageView } from './components/landing/LandingPageView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const activeSection = useAppStore((s) => s.activeSection);
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

  if (viewMode === 'landing') {
    return (
      <QueryClientProvider client={queryClient}>
        <LandingPageView onLaunchEngine={() => setViewMode('app')} />
      </QueryClientProvider>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'command-center':
        return <CommandCenterView />;
      case 'spatial-lab':
        return <SpatialLabView />;
      case 'scenario-studio':
        return <ScenarioStudioPlaceholder />;
      case 'benchmark-arena':
        return <BenchmarkArenaPlaceholder />;
      case 'dataset-explorer':
        return <DatasetExplorerPlaceholder />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        {renderActiveSection()}
      </AppShell>
    </QueryClientProvider>
  );
};

export default App;
