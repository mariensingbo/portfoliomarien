window.addEventListener('resize', loadVideo);

export function loadVideo() {
  var video = document.getElementById('headerVideo');

  // if video does not exist in DOM, return from the function early
  if (!video) {
    return;
  }

  // remove existing source elements
  while(video.firstChild) {
    video.removeChild(video.firstChild);
  }

  var source = document.createElement('source');

  if (window.matchMedia("(max-width: 1023px)").matches) {
    source.src = 'https://prismic-io.s3.amazonaws.com/mariensingbo/64d9487c-fa40-4178-9fee-1a385b0dac67_TNSP_PhoneMobile.mp4';
    video.className = 'headerVideo__mobile'; // apply mobile video styles
  } else {
    source.src = 'https://prismic-io.s3.amazonaws.com/mariensingbo/1658078f-279c-4ea7-999a-8aa5f2d8bb61_flag.mp4';
    video.className = 'headerVideo'; // apply desktop video styles
  }

  video.appendChild(source);
  video.load();
}
