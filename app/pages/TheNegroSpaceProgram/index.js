import Button from 'classes/Button';
import Page from 'classes/Page';


export default class TheNegroSpaceProgram extends Page {
  constructor() {
    super({
      id: 'thenegrospaceprogram',
      element: '.theNegroSpaceProgram',
      elements: {
        wrapper: '.theNegroSpaceProgram__wrapper',
        navigation: document.querySelector('.navigation'),
        title: '.theNegroSpaceProgram__title'
        ,
      },
    });
  }
}
