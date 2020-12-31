# Facebook Image Loader

## Features
- Automatically scroll down and load images.
- Display loaded images in focus view.
- Keyboard navigation support.
- Download image in one click.

## Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) to your browser.
3. Go to the utilites tab in Tampermonkey's dashboard.
2. Paste https://raw.githubusercontent.com/Warrenww/Facebook-Image-Reader/main/main.js into `Install from URL`.
5. Click `Install`.

## Usage
![image](./screenshot.jpeg)
- First row is for change panel position.
- Second row is for setting image size filter, all images which width value in pixel below this will be ignored.
- Third row is to set the minimum numbers of image should be loaded. Page will automatically scroll down and load images until the number of images reached the minimum value.
- **Clear image:** Clear the stored images queue.
- **Shuffle:** Randomly shuffle the loaded images.
- **Download image:** Download the image currently shown.
- **Start:** Load the images and start the focus view mode.

In the focus view mode, all the original content will be blurred, and image will be displayed in the center of the screen with appropriate size. Navigate to the next/previous image by pressing left or right arrow. Press escape or click `stop` to exit the focus view mode.

### Load images from Instagram story
Once you have clicked the `Start` the load images process will start collecting all image on your screen, it will display a progress screen to show how many images are already loaded. This progress screen can be dismissed by clicking it. However, the loading process will remain in background. Until the number of images loaded reached the minimum value setting, the Focus view  will start.

When you starting browsing the Instagram story, you can set the minimum loaded value at the first, and dismiss the progress screen. Once a new story is loaded, it will be immediately add to the images queue. After you finish, you can re-visit the story you have seen before in the focus mode. And they can be download too!

## How does it work?
Using the `querySelectorAll` function to choose all loaded images in each posts, and filtered by 2 filter function and store the results in an array.
```
Array.from(document.querySelectorAll('div[role="article"] img'))
  .filter(x => x.width > filterSize)
  .forEach((x, i) => Images[i] = x);
```  
Focus view is a fullscreen div with `backdrop-filter: blur()` and containing a canvas. The image then be drawn on to canvas, and the canvas is adjusted its size to fit the screen.
```
const fraction = Math.min(window.innerWidth / image.width, window.innerHeight / image.height) * 0.9;
imgsrc = image.src;
const canvas = document.createElement('canvas');
canvas.width = image.width;
canvas.height = image.height;
canvas.style.cssText = `
  zoom: ${fraction};
  box-shadow: 0 0 10px black;
`;

const ctx = canvas.getContext('2d');
ctx.drawImage(image,0,0,image.width,image.height);
```
Canvas cannot directly interpret into dataURL or Blob due to taint. Thus, we using `fetch` api to get the image's Blob data, and create an ObjectURL to download it.
```
const blob = await fetch(image.src).then(res => res.blob()).then(blob => blob);
const url = URL.createObjectURL(blob);
downloadLink.href = url;
downloadLink.click();
```

## Future work
- Batch images download.
