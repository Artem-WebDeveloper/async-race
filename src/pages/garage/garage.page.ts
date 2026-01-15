import Page from '../../core/templates/page';

export default class GaragePage extends Page {
  static TextObject = {
    MAIN_TITLE: 'Garage',
  };

  constructor(id: string) {
    super(id);
  }

  public render() {
    const header = this.createHeaderTitle(GaragePage.TextObject.MAIN_TITLE);

    this.container.append(header);
    return this.container;
  }
}
