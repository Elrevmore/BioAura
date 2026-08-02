import { lazy, Suspense } from 'react';
import { GestureIndicator } from '@features/gestures';
import { ProteinInfoPanel, ProteinSearchPanel, ProteinSearchProvider, RepresentationPanel, InspectorPanel, useProteinSearchSelection } from '@features/protein';
import { AmbientDecor } from '@features/ui/components/AmbientDecor';
import { AppBrand } from '@features/ui/components/AppBrand';
import { CameraPanel } from '@features/ui/components/CameraPanel';
import { GestureGuide } from '@features/ui/components/GestureGuide';
import { LoadingOverlay } from '@features/ui/components/LoadingState';
import { PerformanceMonitor } from '@features/ui/components/PerformanceMonitor';
import { SystemStatusBar } from '@features/ui/components/SystemStatusBar';

const ScenePanel = lazy(() =>
  import('@features/ui/components/ScenePanel').then((module) => ({
    default: module.ScenePanel,
  })),
);

export function AppLayout() {
  return (
    <ProteinSearchProvider>
      <AppLayoutContent />
    </ProteinSearchProvider>
  );
}

function AppLayoutContent() {
  const { onSelect } = useProteinSearchSelection();

  return (
    <div className="safe-hud relative h-full w-full overflow-hidden bg-aura-bg">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
        }}
      />

      <AmbientDecor />

      <header className="absolute top-0 right-0 left-0 z-30 flex items-start justify-between gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:px-6">
        <AppBrand />
        <GestureIndicator className="hidden sm:block" />
      </header>

      <SystemStatusBar />
      <PerformanceMonitor />

      <aside
        className="pointer-events-none absolute top-[7.5rem] bottom-44 left-4 z-10 hidden w-56 flex-col gap-4 overflow-hidden sm:bottom-6 sm:left-6 sm:flex sm:w-72 lg:top-28"
        aria-label="Left HUD panels"
      >
        <div className="pointer-events-auto flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain">
          <div className="shrink-0">
            <ProteinSearchPanel variant="rail" onSelect={onSelect} />
          </div>
          <div className="shrink-0">
            <GestureGuide />
          </div>
          <div className="shrink-0">
            <RepresentationPanel />
          </div>
        </div>
        <div className="pointer-events-auto shrink-0">
          <ProteinInfoPanel variant="rail" />
        </div>
      </aside>

      <aside
        className="pointer-events-none absolute top-[7.5rem] right-4 bottom-44 z-10 hidden w-56 flex-col sm:bottom-6 sm:right-6 sm:flex sm:w-72 lg:top-28"
        aria-label="Molecular inspector"
      >
        <div className="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden">
          <InspectorPanel />
        </div>
      </aside>

      <main className="relative h-full w-full" aria-label="BioAura viewport">
        <Suspense fallback={<LoadingOverlay label="Loading 3D engine" />}>
          <ScenePanel />
        </Suspense>
        <ProteinSearchPanel variant="floating" onSelect={onSelect} />
        <ProteinInfoPanel variant="floating" />
        <CameraPanel />
      </main>

      <div className="pointer-events-none absolute top-[7.5rem] right-0 left-0 z-20 flex justify-center sm:hidden">
        <GestureIndicator />
      </div>
    </div>
  );
}
