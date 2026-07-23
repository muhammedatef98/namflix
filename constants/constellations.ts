/**
 * Constellation geometry for the breathing exercise, in a 300x420 viewBox.
 * `path` is one SVG `d` string so a single strokeDashoffset can "draw" the
 * whole figure. `stars` are the unique vertices (drawn as glowing points).
 * Add more constellations here; the breathe screen is data-driven off this.
 */
export type Constellation = {
  name: string;
  path: string;
  stars: ReadonlyArray<readonly [number, number]>;
  /** Approx total path length; strokeDasharray uses this. Overshoot is fine. */
  length: number;
};

export const ORION: Constellation = {
  name: 'Orion',
  path: 'M95,120 L205,110 L180,240 L150,235 L120,230 L95,120 M120,230 L110,340 M180,240 L200,350',
  stars: [
    [95, 120], // Betelgeuse
    [205, 110], // Bellatrix
    [180, 240], // belt
    [150, 235], // belt
    [120, 230], // belt
    [110, 340], // Saiph
    [200, 350], // Rigel
  ],
  length: 700,
};
