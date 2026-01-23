import ApiRace from '../core/services/api.services';
import { getRandomCars } from '../core/services/randomCar';
import {
  ErrorTypes,
  type Car,
  type carPower,
  type CarSet,
  type ControlDriveBtns,
  type WinnerCar,
} from '../types';

type Listener = () => void;

class Store {
  CARS_PER_PAGE: number = 7;
  COUNT_GENERATED_CARS: number = 100;
  DEFAULT_CAR_VALUES: CarSet = { name: '', color: '#000000' };

  private listeners: Listener[] = [];
  cars: Car[] = [];
  winnersList: WinnerCar[] = [];
  selectedCar: null | Car = null;
  carFormDraft: CarSet = this.DEFAULT_CAR_VALUES;
  currentPage: number = 1;

  raceStatus: 'wait' | 'running' | 'finished' = 'wait';

  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    this.fetchCars();
    this.fetchWinners();
  }

  async fetchCars() {
    this.isLoading = true;
    this.notify();

    try {
      const cars = await ApiRace.getGarage();
      this.cars = cars || [];
      this.error = null;
    } catch (error) {
      this.error = '⚠️ Failed to load cars!';
      console.error(error);
      this.cars = [];
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  async fetchWinners() {
    try {
      const winners = await ApiRace.getWinners();
      this.winnersList = winners || [];
      this.error = null;
      console.log(this.winnersList);
    } catch (error) {
      this.error = '⚠️ Failed to fetch winners!';
      console.error(error);
    }
  }

  async addCar(dataUpload: CarSet) {
    try {
      await ApiRace.createCar(dataUpload);
      await this.fetchCars();
    } catch (error) {
      this.error = '⚠️ Failed to add car!';
      console.error(error);
      this.notify();
    }
  }

  async generateRandomCars() {
    try {
      this.isLoading = true;
      this.notify();

      const newCars = getRandomCars(this.COUNT_GENERATED_CARS);
      const uploadingNewCars = newCars.map((car) => ApiRace.createCar(car));

      await Promise.all(uploadingNewCars);
      await this.fetchCars();
    } catch (error) {
      this.error = `⚠️ Failed to generate ${this.COUNT_GENERATED_CARS} cars!`;
      this.notify();
      console.error(error);
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  async updateCar(dataUpload: CarSet) {
    try {
      if (!this.selectedCar) throw new Error('Car is not exist!');
      await ApiRace.updateCar(dataUpload, this.selectedCar.id);
      this.selectedCar = null;
      await this.fetchCars();
    } catch (error) {
      this.error = '⚠️ Failed to update car!';
      console.error(error);
      this.notify();
    }
  }

  async deleteCar(id: number) {
    try {
      await ApiRace.deleteCar(id);

      if (this.selectedCar?.id === id) {
        this.selectedCar = null;
      }

      await this.fetchCars();
      this.normalizeCurrentPage();
      this.notify();
    } catch (error) {
      this.error = '⚠️ Failed to delete car!';
      console.error(error);
      this.notify();
    }
  }

  async startRace(
    cars: {
      id: number;
      maxTranslateX: number;
      carElement: HTMLElement;
    }[],
    controlBtns: ControlDriveBtns,
  ) {
    const racePromise = cars.map(({ id, maxTranslateX, carElement }) => {
      return this.runCar(id, maxTranslateX, carElement, controlBtns);
    });

    try {
      const winnerData = await Promise.any(racePromise);
      this.addCarToWinnersList(winnerData);
      return winnerData;
    } catch (error) {
      console.error(error);
    }
  }

  async resetRace(
    cars: {
      id: number;
    }[],
    controlBtns: ControlDriveBtns,
  ) {
    const raceResetPromise = cars.map(({ id }) => {
      return this.stopCar(id, controlBtns);
    });

    try {
      await Promise.all(raceResetPromise);
      return 'Race is reset';
    } catch (error) {
      console.error(error);
    }
  }

  async runCar(
    id: number,
    maxTranslateX: number,
    carElement: Element,
    controlDriveBtns: ControlDriveBtns,
  ) {
    const CAR_START_POS = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--start-car-position-px').trim(),
    );

    try {
      controlDriveBtns(id, 'lag');
      const data: carPower = await ApiRace.engineControl(id, 'started');
      controlDriveBtns(id, 'drive');
      const { velocity, distance } = data;
      const timeSec = distance / velocity / 1000;

      if (!(carElement instanceof HTMLElement)) throw new Error('Car Element is not Found!');

      carElement.style.transition = `transform ${timeSec}s linear`;
      carElement.style.transform = `translateX(${maxTranslateX - CAR_START_POS}px)`;

      try {
        await ApiRace.switchDrive(id);
        return { id, time: timeSec };
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        if (error.message === ErrorTypes.ERROR_500) {
          const fixTransform = getComputedStyle(carElement).transform;
          carElement.style.transition = '';
          carElement.style.transform = fixTransform;
        }
        throw error;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addCarToWinnersList(winner: { id: number; time: number }) {
    const { id, time } = winner;
    const existingWinner = this.winnersList.find((winner) => winner.id === id);

    if (existingWinner) {
      await ApiRace.updateWinner(id, {
        wins: existingWinner.wins + 1,
        time: Math.min(existingWinner.time, time),
      });
    } else {
      await ApiRace.createWinner({ id, wins: 1, time });
    }

    await this.fetchWinners();
  }

  async stopCar(
    id: number,
    controlDriveBtns: (id: number, status: 'drive' | 'stop' | 'lag') => void,
  ) {
    controlDriveBtns(id, 'lag');
    await ApiRace.engineControl(id, 'stopped');
    controlDriveBtns(id, 'stop');
  }

  public updateSelectedCar(id: number) {
    const car = this.cars.find((car) => car.id === id);
    if (!car) return this.selectedCar;

    this.selectedCar = car;
    return car;
  }

  public getVisibleCars() {
    const start = (this.currentPage - 1) * this.CARS_PER_PAGE;
    const end = this.currentPage * this.CARS_PER_PAGE;
    return this.cars.slice(start, end);
  }

  public changeCurPage(page: 'next' | 'prev') {
    const totalPages = this.getTotalPages();

    if (page === 'next' && this.currentPage < totalPages) {
      this.currentPage++;
    }

    if (page === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    }

    this.notify();
  }

  private normalizeCurrentPage() {
    const maxPage = Math.max(1, Math.ceil(this.cars.length / this.CARS_PER_PAGE));
    if (this.currentPage > maxPage) this.currentPage = maxPage;
  }

  public getSelectedCar() {
    return this.selectedCar;
  }

  public getTotalCars() {
    return this.cars.length;
  }

  getTotalPages() {
    return Math.ceil(this.cars.length / this.CARS_PER_PAGE);
  }

  public getCurPage() {
    return this.currentPage;
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((observer) => observer !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

const store = new Store();
export default store;
