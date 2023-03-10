import * as THREE from "three";
const { BackSide, Color, Face3, Mesh, ShaderMaterial } = THREE;

const fragmentShader = `
uniform vec3 color;
uniform float coefficient;
uniform float power;
varying vec3 vVertexNormal;
varying vec3 vVertexWorldPosition;
void main() {
  vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
  vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;
  viewCameraToVertex = normalize(viewCameraToVertex);
  float intensity	= pow(
    coefficient + dot(vVertexNormal, viewCameraToVertex),
    power
  );
  gl_FragColor = vec4(color, intensity);
}`;

const vertexShader = `
varying vec3 vVertexWorldPosition;
varying vec3 vVertexNormal;
void main() {
  vVertexNormal	= normalize(normalMatrix * normal);
  vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const defaultOptions = {
  backside: true,
  coefficient: 0.5,
  color: "gold",
  size: 2,
  power: 1,
};
 
export function createGlowMaterial(coefficient, color, power) {
  return new ShaderMaterial({
    depthWrite: true,
    fragmentShader,
    transparent: true,
    uniforms: {
      coefficient: {
        value: coefficient,
      },
      color: {
        value: new Color(color),
      },
      power: {
        value: power,
      },
    },
    vertexShader,
  });
}

export function createGlowGeometry(geometry, size) {
  // Gather vertexNormals from geometry.faces
  const glowGeometry = geometry.clone();
  const vertexNormals = new Array(glowGeometry?.vertices?.length || 0);
  glowGeometry.faces.forEach((face) => {
    if (face instanceof Face3) {
      vertexNormals[face.a] = face.vertexNormals[0];
      vertexNormals[face.b] = face.vertexNormals[1];
      vertexNormals[face.c] = face.vertexNormals[2];
    } else {
      console.error("Face needs to be an instance of THREE.Face3.");
    }
  });

  // Modify the vertices according to vertexNormal
  glowGeometry.vertices.forEach((vertex, i) => {
    const { x, y, z } = vertexNormals[i];
    vertex.x += x * size;
    vertex.y += y * size;
    vertex.z += z * size;
  });

  return glowGeometry;
}

export function createGlowMesh(geometry, options = defaultOptions) {
  const { backside, coefficient, color, size, power } = options;

  const glowGeometry = createGlowGeometry(geometry, size);
  const glowMaterial = createGlowMaterial(coefficient, color, power);
  if (backside) {
    glowMaterial.side = BackSide;
  }

  return new Mesh(glowGeometry, glowMaterial);
}
