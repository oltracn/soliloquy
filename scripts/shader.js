// 独白 (Soliloquy) — WebGL 渐进水流 Shader (背景呈主题色淡色渲染)
// 专一保留【渐进水流】动画，背景微带选中主题原色，无纯白，无浅色淡味

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec3 u_theme_color;

  float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  #define NUM_OCTAVES 5

  float fbm (in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(10.0);
    mat2 rot = mat2(cos(0.5), sin(0.3), -sin(0.5), cos(0.5));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
      v += a * noise(_st);
      _st = rot * _st * 2.0 + shift;
      a *= 0.6;
    }
    return v;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= 1.6;

    // Fluid Stream directional domain warping vectors
    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.02 * u_time);
    q.y = fbm(st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.035 * u_time);
    r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.035 * u_time);

    // Pure paper base color
    vec3 paperBase = vec3(0.988, 0.987, 0.984);

    // Background is subtly tinted with 5.5% wash of the selected theme color (不适用纯白，带选中颜色)
    vec3 tintedBg = mix(paperBase, u_theme_color, 0.055);

    // Fluid stream stream density calculation
    float stream = smoothstep(0.28, 0.76, fbm(st + vec2(u_time * 0.065, 0.0) + r));
    float density = clamp(stream * 0.68, 0.0, 0.72);

    // Vertical position: 0.0 at bottom of viewport, 1.0 at top of viewport
    float v_pos = gl_FragCoord.y / u_resolution.y;

    // Bottom-to-top gradient fade mask (页面 52% 高度自下而上渐变融入背景)
    float fadeMask = smoothstep(0.52, 0.05, v_pos);
    density *= fadeMask;

    // Mix tinted background paper with pure selected theme color fluid stream
    vec3 finalColor = mix(tintedBg, u_theme_color, density);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class WaterShader {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { alpha: false, antialias: true }) || 
              canvas.getContext('experimental-webgl', { alpha: false, antialias: true });
    
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    this.startTime = Date.now();
    this.isAnimating = true;
    this.themeColorRGB = [0.19, 0.23, 0.21]; // Default theme color
    this.mouse = [0.5, 0.5];

    this.initShaders();
    this.initBuffers();
    this.setupListeners();
    this.resize();
    this.render();
  }

  hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return [
      ((num >> 16) & 255) / 255.0,
      ((num >> 8) & 255) / 255.0,
      (num & 255) / 255.0
    ];
  }

  setThemeColor(hexColor) {
    this.themeColorRGB = this.hexToRgb(hexColor);
  }

  setAnimationState(enabled) {
    this.isAnimating = enabled;
  }

  initShaders() {
    const gl = this.gl;

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertexShaderSource);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragmentShaderSource);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compile error:', gl.getShaderInfoLog(fragShader));
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertShader);
    gl.attachShader(this.program, fragShader);
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    // Uniform locations
    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution');
    this.uTime = gl.getUniformLocation(this.program, 'u_time');
    this.uMouse = gl.getUniformLocation(this.program, 'u_mouse');
    this.uThemeColor = gl.getUniformLocation(this.program, 'u_theme_color');

    this.aPosition = gl.getAttribLocation(this.program, 'a_position');
  }

  initBuffers() {
    const gl = this.gl;
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Full screen quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, 0, 0);
  }

  setupListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse[0] = e.clientX / window.innerWidth;
      this.mouse[1] = 1.0 - (e.clientY / window.innerHeight);
    });
  }

  resize() {
    if (!this.gl) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  render() {
    if (!this.gl) return;

    if (this.isAnimating) {
      const gl = this.gl;
      const elapsedTime = (Date.now() - this.startTime) / 1000.0;

      gl.useProgram(this.program);
      gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTime, elapsedTime);
      gl.uniform2f(this.uMouse, this.mouse[0], this.mouse[1]);
      gl.uniform3fv(this.uThemeColor, this.themeColorRGB);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    requestAnimationFrame(() => this.render());
  }
}
