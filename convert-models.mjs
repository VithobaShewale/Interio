/**
 * Model Converter: Three.js r69 JSON → GLTF/GLB
 * Converts old Three.js JSON models to modern GLTF format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Blob } from 'buffer';
import * as THREE from 'three-latest';
import { GLTFExporter } from 'three-latest/examples/jsm/exporters/GLTFExporter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Polyfill Blob and FileReader for Node.js
global.Blob = Blob;

// Simple FileReader polyfill for Node.js
global.FileReader = class FileReader {
  readAsArrayBuffer(blob) {
    setTimeout(() => {
      if (blob.arrayBuffer) {
        blob.arrayBuffer().then(buffer => {
          this.result = buffer;
          if (this.onloadend) this.onloadend();
        });
      } else {
        // For Buffer-based blobs
        this.result = blob;
        if (this.onloadend) this.onloadend();
      }
    }, 0);
  }
  
  readAsDataURL(blob) {
    setTimeout(() => {
      if (blob.arrayBuffer) {
        blob.arrayBuffer().then(buffer => {
          const base64 = Buffer.from(buffer).toString('base64');
          this.result = `data:application/octet-stream;base64,${base64}`;
          if (this.onloadend) this.onloadend();
        });
      } else if (Buffer.isBuffer(blob)) {
        const base64 = blob.toString('base64');
        this.result = `data:application/octet-stream;base64,${base64}`;
        if (this.onloadend) this.onloadend();
      }
    }, 0);
  }
};

const INPUT_DIR = path.join(__dirname, 'example', 'models', 'js');
const OUTPUT_DIR = path.join(__dirname, 'example', 'models', 'gltf');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert old THREE.Geometry JSON format to modern BufferGeometry
 */
function parseFace(faceArray, offset) {
  const faceType = faceArray[offset];
  let index = offset + 1;
  
  // Decode face type flags (Three.js JSON format)
  const isQuad = (faceType & 1) === 1;
  const hasMaterial = (faceType & 2) === 2;
  const hasFaceUv = (faceType & 4) === 4;
  const hasFaceVertexUv = (faceType & 8) === 8;
  const hasFaceNormal = (faceType & 16) === 16;
  const hasFaceVertexNormal = (faceType & 32) === 32;
  const hasFaceColor = (faceType & 64) === 64;
  const hasFaceVertexColor = (faceType & 128) === 128;
  
  const numVertices = isQuad ? 4 : 3;
  
  // Read vertex indices
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    vertices.push(faceArray[index++]);
  }
  
  // Read material index
  let materialIndex = 0;
  if (hasMaterial) {
    materialIndex = faceArray[index++];
  }
  
  // Read UV indices
  const uvIndices = [];
  if (hasFaceUv) index++;
  if (hasFaceVertexUv) {
    for (let i = 0; i < numVertices; i++) {
      uvIndices.push(faceArray[index++]);
    }
  }
  
  // Read normal indices
  const normalIndices = [];
  if (hasFaceNormal) index++;
  if (hasFaceVertexNormal) {
    for (let i = 0; i < numVertices; i++) {
      normalIndices.push(faceArray[index++]);
    }
  }
  
  // Skip colors
  if (hasFaceColor) index++;
  if (hasFaceVertexColor) index += numVertices;
  
  return { vertices, uvIndices, normalIndices, materialIndex, isQuad, nextOffset: index };
}

function convertGeometry(legacyGeometry) {
  const geometry = new THREE.BufferGeometry();

  // Source data
  const srcVertices = legacyGeometry.vertices || [];
  const srcNormals = legacyGeometry.normals || [];
  const uvLayers = legacyGeometry.uvs || [];
  const srcUvs = uvLayers[0] || [];
  const faceArray = legacyGeometry.faces || [];

  console.log(`    Source: ${srcVertices.length / 3} vertices, ${srcNormals.length / 3} normals, ${srcUvs.length / 2} uvs`);

  // Parse all faces first
  const faces = [];
  let offset = 0;
  while (offset < faceArray.length) {
    const face = parseFace(faceArray, offset);
    faces.push(face);
    offset = face.nextOffset;
  }

  // Unroll geometry: create separate vertex for each face-vertex
  // This is necessary because per-face UVs/normals require unique vertices
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const materialGroups = [];

  let vertexIndex = 0;
  let currentMaterialIndex = -1;
  let currentGroupStart = 0;
  let triangleCount = 0;

  for (const face of faces) {
    // Track material groups
    if (face.materialIndex !== currentMaterialIndex) {
      if (currentMaterialIndex !== -1) {
        materialGroups.push({
          start: currentGroupStart * 3,
          count: (triangleCount - currentGroupStart) * 3,
          materialIndex: currentMaterialIndex
        });
      }
      currentMaterialIndex = face.materialIndex;
      currentGroupStart = triangleCount;
    }

    const numVerts = face.isQuad ? 4 : 3;
    const faceVertexIndices = [];

    // Create unique vertices for this face
    for (let i = 0; i < numVerts; i++) {
      const vIdx = face.vertices[i];

      // Position
      positions.push(
        srcVertices[vIdx * 3],
        srcVertices[vIdx * 3 + 1],
        srcVertices[vIdx * 3 + 2]
      );

      // Normal
      if (srcNormals.length > 0 && face.normalIndices.length > i) {
        const nIdx = face.normalIndices[i];
        normals.push(
          srcNormals[nIdx * 3],
          srcNormals[nIdx * 3 + 1],
          srcNormals[nIdx * 3 + 2]
        );
      } else {
        normals.push(0, 1, 0); // Default up normal
      }

      // UV - flip V coordinate (Three.js legacy uses top-left origin, GLTF uses bottom-left)
      if (srcUvs.length > 0 && face.uvIndices.length > i) {
        const uvIdx = face.uvIndices[i];
        uvs.push(
          srcUvs[uvIdx * 2],
          1.0 - srcUvs[uvIdx * 2 + 1]  // Flip V for GLTF
        );
      } else {
        uvs.push(0, 0);
      }

      faceVertexIndices.push(vertexIndex++);
    }

    // Create triangles
    if (face.isQuad) {
      // Quad -> 2 triangles
      indices.push(faceVertexIndices[0], faceVertexIndices[1], faceVertexIndices[2]);
      indices.push(faceVertexIndices[0], faceVertexIndices[2], faceVertexIndices[3]);
      triangleCount += 2;
    } else {
      // Triangle
      indices.push(faceVertexIndices[0], faceVertexIndices[1], faceVertexIndices[2]);
      triangleCount++;
    }
  }

  // Add final material group
  if (currentMaterialIndex !== -1) {
    materialGroups.push({
      start: currentGroupStart * 3,
      count: (triangleCount - currentGroupStart) * 3,
      materialIndex: currentMaterialIndex
    });
  }

  // Set geometry attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(normals), 3));

  if (srcUvs.length > 0) {
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uvs), 2));
  }

  geometry.setIndex(indices);

  // Add material groups
  if (materialGroups.length > 0) {
    materialGroups.forEach(group => {
      geometry.addGroup(group.start, group.count, group.materialIndex);
    });
  }

  geometry.computeBoundingSphere();

  console.log(`    Output: ${positions.length / 3} vertices, ${triangleCount} triangles, ${materialGroups.length} material groups`);

  return geometry;
}

/**
 * Convert old material format to modern material
 */
function convertMaterial(legacyMaterial, modelName, textureFileName) {
  const material = new THREE.MeshStandardMaterial({
    metalness: 0,    // Non-metallic for most furniture
    roughness: 1     // Fully rough (no specular highlights)
  });
  
  if (legacyMaterial.colorDiffuse) {
    const [r, g, b] = legacyMaterial.colorDiffuse;
    material.color = new THREE.Color(r, g, b);
  }
  
  if (legacyMaterial.colorEmissive) {
    const [r, g, b] = legacyMaterial.colorEmissive;
    material.emissive = new THREE.Color(r, g, b);
  }
  
  if (legacyMaterial.transparency !== undefined) {
    material.opacity = legacyMaterial.transparency;
    if (legacyMaterial.transparency < 1) {
      material.transparent = true;
    }
  }
  
  // Store texture reference for later use in GLTF export
  if (legacyMaterial.mapDiffuse) {
    console.log('  - Material has texture:', legacyMaterial.mapDiffuse);
    
    // Create a basic texture with the filename
    // The actual image will be copied separately
    const texture = new THREE.Texture();
    texture.name = legacyMaterial.mapDiffuse;
    
    // Baked textures should use clamp wrapping (no repeat)
    const isBakedTexture = legacyMaterial.mapDiffuse.includes('_baked');
    const defaultWrap = isBakedTexture ? ['clamp', 'clamp'] : ['repeat', 'repeat'];
    
    // Store texture metadata
    texture.userData = {
      fileName: legacyMaterial.mapDiffuse,
      wrap: isBakedTexture ? defaultWrap : (legacyMaterial.mapDiffuseWrap || defaultWrap)
    };
    
    material.map = texture;
    material.needsUpdate = true;
  }
  
  if (legacyMaterial.DbgName) {
    material.name = legacyMaterial.DbgName;
  }
  
  return material;
}

/**
 * Load and parse legacy Three.js JSON model
 */
function loadLegacyModel(filePath) {
  console.log(`\nProcessing: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Try to parse as pure JSON first
    let modelData;
    try {
      modelData = JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from variable assignment (format: "geometry = {...}")
      const jsonMatch = content.match(/=\s*({[\s\S]*})\s*;?\s*$/);
      if (!jsonMatch) {
        console.error('  ✗ Could not extract JSON from file');
        return null;
      }
      modelData = JSON.parse(jsonMatch[1]);
    }
    console.log(`  - Found model with ${modelData.vertices?.length || 0} vertices, ${modelData.faces?.length || 0} faces`);
    
    // Convert geometry
    const geometry = convertGeometry(modelData);
    
    // Convert materials
    const modelName = path.basename(filePath, '.js');
    let materials = [];
    if (modelData.materials && Array.isArray(modelData.materials)) {
      materials = modelData.materials.map(m => convertMaterial(m, modelName));
      console.log(`  - Converted ${materials.length} materials`);
    } else {
      materials = [new THREE.MeshStandardMaterial({ color: 0xcccccc })];
    }
    
    // Create mesh
    const mesh = new THREE.Mesh(
      geometry,
      materials.length === 1 ? materials[0] : materials
    );
    
    mesh.name = path.basename(filePath, '.js');
    
    return mesh;
    
  } catch (error) {
    console.error(`  ✗ Error loading model:`, error.message);
    return null;
  }
}

/**
 * Export mesh to GLTF/GLB format
 */
async function exportToGLTF(mesh, outputPath, binary = true) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    
    // Store texture info before export
    const textureInfo = [];
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const savedMaps = []; // Store original maps
    
    materials.forEach((mat, idx) => {
      if (mat.map && mat.map.userData && mat.map.userData.fileName) {
        textureInfo.push({
          materialIndex: idx,
          fileName: mat.map.userData.fileName,
          wrap: mat.map.userData.wrap
        });
        savedMaps.push(mat.map); // Save the map
        mat.map = null; // Temporarily remove to prevent exporter error
      } else {
        savedMaps.push(null);
      }
    });
    
    exporter.parse(
      mesh,
      (result) => {
        // Restore maps after export
        materials.forEach((mat, idx) => {
          if (savedMaps[idx]) {
            mat.map = savedMaps[idx];
          }
        });
        try {
          if (binary) {
            // GLB format - result should be ArrayBuffer
            if (result instanceof ArrayBuffer) {
              fs.writeFileSync(outputPath, Buffer.from(result));
              console.log(`  ✓ Exported to GLB: ${path.basename(outputPath)} (${result.byteLength} bytes)`);
            } else {
              // Fallback to JSON if binary export failed
              const output = JSON.stringify(result, null, 2);
              const gltfPath = outputPath.replace('.glb', '.gltf');
              fs.writeFileSync(gltfPath, output);
              console.log(`  ✓ Exported to GLTF (fallback): ${path.basename(gltfPath)}`);
            }
          } else {
            // GLTF format - manually add texture references
            if (textureInfo.length > 0) {
              // Ensure arrays exist
              if (!result.images) result.images = [];
              if (!result.textures) result.textures = [];
              if (!result.samplers) result.samplers = [];
              
              // Helper to convert wrap mode
              const getWrapMode = (wrap) => {
                if (wrap === 'clamp' || wrap === 'clampToEdge') return 33071; // CLAMP_TO_EDGE
                return 10497; // REPEAT (default)
              };
              
              // Create samplers based on wrap settings
              const samplerMap = new Map(); // wrapKey -> samplerIndex
              
              // Add images and textures
              const imageMap = new Map(); // fileName -> imageIndex
              
              textureInfo.forEach(info => {
                let imageIndex = imageMap.get(info.fileName);
                
                // Add image if not already added
                if (imageIndex === undefined) {
                  imageIndex = result.images.length;
                  result.images.push({
                    uri: info.fileName
                  });
                  imageMap.set(info.fileName, imageIndex);
                }
                
                // Get or create sampler for this wrap mode
                const wrapS = info.wrap ? getWrapMode(info.wrap[0]) : 33071; // Default CLAMP for baked textures
                const wrapT = info.wrap ? getWrapMode(info.wrap[1]) : 33071;
                const samplerKey = `${wrapS}_${wrapT}`;
                
                let samplerIndex = samplerMap.get(samplerKey);
                if (samplerIndex === undefined) {
                  samplerIndex = result.samplers.length;
                  result.samplers.push({
                    magFilter: 9729, // LINEAR
                    minFilter: 9987, // LINEAR_MIPMAP_LINEAR
                    wrapS: wrapS,
                    wrapT: wrapT
                  });
                  samplerMap.set(samplerKey, samplerIndex);
                }
                
                // Add texture with appropriate sampler
                const textureIndex = result.textures.length;
                result.textures.push({
                  sampler: samplerIndex,
                  source: imageIndex
                });
                
                // Link texture to material
                if (result.materials && result.materials[info.materialIndex]) {
                  if (!result.materials[info.materialIndex].pbrMetallicRoughness) {
                    result.materials[info.materialIndex].pbrMetallicRoughness = {};
                  }
                  // Ensure baseColorFactor is set (white = [1,1,1,1] to show texture as-is)
                  if (!result.materials[info.materialIndex].pbrMetallicRoughness.baseColorFactor) {
                    result.materials[info.materialIndex].pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1];
                  }
                  result.materials[info.materialIndex].pbrMetallicRoughness.baseColorTexture = {
                    index: textureIndex
                  };
                }
              });
            }
            
            const output = JSON.stringify(result, null, 2);
            fs.writeFileSync(outputPath, output);
            console.log(`  ✓ Exported to GLTF: ${path.basename(outputPath)}`);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(error);
      },
      {
        binary: binary,
        onlyVisible: true
      }
    );
  });
}

/**
 * Copy texture file if it exists
 */
function copyTexture(textureFileName, baseName) {
  if (!textureFileName) return;
  
  const sourcePath = path.join(INPUT_DIR, textureFileName);
  const destPath = path.join(OUTPUT_DIR, textureFileName);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  - Copied texture: ${textureFileName}`);
    } else {
      console.log(`  - Texture not found: ${textureFileName}`);
    }
  } catch (error) {
    console.error(`  - Error copying texture:`, error.message);
  }
}

/**
 * Main conversion process
 */
async function convertAllModels() {
  console.log('='.repeat(60));
  console.log('Three.js Model Converter: JSON → GLTF/GLB');
  console.log('='.repeat(60));
  
  // Get all .js model files
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();
  
  console.log(`\nFound ${files.length} model files to convert\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.basename(file, '.js');
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.glb`);
    
    try {
      const mesh = loadLegacyModel(inputPath);
      
      if (mesh) {
        // Export as GLTF JSON (binary GLB requires browser APIs in exporter)
        const gltfPath = path.join(OUTPUT_DIR, `${baseName}.gltf`);
        await exportToGLTF(mesh, gltfPath, false);
        
        // Copy texture files if they exist
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach(mat => {
            if (mat.map && mat.map.userData && mat.map.userData.fileName) {
              copyTexture(mat.map.userData.fileName, baseName);
            }
          });
        }
        
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`  ✗ Conversion failed:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Conversion complete!`);
  console.log(`  ✓ Success: ${successCount}`);
  console.log(`  ✗ Failed: ${errorCount}`);
  console.log(`  Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
}

// Run the converter
convertAllModels().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
