export const bgVertShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    // vUv = position * 20.5 + 20.5;
    vUv = position * 1.0 + 0.15;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const bgFragShaderSource = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform float aspectRatio;
uniform float u_height;  
uniform float u_phase;   
uniform vec2 u_resolution;
uniform vec2 u_lattice[121];  // Precomputed lattice points

const float pi = 3.1415926535897932384626433832795;

vec2 complex_div(vec2 a, vec2 b) {
    float denom = b.x * b.x + b.y * b.y;
    return vec2((a.x * b.x + a.y * b.y) / denom, (a.y * b.x - a.x * b.y) / denom);
}

vec2 complex_add(vec2 a, vec2 b) {
    return vec2(a.x + b.x, a.y + b.y);
}

vec2 complex_sub(vec2 a, vec2 b) {
    return vec2(a.x - b.x, a.y - b.y);
}

vec2 complex_mult(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

// Weierstrass P-function
vec2 weierstrass_wp(vec2 z, vec2 omega1, vec2 omega2, int terms) {
    vec2 wp_value = vec2(0.0, 0.0);
    for (int i = 0; i < 121; i++) {
        vec2 lam = u_lattice[i];
        vec2 z_minus_lam = complex_sub(z, lam) ;
        vec2 term1 = complex_div(vec2(1.0, 0.0), complex_mult(z_minus_lam, z_minus_lam));
        vec2 term2 = complex_div(vec2(1.0, 0.0), complex_mult(lam, lam));
        wp_value = complex_add(wp_value, complex_sub(term1, term2));
    }

    if (z.x != 0.0 || z.y != 0.0) {
        vec2 term = complex_div(vec2(1.0, 0.0), complex_mult(z, z));
        wp_value = complex_add(wp_value, term) ;
    }

    return wp_value ;
}

void main() {
    vec2 adjustedPosition = (vUv - 0.5) * vec2(aspectRatio, 1.0) + 0.5;
    vec2 z = adjustedPosition * 2.0 - 1.0;  // Convert to range -1 to 1
    
    vec2 omega1 = vec2(1.0, 0.0);
    vec2 omega2 = vec2(cos(2.0 * pi / 3.0), sin(2.0 * pi / 3.0));
    
    // Calculate the Weierstrass P-function at the given point
    vec2 wp = weierstrass_wp(z, omega1, omega2, 6);

    // Get magnitude of the complex value
    float magnitude = length(wp) * 0.01;
    
    // Get the phase (argument) of the complex value
    float phase = atan(wp.y + u_height * pi * 2.0, wp.x + u_phase * pi * 2.0);
    
    // Map the normalized phase to RGB values
    vec3 color = vec3(magnitude - (phase * 4.0 * pi), magnitude - sin(phase * 4.0 * pi), magnitude - cos(phase * 4.0 * pi));
    
    gl_FragColor = vec4(color, 1.0);
}
`;
