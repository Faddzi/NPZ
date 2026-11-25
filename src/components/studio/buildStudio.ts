import * as THREE from 'three';

/*
 * The NPZ studio set, built imperatively so the look matches the approved prototype exactly.
 * React Three Fiber owns the renderer, scene and frame loop; this module builds the objects and
 * moves them. Performance budget (keep it when adding to the set): one shadow-casting light,
 * shadows refreshed every other frame, reel repainted at 15 fps, about 100 draw calls.
 */

export type StudioEvents = {
  onSwitch: () => void; // a light clicks on
  onShutter: () => void; // the camera POV beat starts
  onLit: (lit: boolean) => void; // page text should switch between light-on-dark and ink-on-light
  onPov: (on: boolean) => void;
};

export type StudioFrame = { now: number; dt: number; p: number; mx: number; my: number };

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
type Switch = { want: boolean; at: number; v: number };
const sw = (): Switch => ({ want: false, at: 0, v: 0 });

export function buildStudio(
  gl: THREE.WebGLRenderer,
  scene: THREE.Scene,
  reduce: boolean,
  ev: StudioEvents,
  opts: { reels?: string[]; reelMode?: 'wall' | 'fit' } = {},
) {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.05;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  gl.shadowMap.autoUpdate = false;

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);

  const root = new THREE.Group();
  const add = (...o: THREE.Object3D[]) => root.add(...o);
  const dark = new THREE.Color(0x0b0b0c), lit = new THREE.Color(0xdcd9d2), white = new THREE.Color(0xffffff);
  scene.background = dark.clone();
  scene.fog = new THREE.Fog(0x0b0b0c, 16, 34);

  /* studio reflections: two softbox strips, a top light and a red rim, baked once */
  const envTex = (() => {
    const es = new THREE.Scene();
    es.background = new THREE.Color(0x101012);
    const L = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = (w: number, h: number, m: THREE.Material, p: [number, number, number]) => {
      const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      me.position.set(...p);
      me.lookAt(0, 0, 0);
      es.add(me);
    };
    plane(3, 6, L, [-6, 2, 2]);
    plane(3, 6, L, [6, 2, 1]);
    plane(5, 5, L, [0, 8, 0]);
    plane(2, 8, new THREE.MeshBasicMaterial({ color: 0xff3020, side: THREE.DoubleSide }), [0, 2, -7]);
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(es, 0.03).texture;
    pm.dispose();
    es.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
    return track(t);
  })();
  const glossy: (THREE.MeshStandardMaterial & { userData: { envMax?: number } })[] = [];
  const phys = (o: THREE.MeshPhysicalMaterialParameters) => {
    const m = track(new THREE.MeshPhysicalMaterial({ envMap: envTex, ...o }));
    glossy.push(m);
    return m;
  };
  const std = (o: THREE.MeshStandardMaterialParameters) => {
    const m = track(new THREE.MeshStandardMaterial({ envMap: envTex, ...o }));
    glossy.push(m);
    return m;
  };

  /* textures drawn in code */
  const canvasTex = (w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d')!, w, h);
    const t = track(new THREE.CanvasTexture(c));
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  };
  const floorTex = canvasTex(1024, 1024, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, w * 0.62);
    g.addColorStop(0, '#f4f1ea');
    g.addColorStop(0.55, '#dedad2');
    g.addColorStop(1, '#a9a59d');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  });
  const contactTex = canvasTex(256, 256, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(0,0,0,.75)');
    g.addColorStop(0.55, 'rgba(0,0,0,.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
  }, false);
  const furTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#808080';
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const v = (Math.random() * 255) | 0;
      x.strokeStyle = `rgb(${v},${v},${v})`;
      x.beginPath();
      const px = Math.random() * w, py = Math.random() * h;
      x.moveTo(px, py);
      x.lineTo(px + (Math.random() - 0.5) * 6, py + Math.random() * 7);
      x.stroke();
    }
  }, false);
  furTex.wrapS = furTex.wrapT = THREE.RepeatWrapping;
  furTex.repeat.set(3, 2);
  const ledTex = canvasTex(512, 320, (x, w, h) => {
    x.fillStyle = '#0d0d0d';
    x.fillRect(0, 0, w, h);
    for (let r = 0; r < 14; r++)
      for (let c = 0; c < 24; c++) {
        const cx = 14 + c * 20.5, cy = 14 + r * 21.5;
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, 8);
        g.addColorStop(0, '#fff8ee');
        g.addColorStop(0.5, '#f2e6d4');
        g.addColorStop(1, '#1a1a1a');
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, 8, 0, Math.PI * 2);
        x.fill();
      }
  });
  const dotTex = canvasTex(64, 64, (x) => {
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
  }, false);

  /* materials */
  const M = {
    set: track(new THREE.MeshStandardMaterial({ color: 0xffffff, map: floorTex, roughness: 0.92 })),
    wall: track(new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: 0.95, side: THREE.DoubleSide })),
    metal: std({ color: 0x1a1a1d, metalness: 0.85, roughness: 0.32 }),
    alu: std({ color: 0x9a9aa0, metalness: 0.9, roughness: 0.28 }),
    black: std({ color: 0x0b0b0c, metalness: 0, roughness: 0.6 }),
    rubber: track(new THREE.MeshStandardMaterial({ color: 0x121214, roughness: 0.9 })),
    fabric: track(new THREE.MeshStandardMaterial({ color: 0x111113, roughness: 0.95, side: THREE.DoubleSide })),
    red: std({ color: 0xd80000, metalness: 0.3, roughness: 0.35 }),
    glass: phys({ color: 0x0a0f18, metalness: 0.1, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02, reflectivity: 1 }),
    fur: track(new THREE.MeshStandardMaterial({ color: 0x2c2c30, roughness: 1, bumpMap: furTex, bumpScale: 0.02 })),
  };

  /* set: floor, infinity cove, back wall */
  const R = 3.2, WALLZ = -6.6;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 32), M.set);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = WALLZ + R + 16;
  floor.receiveShadow = true;
  const cove = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 44, 48, 1, true, Math.PI, Math.PI / 2), M.wall);
  cove.rotation.z = Math.PI / 2;
  cove.position.set(0, R, WALLZ + R);
  cove.receiveShadow = true;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 16), M.wall);
  wall.position.set(0, R + 8, WALLZ);
  wall.receiveShadow = true;
  add(floor, cove, wall);

  /* lights */
  const amb = new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.04);
  const rim = new THREE.SpotLight(0xff2a1a, 3, 22, 0.35, 0.6, 1.2);
  rim.position.set(0, 6.2, -5);
  rim.target.position.set(0, 1.3, 0);
  const key = new THREE.SpotLight(0xfff1df, 7, 16, 0.25, 0.42, 1.1);
  key.position.set(0, 7.8, 0.4);
  key.target.position.set(0, 0.5, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  add(amb, rim, rim.target, key, key.target);

  /* haze: soft light shafts */
  const hazeMat = (color: number) =>
    track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: 0 } },
        vertexShader: `varying float vAlong;varying vec3 vN;varying vec3 vV;void main(){vAlong=uv.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
        fragmentShader: `uniform vec3 uColor;uniform float uStrength;varying float vAlong;varying vec3 vN;varying vec3 vV;void main(){float edge=pow(abs(dot(vN,vV)),1.6);float along=smoothstep(0.,1.,vAlong)*0.85+0.15;gl_FragColor=vec4(uColor*uStrength*edge*along,1.);}`,
      }),
    );
  const keyBeam = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.25) * 7.3, 7.3, 48, 1, true), hazeMat(0xfff1df));
  keyBeam.position.set(0, 7.8 - 7.3 / 2, 0.4);
  add(keyBeam);

  const dustN = reduce ? 0 : 240;
  const dustPos = new Float32Array(dustN * 3), dustSeed = new Float32Array(dustN);
  for (let i = 0; i < dustN; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.6, y = 0.7 + Math.random() * 6.4;
    dustPos.set([Math.cos(a) * r * (y / 7.3), y, 0.4 + Math.sin(a) * r * (y / 7.3)], i * 3);
    dustSeed[i] = Math.random() * 100;
  }
  const dustBase = dustPos.slice();
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = track(
    new THREE.PointsMaterial({ size: 0.036, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, color: 0xfff3e4 }),
  );
  add(new THREE.Points(dustGeo, dustMat));

  /* turntable and NPZ mark */
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.7, 0.36, 64), M.black);
  base.position.y = 0.18;
  base.castShadow = base.receiveShadow = true;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.63, 1.63, 0.05, 64, 1, true), M.red);
  band.position.y = 0.3;
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.52, 0.12, 64), M.rubber);
  deck.position.y = 0.42;
  deck.receiveShadow = true;
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 5.2),
    track(new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false })),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.004;
  const turn = new THREE.Group();
  turn.position.y = 0.48;
  add(base, band, deck, contact, turn);
  {
    const black = phys({ color: 0x050506, metalness: 0, roughness: 0.5, clearcoat: 0.6, clearcoatRoughness: 0.12 });
    black.userData.envMax = 0.18;
    const red = phys({ color: 0xc80000, metalness: 0, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.1 });
    red.userData.envMax = 0.25;
    const ivory = phys({ color: 0xf3f1ec, metalness: 0, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1 });
    const ex = { depth: 0.62, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.055, bevelSegments: 4, curveSegments: 18 };
    const N = new THREE.Shape();
    [[0.95, 0], [0.95, 1.6], [1.6, 0], [2.5, 0], [2.5, 3], [1.55, 3], [1.55, 1.3], [0.9, 3], [0, 3], [0, 0]].reduce(
      (s, [x, y]) => (s.lineTo(x, y), s),
      (N.moveTo(0, 0), N),
    );
    const P = new THREE.Shape();
    P.moveTo(1.9, 1.0);
    P.lineTo(1.9, 3);
    P.lineTo(3.2, 3);
    P.absarc(3.2, 2.15, 0.85, Math.PI / 2, -Math.PI / 2, true);
    P.lineTo(2.75, 1.3);
    P.lineTo(2.75, 1.0);
    P.lineTo(1.9, 1.0);
    const hole = new THREE.Path();
    hole.moveTo(2.75, 1.95);
    hole.lineTo(3.2, 1.95);
    hole.absarc(3.2, 2.15, 0.2, -Math.PI / 2, Math.PI / 2, false);
    hole.lineTo(2.75, 2.35);
    hole.lineTo(2.75, 1.95);
    P.holes.push(hole);
    const Z = new THREE.Shape();
    Z.moveTo(2.6, 0);
    [[4, 0], [4, 0.3], [3.1, 0.3], [4, 0.85], [4, 1.0], [2.6, 1.0], [2.6, 0.7], [3.45, 0.7], [2.6, 0.15], [2.6, 0]].forEach(([x, y]) => Z.lineTo(x, y));
    const shear = new THREE.Matrix4().set(1, 0.28, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    const g = new THREE.Group();
    ([[N, black, 0], [P, red, -0.24], [Z, ivory, 0.16]] as const).forEach(([s, m, z]) => {
      const geo = new THREE.ExtrudeGeometry(s, ex);
      geo.applyMatrix4(shear);
      geo.computeVertexNormals();
      const me = new THREE.Mesh(geo, m);
      me.position.z = z;
      me.castShadow = me.receiveShadow = true;
      g.add(me);
    });
    g.scale.setScalar(0.7);
    const b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -b.min.y, -c.z);
    turn.add(g);
  }

  /* kit helpers */
  const cyl = (rt: number, rb: number, h: number, m: THREE.Material, seg = 20) => {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    me.castShadow = true;
    return me;
  };
  const box = (w: number, h: number, d: number, m: THREE.Material) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    me.castShadow = true;
    return me;
  };
  const lightStand = (h: number) => {
    const g = new THREE.Group();
    const hub = cyl(0.05, 0.05, 0.12, M.metal);
    hub.position.y = 0.62;
    g.add(hub);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3 + 0.3;
      const leg = cyl(0.017, 0.02, 0.86, M.metal, 8);
      leg.position.set(Math.cos(a) * 0.34, 0.32, Math.sin(a) * 0.34);
      leg.lookAt(0, 0.62, 0);
      leg.rotateX(Math.PI / 2);
      g.add(leg);
      const foot = cyl(0.03, 0.03, 0.02, M.rubber, 10);
      foot.position.set(Math.cos(a) * 0.68, 0.01, Math.sin(a) * 0.68);
      g.add(foot);
    }
    const lower = cyl(0.026, 0.026, 1.1, M.alu, 12);
    lower.position.y = 0.62 + 0.55;
    const upper = cyl(0.019, 0.019, h, M.alu, 12);
    upper.position.y = 1.17 + h / 2;
    const lock = cyl(0.036, 0.036, 0.06, M.black, 12);
    lock.position.y = 1.72;
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), M.black);
    knuckle.position.y = 1.17 + h;
    g.add(lower, upper, lock, knuckle);
    return { group: g, top: 1.17 + h };
  };

  /* octagonal softboxes (no shadows: the key light owns the only shadow map) */
  const softbox = (x: number, z: number, h: number) => {
    const st = lightStand(h);
    const head = new THREE.Group();
    head.position.set(0, st.top + 0.1, 0);
    st.group.add(head);
    const bodyGeo = new THREE.CylinderGeometry(0.95, 0.22, 0.75, 8, 1, true);
    bodyGeo.rotateX(Math.PI / 2);
    bodyGeo.rotateZ(Math.PI / 8);
    const body = new THREE.Mesh(bodyGeo, M.fabric);
    body.position.z = 0.1;
    body.castShadow = true;
    const seams = new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo, 20), track(new THREE.LineBasicMaterial({ color: 0x2a2a2e })));
    seams.position.z = 0.1;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.92, 8, Math.PI / 8), track(new THREE.MeshBasicMaterial({ color: 0x151515, toneMapped: false })));
    face.position.z = 0.475;
    const ringO = new THREE.Mesh(new THREE.RingGeometry(0.9, 0.97, 8, 1, Math.PI / 8), M.fabric);
    ringO.position.z = 0.478;
    const ring = cyl(0.24, 0.24, 0.08, M.metal, 24);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -0.3;
    const mount = box(0.14, 0.2, 0.22, M.black);
    mount.position.z = -0.42;
    head.add(body, seams, face, ringO, ring, mount);
    st.group.position.set(x, 0, z);
    add(st.group);
    head.lookAt(0, 1.2, 0);
    const L = new THREE.SpotLight(0xfff4e8, 0, 26, 0.75, 0.9, 1);
    L.position.set(x, st.top + 0.1, z);
    L.target.position.set(0, 1, 0);
    add(L, L.target);
    return { face, L };
  };
  const sbL = softbox(-5.4, 1.2, 1.6), sbR = softbox(4.6, 1.8, 1.3);

  /* LED panels with barn doors */
  const ledFaces: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  const ledPanel = (x: number, z: number, h: number, ry: number) => {
    const st = lightStand(h);
    const yoke = new THREE.Group();
    yoke.position.y = st.top + 0.05;
    st.group.add(yoke);
    const yb = box(0.86, 0.03, 0.04, M.metal);
    yb.position.y = 0.02;
    yoke.add(yb);
    [-0.43, 0.43].forEach((px) => {
      const arm = box(0.03, 0.42, 0.04, M.metal);
      arm.position.set(px, 0.22, 0);
      const knob = cyl(0.04, 0.04, 0.04, M.black, 14);
      knob.rotation.z = Math.PI / 2;
      knob.position.set(px * 1.07, 0.38, 0);
      yoke.add(arm, knob);
    });
    const head = new THREE.Group();
    head.position.y = 0.38;
    head.rotation.x = -0.18;
    yoke.add(head);
    head.add(box(0.8, 0.52, 0.07, M.black));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.46), track(new THREE.MeshBasicMaterial({ map: ledTex, color: 0x202020, toneMapped: false })));
    face.position.z = 0.037;
    head.add(face);
    ledFaces.push(face);
    ([[0, 0.26, 0.8, 0.22, 'x', -1], [0, -0.26, 0.8, 0.22, 'x', 1], [0.4, 0, 0.22, 0.52, 'y', 1], [-0.4, 0, 0.22, 0.52, 'y', -1]] as const).forEach(
      ([px, py, w, hh, ax, s]) => {
        const pv = new THREE.Group();
        pv.position.set(px, py, 0.04);
        head.add(pv);
        const d = ax === 'x' ? box(w, 0.008, hh, M.black) : box(0.008, hh, w, M.black);
        if (ax === 'x') {
          d.position.set(0, 0, hh / 2);
          pv.rotation.x = s * 0.55;
        } else {
          d.position.set(0, 0, w / 2);
          pv.rotation.y = -s * 0.55;
        }
        pv.add(d);
      },
    );
    st.group.position.set(x, 0, z);
    st.group.rotation.y = ry;
    add(st.group);
  };
  ledPanel(-4.4, -2.4, 1.5, 0.75);
  ledPanel(4.5, -2.7, 1.9, -0.75);

  /* gimbal with camera */
  {
    const gimbal = new THREE.Group();
    const st = lightStand(0.35);
    gimbal.add(st.group);
    const t = st.top;
    const grip = cyl(0.042, 0.046, 0.34, M.rubber, 20);
    grip.position.y = t + 0.2;
    gimbal.add(grip);
    [0.08, 0.16, 0.24].forEach((o) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 6, 20), M.metal);
      r.rotation.x = Math.PI / 2;
      r.position.y = t + 0.06 + o;
      gimbal.add(r);
    });
    const m1 = cyl(0.055, 0.055, 0.05, M.metal, 24);
    m1.position.y = t + 0.4;
    const a1 = box(0.04, 0.04, 0.22, M.metal);
    a1.position.set(0, t + 0.43, -0.1);
    const m2 = cyl(0.05, 0.05, 0.045, M.metal, 24);
    m2.rotation.x = Math.PI / 2;
    m2.position.set(0, t + 0.43, -0.22);
    const a2 = box(0.04, 0.24, 0.04, M.metal);
    a2.position.set(0, t + 0.55, -0.22);
    const m3 = cyl(0.05, 0.05, 0.045, M.metal, 24);
    m3.rotation.z = Math.PI / 2;
    m3.position.set(0.04, t + 0.66, -0.22);
    gimbal.add(m1, a1, m2, a2, m3);
    const camG = new THREE.Group();
    camG.position.set(0.2, t + 0.62, -0.12);
    gimbal.add(camG);
    camG.add(box(0.24, 0.15, 0.1, M.black));
    const gripB = box(0.06, 0.15, 0.13, M.rubber);
    gripB.position.set(0.1, 0, 0.015);
    const evf = box(0.07, 0.04, 0.06, M.black);
    evf.position.set(-0.06, 0.095, -0.01);
    const shoe = box(0.05, 0.012, 0.04, M.alu);
    shoe.position.set(0.01, 0.082, 0);
    const lens = cyl(0.055, 0.058, 0.12, M.black, 32);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(-0.02, 0, 0.11);
    camG.add(gripB, evf, shoe, lens);
    [0.07, 0.11, 0.15].forEach((z) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.005, 6, 28), M.rubber);
      r.position.set(-0.02, 0, z);
      camG.add(r);
    });
    const redR = new THREE.Mesh(new THREE.TorusGeometry(0.057, 0.004, 6, 28), M.red);
    redR.position.set(-0.02, 0, 0.172);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.045, 28), M.glass);
    glass.position.set(-0.02, 0, 0.172);
    camG.add(redR, glass);
    gimbal.position.set(-2.7, 0, 1.9);
    gimbal.rotation.y = 2.4;
    add(gimbal);
  }

  /* boom mic with windjammer */
  const BOOM_AIM = -0.534;
  const boom = new THREE.Group();
  const boomArm = new THREE.Group();
  {
    const st = lightStand(2.05);
    boom.add(st.group);
    boomArm.position.y = st.top + 0.05;
    boom.add(boomArm);
    boomArm.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), M.black));
    ([[0.02, 1.0, 0.5], [0.016, 0.9, 1.45], [0.013, 0.75, 2.25]] as const).forEach(([r, l, x]) => {
      const p = cyl(r, r, l, M.alu, 12);
      p.rotation.z = Math.PI / 2;
      p.position.x = x;
      boomArm.add(p);
    });
    const cw = box(0.16, 0.16, 0.16, M.black);
    cw.position.x = -0.25;
    const drop = cyl(0.01, 0.01, 0.16, M.metal, 8);
    drop.position.set(2.45, -0.08, 0);
    const mount = new THREE.Group();
    mount.position.set(2.45, -0.22, 0);
    mount.rotation.z = -1.2;
    boomArm.add(cw, drop, mount);
    [-0.12, 0.12].forEach((o) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 24), M.black);
      r.rotation.y = Math.PI / 2;
      r.position.x = o;
      mount.add(r);
    });
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const r = 0.085 * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.5) * 2, 6))) + 0.001;
      pts.push(new THREE.Vector2(r, -0.26 + t * 0.52));
    }
    const jam = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), M.fur);
    jam.rotation.z = Math.PI / 2;
    jam.castShadow = true;
    mount.add(jam);
    boom.position.set(-2.2, 0, -1.3);
    add(boom);
  }

  /* NPZ cinema camera on a fluid-head tripod, front right */
  const rig = new THREE.Group();
  const monMat = track(new THREE.MeshBasicMaterial({ color: 0x2a0a08, toneMapped: false }));
  {
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const top = new THREE.Vector3(Math.cos(a) * 0.08, 1.25, Math.sin(a) * 0.08), foot = new THREE.Vector3(Math.cos(a) * 0.55, 0.02, Math.sin(a) * 0.55);
      [-0.02, 0.02].forEach((o) => {
        const len = top.distanceTo(foot);
        const leg = cyl(0.015, 0.015, len, M.metal, 8);
        leg.position.copy(top).add(foot).multiplyScalar(0.5);
        leg.position.x += o * Math.sin(a);
        leg.position.z -= o * Math.cos(a);
        leg.lookAt(foot);
        leg.rotateX(Math.PI / 2);
        rig.add(leg);
      });
      const sp = cyl(0.008, 0.008, 0.48, M.alu, 6);
      sp.position.set(Math.cos(a) * 0.24, 0.3, Math.sin(a) * 0.24);
      sp.rotation.z = Math.PI / 2;
      sp.rotation.y = -a;
      rig.add(sp);
    }
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.metal);
    bowl.position.y = 1.26;
    const head = box(0.18, 0.14, 0.2, M.black);
    head.position.y = 1.36;
    const bar = cyl(0.014, 0.014, 0.7, M.alu, 8);
    bar.rotation.x = Math.PI / 2 - 0.35;
    bar.position.set(0.05, 1.34, 0.42);
    const camG = new THREE.Group();
    camG.position.y = 1.56;
    rig.add(bowl, head, bar, camG);
    camG.add(box(0.26, 0.24, 0.42, M.black));
    for (let i = 0; i < 6; i++) {
      const v = box(0.005, 0.14, 0.012, M.metal);
      v.position.set(0.131, 0, -0.12 + i * 0.045);
      camG.add(v);
    }
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.016, 8, 24, Math.PI), M.black);
    handle.position.set(0, 0.13, 0);
    handle.rotation.y = Math.PI / 2;
    camG.add(handle);
    const lensG = new THREE.Group();
    lensG.position.set(0, 0, -0.21);
    camG.add(lensG);
    const lens = cyl(0.085, 0.09, 0.32, M.black, 36);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = -0.16;
    lensG.add(lens);
    [-0.06, -0.14, -0.22].forEach((z) => {
      const r = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 8, 36), M.rubber);
      r.position.z = z;
      lensG.add(r);
    });
    const redR = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.006, 8, 36), M.red);
    redR.position.z = -0.3;
    const mbGeo = new THREE.CylinderGeometry(0.2, 0.12, 0.16, 4, 1, true);
    mbGeo.rotateY(Math.PI / 4);
    mbGeo.rotateX(-Math.PI / 2);
    const matte = new THREE.Mesh(mbGeo, M.fabric);
    matte.scale.set(1.25, 0.8, 1);
    matte.position.z = -0.4;
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.075, 32), M.glass);
    glass.rotation.y = Math.PI;
    glass.position.z = -0.321;
    lensG.add(redR, matte, glass);
    const monArm = cyl(0.01, 0.01, 0.16, M.alu, 8);
    monArm.position.set(-0.17, 0.17, 0.05);
    monArm.rotation.z = 0.6;
    const mon = box(0.2, 0.13, 0.025, M.black);
    mon.position.set(-0.24, 0.24, 0.08);
    mon.rotation.y = -0.4;
    const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.11), monMat);
    monScreen.position.set(0, 0, 0.014);
    mon.add(monScreen);
    const tally = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), track(new THREE.MeshBasicMaterial({ color: 0xff2a1a, toneMapped: false })));
    tally.position.set(0.09, 0.13, -0.16);
    camG.add(monArm, mon, tally);
    rig.position.set(3.5, 0, 4.0);
    rig.rotation.y = 0.72;
    add(rig);
  }

  /* projector and reels. "fit" (chosen): one wide screen, reels cropped to fill it and played one after another.
     "wall": three vertical screens, one reel each. */
  const mode = opts.reelMode ?? 'fit';
  const reels = (opts.reels ?? []).slice(0, 3);
  const COLS = mode === 'wall' ? 3 : 1;
  const COLW = mode === 'wall' ? 304 : 960, RH = 540, RW = COLW * COLS;
  const reelCv = document.createElement('canvas');
  reelCv.width = RW;
  reelCv.height = RH;
  const rx = reelCv.getContext('2d')!;
  const reelTex = track(new THREE.CanvasTexture(reelCv));
  reelTex.encoding = THREE.sRGBEncoding;
  rx.fillStyle = '#000';
  rx.fillRect(0, 0, RW, RH);
  const videos = reels.map((src) => {
    const v = document.createElement('video');
    v.muted = true;
    v.loop = mode === 'wall';
    v.playsInline = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    v.src = src;
    v.addEventListener('loadeddata', () => drawReel());
    return v;
  });
  let cur = 0; // fit mode: which reel is on screen
  const showing = () => (mode === 'wall' ? videos : videos.slice(cur, cur + 1));
  videos.forEach((v, i) =>
    v.addEventListener('ended', () => {
      if (mode === 'wall' || i !== cur) return;
      cur = (cur + 1) % videos.length;
      const next = videos[cur];
      next.currentTime = 0;
      void next.play().catch(() => {});
    }),
  );
  const drawReel = () => {
    showing().forEach((v, j) => {
      const i = mode === 'wall' ? j : 0;
      if (v.readyState < 2) return;
      const vw = v.videoWidth || 9, vh = v.videoHeight || 16;
      // cover-fit each reel into its column
      const sc = Math.max(COLW / vw, RH / vh), w = vw * sc, h = vh * sc;
      rx.save();
      rx.beginPath();
      rx.rect(i * COLW, 0, COLW, RH);
      rx.clip();
      rx.drawImage(v, i * COLW + (COLW - w) / 2, (RH - h) / 2, w, h);
      rx.restore();
    });
    reelTex.needsUpdate = true;
  };
  const SCREEN = new THREE.Vector3(0, 4.9, WALLZ + 0.06);
  const screenMat = track(new THREE.MeshBasicMaterial({ map: reelTex, color: 0x000000, toneMapped: false }));
  const PH = 3.6, PW = mode === 'wall' ? (PH * 9) / 16 : 6.4, GAP = 0.2;
  for (let i = 0; i < COLS; i++) {
    const geo = new THREE.PlaneGeometry(PW, PH);
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / COLS);
    const panel = new THREE.Mesh(geo, screenMat);
    panel.position.set(SCREEN.x + (i - (COLS - 1) / 2) * (PW + GAP), SCREEN.y, SCREEN.z);
    add(panel);
  }
  const frameBar = box(6.6, 0.06, 0.06, M.black);
  frameBar.position.set(0, SCREEN.y + 1.85, SCREEN.z + 0.03);
  add(frameBar);
  const projector = new THREE.Group();
  const glowMat = track(new THREE.MeshBasicMaterial({ color: 0x111111, toneMapped: false }));
  {
    const rod = cyl(0.02, 0.02, 2.6, M.alu, 8);
    rod.position.y = 1.45;
    const plate = box(0.2, 0.02, 0.2, M.metal);
    plate.position.y = 0.15;
    projector.add(rod, plate, box(0.46, 0.18, 0.52, M.black));
    for (let i = 0; i < 7; i++) {
      const v = box(0.006, 0.12, 0.02, M.metal);
      v.position.set(0.232, 0, -0.18 + i * 0.06);
      projector.add(v);
    }
    const lens = cyl(0.07, 0.08, 0.1, M.black, 28);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0.1, 0, -0.3);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat);
    glow.position.set(0.1, 0, -0.352);
    glow.rotation.y = Math.PI;
    projector.add(lens, glow);
    projector.position.set(0.5, 4.55, 3.2);
    add(projector);
  }
  const PLENS = new THREE.Vector3(0.6, 4.55, 2.85);
  const beamLen = PLENS.distanceTo(SCREEN);
  const beamGeo = new THREE.ConeGeometry(1, beamLen, 4, 1, true);
  beamGeo.rotateY(Math.PI / 4);
  beamGeo.translate(0, -beamLen / 2, 0);
  beamGeo.rotateX(-Math.PI / 2);
  const projBeam = new THREE.Mesh(beamGeo, hazeMat(0xfff0e0));
  projBeam.scale.set(4.4, 2.5, 1);
  projBeam.position.copy(PLENS);
  projBeam.lookAt(SCREEN);
  add(projBeam);

  scene.add(root);

  /* camera path: one key per scroll scene */
  const keys: [number, [number, number, number], [number, number, number]][] = [
    [0.0, [0, 1.9, 9.6], [0, 1.35, 0]],
    [0.25, [-2.5, 2.5, 8.3], [0, 1.3, 0]],
    [0.5, [0.3, 3.0, 9.6], [0, 2.4, -3.6]],
    [0.75, [4.6, 2.3, 8.2], [0.4, 1.3, 0]],
    [0.9, [4.9, 2.2, 7.0], [0.2, 1.25, 0]],
    [1.0, [4.3, 1.95, 5.9], [0.1, 1.25, 0]],
  ];
  const va = new THREE.Vector3(), vb = new THREE.Vector3(), pos = new THREE.Vector3(), look = new THREE.Vector3();
  const pathAt = (p: number) => {
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (p <= b[0]) {
        const t = (p - a[0]) / (b[0] - a[0]), e = t * t * (3 - 2 * t);
        pos.copy(va.set(...a[1])).lerp(vb.set(...b[1]), e);
        look.copy(va.set(...a[2])).lerp(vb.set(...b[2]), e);
        return;
      }
    }
    const k = keys[keys.length - 1];
    pos.set(...k[1]);
    look.set(...k[2]);
  };

  /* beats: each scroll scene triggers one timed moment */
  const S = { sbL: sw(), sbR: sw(), fill: sw(), led1: sw(), led2: sw(), boom: sw(), proj: sw(), pov: sw() };
  const drive = (o: Switch, want: boolean, delay: number, dur: number, now: number, dt: number) => {
    if (want !== o.want) {
      o.want = want;
      o.at = now + (want && !reduce ? delay : 0);
    }
    if (now >= o.at) {
      const t = o.want ? 1 : 0, step = reduce ? 1 : dt / dur;
      o.v += Math.sign(t - o.v) * Math.min(Math.abs(t - o.v), step);
    }
    return o.v;
  };
  const easeBack = (t: number) => {
    const c = 1.6;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };
  const tmp = new THREE.Color();
  const bg = scene.background as THREE.Color, fog = scene.fog as THREE.Fog;
  let flash = 0, flick = 0, reelAcc = 0, spin = 0, spinV = 0, dragging = false, litState = false, shadowTick = 0;
  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

  function update(cam: THREE.PerspectiveCamera, f: StudioFrame) {
    const { now, dt, p } = f;

    // beat 1: softboxes snap on, one after the other, with a flash
    const lightsWant = p > 0.08, wasOn = S.sbL.want;
    const a1 = drive(S.sbL, lightsWant, 0, 0.07, now, dt), a2 = drive(S.sbR, lightsWant, 0.16, 0.07, now, dt), a3 = drive(S.fill, lightsWant, 0.32, 0.3, now, dt);
    if (lightsWant && !wasOn) {
      if (!reduce) {
        flash = 1;
        spinV += 0.05;
      }
      ev.onSwitch();
      later(ev.onSwitch, 160);
    }
    flash *= Math.exp(-dt * 5);
    sbL.L.intensity = a1 * 2.2;
    sbR.L.intensity = a2 * 1.5;
    const on = (a1 + a2 + a3) / 3;
    amb.intensity = 0.04 + on * 0.28 + a3 * 0.12 + flash * 1.1;
    (sbL.face.material as THREE.MeshBasicMaterial).color.setScalar(0.08 + a1 * 1.12);
    (sbR.face.material as THREE.MeshBasicMaterial).color.setScalar(0.08 + a2 * 1.12);
    rim.intensity = 3 * (1 - on * 0.5);
    key.intensity = 7 - on * 4.5;
    (keyBeam.material as THREE.ShaderMaterial).uniforms.uStrength.value = 0.16 * (1 - on * 0.75);
    dustMat.opacity = 0.55 * (1 - on * 0.6);
    glossy.forEach((m) => {
      const mx = m.userData.envMax || 0.35;
      m.envMapIntensity = 0.1 + on * (mx - 0.1);
    });
    tmp.copy(dark).lerp(lit, on).lerp(white, flash * 0.55);
    bg.copy(tmp);
    fog.color.copy(tmp);
    const isLit = a1 > 0.5;
    if (isLit !== litState) {
      litState = isLit;
      ev.onLit(isLit);
    }

    // beat 2: LED panels click on, boom swings in over the mark
    const kitWant = p > 0.33, kitWas = S.led1.want;
    const l1 = drive(S.led1, kitWant, 0, 0.05, now, dt), l2 = drive(S.led2, kitWant, 0.14, 0.05, now, dt), bm = drive(S.boom, kitWant, 0.1, 0.9, now, dt);
    if (kitWant && !kitWas) {
      ev.onSwitch();
      later(ev.onSwitch, 140);
    }
    [l1, l2].forEach((v, i) => ledFaces[i].material.color.setScalar(0.12 + v * 1.0));
    boomArm.rotation.y = BOOM_AIM - 0.9 + 0.9 * (S.boom.want ? easeBack(bm) : bm);

    // beat 3: projector flickers on and the reel starts
    const projWant = p > 0.4;
    if (projWant && !S.proj.want) {
      flick = reduce ? 0 : 0.45;
      later(ev.onSwitch, 250);
    }
    const pj = drive(S.proj, projWant, 0.25, 0.05, now, dt);
    flick = Math.max(0, flick - dt);
    const fl = flick > 0 && now >= S.proj.at ? (Math.random() > 0.45 ? 1 : 0.15) : 1;
    const projOn = pj * fl;
    screenMat.color.setScalar(0.03 + projOn * 0.97);
    (projBeam.material as THREE.ShaderMaterial).uniforms.uStrength.value = projOn * 0.09 * (1 - on * 0.55);
    glowMat.color.setScalar(0.07 + projOn * 1.1);
    monMat.color.setRGB(0.16 + pj * 0.3, 0.04 + pj * 0.25, 0.03 + pj * 0.22);
    // the reel plays only while the projector is on, repainted at 20 fps
    if (pj > 0 && !reduce) {
      showing().forEach((v) => {
        if (v.paused && v.readyState >= 2) void v.play().catch(() => {});
      });
      reelAcc += dt;
      if (reelAcc > 1 / 20) {
        reelAcc = 0;
        drawReel();
      }
    } else videos.forEach((v) => !v.paused && v.pause());

    // beat 4: point of view through NPZ's camera
    const povWant = p > 0.9, povWas = S.pov.want;
    drive(S.pov, povWant, 0, 0.2, now, dt);
    if (povWant !== povWas) {
      ev.onPov(povWant);
      if (povWant) ev.onShutter();
    }
    rig.visible = p < 0.9;

    // dust drifts in the key light
    if (dustN) {
      for (let i = 0; i < dustN; i++) {
        const s = dustSeed[i];
        dustPos[i * 3] = dustBase[i * 3] + Math.sin(now * 0.15 + s) * 0.08;
        dustPos[i * 3 + 1] = dustBase[i * 3 + 1] + ((now * 0.04 + s) % 1) * 0.3 - 0.15;
        dustPos[i * 3 + 2] = dustBase[i * 3 + 2] + Math.cos(now * 0.12 + s * 1.3) * 0.08;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    if (!dragging) {
      if (!reduce) spin += 0.25 * dt;
      spin += spinV;
      spinV *= Math.pow(0.02, dt);
    }
    turn.rotation.y = spin;
    deck.rotation.y = spin;

    pathAt(clamp(p, 0, 1));
    cam.position.copy(pos);
    cam.lookAt(look);
    if (!reduce) {
      cam.rotateY(-f.mx * 0.035);
      cam.rotateX(-f.my * 0.025);
    }

    shadowTick ^= 1;
    if (shadowTick) gl.shadowMap.needsUpdate = true;
  }

  return {
    update,
    drag(dx: number | null) {
      if (dx === null) {
        dragging = false;
        return;
      }
      dragging = true;
      spinV = dx * 0.008;
      spin += spinV;
    },
    dispose() {
      timers.forEach(clearTimeout);
      videos.forEach((v) => {
        v.pause();
        v.removeAttribute('src');
        v.load();
      });
      scene.remove(root);
      root.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points || o instanceof THREE.LineSegments) o.geometry.dispose();
      });
      disposables.forEach((d) => d.dispose());
    },
  };
}

export type Studio = ReturnType<typeof buildStudio>;
