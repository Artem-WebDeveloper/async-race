import Page from '../../core/templates/page';

export default class ErrorPage extends Page {
  private errorType: string;

  static TextObject: { [prop: string]: string } = {
    '404': '⚠️ Error! The page was not found.',
  };

  constructor(id: string, errorType: string) {
    super(id);
    this.errorType = errorType;
  }

  public render() {
    const header = this.createHeaderTitle(ErrorPage.TextObject[this.errorType]);

    this.container.append(header);
    return this.container;
  }
}
