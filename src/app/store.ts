import ApiRace from '../core/services/api.services';
import type { Car, CarSet } from '../types';

type Listener = () => void;

class Store {
  private listeners: Listener[] = [];
  cars: Car[] = [];

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

    console.log(this.cars);
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
