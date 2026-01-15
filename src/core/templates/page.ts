import dom from '../../core/templates/creator';

export default abstract class Page {
  protected container: HTMLElement;

  constructor(id: string) {
    this.container = dom.create({ tag: 'div', id: id });
  }

  protected createHeaderTitle(text: string) {
    const title = dom.create({ tag: 'h2', text: text });
    return title;
  }

  protected showLoader(element: HTMLElement) {
    element.replaceChildren();
    const loader = dom.create({ tag: 'p', classNames: ['loader'], text: 'Loading...' });
    element.append(loader);
  }

  protected showError(element: HTMLElement, ErrorMessage: string) {
    element.replaceChildren();
    const error = dom.create({ tag: 'p', classNames: ['loader'], text: ErrorMessage });
    element.append(error);
  }

  render() {
    return this.container;
  }
}
