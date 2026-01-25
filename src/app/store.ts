import ApiRace from '../core/services/api.services';
import { getRandomCars } from '../core/services/randomCar';
import {
  ErrorTypes,
  type Car,
  type carPower,
  type CarSet,
  type ControlDriveBtns,
  type WinnerCar,
  type WinnerCarTableFormat,
} from '../types';

type Listener = () => void;

class Store {
  CARS_PER_PAGE: number = 7;
  WINNERS_PER_PAGE: number = 10;
  COUNT_GENERATED_CARS: number = 100;
  DEFAULT_CAR_VALUES: CarSet = { name: '', color: '#000000' };

  private listenersGarage = new Set<Listener>();
  private listenersWinners = new Set<Listener>();

  cars: Car[] = [];
  winnersList: WinnerCar[] = [];
  selectedCar: null | Car = null;
  carFormDraft: CarSet = this.DEFAULT_CAR_VALUES;
  currentPage: number = 1;
  currentWinnersPage: number = 1;
  totalWinners: number = 0;

  sortField: 'wins' | 'time' | null = null;
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    this.fetchCars();
    this.fetchWinners();
  }

  async fetchCars() {
    this.isLoading = true;
    this.notify('garage');

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
      this.notify('garage');
      this.notify('winners');
    }
  }

  async fetchWinners() {
    try {
      const { winners, total } = await ApiRace.getWinners(
        this.currentWinnersPage,
        this.WINNERS_PER_PAGE,
        this.sortField,
        this.sortOrder,
      );
      this.totalWinners = total;
      this.winnersList = winners || [];
      this.error = null;
    } catch (error) {
      this.error = '⚠️ Failed to fetch winners!';
      console.error(error);
    } finally {
      this.notify('winners');
    }
  }

  async addCar(dataUpload: CarSet) {
    try {
      await ApiRace.createCar(dataUpload);
      await this.fetchCars();
    } catch (error) {
      this.error = '⚠️ Failed to add car!';
      console.error(error);
      this.notify('garage');
    }
  }

  async generateRandomCars() {
    try {
      this.isLoading = true;
      this.notify('garage');

      const newCars = getRandomCars(this.COUNT_GENERATED_CARS);
      const uploadingNewCars = newCars.map((car) => ApiRace.createCar(car));

      await Promise.all(uploadingNewCars);
      await this.fetchCars();
    } catch (error) {
      this.error = `⚠️ Failed to generate ${this.COUNT_GENERATED_CARS} cars!`;
      this.notify('garage');
      console.error(error);
    } finally {
      this.isLoading = false;
      this.notify('garage');
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
      this.notify('garage');
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
      this.notify('garage');
    } catch (error) {
      this.error = '⚠️ Failed to delete car!';
      console.error(error);
      this.notify('garage');
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

  getWinnersInfo(): WinnerCarTableFormat[] {
    if (!this.winnersList.length) return [];

    return this.winnersList.map((winner) => {
      const car = this.cars.find((car) => car.id === winner.id);
      return {
        name: car?.name || 'No name',
        color: car?.color || '#00000',
        bestTime: winner.time,
        wins: winner.wins,
        id: winner.id,
      };
    });
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

    this.notify('garage');
  }

  public changeWinnersCurPage(page: 'next' | 'prev') {
    const totalPages = this.getTotalWinnersPages();

    if (page === 'next' && this.currentWinnersPage < totalPages) {
      this.currentWinnersPage++;
    }

    if (page === 'prev' && this.currentWinnersPage > 1) {
      this.currentWinnersPage--;
    }

    this.fetchWinners();
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

  public getTotalWinnersCars() {
    return this.totalWinners;
  }

  getTotalPages() {
    return Math.ceil(this.cars.length / this.CARS_PER_PAGE);
  }

  getTotalWinnersPages() {
    return Math.ceil(this.totalWinners / this.WINNERS_PER_PAGE);
  }

  public getCurPage() {
    return this.currentPage;
  }

  public getCurWinnersPage() {
    return this.currentWinnersPage;
  }

  public subscribe(listener: Listener, page: 'garage' | 'winners') {
    const listeners = page === 'garage' ? this.listenersGarage : this.listenersWinners;
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  private notify(page: 'garage' | 'winners') {
    const listeners = page === 'garage' ? this.listenersGarage : this.listenersWinners;

    listeners.forEach((listener) => listener());
  }
}

const store = new Store();
export default store;
