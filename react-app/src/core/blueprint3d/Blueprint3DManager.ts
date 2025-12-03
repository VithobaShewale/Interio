/**
 * Blueprint3D Manager
 * Central adapter/facade for Blueprint3D library
 * Decouples the app from direct Blueprint3D coupling
 */

import { EventEmitter } from 'events';

export interface Blueprint3DConfig {
  floorplannerElement: string;
  threeElement: string;
  textureDir: string;
}

export interface FloorplanData {
  corners: any;
  walls: any;
}

export interface ItemData {
  item_name: string;
  item_type: number;
  model_url: string;
  xpos: number;
  ypos: number;
  zpos: number;
  rotation: number;
  scale_x: number;
  scale_y: number;
  scale_z: number;
  fixed: boolean;
}

export interface SerializedDesign {
  floorplan: FloorplanData;
  items: ItemData[];
}

export type ViewMode = '3d' | '2d' | 'wall';
export type FloorplannerMode = 0 | 1 | 2; // MOVE=0, DRAW=1, DELETE=2

/**
 * Blueprint3D Manager Class
 * Provides a clean API for interacting with Blueprint3D library
 */
export class Blueprint3DManager extends EventEmitter {
  private blueprint3d: any;
  private isInitialized: boolean = false;
  private config: Blueprint3DConfig;

  constructor(config: Blueprint3DConfig) {
    super();
    this.config = config;
  }

  /**
   * Initialize Blueprint3D instance
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkLibrary = setInterval(() => {
        if ((window as any).BP3D) {
          clearInterval(checkLibrary);
          clearTimeout(timeout);

          try {
            this.blueprint3d = new (window as any).BP3D.Blueprint3d(this.config);
            this.setupEventListeners();
            this.isInitialized = true;
            this.emit('initialized');
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(checkLibrary);
        reject(new Error('Blueprint3D library load timeout'));
      }, 10000);
    });
  }

  /**
   * Setup event listeners from Blueprint3D
   */
  private setupEventListeners(): void {
    if (!this.blueprint3d) return;

    // Room loaded
    this.blueprint3d.model.roomLoadedCallbacks.add(() => {
      this.emit('roomLoaded');
    });

    // Item selected
    this.blueprint3d.three.controller.itemSelectedCallbacks.add((item: any) => {
      this.emit('itemSelected', item);
    });

    // Item unselected
    this.blueprint3d.three.controller.itemUnselectedCallbacks.add(() => {
      this.emit('itemUnselected');
    });

    // Item removed
    this.blueprint3d.model.scene.itemRemovedCallbacks.add(() => {
      this.emit('itemRemoved');
    });

    // Item added
    this.blueprint3d.model.scene.itemLoadedCallbacks.add(() => {
      this.emit('itemAdded');
    });

    // Wall clicked
    this.blueprint3d.three.controller.wallClicked.add((wall: any) => {
      this.emit('wallClicked', wall);
    });

    // Nothing selected
    this.blueprint3d.three.controller.nothingClicked.add(() => {
      this.emit('nothingClicked');
    });

    // Floorplan mode changed
    this.blueprint3d.floorplanner.modeResetCallbacks.add((mode: FloorplannerMode) => {
      this.emit('floorplannerModeChanged', mode);
    });
  }

  /**
   * Set view mode
   */
  setViewMode(mode: ViewMode): void {
    this.ensureInitialized();
    
    switch (mode) {
      case '3d':
        this.blueprint3d.three.switchView(this.blueprint3d.three.modes.VIEWER);
        break;
      case '2d':
        this.blueprint3d.three.switchView(this.blueprint3d.three.modes.FLOORPLANNER);
        break;
      case 'wall':
        this.blueprint3d.three.switchView(this.blueprint3d.three.modes.WALLELEVATION);
        break;
    }
    
    this.emit('viewModeChanged', mode);
  }

  /**
   * Set floorplanner mode
   */
  setFloorplannerMode(mode: FloorplannerMode): void {
    this.ensureInitialized();
    this.blueprint3d.floorplanner.setMode(mode);
  }

  /**
   * Add item to scene
   */
  async addItem(itemData: { name: string; model: string; type: number }): Promise<void> {
    this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      try {
        this.blueprint3d.model.scene.addItem(
          itemData.type,
          itemData.model,
          { name: itemData.name }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Remove selected item
   */
  removeSelectedItem(): void {
    this.ensureInitialized();
    const item = this.blueprint3d.three.controller.getSelectedObject();
    if (item) {
      this.blueprint3d.model.scene.removeItem(item);
    }
  }

  /**
   * Get selected item
   */
  getSelectedItem(): any {
    this.ensureInitialized();
    return this.blueprint3d.three.controller.getSelectedObject();
  }

  /**
   * Load design from serialized data
   */
  loadDesign(data: SerializedDesign): void {
    this.ensureInitialized();
    const jsonString = JSON.stringify(data);
    this.blueprint3d.model.loadSerialized(jsonString);
  }

  /**
   * Export current design
   */
  exportDesign(): SerializedDesign {
    this.ensureInitialized();
    const jsonString = this.blueprint3d.model.exportSerialized();
    return JSON.parse(jsonString);
  }

  /**
   * Create new empty design
   */
  newDesign(): void {
    this.ensureInitialized();
    this.blueprint3d.model.newDesign();
  }

  /**
   * Toggle dimension visibility
   */
  toggleDimensions(visible: boolean): void {
    this.ensureInitialized();
    if (visible) {
      this.blueprint3d.model.floorplan.showDimensions();
    } else {
      this.blueprint3d.model.floorplan.hideDimensions();
    }
  }

  /**
   * Get all items in scene
   */
  getItems(): any[] {
    this.ensureInitialized();
    return this.blueprint3d.model.scene.getItems();
  }

  /**
   * Get floorplan data
   */
  getFloorplan(): any {
    this.ensureInitialized();
    return this.blueprint3d.model.floorplan;
  }

  /**
   * Get rooms
   */
  getRooms(): any[] {
    this.ensureInitialized();
    return this.blueprint3d.model.floorplan.getRooms();
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get raw Blueprint3D instance (use sparingly)
   */
  getInstance(): any {
    return this.blueprint3d;
  }

  /**
   * Ensure Blueprint3D is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Blueprint3D not initialized. Call initialize() first.');
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.blueprint3d) {
      // Remove all listeners
      this.removeAllListeners();
      this.isInitialized = false;
    }
  }
}
