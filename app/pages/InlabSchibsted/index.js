import Page from 'classes/Page';

export default class InlabSchibsted extends Page {
  constructor() {
    super({
      id: 'inlabschibsted',
      element: '.inlabschibsted',
      elements: {
        wrapper: '.inlabschibsted__wrapper',
        navigation: document.querySelector('.navigation'),
        title: '.inlabschibsted__title'
        ,
      },
    });
  }
}
