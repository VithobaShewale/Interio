import * as THREE from 'three';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.join(__dirname, 'example', 'models', 'js');
const OUTPUT_DIR = path.join(__dirname, 'example', 'models', 'obj');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Parse face data from Three.js JSON format
 */
function parseFace(faceArray, offset) {
  const faceType = faceArray[offset];
  let index = offset + 1;
  
  // Decode face type flags
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

/**
 * Export geometry to OBJ format
 */
function exportToOBJ(modelData, materials, modelName) {
  const vertexArray = modelData.vertices || [];
  const normalArray = modelData.normals || [];
  const uvLayers = modelData.uvs || [];
  const uvArray = uvLayers[0] || [];
  const faceArray = modelData.faces || [];
  
  let objContent = `# OBJ file: ${modelName}\n`;
  objContent += `# Converted from Three.js JSON format\n\n`;
  objContent += `mtllib ${modelName}.mtl\n\n`;
  
  // Write vertices
  objContent += `# Vertices\n`;
  for (let i = 0; i < vertexArray.length; i += 3) {
    objContent += `v ${vertexArray[i]} ${vertexArray[i + 1]} ${vertexArray[i + 2]}\n`;
  }
  objContent += `\n`;
  
  // Write UVs
  if (uvArray.length > 0) {
    objContent += `# Texture coordinates\n`;
    for (let i = 0; i < uvArray.length; i += 2) {
      // Flip V coordinate for OBJ format
      objContent += `vt ${uvArray[i]} ${1.0 - uvArray[i + 1]}\n`;
    }
    objContent += `\n`;
  }
  
  // Write normals
  if (normalArray.length > 0) {
    objContent += `# Normals\n`;
    for (let i = 0; i < normalArray.length; i += 3) {
      objContent += `vn ${normalArray[i]} ${normalArray[i + 1]} ${normalArray[i + 2]}\n`;
    }
    objContent += `\n`;
  }
  
  // Write faces grouped by material
  objContent += `# Faces\n`;
  let offset = 0;
  let currentMaterial = -1;
  
  while (offset < faceArray.length) {
    const face = parseFace(faceArray, offset);
    
    // Switch material if needed
    if (face.materialIndex !== currentMaterial) {
      currentMaterial = face.materialIndex;
      const matName = materials[currentMaterial]?.DbgName || `material_${currentMaterial}`;
      objContent += `usemtl ${matName}\n`;
    }
    
    // Write face (OBJ indices start at 1)
    const writeFace = (v1, v2, v3) => {
      const v1Idx = face.vertices[v1] + 1;
      const v2Idx = face.vertices[v2] + 1;
      const v3Idx = face.vertices[v3] + 1;
      
      let faceStr = 'f';
      
      for (let i = 0; i < 3; i++) {
        const vIdx = [v1Idx, v2Idx, v3Idx][i];
        const vtIdx = face.uvIndices.length > 0 ? face.uvIndices[[v1, v2, v3][i]] + 1 : '';
        const vnIdx = face.normalIndices.length > 0 ? face.normalIndices[[v1, v2, v3][i]] + 1 : '';
        
        faceStr += ` ${vIdx}`;
        if (vtIdx || vnIdx) {
          faceStr += `/${vtIdx || ''}`;
          if (vnIdx) {
            faceStr += `/${vnIdx}`;
          }
        }
      }
      
      objContent += faceStr + '\n';
    };
    
    // Convert quad to two triangles
    if (face.isQuad) {
      writeFace(0, 1, 2);
      writeFace(0, 2, 3);
    } else {
      writeFace(0, 1, 2);
    }
    
    offset = face.nextOffset;
  }
  
  return objContent;
}

/**
 * Create MTL file
 */
function createMTL(materials, modelName) {
  let mtlContent = `# MTL file: ${modelName}\n`;
  mtlContent += `# Converted from Three.js JSON format\n\n`;
  
  materials.forEach((mat, idx) => {
    const matName = mat.DbgName || `material_${idx}`;
    mtlContent += `newmtl ${matName}\n`;
    
    // Diffuse color
    if (mat.colorDiffuse) {
      const [r, g, b] = mat.colorDiffuse;
      mtlContent += `Kd ${r} ${g} ${b}\n`;
    }
    
    // Ambient color
    if (mat.colorAmbient) {
      const [r, g, b] = mat.colorAmbient;
      mtlContent += `Ka ${r} ${g} ${b}\n`;
    }
    
    // Specular color
    if (mat.colorSpecular) {
      const [r, g, b] = mat.colorSpecular;
      mtlContent += `Ks ${r} ${g} ${b}\n`;
    }
    
    // Specular exponent
    if (mat.specularCoef !== undefined) {
      mtlContent += `Ns ${mat.specularCoef}\n`;
    }
    
    // Transparency
    if (mat.transparency !== undefined) {
      mtlContent += `d ${mat.transparency}\n`;
    }
    
    // Diffuse texture map
    if (mat.mapDiffuse) {
      mtlContent += `map_Kd ${mat.mapDiffuse}\n`;
    }
    
    mtlContent += `\n`;
  });
  
  return mtlContent;
}

/**
 * Load and convert a model
 */
function convertModel(filePath) {
  const modelName = path.basename(filePath, '.js');
  console.log(`\nProcessing: ${modelName}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract JSON from variable assignment
    let modelData;
    try {
      modelData = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/=\s*({[\s\S]*})\s*;?\s*$/);
      if (!jsonMatch) {
        console.error('  ✗ Could not extract JSON from file');
        return false;
      }
      modelData = JSON.parse(jsonMatch[1]);
    }
    
    const materials = modelData.materials || [{ DbgName: 'default' }];
    
    console.log(`  - Vertices: ${(modelData.vertices?.length || 0) / 3}`);
    console.log(`  - Materials: ${materials.length}`);
    
    // Export OBJ
    const objContent = exportToOBJ(modelData, materials, modelName);
    const objPath = path.join(OUTPUT_DIR, `${modelName}.obj`);
    fs.writeFileSync(objPath, objContent);
    console.log(`  ✓ Exported OBJ: ${modelName}.obj`);
    
    // Export MTL
    const mtlContent = createMTL(materials, modelName);
    const mtlPath = path.join(OUTPUT_DIR, `${modelName}.mtl`);
    fs.writeFileSync(mtlPath, mtlContent);
    console.log(`  ✓ Exported MTL: ${modelName}.mtl`);
    
    // Copy textures
    materials.forEach(mat => {
      if (mat.mapDiffuse) {
        const texturePath = path.join(INPUT_DIR, mat.mapDiffuse);
        const destPath = path.join(OUTPUT_DIR, mat.mapDiffuse);
        
        if (fs.existsSync(texturePath)) {
          fs.copyFileSync(texturePath, destPath);
          console.log(`  ✓ Copied texture: ${mat.mapDiffuse}`);
        } else {
          console.log(`  - Texture not found: ${mat.mapDiffuse}`);
        }
      }
    });
    
    return true;
    
  } catch (error) {
    console.error(`  ✗ Error:`, error.message);
    return false;
  }
}

/**
 * Main conversion process
 */
async function convertAllModels() {
  console.log('='.repeat(60));
  console.log('Three.js Model Converter: JSON → OBJ');
  console.log('='.repeat(60));
  
  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();
  
  console.log(`\nFound ${files.length} model files to convert\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    if (convertModel(inputPath)) {
      successCount++;
    } else {
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
