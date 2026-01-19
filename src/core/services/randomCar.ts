import type { CarSet } from '../../types';

const CAR_BRANDS = [
  'Lamborghini',
  'Subaru',
  'VAZ',
  'LADA',
  'Subaru',
  'Nissan',
  'Porsche',
  'Mercedes',
  'Tesla',
  'BMW',
  'Toyota',
  'Honda',
  'Audi',
];

const CAR_MODELS = [
  'Camaro',
  'Altima',
  '911',
  'Evora',
  'Cooper S',
  'Impreza',
  'MX-5',
  'C4',
  '208',
  'Stinger',
  'Model S',
  'Model M',
  'Model X',
  'X5',
  'A6',
  'Corolla',
  'Civic',
];

export function getRandomCars(count: number = 100): CarSet[] {
  return Array.from({ length: count }, () => createRandomCar());
}

function getRandomItem(arrayItems: string[]) {
  return arrayItems[Math.floor(Math.random() * arrayItems.length)];
}

function getRandomColor() {
  const rgb = Array.from({ length: 3 }, () => Math.floor(Math.random() * 256));
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${rgb.map((value) => toHex(value)).join('')}`;
}

function getRandomCarName() {
  return `${getRandomItem(CAR_BRANDS)} ${getRandomItem(CAR_MODELS)}`;
}

function createRandomCar(): CarSet {
  return {
    name: getRandomCarName(),
    color: getRandomColor(),
  };
}
