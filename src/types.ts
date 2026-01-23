export const PageIDs = {
  GARAGE_PAGE: 'garage-page',
  WINNERS_PAGE: 'winners-page',
} as const;

export const ErrorTypes = {
  ERROR_404: '404',
  ERROR_500: '500',
} as const;

// API

export type Car = {
  name: string;
  color: string;
  id: number;
};

export type WinnerCar = {
  id: number;
  wins: number;
  time: number;
};

// export type WinnerCarTableFormat = Car & {
//   wins: number;
//   bestTime: number;
// };

export type CarSet = {
  name: string;
  color: string;
};

export type carPower = { velocity: number; distance: number };
export type RaceResult = { id: number; time: number };
export type ControlDriveBtns = (id: number, status: 'drive' | 'stop' | 'lag') => void;
