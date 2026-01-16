import type { CarSet } from '../../types';

const BASE_URL = import.meta.env.VITE_API_URL;

export default class ApiRace {
  static async fetchRequest(request: string) {
    try {
      if (!BASE_URL) throw new Error('ENV: VITE_API_URL is not defined');

      const response = await fetch(`${BASE_URL}/${request}`);
      if (!response.ok) throw new Error(`Error Status: ${response.status.toString()}`);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async getGarage() {
    try {
      const response = await ApiRace.fetchRequest('garage');
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async createCar(uploadData: CarSet) {
    try {
      if (!BASE_URL) throw new Error('ENV: VITE_API_URL is not defined');

      const response = await fetch(`${BASE_URL}/garage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) throw new Error(`Error Status: ${response.status.toString()}`);
      return await response.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
