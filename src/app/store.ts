import ApiRace from '../core/services/api.services';
import type { Car, CarSet } from '../types';

type Listener = () => void;

class Store {
  private listeners: Listener[] = [];
  cars: Car[] = [];
  selectedCar: null | Car = null;

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
      await this.fetchCars();
    } catch (error) {
      this.error = '⚠️ Failed to delete car!';
      console.error(error);
      this.notify();
    }
  }

  public updateSelectedCar(id: number) {
    const car = this.cars.find((car) => car.id === id);
    if (!car) return this.selectedCar;

    this.selectedCar = car;
    return car;
  }

  public getSelectedCar() {
    return this.selectedCar;
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
