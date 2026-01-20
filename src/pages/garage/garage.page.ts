import Page from '../../core/templates/page';
import store from '../../app/store';

import './garage.scss';
import CarsList from './carsList/carsList';
import CarsControl from './carsControl/carsControl';
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
    });

    this.carsList.addHandlerBtnPrev(() => {
      store.changeCurPage('prev');
    });

    this.carsList.addHandlerRunCar((id: number) => {
      store.startEngine(id);
    });
  }

  destroy() {
    this.unsubscribe();
  }
}
