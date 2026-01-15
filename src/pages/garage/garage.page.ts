import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import store from '../../app/store';

import './garage.scss';

export default class GaragePage extends Page {
  carsContainer: HTMLDivElement;
  static TextObject = {
    MAIN_TITLE: '⚙️ Garage',
  };

  constructor(id: string) {
    super(id);
    this.carsContainer = dom.create({ tag: 'div', classNames: ['cars'] });

    store.subscribe(() => this.renderCars());
  }

  renderCars() {
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
    const info = dom.create({ tag: 'div', classNames: ['garage__info'] });
    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(store.cars.length)}` });
    const currentPage = dom.create({ tag: 'p', text: `Page #1` });
    info.append(carsQuantity, currentPage);
    this.carsContainer.append(info);

    store.cars.forEach(({ name, color }) => {
      const carElement = this.createCar(name, color);
      this.carsContainer.append(carElement);
    });
  }

  public render() {
    const header = this.createHeaderTitle(GaragePage.TextObject.MAIN_TITLE);
    this.container.append(header, this.carsContainer);

    this.renderCars();
    return this.container;
  }

  private createCar(name: string, color: string) {
    const carElement = dom.create({ tag: 'div', classNames: ['car'] });
    const carFigure = dom.create({ tag: 'div', classNames: ['car__figure'] });
    carFigure.style.backgroundColor = color;
    const carName = dom.create({ tag: 'p', classNames: ['car__name'], text: name });
    carElement.append(carFigure, carName);
    return carElement;
  }
}
