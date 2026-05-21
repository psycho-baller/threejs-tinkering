export const renderVertexShader = `
uniform sampler2D uPositionTexture;
uniform float uBaseSize;
attribute vec2 reference;
attribute float aRandomSize;
varying float vStandout;
varying vec3 vWorldPosition;

void main() {
  // Read current position data from GPGPU FBO texture
  vec4 positionData = texture2D(uPositionTexture, reference);
  vec3 particlePos = positionData.xyz;
  
  // Expose standout state and position to fragment shader
  vStandout = positionData.w;
  vWorldPosition = particlePos;

  // Standard MVP projection
  vec4 mvPosition = modelViewMatrix * vec4(particlePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Dynamic sizing based on distance to camera (perspective scaling)
  // particles closer to camera appear physically larger on screen
  float distanceSize = uBaseSize * (aRandomSize * 0.6 + 0.4);
  
  // Perspective point scaling division (mvPosition.z is negative in view space)
  gl_PointSize = distanceSize * (280.0 / -mvPosition.z);
  
  // Cap size so close-up particle blocks are avoid looking too blocky
  gl_PointSize = clamp(gl_PointSize, 1.0, 32.0);
}
`;

export const renderFragmentShader = `
varying float vStandout;
varying vec3 vWorldPosition;
uniform float uPulseTime;
uniform vec3 uAmberColor;
uniform vec3 uGoldColor;
uniform vec3 uStandoutColor;

void main() {
  // Compute elegant radial soft gradient (dist from center of point coord)
  vec2 circCoord = gl_PointCoord - vec2(0.5);
  float dist = length(circCoord);

  // Soft Gaussian-like circular decay, avoiding sharp edges
  if (dist > 0.5) {
    discard;
  }
  
  // Soft edge decay multiplier: 0 at edge (0.5), 1 at center (0.0)
  float alpha = smoothstep(0.5, 0.05, dist);

  // Compute base particle color
  // Let's create beautiful color variations: some are more amber, some are more gold
  float colorNoise = fract(vWorldPosition.x * 12.34 + vWorldPosition.y * 34.56 + vWorldPosition.z * 56.78);
  vec3 particleColor = mix(uAmberColor, uGoldColor, colorNoise);

  // Apply the "Standout Figure" highlight styling:
  // Multiply overall brightness. Raise to gold/white glowing colors.
  if (vStandout > 0.5) {
    // Elegant bright sparks that pulse slightly
    float pulse = 0.85 + 0.15 * sin(uPulseTime * 6.0 + colorNoise * 10.0);
    particleColor = mix(uGoldColor, uStandoutColor, colorNoise * 0.6) * 2.2 * pulse;
    // Standout elements are tighter and clearer
    alpha *= 1.1;
  } else {
    // Ambient crowd lights fade slightly into depth
    alpha *= 0.6;
  }

  // Final rendering output combining glow intensity and alpha blending
  gl_FragColor = vec4(particleColor, alpha);
}
`;
