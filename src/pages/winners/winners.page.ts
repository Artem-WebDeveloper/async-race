import Page from '../../core/templates/page';

export default class WinnersPage extends Page {
  static TextObject = {
    MAIN_TITLE: '🏁 Winners',
  };

  constructor(id: string) {
    super(id);
  }

  public render() {
    const header = this.createHeaderTitle(WinnersPage.TextObject.MAIN_TITLE);

    this.container.append(header);
    return this.container;
  }
}
