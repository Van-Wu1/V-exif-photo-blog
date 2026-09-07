import * as THREE from 'three';

// Procedural rubber/fibre surface, with no baked directional illumination.
export function makeTableTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  let seed = 731;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  ctx.fillStyle = '#77736d';
  ctx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 18000; i++) {
    const x = random() * 1024;
    const y = random() * 1024;
    const shade = Math.floor(65 + random() * 95);
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},0.45)`;
    ctx.lineWidth = 0.5 + random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 2, y - 3, x + random() * 7, y + 3);
    ctx.stroke();
  }
  for (let i = 0; i < 650; i++) {
    const x = random() * 1024;
    const y = random() * 1024;
    const radius = 5 + random() * 26;
    const wash = ctx.createRadialGradient(x, y, 0, x, y, radius);
    wash.addColorStop(0, 'rgba(36,30,22,0.13)');
    wash.addColorStop(1, 'rgba(36,30,22,0)');
    ctx.fillStyle = wash;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.5, 2.7);
  return texture;
}

export function addDarkroomProps(scene: THREE.Scene) {
  const black = new THREE.MeshStandardMaterial({
    color: '#151515', metalness: 0.65, roughness: 0.36,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: '#86755b', metalness: 0.85, roughness: 0.38,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: '#101010', roughness: 0.93,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: '#17242b', metalness: 0.75, roughness: 0.16,
  });
  const group = new THREE.Group();
  scene.add(group);
  function cylinder(parent: THREE.Object3D, radius: number, height: number,
    y: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, 48), material,
    );
    mesh.position.y = y;
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function lens(x: number, z: number, scale: number) {
    const body = new THREE.Group();
    body.position.set(x, 0, z);
    body.scale.setScalar(scale);
    group.add(body);
    cylinder(body, 0.7, 1.4, 0.7, black);
    cylinder(body, 0.74, 0.35, 0.65, rubber);
    for (const y of [0.06, 0.25, 0.95, 1.25, 1.39]) {
      cylinder(body, 0.725, 0.025, y, brass);
    }
    for (let i = 0; i < 48; i++) {
      const angle = i * Math.PI / 24;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.33, 0.045),
        black);
      rib.position.set(Math.cos(angle) * 0.744, 0.65,
        Math.sin(angle) * 0.744);
      rib.rotation.y = -angle;
      body.add(rib);
    }
    cylinder(body, 0.59, 0.014, 1.412, glass);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.045, 8, 48),
      black);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.44;
    body.add(rim);
  }
  lens(-7.5, -1.4, 1.15);
  lens(-5.5, -7.1, 1.1);
  lens(6, -6.9, 1.25);
  lens(5.7, 3.4, 0.9);

  // Shallow metal film tin, with concentric rolled edges.
  const tin = new THREE.Group();
  tin.position.set(-1.8, 0, -6.5);
  group.add(tin);
  cylinder(tin, 0.95, 0.32, 0.16, black);
  cylinder(tin, 0.97, 0.035, 0.33, brass);
  cylinder(tin, 0.89, 0.012, 0.352, black);

  const lamp = new THREE.Group();
  lamp.position.set(1.8, 0, -7.4);
  group.add(lamp);
  cylinder(lamp, 0.43, 0.12, 0.06, black);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16),
    new THREE.MeshStandardMaterial({
      color: '#7d1209', emissive: '#e22e18', emissiveIntensity: 0.9,
      roughness: 0.4,
    }));
  bulb.position.y = 0.18;
  bulb.scale.y = 0.6;
  lamp.add(bulb);

  // A tilted mechanical timer, with a legible dial and raised bezel.
  const dialCanvas = document.createElement('canvas');
  dialCanvas.width = dialCanvas.height = 512;
  const ctx = dialCanvas.getContext('2d')!;
  ctx.fillStyle = '#a69a7d';
  ctx.fillRect(0, 0, 512, 512);
  ctx.translate(256, 256);
  ctx.strokeStyle = '#211f1b';
  ctx.fillStyle = '#211f1b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '25px Georgia';
  for (let i = 0; i < 60; i++) {
    const angle = i * Math.PI / 30 - Math.PI / 2;
    const major = i % 5 === 0;
    ctx.lineWidth = major ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 218, Math.sin(angle) * 218);
    ctx.lineTo(Math.cos(angle) * (major ? 190 : 204),
      Math.sin(angle) * (major ? 190 : 204));
    ctx.stroke();
    if (major) ctx.fillText(String(i), Math.cos(angle) * 165,
      Math.sin(angle) * 165);
  }
  ctx.font = '17px Georgia';
  ctx.fillText('DARKROOM', 0, 78);
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-28, 32);
  ctx.lineTo(115, -140);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  const dialTexture = new THREE.CanvasTexture(dialCanvas);
  dialTexture.colorSpace = THREE.SRGBColorSpace;
  const timer = new THREE.Group();
  timer.position.set(7.8, 0.55, -1.8);
  timer.rotation.x = 0.55;
  timer.rotation.z = -0.12;
  group.add(timer);
  cylinder(timer, 1.08, 0.3, 0, black);
  cylinder(timer, 1.1, 0.04, 0.16, brass);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.01, 64),
    new THREE.MeshStandardMaterial({ map: dialTexture, roughness: 0.8 }));
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.185;
  timer.add(face);

  // Contact shadows anchor props even where the main spotlight is weak.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowCtx = shadowCanvas.getContext('2d')!;
  const gradient = shadowCtx.createRadialGradient(64, 64, 25, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  shadowCtx.fillStyle = gradient;
  shadowCtx.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture, transparent: true, depthWrite: false,
  });
  for (const prop of [...group.children]) {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7),
      shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(prop.position.x, 0.006, prop.position.z);
    group.add(shadow);
  }
  return [dialTexture, shadowTexture];
}
