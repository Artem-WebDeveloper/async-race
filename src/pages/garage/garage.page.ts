import Page from '../../core/templates/page';
import store from '../../app/store';

import './garage.scss';
import CarsList from './carsList';

export default class GaragePage extends Page {
  static TextObject = {
    MAIN_TITLE: '⚙️ Garage',
  };

  carsList: CarsList = new CarsList();
  carsContainer: HTMLDivElement;
  unsubscribe: () => void;

  constructor(id: string) {
    super(id);
    this.carsContainer = this.carsList.render();

    this.unsubscribe = store.subscribe(this.renderCars);
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
    this.container.append(header, this.carsContainer);

    this.renderCars();
    return this.container;
  }

  destroy() {
    this.unsubscribe();
  }
}
