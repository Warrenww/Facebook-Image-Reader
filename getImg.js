// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Warrenww
// @match        https://www.facebook.com/*
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
  const scrollParent = document.getElementById('facebook');
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
    style: 'margin: 10px 0;',
    placeholder: "Images size filter",
    title: "Images size filter",
  });
  container.append(sizeFilterInput);

  const imagesCountInput = CreateElement({
    type: 'input',
    inputType: 'number',
    style: 'margin: 10px 0;',
    placeholder: "Images count",
    title: "Images count",
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

    while (Images.length < n) {
      scrollParent.scrollTop = scrollParent.scrollHeight;
      Images.length = 0;
      Array.from(document.querySelectorAll('div[role="article"] img'))
        .filter(x => !x.className.includes('j1lvzwm4'))
        .filter(x => x.width > s)
        .forEach((x, i) => Images[i] = x);

      ImgBox.innerText = `Loading ${Images.length} / ${n}`
      await sleep(100);
    }
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

  const displayImage = (index) => {
    const temp = DisplayImages[index];
    if (temp) {
      const prevCanvas = document.querySelector('#my-img-container canvas')
      if(prevCanvas) prevCanvas.remove();
      const fraction = Math.min(window.innerWidth / temp.width, window.innerHeight / temp.height) * 0.9;
      imgsrc = temp.src;
      console.log(imgsrc);
      const canvas = document.createElement('canvas');
      canvas.width = temp.width;
      canvas.height = temp.height;
      canvas.style.cssText = `
        zoom: ${fraction};
        box-shadow: 0 0 10px black;
      `;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(temp,0,0,temp.width,temp.height);

      document.getElementById('my-img-container').append(canvas);
    }
  }

  const start = () => {
    let idx = 0;
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
      onclick: () => displayImage(idx++),
    });

    document.body.append(ImgBox);
    displayImage(idx);

    btn_3.innerText = 'Stop';
    btn_3.onclick = () =>{
      ImgBox.remove();
      btn_3.innerText = 'Start';
      btn_3.onclick = start;
   }
  }

  const btn_3 = CreateElement({
    type: 'button',
    text: 'Start',
    onclick: start,
    style: btnStyle,
  })
  container.append(btn_3);
}

})();
