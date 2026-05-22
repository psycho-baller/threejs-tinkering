export const simulationVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
uniform sampler2D uCurrentPosition;
uniform sampler2D uTargetPosition;
uniform float uTime;
uniform float uDeltaTime;
uniform float uNoiseStrength;
uniform float uNoiseFrequency;
uniform float uReturnSpeed;
uniform float uInteractionRadius;
uniform vec3 uMousePos;
uniform float uMouseStrength;
uniform float uChaos;
uniform float uStandoutRatio;
varying vec2 vUv;

// ashima-arts 3D simplex noise function
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;      // Really 3.0 * C.xxx = 3.0*1/6 = 0.5

  // Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points project uniformly to a line, dN=7)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // j mod N

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 snoiseVec3( vec3 x ){
  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1, x.z + 33.4, x.x + 5.2 ));
  float s2 = snoise(vec3( x.z + 74.2, x.x - 124.5, x.y + 99.4 ));
  vec3 c = vec3( s, s1, s2 );
  return c;
}

// Curl noise computes the rotation/curl of a 3D simplex field to create dynamic fluid swirls
vec3 curlNoise( vec3 p ){
  const float e = .1;
  vec3 dx = vec3( e, 0.0, 0.0 );
  vec3 dy = vec3( 0.0, e, 0.0 );
  vec3 dz = vec3( 0.0, 0.0, e );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x, y, z ) * divisor );
}

void main() {
  vec4 currentData = texture2D(uCurrentPosition, vUv);
  vec3 pos = currentData.xyz;
  
  // High-precision standout checking based on row ratios (v-coordinate)
  // Our standout figure is Figure 0, which sits in rows 0 to 127 out of 1024, i.e., vUv.y < 0.125
  bool standout = vUv.y < uStandoutRatio;

  // Retrieve base static shape target position in 3D
  vec3 crowdTarget = texture2D(uTargetPosition, vUv).xyz;

  // Generate an alternate Cosmic Vortex motion target
  float angle = atan(pos.z, pos.x);

  // Dynamic vortex spiral calculations
  // Vortex target radius depends slightly on particles to create thickness
  float vortexTargetRadius = 1.6 + 0.9 * sin(pos.y * 0.8 + uTime * 0.3) + fract(vUv.x * 23.4) * 0.7;
  // Add angular velocity
  float vortexTargetAngle = angle + uDeltaTime * (standout ? 2.5 : 1.25) + pos.y * 0.35;
  // Slowly carry particles upward
  float vortexTargetY = pos.y + uDeltaTime * (standout ? 1.4 : 0.7);
  
  // Respawn looping inside the cylinder vortex when exiting boundary
  if (vortexTargetY > 4.5) {
    vortexTargetY = -1.5 + fract(vUv.y * 455.4) * 1.0;
    // slightly randomize radius on loop
    vortexTargetRadius = 1.0 + fract(vUv.x * 883.3) * 1.5;
  }

  vec3 vortexTarget = vec3(
    cos(vortexTargetAngle) * vortexTargetRadius,
    vortexTargetY,
    sin(vortexTargetAngle) * vortexTargetRadius
  );

  // Blend target based on chaos (0.0: strict figures, 1.0: cosmic vortex cascade)
  vec3 finalTarget = mix(crowdTarget, vortexTarget, uChaos);

  // Force vectors compilation
  vec3 force = vec3(0.0);

  // Force A: Target Snapping
  // Standout figures snap harder and faster to keep clean visual definition
  vec3 toTarget = finalTarget - pos;
  float snapStrength = standout ? uReturnSpeed * 1.8 : uReturnSpeed;
  force += toTarget * snapStrength;

  // Force B: Ambient / Turbulent GPU Curl Noise 
  // Standout figure displays higher frequency energy and speed
  float noiseFreq = standout ? uNoiseFrequency * 1.7 : uNoiseFrequency;
  float noiseStr = standout ? uNoiseStrength * 1.6 : uNoiseStrength;

  // Modulate curl noise slightly over time
  vec3 curlPos = pos * noiseFreq;
  curlPos.y += uTime * 0.15;
  
  vec3 turbulence = curlNoise(curlPos);
  force += turbulence * noiseStr;

  // Force C: Interactive mouse cursor reaction pushing particles
  vec3 toMouse = pos - uMousePos;
  float distToMouse = length(toMouse);
  if (distToMouse < uInteractionRadius && distToMouse > 0.001) {
    float strengthFactor = (1.0 - (distToMouse / uInteractionRadius));
    // Soft easing curve
    strengthFactor = strengthFactor * strengthFactor;
    
    // Push away from cursor
    force += normalize(toMouse) * strengthFactor * uMouseStrength;
  }

  // Constrain extreme speeds to prevent coordinates from expanding to infinity
  float maxSpeed = standout ? 18.0 : 12.0;
  float forceLen = length(force);
  if (forceLen > maxSpeed) {
    force = (force / forceLen) * maxSpeed;
  }

  // Position update equation: P_new = P_old + velocity * delta_t
  vec3 nextPos = pos + force * uDeltaTime;

  // Store position and standout state tag in Alpha channel
  gl_FragColor = vec4(nextPos, standout ? 1.0 : 0.0);
}
`;
