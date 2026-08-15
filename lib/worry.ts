/**
 * The worry dump is deliberately write-nowhere: what you type is released, not
 * filed. Nothing is stored, on device or off — the point of the exercise is
 * that the thought stops being yours to hold overnight.
 */
export async function releaseWorry(_body: string): Promise<void> {
  // Intentionally empty. Kept async so callers keep their await-shaped flow.
}
