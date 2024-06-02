export const bgVertShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0, 1);
  }
`;

export const bgFragShaderSource = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform float aspectRatio;

uniform float u_height;  // Height up the modular form
uniform float u_phase;   // Phase shift along the modular form
uniform vec2 u_resolution; // Resolution of the window
uniform sampler2D u_jthetaTexture;  // Precomputed jtheta data

const float pi = 3.1415926535897932384626433832795;

// Fetch the jtheta value from the precomputed texture
vec4 fetchJtheta(float q) {
  return texture2D(u_jthetaTexture, vec2(q, 0.5));
}

// Approximate theta functions using precomputed data
float jtheta(float n, float z, float q) {
    float sum = 0.0;
    for (int k = -50; k <= 50; k++) {
        float t = float(k);
        sum += pow(q, t*t) * cos(2.0 * pi * t * z);
    }
    return sum;
}

// Adjust g2 and g3 based on height (modular scaling in Z direction)
void adjust_g2_g3(inout vec2 g2, inout vec2 g3, float height) {
    float scale = exp(height);
    g2 *= scale;
    g3 *= scale;
}

// Weierstrass P-function with tau
vec2 wp_from_tau(vec2 z, vec2 tau, vec2 g2, vec2 g3) {
    float q = exp(2.0 * pi * tau.y);
    vec4 jthetaValues = fetchJtheta(q);
    float j2 = jthetaValues.y;
    float j3 = jthetaValues.z;
    float j4 = jthetaValues.w;

    float term1 = pi * j2 * j3 * jtheta(4.0, pi * z.x, q) / jtheta(1.0, pi * z.x, q);
    float term2 = pi * pi * (j2 * j2 * j2 * j2 + j3 * j3 * j3 * j3) / 3.0;

    return vec2(term1 * term1 - term2, 0.0);
}

void main() {
    vec2 adjustedPosition = (vUv - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
    vec2 z = adjustedPosition * 2.0 - 1.0;  // Convert to range -1 to 1
    
    // Initial g2 and g3 values
    vec2 g2 = vec2(1.0, 1.0);
    vec2 g3 = vec2(1.0, -1.0);
    
    // Adjust g2 and g3 based on height
    adjust_g2_g3(g2, g3, u_height);
    
    // Encode height and phase into the complex parameter
    vec2 tau = vec2(u_height, u_phase);
    
    // Calculate the Weierstrass P-function at the given point
    vec2 wp = wp_from_tau(z + tau, tau, g2, g3);
    
    // Get the phase (argument) of the complex value
    float phase = atan(wp.y, wp.x);
    
    // Normalize the phase to the range 0 to 1
    float normalizedPhase = (phase + pi) / (2.0 * pi);
    
    // Map the normalized phase to RGB values
    vec3 color = vec3(normalizedPhase, sin(normalizedPhase * 2.0 * pi), cos(normalizedPhase * 2.0 * pi));
    
    gl_FragColor = vec4(color, 1.0);
}
`;
