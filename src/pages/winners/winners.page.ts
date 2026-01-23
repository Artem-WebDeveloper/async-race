import dom from '../../core/templates/creator';
import Page from '../../core/templates/page';

export default class WinnersPage extends Page {
  static TextObject = {
    MAIN_TITLE: '🏁 Winners',
  };

  tableContainer: HTMLDivElement;
  controlContainer: HTMLDivElement;
  btnPrev: HTMLButtonElement;
  btnNext: HTMLButtonElement;

  constructor(id: string) {
    super(id);

    this.tableContainer = dom.create({ tag: 'div', classNames: ['winners-table'] });
    this.controlContainer = dom.create({ tag: 'div', classNames: ['winners-controls'] });

    this.btnPrev = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: '← Prev' });
    this.btnNext = dom.create({ tag: 'button', classNames: ['btn-pagination'], text: 'Next →' });
  }

  createWinnerTable() {}

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

    this.container.append(header, this.tableContainer, this.controlContainer);
    return this.container;
  }
}
