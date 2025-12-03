/**
 * 3D Model Export Utility
 * Exports the Blueprint3D scene to OBJ or GLB format using old Three.js r69 exporters
 * Note: Blueprint3D uses Three.js r69 from window.THREE, incompatible with modern npm Three.js
 */

/**
 * Export the current Blueprint3D scene to OBJ format (simple and reliable)
 * @param blueprint3d - The Blueprint3D instance
 * @returns Promise that resolves when export is complete
 */
export const exportToOBJ = async (blueprint3d: any): Promise<void> => {
  try {
    if (!blueprint3d || !blueprint3d.model || !blueprint3d.model.scene) {
      throw new Error('Blueprint3D instance not available');
    }

    // Get the actual Three.js scene
    const threeScene = blueprint3d.model.scene.getScene();
    
    if (!threeScene) {
      throw new Error('Three.js scene not available');
    }

    console.log('Exporting scene to OBJ with', threeScene.children.length, 'children');

    // Log scene structure to understand materials/textures
    let materialCount = 0;
    let textureCount = 0;
    threeScene.traverse((child: any) => {
      if (child.material) {
        materialCount++;
        if (child.material.map) textureCount++;
        console.log('Object:', child.name, 'Material:', child.material.name, 'HasTexture:', !!child.material.map);
      }
    });
    console.log('Total materials:', materialCount, 'with textures:', textureCount);

    // Use the old Three.js OBJExporter from window.THREE (r69)
    const THREE = (window as any).THREE;
    
    if (!THREE || !THREE.OBJExporter) {
      throw new Error('THREE.OBJExporter not available. Please include OBJExporter.js');
    }

    // Create OBJ exporter
    const exporter = new THREE.OBJExporter();
    
    // Parse the scene to OBJ format (synchronous)
    const objString = exporter.parse(threeScene);
    
    console.log('OBJ generated, length:', objString.length, 'characters');
    console.log('OBJ preview (first 500 chars):', objString.substring(0, 500));
    console.log('\nNote: OBJ format does not include texture data. Textures are in Blueprint3D scene separately.');
    console.log('For textures, use GLB export or export will need MTL file generation.');

    // Create blob and download
    const blob = new Blob([objString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blueprint3d-design-${Date.now()}.obj`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('OBJ export error:', error);
    throw error;
  }
};

/**
 * Export the current Blueprint3D scene to GLB format using old Three.js GLTFExporter
 * @param blueprint3d - The Blueprint3D instance
 * @returns Promise that resolves when export is complete
 */
export const exportToGLB = async (blueprint3d: any): Promise<void> => {
  try {
    if (!blueprint3d || !blueprint3d.model || !blueprint3d.model.scene) {
      throw new Error('Blueprint3D instance not available');
    }

    // Get the actual Three.js scene from model.scene.getScene()
    const threeScene = blueprint3d.model.scene.getScene();
    
    if (!threeScene) {
      throw new Error('Three.js scene not available');
    }

    console.log('Exporting scene with', threeScene.children.length, 'children');

    // Use the old Three.js GLTFExporter from window.THREE (r69)
    const THREE = (window as any).THREE;
    
    if (!THREE || !THREE.GLTFExporter) {
      throw new Error('THREE.GLTFExporter not available. Please include GLTFExporter.js for Three.js r69');
    }

    // Create GLTF exporter using old Three.js
    const exporter = new THREE.GLTFExporter();

    // Export options for r69
    const options = {
      binary: true, // Export as GLB (binary format)
      embedImages: true,
    };

    // Export the scene
    return new Promise((resolve, reject) => {
      console.log('Starting GLTFExporter.parse with binary:true option...');
      
      try {
        exporter.parse(
          threeScene,
          (result: any) => {
            try {
              console.log('✓ Export callback invoked!');
              console.log('Export result type:', typeof result);
              console.log('Export result constructor:', result?.constructor?.name);
              console.log('Is ArrayBuffer?', result instanceof ArrayBuffer);
              
              if (result instanceof ArrayBuffer) {
                console.log('ArrayBuffer size:', result.byteLength, 'bytes');
              } else if (typeof result === 'object' && result !== null) {
                console.log('Result keys:', Object.keys(result).slice(0, 10));
                console.log('Result structure:', JSON.stringify(result, null, 2).substring(0, 500));
              }

              // Check if result is ArrayBuffer (binary GLB) or object (glTF JSON)
              let blob: Blob;
              
              if (result instanceof ArrayBuffer) {
                // Binary GLB format
                console.log('✓ Result is ArrayBuffer, size:', result.byteLength, 'bytes');
                blob = new Blob([result], { type: 'model/gltf-binary' });
              } else if (typeof result === 'object' && result !== null) {
                // JSON glTF format - convert to string
                console.log('✓ Result is JSON object, converting to string');
                const jsonString = JSON.stringify(result);
                console.log('JSON string length:', jsonString.length);
                blob = new Blob([jsonString], { type: 'model/gltf+json' });
              } else {
                console.error('✗ Unexpected export result:', result);
                throw new Error('Unexpected export result type: ' + typeof result);
              }

              console.log('Blob created, size:', blob.size, 'bytes');

            // Convert to base64 for debugging
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              console.log('GLB Base64 String (first 500 chars):', base64.substring(0, 500));
              console.log('Full Base64 length:', base64.length);
            };
            reader.readAsDataURL(blob);

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = result instanceof ArrayBuffer ? 'glb' : 'gltf';
            link.download = `blueprint3d-design-${Date.now()}.${extension}`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        (error: any) => {
          console.error('GLTFExporter parse error:', error);
          reject(error);
        },
        options
      );
      } catch (parseError) {
        console.error('Parse setup error:', parseError);
        reject(parseError);
      }
    });
  } catch (error) {
    console.error('GLB export error:', error);
    throw error;
  }
};

/**
 * Check if 3D model export is available
 * @param blueprint3d - The Blueprint3D instance
 * @returns true if export is possible
 */
export const canExport3D = (blueprint3d: any): boolean => {
  try {
    const THREE = (window as any).THREE;
    return !!(
      blueprint3d && 
      blueprint3d.model && 
      blueprint3d.model.scene &&
      blueprint3d.model.scene.getScene &&
      THREE &&
      (THREE.OBJExporter || THREE.GLTFExporter)
    );
  } catch {
    return false;
  }
};

/**
 * Check if GLB export is available
 * @param blueprint3d - The Blueprint3D instance
 * @returns true if export is possible
 */
export const canExportGLB = (blueprint3d: any): boolean => {
  try {
    const THREE = (window as any).THREE;
    return !!(
      blueprint3d && 
      blueprint3d.model && 
      blueprint3d.model.scene &&
      blueprint3d.model.scene.getScene &&
      THREE &&
      THREE.GLTFExporter
    );
  } catch {
    return false;
  }
};
