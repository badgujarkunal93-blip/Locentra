import '@testing-library/jest-dom';

// ResizeObserver mock for Recharts, Three.js, and ResponsiveContainers
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Canvas WebGL Mock for Three.js in jsdom
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType: string, ...args: any[]) {
  if (contextType === '2d') {
    return {
      canvas: this,
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      fill: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      scale: () => {},
      arc: () => {},
      moveTo: () => {},
      lineTo: () => {},
      bezierCurveTo: () => {},
      createImageData: () => ({ data: [] }),
      getImageData: () => ({ data: [] }),
      putImageData: () => {},
    } as any;
  }
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      canvas: this,
      getExtension: () => null,
      getParameter: () => 0,
      createTexture: () => ({}),
      bindTexture: () => {},
      texParameteri: () => {},
      texImage2D: () => {},
      clearColor: () => {},
      clearDepth: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      viewport: () => {},
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      getShaderInfoLog: () => '',
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      getProgramInfoLog: () => '',
      useProgram: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      getAttribLocation: () => 0,
      getUniformLocation: () => ({}),
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      drawArrays: () => {},
      drawElements: () => {},
      createRenderbuffer: () => ({}),
      bindRenderbuffer: () => {},
      renderbufferStorage: () => {},
      createFramebuffer: () => ({}),
      bindFramebuffer: () => {},
      framebufferRenderbuffer: () => {},
      framebufferTexture2D: () => {},
      checkFramebufferStatus: () => 36053, // FRAMEBUFFER_COMPLETE
    } as any;
  }
  return originalGetContext ? (originalGetContext as any).apply(this, [contextType, ...args]) : null;
};
