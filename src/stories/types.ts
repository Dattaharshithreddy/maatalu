export type Who = 'kid' | 'ammamma' | 'tatayya' | 'amma' | 'nanna';
export type Gesture = 'wave' | 'cheer' | 'point' | 'namaste' | 'clap' | 'nod' | 'talk';

/** One spoken line. `{dear}` becomes నాన్నా (boy) or తల్లీ (girl), the way grandparents call a child. */
export type Line = { who: Who; te: string; tl: string; en: string; g?: Gesture };

/** Where a character stands. x/y are in the 1200 x 900 scene, y is the feet. `screen` puts them inside the video call. */
export type Place = { who: Who; x: number; y: number; s: number; screen?: boolean };

/** [prop id, x, y, scale, in front of the characters?] */
export type PropPlace = [string, number, number, number?, boolean?];

export type Scene = {
  id: string;
  title: string;
  te: string;
  bg: string;
  cast: Place[];
  props: PropPlace[];
  lines: Line[];
};

export type Chapter = {
  id: string;
  title: string;
  te: string;
  icon: string;
  free: boolean;
  scenes: Scene[];
};
