'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './table.module.css';
import { useVisualExperience } from '@/app/VisualExperienceProvider';
import { addDarkroomProps, makeTableTexture } from './setDressing';
import type { BufferGeometry, Material } from 'three';

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
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      element.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#080706');
      scene.fog = new THREE.FogExp2('#080706', 0.035);
      const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 60);
      camera.position.set(0, 7.6, 8.8);
      camera.lookAt(0, 0, -0.8);

      const texture = makeTableTexture();
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

      const topMaterial = new THREE.MeshStandardMaterial({
        color: '#817361', roughness: 0.82, metalness: 0.08,
        map: texture, bumpMap: texture, bumpScale: 0.045,
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
      tabletop.receiveShadow = true;
      scene.add(tabletop);
      const propTextures = addDarkroomProps(scene);

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
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.normalBias = 0.025;
      light.shadow.bias = -0.0001;
      scene.add(light, light.target);
      const safelight = new THREE.PointLight('#c52a16', 5, 10, 2);
      safelight.position.set(1.8, 1.6, -7.4);
      scene.add(safelight);
      // Restrained rim illumination lets the peripheral tools read in shadow.
      const rimLight = new THREE.DirectionalLight('#c9b79b', 0.65);
      rimLight.position.set(-5, 4, -4);
      scene.add(rimLight);

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
        const geometries = new Set<BufferGeometry>();
        const materials = new Set<Material>();
        scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
            geometries.add(object.geometry);
            const list = Array.isArray(object.material)
              ? object.material : [object.material];
            list.forEach(material => materials.add(material));
          }
        });
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        texture.dispose();
        propTextures.forEach(propTexture => propTexture.dispose());
        light.shadow.dispose();
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
