// Global type declarations

declare module '*.json' {
  const value: any;
  export default value;
}

declare global {
  interface Window {
    BP3D: any;
    THREE: any;
    $: any;
  }
}

export {};
