import { gsap } from 'gsap';

export function initNavMenu() {
  const navWrapper = document.querySelector('.nav__wrapper');
  const topbtn = document.querySelector('#top-btn');
  const homeNav = document.querySelector('.home-nav');
  const homeNavItems = homeNav.querySelectorAll('li');
  const wrap = document.querySelector('#wrap');

  document.querySelector('.explore-btn').addEventListener('click', () => {
    const container = document.querySelector('#container');
    navWrapper.classList.add('visible');
    container.scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      gsap.fromTo(homeNav, { x: '100%', opacity: 0 }, { duration: 3, x: '0%', opacity: 1, ease: 'expo.inOut', delay: 0.7});
      gsap.fromTo(homeNavItems, { x: '100%' }, { stagger: 0.2, x: '0%', ease: 'expo.easeIn', delay: 0 });

      // Animate wrap
      if (window.innerWidth < 1024) {
        gsap.fromTo(wrap, { top: '120%' }, { duration: 2.5, top: '100%', ease: 'expo.inOut', delay: 0.2 });
        gsap.fromTo(wrap, { opacity: 0 }, { duration: 1.2, opacity: 1, ease: 'power1.out', delay: 1.3 });
      } else {
        gsap.fromTo(wrap, { left: '-50%' }, { duration: 2.5, left: '0%', ease: 'expo.inOut', delay: 0. });
        gsap.fromTo(wrap, { opacity: 0 }, { duration: 2.5, opacity: 1, ease: 'power1.out', delay: 0.2 });
      }
      }, 0);
      });


  document.querySelector('#top-btn').addEventListener('click', () => {
    const headerWrapper = document.querySelector('.header__wrapper');
    const navWrapper = document.querySelector('.nav__wrapper.visible');
    navWrapper.classList.remove('visible');
    headerWrapper.scrollIntoView({ behavior: 'smooth' });

    // Reverse wrap animation
    if (window.innerWidth < 1024) {
      gsap.to(wrap, { top: '100%', duration: 2.5, opacity: 0 });
    } else {
      gsap.to(wrap, { left: '-50%', duration: 2.5 });
    }

    // Fade out and return to right starting position
    gsap.to(homeNav, { x: '100%', opacity: 0, duration: 2.5 });
  });
}

