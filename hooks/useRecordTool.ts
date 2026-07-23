import { useEffect } from 'react';
import { recordToolUse } from '@/lib/nightTracking';

/** Records one use of a tool for tonight's record when its screen opens. */
export function useRecordTool(toolId: string): void {
  useEffect(() => {
    void recordToolUse(toolId);
  }, [toolId]);
}
