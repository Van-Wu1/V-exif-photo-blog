'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './table.module.css';
import { useVisualExperience } from '@/app/VisualExperienceProvider';

export default function DarkroomTable() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { setExperience } = useVisualExperience();
  const leave = (experience: 'classic' | 'darkroom') => {
    const url = new URL(window.location.href);
    url.searchParams.set('experience', experience);
    window.history.replaceState(null, '', url);
    setExperience(experience);
  };

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};

    void import('three').then(THREE => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      cleanup = () => renderer.dispose();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      element.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#080706');
      scene.fog = new THREE.FogExp2('#080706', 0.035);
      const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 60);
      camera.position.set(0, 7.6, 8.8);
      camera.lookAt(0, 0, -0.8);

      // Neutral, deterministic microtexture: illumination belongs to the lights.
      const grain = document.createElement('canvas');
      grain.width = grain.height = 512;
      const context = grain.getContext('2d');
      if (!context) throw new Error('Texture canvas unavailable');
      const pixels = context.createImageData(512, 512);
      let seed = 9137;
      for (let i = 0; i < pixels.data.length; i += 4) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const value = 80 + (seed >>> 24) * 0.32;
        pixels.data[i] = value;
        pixels.data[i + 1] = value;
        pixels.data[i + 2] = value;
        pixels.data[i + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
      const texture = new THREE.CanvasTexture(grain);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(9, 7);
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

      const topMaterial = new THREE.MeshStandardMaterial({
        color: '#5b5145', roughness: 0.87, metalness: 0.08,
        bumpMap: texture, bumpScale: 0.024, roughnessMap: texture,
      });
      const edgeMaterial = new THREE.MeshStandardMaterial({
        color: '#28221b', roughness: 0.72, metalness: 0.15,
      });
      const tabletop = new THREE.Mesh(
        new THREE.BoxGeometry(17, 0.22, 13),
        [edgeMaterial, edgeMaterial, topMaterial, edgeMaterial,
          edgeMaterial, edgeMaterial],
      );
      tabletop.position.set(0, -0.11, -1.8);
      scene.add(tabletop);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: '#080706', roughness: 1 }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.55;
      scene.add(floor);

      scene.add(new THREE.AmbientLight('#b4b9c5', 0.065));
      const light = new THREE.SpotLight('#ffe0b3', 100, 22, 0.64, 0.92, 2);
      light.position.set(-2.8, 5.6, 3.2);
      light.target.position.set(0, 0, 0.7);
      scene.add(light, light.target);
      const safelight = new THREE.PointLight('#c52a16', 5, 10, 2);
      safelight.position.set(3.8, 1.6, -6);
      scene.add(safelight);

      const render = () => renderer.render(scene, camera);
      const resize = () => {
        const { width, height } = element.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.fov = width < height ? 57 : 43;
        camera.updateProjectionMatrix();
        render();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      const contextLost = (event: Event) => {
        event.preventDefault();
        setFailed(true);
      };
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      resize();

      // A static study needs no continuous animation loop or idle GPU work.
      cleanup = () => {
        observer.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        tabletop.geometry.dispose();
        floor.geometry.dispose();
        floor.material.dispose();
        topMaterial.dispose();
        edgeMaterial.dispose();
        texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }).catch(() => {
      cleanup();
      if (!disposed) setFailed(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <section className={styles.stage} aria-label="三维暗房桌面">
      <div ref={host} className={styles.scene} aria-hidden="true" />
      <div className={styles.vignette} />
      <header className={styles.header}>
        <button onClick={() => leave('darkroom')}>← 暗房</button>
        <span>THE DARKROOM</span>
        <button onClick={() => leave('classic')}>经典视图</button>
      </header>
      <div className={styles.caption}>
        <span>LIGHT STUDY — 01</span>
        <p>光落在桌上，照片尚未到来。</p>
      </div>
      {failed && <p className={styles.error} role="status">
        无法开启三维画面，请使用支持 WebGL 的浏览器，或返回暗房。
      </p>}
    </section>
  );
}
