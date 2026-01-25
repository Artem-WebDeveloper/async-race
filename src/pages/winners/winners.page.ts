import store from '../../app/store';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import type { WinnerCarTableFormat } from '../../types';

import './winners.scss';

export default class WinnersPage extends Page {
  static TextObject = {
    MAIN_TITLE: '🏁 Winners',
  };

  HEADER_COLS = [
    { key: 'id', label: '№ ID' },
    { key: 'car', label: 'Car' },
    { key: 'name', label: 'Name' },
    { key: 'wins', label: '🏆 Wins' },
    { key: 'time', label: 'Best ⏱️' },
  ];

  tableContainer: HTMLDivElement;
  winnersInfo: HTMLDivElement;
  btnPrev: HTMLButtonElement;
  btnNext: HTMLButtonElement;

  unsubscribe: () => void;

  constructor(id: string) {
    super(id);

    this.tableContainer = dom.create({ tag: 'div', classNames: ['winners-table'] });

    this.winnersInfo = dom.create({ tag: 'div', classNames: ['winners-table__info'] });
    this.btnPrev = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: '← Prev' });
    this.btnNext = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: 'Next →' });

    this.unsubscribe = store.subscribe(this.renderWinnerTable, 'winners');

    this.btnPrev.addEventListener('click', () => store.changeWinnersCurPage('prev'));
    this.btnNext.addEventListener('click', () => store.changeWinnersCurPage('next'));
    this.addHandlerSort();
  }

  renderWinnerTable = () => {
    this.tableContainer.replaceChildren();
    const winners = store.getWinnersInfo();

    const table = dom.create({ tag: 'div', classNames: ['winners-table__table'] });

    if (winners.length === 0) {
      table.textContent = 'No winners yet!';
      this.tableContainer.append(table);
      return;
    }

    const tableHeader = this.createHeaderTable();
    table.append(tableHeader);

    winners.forEach((winner) => {
      const row = this.createRowTable(winner);
      table.append(row);
    });

    this.tableContainer.append(table);

    this.renderCarsInfo(
      store.getCurWinnersPage(),
      store.getTotalWinnersPages(),
      store.getTotalWinnersCars(),
    );
  };

  createHeaderTable() {
    const headTableElement = dom.create({ tag: 'div', classNames: ['winners-table__head'] });
    this.HEADER_COLS.forEach((col) => {
      const header = dom.create({ tag: 'span', text: col.label });
      header.dataset.colName = col.key;

      if (col.key === 'wins' || col.key === 'time') {
        header.classList.add('sortable');
        header.textContent += ' ↓↑';
      }

      if (store.sortField === col.key) {
        header.classList.add('active');
        header.textContent = header.textContent.replace('↓↑', '');
        header.textContent += store.sortOrder === 'ASC' ? ' ↑' : ' ↓';
      }

      headTableElement.append(header);
    });

    return headTableElement;
  }

  createRowTable(winner: WinnerCarTableFormat) {
    const { id, color, bestTime, name, wins } = winner;
    const rowElement = dom.create({ tag: 'div', classNames: ['winners-table__row'] });

    const carCell = this.createCarCell(color);

    [id, carCell, name, wins, bestTime.toFixed(2)].forEach((col) => {
      const colElement = dom.create({ tag: 'span' });

      if (col instanceof HTMLElement) {
        colElement.append(col);
      } else {
        colElement.textContent = String(col);
      }

      rowElement.append(colElement);
    });
    return rowElement;
  }

  addHandlerSort() {
    this.tableContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.dataset.colName === 'wins') {
        this.toggleSort('wins');
      } else if (target.dataset.colName === 'time') {
        this.toggleSort('time');
      }
    });
  }

  toggleSort(field: 'time' | 'wins') {
    if (store.sortField !== field) {
      store.sortField = field;
      store.sortOrder = 'ASC';
    } else {
      store.sortOrder = store.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    }

    store.currentWinnersPage = 1;
    store.fetchWinners();
  }

  createCarCell(color: string) {
    const carModel = dom.create({ tag: 'div', classNames: ['winners-table__car-model'] });
    const svgCar = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgCar.style.color = color;
    svgCar.innerHTML = `<use href="#car"></use>`;
    carModel.append(svgCar);
    return carModel;
  }

  renderCarsInfo(currentPage: number, totalPages: number, carsAll: number) {
    this.winnersInfo.replaceChildren();

    const carsQuantity = dom.create({ tag: 'p', text: `Winners All: ${String(carsAll)}` });
    const currentPageElement = dom.create({ tag: 'p', text: `Page #${String(currentPage)}` });

    this.btnPrev.disabled = currentPage <= 1;
    this.btnNext.disabled = currentPage >= totalPages;

    const btnsContainer = dom.create({ tag: 'div', classNames: ['cars__pagination'] });
    btnsContainer.append(this.btnPrev, currentPageElement, this.btnNext);

    this.winnersInfo.append(carsQuantity, btnsContainer);
  }

  public render() {
    const header = this.createHeaderTitle(WinnersPage.TextObject.MAIN_TITLE);

    this.container.append(header, this.winnersInfo, this.tableContainer);

    this.renderWinnerTable();

    return this.container;
  }

  destroy() {
    this.unsubscribe();
  }
}
