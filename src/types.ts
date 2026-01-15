export const PageIDs = {
  GARAGE_PAGE: 'garage-page',
  WINNERS_PAGE: 'winners-page',
} as const;

export const ErrorTypes = {
  ERROR_404: '404',
} as const;

// API

export type Car = {
  name: string;
  color: string;
  id: number;
};
