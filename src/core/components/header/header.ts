import { PageIDs } from '../../../types';
import dom from '../../templates/creator';

import './header.scss';

export default class Header {
  header: HTMLElement;
  navElement: HTMLElement;

  buttons = [
    {
      id: PageIDs.GARAGE_PAGE,
      text: 'Garage',
    },
    {
      id: PageIDs.WINNERS_PAGE,
      text: 'Winners',
    },
  ];

  constructor() {
    this.header = dom.create({ tag: 'header', classNames: ['header'] });
    this.navElement = this.createPageBtns();
  }

  createPageBtns() {
    const nav = dom.create({ tag: 'nav', classNames: ['nav'] });
    this.buttons.forEach((btn) => {
      const button = dom.create({ tag: 'a', classNames: ['nav__link'], text: btn.text });
      const hash = window.location.hash.slice(1);

      if (hash === btn.id) {
        button.classList.add('nav__link--active');
      }

      button.href = `#${btn.id}`;
      nav.append(button);
    });
    return nav;
  }

  updateActive(pageId: string) {
    const links = this.navElement.querySelectorAll('a');

    Array.from(links).forEach((link) => {
      const isActive = link.hash.slice(1) === pageId;
      link.classList.toggle('nav__link--active', isActive);
    });
  }

  render() {
    this.header.append(this.navElement);
    return this.header;
  }
}
