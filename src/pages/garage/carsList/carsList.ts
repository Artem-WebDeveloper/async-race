import dom from '../../../core/templates/creator';
import type { Car, ControlDriveBtns } from '../../../types';

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

  public renderCarsInfo(currentPage: number, totalPages: number, carsAll: number) {
    this.carsInfo.replaceChildren();

    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(carsAll)}` });
    const currentPageElement = dom.create({ tag: 'p', text: `Page #${String(currentPage)}` });

    this.btnPrev.disabled = currentPage <= 1;
    this.btnNext.disabled = currentPage >= totalPages;

    const btnsContainer = dom.create({ tag: 'div', classNames: ['cars__pagination'] });
    btnsContainer.append(this.btnPrev, currentPageElement, this.btnNext);

    this.carsInfo.append(carsQuantity, btnsContainer);
    this.container.append(this.carsInfo);
  }

  private createCar(name: string, color: string, id: number, selectedCar: Car | null) {
    const carElement = dom.create({ tag: 'li', classNames: ['cars__item'] });
    const carTop = dom.create({ tag: 'div', classNames: ['cars__item--top'] });
    const carBottom = dom.create({ tag: 'div', classNames: ['cars__item--bottom'] });
    const carDriveControl = dom.create({ tag: 'div', classNames: ['cars__drive-contol'] });

    const carModel = this.createCarModel(color, id);
    const flagModel = this.createFlag();
    const carName = dom.create({ tag: 'p', classNames: ['cars__name'], text: name });

    const [btnDelete, btnUpdate, btnGo, btnStop] = ['delete', 'select', 'go', 'stop'].map(
      (buttonType) => {
        const btn = dom.create({
          tag: 'button',
          classNames: ['cars__btn', `cars__btn--${buttonType}`],
        });
        btn.textContent = buttonType;
        btn.dataset.carId = String(id);

        if (buttonType === 'select') {
          btn.disabled = selectedCar?.id === id;
        }
        return btn;
      },
    );

    btnGo.textContent = 'A';
    btnStop.textContent = 'B';
    btnStop.disabled = true;
    carDriveControl.append(btnGo, btnStop);
    carTop.append(btnUpdate, btnDelete, carName);
    carBottom.append(carDriveControl, carModel, flagModel);

    carElement.append(carTop, carBottom);
    return carElement;
  }

  private createCarModel(color: string, id: number) {
    const carModel = dom.create({ tag: 'div', classNames: ['cars__figure'] });
    carModel.dataset.carModelId = String(id);
    const svgCar = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgCar.style.color = color;
    svgCar.innerHTML = `<use href="#car"></use>`;
    carModel.append(svgCar);
    return carModel;
  }

  private createFlag() {
    const flagModel = dom.create({ tag: 'div', classNames: ['cars__flag'] });
    const svgFlag = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFlag.innerHTML = `<use href="#flag"></use>`;
    flagModel.append(svgFlag);
    return flagModel;
  }

  addHandlerRunCar(
    handler: (
      id: number,
      maxDistance: number,
      car: Element,
      controlDriveBtns: ControlDriveBtns,
    ) => void,
  ) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn--go')) return;

      const car = document.querySelector(`[data-car-model-id="${target.dataset.carId}"]`);
      if (!car) return;
      const maxTranslateX = this.getMaxTranslateX(Number(target.dataset.carId)) || 0;

      handler(Number(target.dataset.carId), maxTranslateX, car, this.setDisabledRunBtns);
    });
  }

  getMaxTranslateX(id: number) {
    const car = document.querySelector(`[data-car-model-id="${id}"]`);
    const track = car?.closest('.cars__item')?.querySelector('.cars__item--bottom');
    let maxTranslateX = 0;
    if (!car || !track) return maxTranslateX;

    if (car instanceof HTMLElement && track instanceof HTMLElement) {
      maxTranslateX = track.offsetWidth - car.offsetWidth;
    }
    return maxTranslateX;
  }

  addHandlerStopCar(handler: (id: number, controlDriveBtns: ControlDriveBtns) => void) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn--stop')) return;
      const car = document.querySelector(`[data-car-model-id="${target.dataset.carId}"]`);
      if (!(car instanceof HTMLElement)) return;

      car.style.transform = `translateX(0)`;
      car.style.transition = '';
      car.classList.remove('car--broken');

      handler(Number(target.dataset.carId), this.setDisabledRunBtns);
    });
  }

  resetTransformCars() {
    Array.from(document.querySelectorAll<HTMLElement>('.cars__figure')).forEach((carElement) => {
      carElement.classList.remove('car--broken');

      carElement.style.transform = `translateX(0)`;
      carElement.style.transition = '';
    });
  }

  setDisabledRunBtns = (carId: number, status: 'drive' | 'stop' | 'lag') => {
    const btnGo = this.carsList.querySelector<HTMLButtonElement>(
      `.cars__btn--go[data-car-id="${carId}"]`,
    );
    const btnStop = this.carsList.querySelector<HTMLButtonElement>(
      `.cars__btn--stop[data-car-id="${carId}"]`,
    );
    if (!btnGo || !btnStop) return;

    const isDrive = status === 'drive';
    const isLag = status === 'lag';
    btnGo.disabled = isLag ? true : isDrive;
    btnStop.disabled = isLag ? true : !isDrive;
  };

  collectCarsRace() {
    return Array.from(document.querySelectorAll<HTMLElement>('.cars__figure')).map((carElement) => {
      const id = Number(carElement.dataset.carModelId);
      return {
        id: id,
        maxTranslateX: this.getMaxTranslateX(id),
        carElement,
      };
    });
  }

  addHandlerDeleteCar(handler: (id: number) => void) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn--delete')) return;
      handler(Number(target.dataset.carId));
    });
  }

  addHandlerSelectCar(handler: (id: number) => void) {
    this.carsList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (!target.closest('.cars__btn--select')) return;
      const selectBtns = this.carsList.querySelectorAll('.cars__btn--select');
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
