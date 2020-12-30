// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Browse Facebook images in a focus mode.
// @author       Warrenww
// @include      /https:\/\/www\.(facebook|instagram)\.com\/.*/
// @grant        none
// ==/UserScript==
(function() {
  'use strict';

  const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

  const CreateElement = ({type, text, html, style, inputType, ...rest}) => {
    const ele = document.createElement(type);
    if(text) ele.innerText = text;
    if(html) ele.innerHTML = html;
    if(style) ele.style.cssText = style;
    if(inputType) ele.type = inputType;
    for(let key in rest) ele[key] = rest[key];

    return ele;
  }

  const Images = [];
  const DisplayImages = [];
  let imgsrc = null;

  const btnStyle = `
    outline: none;
    border-radius: 10px;
    border: 0;
    margin: 0.5em;
    padding: 0.4em 1em;
    cursor: pointer;
  `;

  window.onload = function() {
  const scrollParent = document.getElementById('facebook') || document.getElementById('react-root');
  const container = CreateElement({
    type: 'div',
    text: '',
    style:`
      position: fixed;
      bottom: 1em;
      left: 1em;
      background-color: #333;
      border-radius: 10px;
      box-shadow: 0 0 10px black;
      z-index: 100;
      padding: 1em;
      display: flex;
      flex-direction: column;
      transition: .3s ease-in-out;
    `
  });
  document.body.append(container);

  const positionSelector = CreateElement({
    type: 'select',
    html: `
      <option value="BL">bottom left</option>
      <option value="BR">bottom right</option>
      <option value="TL">top left</option>
      <option value="TR">top right</option>
    `,
    defaultValue: 'BL',
    onchange: (e) => {
      const pos = e.target.value;
      container.style.top = '';
      container.style.bottom = '';
      container.style.left = '';
      container.style.right = '';
      switch (pos) {
        case 'BL':
          container.style.bottom = '1em';
          container.style.left = '1em';
          break;
        case 'BR':
          container.style.bottom = '1em';
          container.style.right = '1em';
          break;
        case 'TL':
          container.style.top = '1em';
          container.style.left = '1em';
          break;
        case 'TR':
          container.style.top = '1em';
          container.style.right = '1em';
          break;
      }
    },
  });
  container.append(positionSelector);

  const sizeFilterInput = CreateElement({
    type: 'input',
    inputType: 'number',
    style: 'margin: 10px 0; border: 0;',
    placeholder: "Images size filter",
    title: "Images size filter",
    defaultValue: 100,
  });
  container.append(sizeFilterInput);

  const imagesCountInput = CreateElement({
    type: 'input',
    inputType: 'number',
    style: 'margin: 10px 0; border: 0;',
    placeholder: "Images count",
    title: "Images count",
    onkeypress: (e) => {if(e.key === "Enter") LoadImages()},
  });
  container.append(imagesCountInput);

  const LoadImages = async () => {
    const n = Number(imagesCountInput.value);
    if (Number.isNaN(n)) n = 1;

    const s = Number(sizeFilterInput.value);
    if (Number.isNaN(n)) n = 0;

    const ImgBox = CreateElement({
      type: 'div',
      style: `
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background: #3338;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
        color: white;
        font-size: 2em;
      `,
      id: 'my-img-container',
      onclick: () => document.getElementById('my-img-container').remove(),
    });

    document.body.append(ImgBox);

    do {
      scrollParent.scrollTop = scrollParent.scrollHeight;
      Images.length = 0;
      Array.from(document.querySelectorAll('img'))
        .filter(x => x.width > s)
        .forEach((x, i) => Images[i] = x);

      ImgBox.innerText = `Loading ${Images.length} / ${n}`
      await sleep(100);
    } while (Images.length < n)

    ImgBox.remove();
    Images.forEach((x, i) => DisplayImages[i] = x);
  }

  const btn_1 = CreateElement({
    type: 'button',
    text: 'Load image',
    style: btnStyle,
    onclick: LoadImages,
  });
  container.append(btn_1);

  const shuffle = () => DisplayImages.sort((a, b) => (Math.random() - 0.5));

  const btn_2 = CreateElement({
    type: 'button',
    style: btnStyle,
    onclick: shuffle,
    text: 'Shuffle',
  });
  container.append(btn_2);

  const downloadLink = document.createElement('a');
  downloadLink.download = 'download.png';
  container.append(downloadLink);
  const download = async () => {
    const blob = await fetch(DisplayImages[idx].src).then(res => res.blob()).then(blob => blob);
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.click();
  };
  const btn_4 = CreateElement({
    type: 'button',
    style: btnStyle,
    onclick: download,
    text: 'Download Image',
  });
  container.append(btn_4);

  const displayImage = (index) => {
    const temp = DisplayImages[index];
    if (temp) {
      const prevCanvas = document.querySelector('#my-img-container canvas')
      if(prevCanvas) prevCanvas.remove();
      imgsrc = temp.src;
      const imgWidth = temp.naturalWidth || temp.width;
      const imgHeight = temp.naturalHeight || temp.height;
      const fraction = Math.min(window.innerWidth / imgWidth, window.innerHeight / imgHeight) * 0.9;
      const canvas = document.createElement('canvas');
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      canvas.style.cssText = `
        zoom: ${fraction};
        box-shadow: 0 0 10px black;
      `;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(temp, 0, 0, imgWidth, imgHeight);

      document.getElementById('my-img-container').append(canvas);
    }
  }

  let idx = 0;
  const start = () => {
    const ImgBox = CreateElement({
      type: 'div',
      style: `
        width: 100vw;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        background: #3338;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
      `,
      id: 'my-img-container',
    });

    document.body.append(ImgBox);
    displayImage(idx);

    const stop = () => {
      ImgBox.remove();
      btn_3.innerText = 'Start';
      btn_3.style.backgroundColor = '#4b8646';
      btn_3.onclick = start;
      document.onkeyup = null;
   }

    document.onkeyup = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          idx -= 1;
          idx = idx < 0 ? 0 : idx;
          displayImage(idx);
          break;
        case 'ArrowRight':
          idx += 1;
          idx = idx >= DisplayImages.length ? DisplayImages.length - 1 : idx;
          displayImage(idx);
          break;
        case 'Escape':
          stop();
      }
    }

    btn_3.innerText = 'Stop';
    btn_3.onclick = stop;
    btn_3.style.backgroundColor = '#864646';
  }

  const btn_3 = CreateElement({
    type: 'button',
    text: 'Start',
    onclick: start,
    style: btnStyle + 'background-color: #4b8646;',
  });
  container.append(btn_3);
}

})();
