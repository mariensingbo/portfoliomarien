/* eslint-disable no-unused-vars */
/* eslint-disable no-new */

import NormalizeWheel from 'normalize-wheel';

import each from 'lodash/each';
import Header from 'components/Canvas/Home/Header.js';
import { loadVideo } from './../shared/src/content.js';
import { ProcessGalleryInit, Character_webcamInit } from 'components/Canvas/thenegrospaceprogram';
import { WorkNavInit, initHomePage } from 'components/Canvas/Home';
import Canvas from 'components/Canvas';
import Detection from 'classes/Detection';
import Navigation from 'components/Navigation';
import Preloader from 'components/Preloader';
import About from 'pages/About';
import Collections from 'pages/Collections';
import Home from 'pages/Home';
import Detail from 'pages/Detail';
import TheNegroSpaceProgram from 'pages/TheNegroSpaceProgram';
import ThePark from 'pages/ThePark';
import Places from 'pages/Places';
import InlabSchibsted from 'pages/InlabSchibsted';

class App {
  constructor() {
    this.createContent();

    this.createCanvas();
    this.createPreloader();
    this.createNavigation();
    this.createPages();
    this.handlePointerEventForHome();
    this.addEventListeners();
    this.addLinkListeners();

    this.onResize();
    this.update();
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template,
    });
  }

  createPreloader() {
    this.preloader = new Preloader({
      canvas: this.canvas,
    });

    this.preloader.once('completed', this.onPreloaded.bind(this));
  }

  createCanvas() {
    this.canvas = new Canvas({
      template: this.template,
    });
  }

  createContent() {
    this.content = document.querySelector('.content');
    this.template = this.content.getAttribute('data-template');
  }

  createPages() {
    this.pages = {
      about: new About(),
      home: new Home(),
      thenegrospaceprogram: new TheNegroSpaceProgram(),
      thepark: new ThePark(),
      places: new Places(),
      inlabschibsted: new InlabSchibsted(),
    };

    this.page = this.pages[this.template];
    this.page.create();


    if (this.template === 'home') {
      WorkNavInit.initWorknav();
      initHomePage();
    }
    if (this.template === 'thenegrospaceprogram') {
      loadVideo();

      ProcessGalleryInit.initProcessGallery();

    }

  }


  /*
   * Events
   */

  onPreloaded() {
    this.onResize();

    this.canvas.onPreloaded();
    this.page.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: true,
    });
  }

  handlePointerEventForHome() {
    const links = document.querySelectorAll('a.navigation__link');

    if (this.template === 'home') {
      links.forEach((link) => {
        link.style.pointerEvents = 'none';
      });
    } else {
      links.forEach((link) => {
        link.style.pointerEvents = 'auto';
      });
    }
  }

  async onChange({ url, push = true }) {
    this.canvas.onChangeStart(this.template, url);

    await this.page.hide();

    const res = await window.fetch(url);

    if (res.status === 200) {
      const html = await res.text();
      const div = document.createElement('div');

      if (push) {
        window.history.pushState({}, '', url);
      }

      div.innerHTML = html;

      const divContent = div.querySelector('.content');

      this.template = divContent.getAttribute('data-template');
      this.navigation.onChange(this.template);

      if (this.template === 'home') {
        WorkNavInit.destroyWorknav();

      }


      this.content.setAttribute('data-template', this.template);



      this.content.innerHTML = divContent.innerHTML;



      if (this.template === 'thenegrospaceprogram') {
        ProcessGalleryInit.destroyProcessGallery();
        Character_webcamInit.destroyCharacterMorphTarget();
      }
      this.canvas.onChangeEnd(this.template);

      this.page = this.pages[this.template];
      this.page.create();

      if (this.template === 'home') {
        WorkNavInit.initWorknav();
        initHomePage();



      }


      this.handlePointerEventForHome()

      if (this.template === 'thenegrospaceprogram') {
        loadVideo();
        ProcessGalleryInit.initProcessGallery();

      }



      this.onResize();

      this.page.show();

      this.addLinkListeners();
    } else {
      console.error(`response status: ${res.status}`);
    }
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }



    this.addLinkListeners();

    window.requestAnimationFrame((_) => {
      if (this.canvas && this.canvas.onResize) {
        this.canvas.onResize();
      }
    });
  }


  onTouchDown(e) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(e);
    }
  }

  onTouchMove(e) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(e);
    }
  }


  onTouchUp(e) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(e);
    }
  }

  onWheel(e) {
    const normalizedWheel = NormalizeWheel(e);

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.onWheel) {
      this.page.onWheel(normalizedWheel);
    }
  }


  /*
   *  LOop
   */

  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this));
  }

  /*
  Listeners
  */

  addEventListeners() {
    window.addEventListener('wheel', this.onWheel.bind(this));
    window.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));
    window.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }



  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  addLinkListeners() {
    const links = this.isMobileDevice() ?
                  document.querySelectorAll('a') :
                  document.querySelectorAll('.navigation__list__link, a');

    each(links, (link) => {
      // Unbind all current click or tap events
      link.onclick = null;
      link.ontouchend = null;

      if (this.isMobileDevice()) {
        link.ontouchend = (event) => {
          event.preventDefault();

          // Prevent the subsequent click event from firing
          const onclick = link.onclick;
          link.onclick = null;
          setTimeout(() => {
            link.onclick = onclick;
          }, 8000);

          const { href } = link;
          this.onChange({ url: href });
        }
      } else {
        link.onclick = (event) => {
          event.preventDefault();

          const { href } = link;
          this.onChange({ url: href });

          if (link.classList.contains('navigation__list__link')) {
            // Set pointer-events to none
            link.style.pointerEvents = 'none';

            // Reset pointer-events after 4 seconds
            setTimeout(() => {
              link.style.pointerEvents = '';
            }, 8000);
          }
        };
      }
    });
  }



}

new App();



