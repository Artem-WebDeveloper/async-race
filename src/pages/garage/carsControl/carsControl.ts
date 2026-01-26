import dom from '../../../core/templates/creator';
import type { Car, CarSet } from '../../../types';

import './carsControl.scss';

export default class CarsControl {
  container: HTMLDivElement;
  createCarForm: HTMLFormElement;
  updateCarForm: HTMLFormElement;
  btnGenerateCars: HTMLButtonElement;
  btnStartRace: HTMLButtonElement;
  btnResetRace: HTMLButtonElement;

  constructor() {
    this.container = dom.create({ tag: 'div', classNames: ['controls'] });
    this.createCarForm = this.createForm('create');
    this.updateCarForm = this.createForm('update');
    this.btnGenerateCars = dom.create({
      tag: 'button',
      classNames: ['controls__btn', 'controls__btn--generate'],
      text: 'Generate 100 Cars',
    });

    this.btnStartRace = dom.create({
      tag: 'button',
      classNames: ['controls__btn', 'controls__btn--start-race'],
      text: 'Race🏁',
    });

    this.btnResetRace = dom.create({
      tag: 'button',
      classNames: ['controls__btn', 'controls__btn--reset-race'],
      text: 'Reset🔁',
    });
  }

  createForm(type: 'create' | 'update') {
    const form = dom.create({ tag: 'form', classNames: ['form'] });
    const nameInput = dom.create({ tag: 'input', classNames: ['form__name'] });
    const colorInput = dom.create({ tag: 'input', classNames: ['form__color'] });
    const button = dom.create({ tag: 'button', classNames: ['form__btn'], text: type });
    nameInput.type = 'text';
    nameInput.name = 'nameField';
    nameInput.placeholder = 'Name Car';
    colorInput.type = 'color';
    colorInput.name = 'color';
    button.name = 'submitBtn';

    if (type === 'update') {
      nameInput.disabled = true;
      colorInput.disabled = true;
      button.disabled = true;
    }

    form.append(nameInput, colorInput, button);
    return form;
  }

  addHandlerCreate(handler: (newCar: CarSet) => void) {
    this.createCarForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      if (!(event.target instanceof HTMLFormElement)) return;

      const formData = new FormData(event.target);
      const name = String(formData.get('nameField'));
      const color = String(formData.get('color'));

      const newCar = { name, color };
      handler(newCar);
      this.createCarForm.nameField.value = '';
      this.createCarForm.color.value = '#ffffff';
    });
  }

  addHandlerCreateInput(handler: (data: CarSet) => void) {
    this.createCarForm.addEventListener('input', () => {
      handler({
        name: this.createCarForm.nameField.value,
        color: this.createCarForm.color.value,
      });
    });
  }

  addHandlerUpdate(handler: (newCar: CarSet) => void) {
    this.updateCarForm.addEventListener('submit', (event: SubmitEvent) => {
      event.preventDefault();

      if (!(event.target instanceof HTMLFormElement)) return;

      const formData = new FormData(event.target);
      const name = String(formData.get('nameField'));
      const color = String(formData.get('color'));

      const newCar = { name, color };
      handler(newCar);

      this.deactivateUpdateForm();
    });
  }

  addHandlerGenerateCars(handler: () => void) {
    this.btnGenerateCars.addEventListener('click', handler);
  }

  addHandlerStartRace(handler: () => void) {
    this.btnStartRace.addEventListener('click', handler);
  }

  addHandlerResetRace(handler: () => void) {
    this.btnResetRace.addEventListener('click', handler);
  }

  setActualCreateFormValues(car: CarSet) {
    const color = this.createCarForm.color;
    const name = this.createCarForm.nameField;

    name.value = car.name;
    color.value = car.color;
  }

  activateUpdateForm(car: Car) {
    const color = this.updateCarForm.color;
    const name = this.updateCarForm.nameField;
    const btn = this.updateCarForm.submitBtn;

    name.value = car.name;
    color.value = car.color;

    name.focus();
    [color, btn, name].forEach((elem) => (elem.disabled = false));
  }

  deactivateUpdateForm() {
    this.updateCarForm.nameField.value = '';
    const color = this.updateCarForm.color;
    const name = this.updateCarForm.nameField;
    const btn = this.updateCarForm.submitBtn;

    [color, btn, name].forEach((elem) => (elem.disabled = true));
  }

  disableRaceBtns() {
    this.btnResetRace.disabled = this.btnStartRace.disabled = true;
  }

  enableRaceBtns() {
    this.btnResetRace.disabled = this.btnStartRace.disabled = false;
  }

  enableResetBtn() {
    this.btnResetRace.disabled = false;
  }

  displayLoading(isLoading: boolean) {
    this.btnResetRace.classList.toggle('is-loading', isLoading);
  }

  displayLoadingRace(isLoading: boolean) {
    this.btnStartRace.classList.toggle('is-loading', isLoading);
  }

  render() {
    const btnsBottom = dom.create({ tag: 'div', classNames: ['controls__btns'] });
    btnsBottom.append(this.btnGenerateCars, this.btnStartRace, this.btnResetRace);

    this.container.append(this.createCarForm, this.updateCarForm, btnsBottom);
    return this.container;
  }
}
