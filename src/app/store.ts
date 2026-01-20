import ApiRace from '../core/services/api.services';
import { getRandomCars } from '../core/services/randomCar';
import type { Car, CarSet } from '../types';

type Listener = () => void;

class Store {
  CARS_PER_PAGE: number = 7;
  COUNT_GENERATED_CARS: number = 100;
  DEFAULT_CAR_VALUES: CarSet = { name: '', color: '#000000' };

  private listeners: Listener[] = [];
  cars: Car[] = [];
  selectedCar: null | Car = null;
  carFormDraft: CarSet = this.DEFAULT_CAR_VALUES;
  currentPage: number = 1;

  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    this.fetchCars();
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

  async startEngine(id: number) {
    try {
      const data = await ApiRace.engineControl(id, 'started');
      console.log(data);
    } catch (error) {
      this.error = '⚠️ Failed to start engine of car!';
      console.error(error);
    }
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
