import Button from 'classes/Button';
import Page from 'classes/Page';


export default class ThePark extends Page {
  constructor() {
    super({
      id: 'thepark',
      element: '.thepark',
      elements: {
        wrapper: '.thepark__wrapper',
        navigation: document.querySelector('.navigation'),
        title: '.thepark__title'
        ,
      },
    });
  }
}
