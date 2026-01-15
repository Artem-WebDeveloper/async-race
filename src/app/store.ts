import ApiRace from '../core/services/api.services';
import type { Car } from '../types';

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

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

const store = new Store();
export default store;
