import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Custom hook to intercept page unloads and Next.js transitions when a form is dirty.
 * @param isDirty Boolean flag tracking whether the form has unsaved modifications.
 */
export function useUnsavedChangesWarning(isDirty: boolean) {
  const router = useRouter();

  useEffect(() => {
    // Scenario A: Intercept browser refreshes, tab closures, or external links
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const warningMessage = "You have unsaved notification edits. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = warningMessage;
        return warningMessage;
      }
    };

    // Scenario B: Intercept Next.js client-side router transitions
    const handleBrowseAway = (url: string) => {
      if (isDirty) {
        const confirmLeave = window.confirm(
          "You have unsaved notification edits. Leaving this page will discard your changes. Proceed?"
        );
        if (!confirmLeave) {
          router.events.emit('routeChangeError');
          throw `Route change to ${url} aborted to protect unsaved form state.`;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [isDirty, router]);
}
