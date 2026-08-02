import { AppProviders } from '@app/providers/AppProviders';
import { AppLayout } from '@features/ui/layouts/AppLayout';

export function App() {
  return (
    <AppProviders>
      <AppLayout />
    </AppProviders>
  );
}
