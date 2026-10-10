import { useEffect } from 'react';
import { recordToolUse } from '@/lib/nightTracking';
import { useAds } from '@/contexts/AdsContext';

/**
 * Records one use of a tool for tonight's record when its screen opens.
 * Closing the screen ends that session — the only "natural break" the ads
 * layer recognises for (optional, off-by-default) interstitials.
 */
export function useRecordTool(toolId: string): void {
  const { noteSessionEnded } = useAds();
  useEffect(() => {
    void recordToolUse(toolId);
    return () => noteSessionEnded();
  }, [toolId, noteSessionEnded]);
}
