import dom from '../../../core/templates/creator';
import type { Car } from '../../../types';

import './carsList.scss';

export default class CarsList {
  container: HTMLDivElement;
  carsList: HTMLUListElement;
  carsInfo: HTMLDivElement;

  constructor() {
    this.container = dom.create({ tag: 'div', classNames: ['cars'] });
    this.carsList = dom.create({ tag: 'ul', classNames: ['cars__list'] });
    this.carsInfo = dom.create({ tag: 'div', classNames: ['cars__info'] });
  }

  render() {
    return this.container;
  }

  renderCarsList(cars: Car[], selectedCar: Car | null) {
    this.clear();

    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(cars.length)}` });
    const currentPage = dom.create({ tag: 'p', text: `Page #1` });
    this.carsInfo.append(carsQuantity, currentPage);

    cars.forEach(({ name, color, id }) => {
      const carElement = this.createCar(name, color, id, selectedCar);
      this.carsList.append(carElement);
    });
    this.container.append(this.carsInfo, this.carsList);
  }

  private createCar(name: string, color: string, id: number, selectedCar: Car | null) {
    const carElement = dom.create({ tag: 'li', classNames: ['cars__item'] });
    const carFigure = dom.create({ tag: 'div', classNames: ['cars__figure'] });
    carFigure.style.backgroundColor = color;
    const carName = dom.create({ tag: 'p', classNames: ['cars__name'], text: name });
    const [btnDelete, btnUpdate] = ['delete', 'select'].map((buttonType) => {
      const btn = dom.create({ tag: 'button', classNames: [`cars__btn-${buttonType}`] });
      btn.textContent = buttonType;
      btn.dataset.carId = String(id);

      if (buttonType === 'select') {
        btn.disabled = selectedCar?.id === id;
      }
      return btn;
    });

    carElement.append(carFigure, carName, btnDelete, btnUpdate);
    return carElement;
  }

  addHandlerDeleteCar(handler: (id: number) => void) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn-delete')) return;
      handler(Number(target.dataset.carId));
    });
  }

  addHandlerSelectCar(handler: (id: number) => void) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn-select')) return;
      const selectBtns = this.carsList.querySelectorAll('.cars__btn-select');
      Array.from(selectBtns).forEach((button) => {
        if (button instanceof HTMLButtonElement) button.disabled = false;
      });

      target.disabled = true;
      handler(Number(target.dataset.carId));
    });
  }

  private clear() {
    this.container.replaceChildren();
    this.carsList.replaceChildren();
    this.carsInfo.replaceChildren();
  }
}
