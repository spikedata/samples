export type onDropFn = (files: FileList) => void;
export type onHoverFn = () => void;
export type onUnhoverFn = () => void;

class DropArea {
  el: HTMLElement | null;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onDrop: onDropFn;
  onHover: onHoverFn;
  onUnhover: onUnhoverFn;

  constructor(id = "drop-area", onDrop: onDropFn, onHover: onHoverFn, onUnhover: onUnhoverFn) {
    this.el = document.getElementById(id);
    // console.log("el", this.el);
    this.onDrop = onDrop;
    this.onHover = onHover;
    this.onUnhover = onUnhover;
    this.init();
  }

  init() {
    // Prevent default drag behaviors
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      this.el?.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ["dragenter", "dragover"].forEach((eventName) => {
      this.el?.addEventListener(eventName, onHover.bind(this), false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      this.el?.addEventListener(eventName, onUnhover.bind(this), false);
    });

    // Handle dropped files
    this.el?.addEventListener("drop", onDrop.bind(this), false);
  }
}

function preventDefaults(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
}

function onHover(this: DropArea) {
  this.onHover();
}

function onUnhover(this: DropArea) {
  this.onUnhover();
}

function onDrop(this: DropArea, e: DragEvent) {
  // console.log("onDrop");
  const dt = e.dataTransfer;
  if (dt?.files) {
    const files = dt.files;
    this.onDrop(files);
  }
}

export default DropArea;
