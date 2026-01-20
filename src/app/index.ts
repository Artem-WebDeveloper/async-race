import Header from '../core/components/header/header';
import { initSvgSprite } from '../core/services/svgSprite';
import Page from '../core/templates/page';
import ErrorPage from '../pages/error/error.page';
import GaragePage from '../pages/garage/garage.page';
import WinnersPage from '../pages/winners/winners.page';
import { ErrorTypes, PageIDs } from '../types';

type RouteConfig = {
  path: string;
  component: new (id: string) => Page;
  title?: string;
};

export default class App {
  mainContainer: HTMLElement;
  header: Header;
  currentPage: Page | null = null;

  routes: RouteConfig[] = [
    { path: PageIDs.GARAGE_PAGE, component: GaragePage, title: 'async-race | Garage' },
    { path: PageIDs.WINNERS_PAGE, component: WinnersPage, title: 'async-race | Winners' },
  ];

  constructor() {
    this.mainContainer = document.createElement('main');
    this.header = new Header();
  }

  renderPage(pageId: string) {
    this.currentPage?.destroy();
    this.mainContainer.replaceChildren();

    const route = this.routes.find((route) => route.path === pageId);
    const page = route ? new route.component(pageId) : new ErrorPage(pageId, ErrorTypes.ERROR_404);
    this.currentPage = page;

    if (route?.title) {
      document.title = route.title;
    }

    this.mainContainer.append(page.render());
    this.header.updateActive(pageId);
  }

  private enableRouteChange() {
    const handleRoute = () => {
      const hash = window.location.hash.slice(1);
      this.renderPage(hash || PageIDs.GARAGE_PAGE);
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
  }

  public run() {
    document.body.append(this.header.render(), this.mainContainer);
    initSvgSprite();

    this.enableRouteChange();
  }
}
