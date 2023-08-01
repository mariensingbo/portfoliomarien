export default class HeaderVideo {
  constructor() {
    window.addEventListener('load', () => {
      this.initializeVideoLoop();
      this.disableContextMenu();
    });
  }

  initializeVideoLoop() {
    const video = document.getElementById('myVideo');

    this.loopVideo(video);
  }

  loopVideo(video) {
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play();
    });
  }

  disableContextMenu() {
    const video = document.getElementById('myVideo');
    video.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
}
