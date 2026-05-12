/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FilterOptions {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  blur: number;
  hueRotate: number;
  invert: number;
}

export const DEFAULT_FILTERS: FilterOptions = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
  invert: 0,
};

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
  }

  async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  applyFilters(filters: FilterOptions) {
    const { brightness, contrast, saturation, grayscale, sepia, blur, hueRotate, invert } = filters;
    this.ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      grayscale(${grayscale}%)
      sepia(${sepia}%)
      blur(${blur}px)
      hue-rotate(${hueRotate}deg)
      invert(${invert}%)
    `;
  }

  drawImage(img: HTMLImageElement, x = 0, y = 0, width?: number, height?: number) {
    this.ctx.drawImage(img, x, y, width || img.width, height || img.height);
  }

  resizeToSquare(img: HTMLImageElement, background = '#ffffff') {
    const size = Math.max(img.width, img.height);
    this.setSize(size, size);
    this.ctx.fillStyle = background;
    this.ctx.fillRect(0, 0, size, size);
    
    const x = (size - img.width) / 2;
    const y = (size - img.height) / 2;
    this.ctx.drawImage(img, x, y);
  }

  addQuote(text: string, author?: string, style: 'classic' | 'modern' = 'classic') {
    const { width, height } = this.canvas;
    this.ctx.save();
    
    // Background overlay for readability
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    
    if (style === 'classic') {
      this.ctx.font = `italic 600 ${Math.floor(width * 0.05)}px serif`;
      this.ctx.fillText(`"${text}"`, width / 2, height / 2);
      if (author) {
        this.ctx.font = `400 ${Math.floor(width * 0.03)}px serif`;
        this.ctx.fillText(`— ${author}`, width / 2, height / 2 + (width * 0.08));
      }
    } else {
      this.ctx.font = `900 ${Math.floor(width * 0.06)}px "Inter", sans-serif`;
      this.ctx.fillText(text.toUpperCase(), width / 2, height / 2);
    }
    
    this.ctx.restore();
  }

  addWatermark(text: string, opacity = 0.5) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Inter';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(text, this.canvas.width - 20, this.canvas.height - 20);
    this.ctx.restore();
  }

  export(format = 'image/png', quality = 0.92): string {
    return this.canvas.toDataURL(format, quality);
  }

  // Utility to get image data for advanced processing (like background removal or palette)
  getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}
