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

  render() {
    return this.container;
  }
}
