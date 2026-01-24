import Page from '../../core/templates/page';
import store from '../../app/store';

import './garage.scss';
import CarsList from './carsList/carsList';
import CarsControl from './carsControl/carsControl';
import type { CarSet, ControlDriveBtns } from '../../types';
import dom from '../../core/templates/creator';

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

    this.unsubscribe = store.subscribe(this.renderCars, 'garage');

    this.initHandlers();
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

    this.carsList.renderCarsInfo(store.getCurPage(), store.getTotalPages(), store.getTotalCars());
    this.carsList.renderCarsList(store.getVisibleCars(), store.getSelectedCar());
  };

  showWinner(nameWinner?: string, timeWinner?: string) {
    const modal = dom.create({ tag: 'div', classNames: ['modal-winner'] });
    const name = dom.create({ tag: 'p', classNames: ['modal-winner__name'] });
    const time = dom.create({ tag: 'p', classNames: ['modal-winner__time'] });

    if (nameWinner && timeWinner) {
      name.innerHTML = `🏆 <span class="modal-winner__name--accent">${nameWinner}</span> won the race!`;
      time.textContent = `⏱️ ${timeWinner} sec`;
    } else {
      name.textContent = `No winners!`;
      time.textContent = `All cars have broken`;
    }

    const closeModal = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('.modal-winner')) return;
      modal.remove();
      document.removeEventListener('click', closeModal);
    };

    document.addEventListener('click', closeModal);

    modal.append(name, time);
    this.container.append(modal);
  }

  public render() {
    const header = this.createHeaderTitle(GaragePage.TextObject.MAIN_TITLE);
    this.container.append(header, this.controlContainer, this.carsContainer);

    this.renderCars();

    const selectedCar = store.getSelectedCar();
    if (selectedCar) this.carsControl.activateUpdateForm(selectedCar);

    this.carsControl.setActualCreateFormValues(store.carFormDraft);

    return this.container;
  }

  initHandlers() {
    this.carsControl.addHandlerCreateInput((draft: CarSet) => {
      store.carFormDraft = draft;
    });

    this.carsControl.addHandlerCreate((newCar: CarSet) => {
      store.addCar(newCar);
      store.carFormDraft = store.DEFAULT_CAR_VALUES;
    });

    this.carsControl.addHandlerUpdate((newCar: CarSet) => {
      store.updateCar(newCar);
    });

    this.carsControl.addHandlerGenerateCars(() => {
      store.generateRandomCars();
    });

    this.carsList.addHandlerDeleteCar((id: number) => {
      store.deleteCar(id);
      if (id === store.selectedCar?.id) {
        this.carsControl.deactivateUpdateForm();
      }
    });

    this.carsList.addHandlerSelectCar((id: number) => {
      const car = store.updateSelectedCar(id);
      if (!car) return;

      this.carsControl.activateUpdateForm(car);
    });

    this.carsList.addHandlerBtnNext(() => {
      store.changeCurPage('next');
      this.carsControl.enableRaceBtns();
    });

    this.carsList.addHandlerBtnPrev(() => {
      store.changeCurPage('prev');
      this.carsControl.enableRaceBtns();
    });

    this.carsList.addHandlerRunCar(
      (
        id: number,
        maxDistance: number,
        carElement: Element,
        controlDriveBtns: ControlDriveBtns,
      ) => {
        store.runCar(id, maxDistance, carElement, controlDriveBtns);
      },
    );

    this.carsList.addHandlerStopCar((id: number, controlDriveBtns: ControlDriveBtns) => {
      store.stopCar(id, controlDriveBtns);
    });

    this.carsControl.addHandlerStartRace(async () => {
      console.log('start race');
      const cars = this.carsList.collectCarsRace();

      try {
        this.carsControl.disableRaceBtns();
        const result = await store.startRace(cars, this.carsList.setDisabledRunBtns);
        if (!result) {
          this.showWinner();
          return;
        }
        const winner = store.getVisibleCars().find((car) => car.id === result.id);

        const winnerName = winner?.name || 'No name';
        const winnerTime = result.time.toFixed(2);

        this.showWinner(winnerName, winnerTime);
      } finally {
        this.carsControl.enableResetBtn();
      }
    });

    this.carsControl.addHandlerResetRace(async () => {
      console.log('stop race');
      this.carsControl.displayLoading(true);
      const cars = this.carsList.collectCarsRace();

      try {
        this.carsControl.disableRaceBtns();
        this.carsList.resetTransformCars();
        await store.resetRace(cars, this.carsList.setDisabledRunBtns);
      } finally {
        this.carsControl.enableRaceBtns();
        this.carsControl.displayLoading(false);
      }
    });
  }

  destroy() {
    this.unsubscribe();
  }
}
