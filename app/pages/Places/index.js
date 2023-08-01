import Button from 'classes/Button';
import Page from 'classes/Page';


export default class Places extends Page {
  constructor() {
    super({
      id: 'places',
      element: '.places',
      elements: {
        wrapper: '.places__wrapper',
        navigation: document.querySelector('.navigation'),
        title: '.places__title'
        ,
      },
    });
  }
}
