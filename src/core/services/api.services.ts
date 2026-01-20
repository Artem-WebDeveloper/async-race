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

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static createCar(uploadData: CarSet) {
    return ApiRace.request('/garage', 'POST', uploadData);
  }

  static updateCar(uploadData: CarSet, id: number) {
    return ApiRace.request(`/garage/${id}`, 'PUT', uploadData);
  }

  static async request(url: string, method: 'POST' | 'PUT', body: unknown) {
    try {
      if (!BASE_URL) throw new Error('ENV: VITE_API_URL is not defined');

      const response = await fetch(`${BASE_URL}${url}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error Status: ${response.status.toString()}`);
      return await response.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async deleteCar(id: number) {
    try {
      if (!BASE_URL) throw new Error('ENV: VITE_API_URL is not defined');

      const response = await fetch(`${BASE_URL}/garage/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Error Status: ${response.status.toString()}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  static async engineControl(id: number, status: 'started' | 'stopped') {
    try {
      if (!BASE_URL) throw new Error('ENV: VITE_API_URL is not defined');

      const response = await fetch(`${BASE_URL}/engine?id=${id}&status=${status}`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error(`Error Status: ${response.status.toString()}`);

      return await response.json();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
