import dom from '../../core/templates/creator';
import type { Car } from '../../types';

export default class CarsList {
  container: HTMLDivElement;
  carsList: HTMLUListElement;
  carsInfo: HTMLDivElement;

  constructor() {
    this.container = dom.create({ tag: 'div', classNames: ['cars'] });
    this.carsList = dom.create({ tag: 'ul', classNames: ['cars__list'] });
    this.carsInfo = dom.create({ tag: 'div', classNames: ['garage__info'] });
  }

  render() {
    return this.container;
  }

  renderCarsList(cars: Car[]) {
    this.clear();

    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(cars.length)}` });
    const currentPage = dom.create({ tag: 'p', text: `Page #1` });
    this.carsInfo.append(carsQuantity, currentPage);

    cars.forEach(({ name, color }) => {
      const carElement = this.createCar(name, color);
      this.carsList.append(carElement);
    });
    this.container.append(this.carsInfo, this.carsList);
  }

  private createCar(name: string, color: string) {
    const carElement = dom.create({ tag: 'div', classNames: ['car'] });
    const carFigure = dom.create({ tag: 'div', classNames: ['car__figure'] });
    carFigure.style.backgroundColor = color;
    const carName = dom.create({ tag: 'p', classNames: ['car__name'], text: name });
    carElement.append(carFigure, carName);
    return carElement;
  }

  private clear() {
    this.container.replaceChildren();
    this.carsList.replaceChildren();
    this.carsInfo.replaceChildren();
  }
}
