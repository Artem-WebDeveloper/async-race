import Page from '../../core/templates/page';
import store from '../../app/store';

import './garage.scss';
import CarsList from './carsList';
import CarsControl from './carsControl';
import type { CarSet } from '../../types';

export default class GaragePage extends Page {
  static TextObject = {
    MAIN_TITLE: '⚙️ Garage',
  };

  carsControl: CarsControl = new CarsControl();
  carsList: CarsList = new CarsList();
  carsContainer: HTMLDivElement;
  controlContainer: HTMLDivElement;
  unsubscribe: () => void;

  constructor(id: string) {
    super(id);
    this.carsContainer = this.carsList.render();
    this.controlContainer = this.carsControl.render();

    this.unsubscribe = store.subscribe(this.renderCars);

    this.carsControl.addHandlerCreate((newCar: CarSet) => {
      store.addCar(newCar);
    });
  }

  renderCars = () => {
    this.carsContainer.replaceChildren();

    if (store.isLoading) {
      this.showLoader(this.carsContainer);
      return;
    }
    if (store.error) {
      this.showError(this.carsContainer, store.error);
      return;
    }
    if (store.cars.length === 0) {
      this.carsContainer.append('There are no Cars yet!');
      return;
    }

    this.carsList.renderCarsList(store.cars);
  };

  public render() {
    const header = this.createHeaderTitle(GaragePage.TextObject.MAIN_TITLE);
    this.container.append(header, this.controlContainer, this.carsContainer);

    this.renderCars();
    return this.container;
  }

  destroy() {
    this.unsubscribe();
  }
}
