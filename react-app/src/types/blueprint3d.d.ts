// Type declarations for Blueprint3D

declare namespace BP3D {
  interface Blueprint3dOptions {
    floorplannerElement: string;
    threeElement: string;
    threeCanvasElement: string;
    textureDir: string;
    widget: boolean;
  }

  interface Blueprint3dInstance {
    model: Model;
    three: Three;
    floorplanner: Floorplanner;
  }

  interface Model {
    floorplan: Floorplan;
    scene: Scene;
    exportSerialized(): string;
    loadSerialized(json: string): void;
  }

  interface Floorplan {
    update(): void;
  }

  interface Scene {
    getItems(): any[];
    addItem(itemType: number, fileName: string, metadata: any, position?: any, rotation?: any, scale?: any): void;
  }

  interface Callbacks {
    add(callback: Function): void;
    remove(callback: Function): void;
  }

  interface Three {
    updateWindowSize(): void;
    centerCamera(): void;
    getFloorplan(): any;
    controls: Controls;
    itemSelectedCallbacks: Callbacks;
    itemUnselectedCallbacks: Callbacks;
    wallClicked: Callbacks;
    floorClicked: Callbacks;
  }
  
  namespace Three {
    function setEdgeAutoVisibility(enabled: boolean): void;
    function getEdgeAutoVisibility(): boolean;
  }

  interface Controls {
    panLeft(distance: number): void;
    panUp(distance: number): void;
    update(): void;
    rotateLeft(angle: number): void;
  }

  interface Floorplanner {
    view: FloorplannerView;
  }

  interface FloorplannerView {
    handleWindowResize(): void;
    draw(): void;
  }

  interface ItemMetadata {
    itemName: string;
    resizable: boolean;
    modelUrl: string;
    itemType: number;
  }

  namespace Floorplanner {
    enum floorplannerModes {
      MOVE = 0,
      DRAW = 1,
      DELETE = 2
    }
  }
}

  class Blueprint3d implements Blueprint3dInstance {
    constructor(options: Blueprint3dOptions);
    model: Model;
    three: Three;
    floorplanner: Floorplanner;
  }
}

export = BP3D;
export as namespace BP3D;

declare global {
  interface Window {
    BP3D: typeof BP3D;
    THREE: any;
    $: any;
    bp3d: BP3D.Blueprint3dInstance;
  }
}
