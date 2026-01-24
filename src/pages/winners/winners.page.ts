import store from '../../app/store';
import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';
import type { WinnerCarTableFormat } from '../../types';

import './winners.scss';

export default class WinnersPage extends Page {
  static TextObject = {
    MAIN_TITLE: '🏁 Winners',
  };

  tableContainer: HTMLDivElement;
  winnersInfo: HTMLDivElement;
  btnPrev: HTMLButtonElement;
  btnNext: HTMLButtonElement;

  unsubscribe: () => void;

  constructor(id: string) {
    super(id);

    this.tableContainer = dom.create({ tag: 'div', classNames: ['winners-table'] });

    this.winnersInfo = dom.create({ tag: 'div', classNames: ['cars__info'] });
    this.btnPrev = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: '← Prev' });
    this.btnNext = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: 'Next →' });

    this.unsubscribe = store.subscribe(this.renderWinnerTable, 'winners');
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
  };

  createHeaderTable() {
    const headTableElement = dom.create({ tag: 'div', classNames: ['winners-table__head'] });
    ['number ID', 'car', 'name', 'wins', 'best time (S)'].forEach((col) => {
      headTableElement.append(dom.create({ tag: 'span', text: col }));
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

    const carsQuantity = dom.create({ tag: 'p', text: `Cars All: ${String(carsAll)}` });
    const currentPageElement = dom.create({ tag: 'p', text: `Page #${String(currentPage)}` });

    this.btnPrev.disabled = currentPage <= 1;
    this.btnNext.disabled = currentPage >= totalPages;

    const btnsContainer = dom.create({ tag: 'div', classNames: ['cars__pagination'] });
    btnsContainer.append(this.btnPrev, currentPageElement, this.btnNext);

    this.winnersInfo.append(carsQuantity, btnsContainer);
    this.container.append(this.winnersInfo);
  }

  // ВОЗМОЖНО НЕ ПОТРЕБУЕТСЯ!
  /* public renderBtnsPagination(totalPages: number, currentPage: number) {
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
  } */

  public render() {
    const header = this.createHeaderTitle(WinnersPage.TextObject.MAIN_TITLE);

    this.container.append(header, this.tableContainer);

    this.renderWinnerTable();

    return this.container;
  }

  destroy() {
    this.unsubscribe();
  }
}
