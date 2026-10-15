// Gently animates the two Ma Yuan "Water" leaves in the page margins.
//
// A fixed WebGL canvas redraws the same backdrop as the static CSS version
// (gold ground, two leaves, white reading column), but samples each leaf
// through a slow, layered sine displacement so the ink lines ripple like
// moving water, and adds a soft band of gold light drifting over the crests.
//
// Progressive enhancement: if WebGL is unavailable, the margins are too narrow,
// the theme is dark, or the reader prefers reduced motion, nothing is drawn
// and the static CSS backdrop stays in place.
(function () {
  "use strict";

  var CONTENT_WIDTH = 930; // site.max_width
  var MAX_DPR = 1.5;
  var FRAME_MS = 1000 / 30;
  var LEAVES = [
    {
      src: "/assets/img/shuitu-cengbo.webp",
      aspect: 1513 / 900,
      // left = 0.19W - 19vw, top = 50vh - width / 3.36
      x: function (vw) {
        return 0.19 * CONTENT_WIDTH - 19 * vw;
      },
      yDiv: 3.36,
    },
    {
      src: "/assets/img/shuitu-yunshu.webp",
      aspect: 1670 / 900,
      // left = 6.8vw + 0.932W, top = 50vh - width / 3.71
      x: function (vw) {
        return 6.8 * vw + 0.932 * CONTENT_WIDTH;
      },
      yDiv: 3.71,
    },
  ];

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "water-flow";
  canvas.setAttribute("aria-hidden", "true");
  var gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
  if (!gl) return;

  var VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  var FRAG = [
    "precision mediump float;",
    "uniform vec2 uView;", // viewport size in CSS px
    "uniform float uDpr;",
    "uniform float uTime;",
    "uniform vec4 uRect0;", // leaf rects in CSS px: x, y, w, h
    "uniform vec4 uRect1;",
    "uniform sampler2D uTex0;",
    "uniform sampler2D uTex1;",
    "uniform float uColumn;", // half width of the white column
    "const vec3 BASE = vec3(0.980, 0.945, 0.855);",
    "vec4 leaf(sampler2D tex, vec4 r, vec2 p, float t, float phase) {",
    "  vec2 uv = (p - r.xy) / r.zw;",
    "  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return vec4(0.);",
    // layered ripples: long slow swells plus finer, faster chop
    "  float s = sin(uv.y * 9.0 + t * 0.55 + phase) * 0.0045",
    "          + sin(uv.y * 23.0 - t * 0.9 + uv.x * 4.0) * 0.0018;",
    "  float u = sin(uv.x * 7.0 + t * 0.45 + phase) * 0.0040",
    "          + sin(uv.x * 19.0 + t * 1.1) * 0.0012;",
    "  vec4 c = texture2D(tex, clamp(uv + vec2(s, u), 0.001, 0.999));",
    // a band of gold light drifting diagonally, caught mostly by the ink
    "  float band = pow(max(0., sin(uv.x * 3.2 + uv.y * 1.6 - t * 0.35 + phase)), 14.0);",
    "  float ink = 1.0 - dot(c.rgb, vec3(0.333));",
    "  c.rgb += vec3(0.20, 0.15, 0.04) * band * (0.35 + ink);",
    "  return c;",
    "}",
    "void main() {",
    "  vec2 p = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;",
    "  vec3 col = BASE;",
    "  vec4 a = leaf(uTex0, uRect0, p, uTime, 0.0);",
    "  col = mix(col, a.rgb, a.a);",
    "  vec4 b = leaf(uTex1, uRect1, p, uTime, 1.7);",
    "  col = mix(col, b.rgb, b.a);",
    // white reading column with a 60px fade on each side
    "  float d = abs(p.x - uView.x * 0.5);",
    "  float white = 1.0 - smoothstep(uColumn + 10.0, uColumn + 70.0, d);",
    "  col = mix(col, vec3(1.0), white);",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT);
  var fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  ["uView", "uDpr", "uTime", "uRect0", "uRect1", "uTex0", "uTex1", "uColumn"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });
  gl.uniform1i(U.uTex0, 0);
  gl.uniform1i(U.uTex1, 1);
  gl.uniform1f(U.uColumn, CONTENT_WIDTH / 2);

  function loadTexture(unit, src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var tex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  var root = document.documentElement;
  var width = 0;
  var height = 0;
  var dpr = 1;

  function marginsWideEnough() {
    return window.innerWidth / 2 - CONTENT_WIDTH / 2 > 40;
  }
  function isDark() {
    return root.getAttribute("data-theme") === "dark";
  }
  function shouldRun() {
    return !document.hidden && !isDark() && marginsWideEnough();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.uView, width, height);
    gl.uniform1f(U.uDpr, dpr);
    var vw = width / 100;
    var vh = height / 100;
    var w = 110 * vw - 1.1 * CONTENT_WIDTH;
    [U.uRect0, U.uRect1].forEach(function (u, i) {
      var leafDef = LEAVES[i];
      gl.uniform4f(u, leafDef.x(vw), 50 * vh - w / leafDef.yDiv, w, w / leafDef.aspect);
    });
  }

  var start = performance.now();
  var last = 0;
  var running = false;

  function frame(now) {
    if (!running) return;
    if (now - last >= FRAME_MS) {
      last = now;
      gl.uniform1f(U.uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  }

  function update() {
    var on = shouldRun();
    root.classList.toggle("water-flow-active", on);
    if (on && !running) {
      running = true;
      resize();
      requestAnimationFrame(frame);
    } else if (!on) {
      running = false;
    }
  }

  Promise.all([loadTexture(0, LEAVES[0].src), loadTexture(1, LEAVES[1].src)])
    .then(function () {
      document.body.prepend(canvas);
      window.addEventListener("resize", function () {
        if (running) resize();
        update();
      });
      document.addEventListener("visibilitychange", update);
      reduceMotion.addEventListener("change", function () {
        if (reduceMotion.matches) {
          running = false;
          root.classList.remove("water-flow-active");
        }
      });
      new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      update();
    })
    .catch(function () {
      /* keep the static backdrop */
    });
})();
