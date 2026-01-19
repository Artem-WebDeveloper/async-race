import dom from '../../../core/templates/creator';
import type { Car } from '../../../types';

import './carsList.scss';

export default class CarsList {
  container: HTMLDivElement;
  carsList: HTMLUListElement;
  carsInfo: HTMLDivElement;
  btnPrev: HTMLButtonElement;
  btnNext: HTMLButtonElement;

  constructor() {
    this.container = dom.create({ tag: 'div', classNames: ['cars'] });
    this.carsList = dom.create({ tag: 'ul', classNames: ['cars__list'] });
    this.carsInfo = dom.create({ tag: 'div', classNames: ['cars__info'] });

    this.btnPrev = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: '← Prev' });
    this.btnNext = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: 'Next →' });
  }

  render() {
    return this.container;
  }

  public renderCarsList(cars: Car[], selectedCar: Car | null) {
    this.carsList.replaceChildren();

    cars.forEach(({ name, color, id }) => {
      const carElement = this.createCar(name, color, id, selectedCar);
      this.carsList.append(carElement);
    });

    this.container.append(this.carsList);
  }

  public renderCarsInfo(currentPage: number, carsAll: number) {
    this.carsInfo.replaceChildren();

    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(carsAll)}` });
    const currentPageElement = dom.create({ tag: 'p', text: `Page #${String(currentPage)}` });
    this.carsInfo.append(carsQuantity, currentPageElement);
    this.container.append(this.carsInfo);
  }

  public renderBtnsPagination(totalPages: number, currentPage: number) {
    const btnsContainer = dom.create({ tag: 'div', classNames: ['cars__pagination'] });

    if (currentPage === 1 && totalPages > 1) {
      btnsContainer.append(this.btnNext);
      this.container.append(btnsContainer);
      return;
    }

    if (currentPage === totalPages && totalPages > 1) {
      btnsContainer.append(this.btnPrev);
      this.container.append(btnsContainer);
      return;
    }

    if (currentPage < totalPages) {
      btnsContainer.append(this.btnPrev, this.btnNext);
      this.container.append(btnsContainer);
      return;
    }
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

  addHandlerBtnNext(hander: () => void) {
    this.btnNext.addEventListener('click', hander);
  }
  addHandlerBtnPrev(hander: () => void) {
    this.btnPrev.addEventListener('click', hander);
  }
}
