import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger);

export default function GsapScroll(scrollContainer, scrollContent) {
  const caseElement = scrollContent.querySelector('.case');
  const caseTop = caseElement.getBoundingClientRect().top - scrollContent.getBoundingClientRect().top;

  ScrollTrigger.create({
    trigger: ".theNegroSpaceProgram__wrapper",
    start: "top top",
    end: "+=100%",
    pin: true,
    scrub: true,
    onEnter: () => {
      gsap.to(scrollContainer, {
        duration: 3,
        onUpdate: function() {
          scrollContainer.scrollTop = gsap.utils.interpolate(scrollContainer.scrollTop, caseTop, this.progress());
        },
        ease: "ExpoInOut",
      });
    },
  });
}
