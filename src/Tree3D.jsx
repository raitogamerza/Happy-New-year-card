import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default function Tree3D({ width = 340, height = 320, scale = 1, interactive = false }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.012)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 2.2, 8.0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
      // Allow touch gestures on mobile without the page scrolling
      renderer.domElement.style.touchAction = 'none'
    // keep overall brightness balanced to avoid neon surfaces
    renderer.toneMappingExposure = 0.95
    container.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(3, 6, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.camera.near = 1
    keyLight.shadow.camera.far = 20
    scene.add(keyLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5)
    rimLight.position.set(-3, 4, -5)
    scene.add(rimLight)

    const tree = new THREE.Group()
    scene.add(tree)

    // Materials
    const green = 0x2f9e44
    const tierMat = new THREE.MeshStandardMaterial({
      color: green,
      roughness: 0.5,
      metalness: 0.2,
    })
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 })

    // Tiered foliage (stacked cones) for a more realistic layered tree
    const trunkHeight = 1.8
    const trunkRadiusTop = 0.35
    const trunkRadiusBottom = 0.42

    const tiers = [
      { height: 1.20, radius: 1.80, yBottom: trunkHeight - 0.05 },
      { height: 1.00, radius: 1.50, yBottom: trunkHeight + 1.20 - 0.35 },
      { height: 0.85, radius: 1.20, yBottom: trunkHeight + 1.00 + 1.20 - 0.65 },
      { height: 0.70, radius: 0.95, yBottom: trunkHeight + 0.85 + 1.00 + 1.20 - 0.95 },
    ]

    const tierMeshes = []
    tiers.forEach((t) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(t.radius, t.height, 48), tierMat)
      cone.position.y = t.yBottom + t.height / 2
      cone.castShadow = true
      tree.add(cone)
      tierMeshes.push(cone)
    })

    // Small cap at the very top to soften the tip
    const topCap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.35, 48), tierMat)
    const topY = tiers[tiers.length - 1].yBottom + tiers[tiers.length - 1].height
    topCap.position.y = topY + 0.20
    topCap.castShadow = true
    tree.add(topCap)

    // Trunk (more visible)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkRadiusTop, trunkRadiusBottom, trunkHeight, 24), trunkMat)
    trunk.position.y = trunkHeight / 2
    trunk.castShadow = true
    tree.add(trunk)

    // Star (extruded 5-pointed star)
    function createStarGeometry(outer = 0.45, inner = 0.20, points = 5, depth = 0.18) {
      const shape = new THREE.Shape()
      const total = points * 2
      for (let i = 0; i < total; i++) {
        const a = (i / total) * Math.PI * 2 - Math.PI / 2
        const r = i % 2 === 0 ? outer : inner
        const x = Math.cos(a) * r
        const y = Math.sin(a) * r
        if (i === 0) shape.moveTo(x, y)
        else shape.lineTo(x, y)
      }
      shape.closePath()
      const extrudeSettings = {
        depth,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04,
      }
      return new THREE.ExtrudeGeometry(shape, extrudeSettings)
    }

    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffe066,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      metalness: 0.35,
    })
    const star = new THREE.Mesh(createStarGeometry(), starMat)
    star.position.set(0, topY + 0.65, 0)
    star.rotation.y = Math.PI / 5
    star.castShadow = true
    tree.add(star)

    const starLight = new THREE.PointLight(0xffe066, 1.3, 6, 2)
    starLight.position.set(0, star.position.y + 0.05, 0)
    scene.add(starLight)

    // Ornaments
    const ornamentColors = [0xff4d4f, 0x4da3ff, 0x30c463, 0xff80b5, 0x9b6cff, 0xff9c33]
    const ornaments = []
    function addRing(y, radius, count) {
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4
        const r = radius * (0.9 + Math.random() * 0.08)
        const x = Math.cos(ang) * r
        const z = Math.sin(ang) * r
        const mat = new THREE.MeshStandardMaterial({
          color: ornamentColors[i % ornamentColors.length],
          emissive: ornamentColors[i % ornamentColors.length],
          emissiveIntensity: 0.8,
          roughness: 0.5,
          metalness: 0.25,
        })
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.11 + Math.random() * 0.05, 16, 16), mat)
        sphere.position.set(x, y + (Math.random() - 0.5) * 0.18, z)
        tree.add(sphere)
        ornaments.push(sphere)
        // metallic cap on top of ornament
        const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 })
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), capMat)
        cap.position.set(x, sphere.position.y + 0.1, z)
        cap.rotation.x = Math.PI / 2
        cap.castShadow = true
        tree.add(cap)
      }
    }
    // Helper to approximate surface radius for the layered shape at height y
    function radiusAtLayered(y) {
      let r = 0.0
      for (const t of tiers) {
        const yRel = y - t.yBottom
        if (yRel >= 0 && yRel <= t.height) {
          const rr = t.radius * (1 - yRel / t.height)
          r = Math.max(r, rr)
        } else if (yRel < 0 && yRel > -0.15) {
          r = Math.max(r, t.radius)
        }
      }
      return Math.max(0.05, r)
    }
    function addRingByY(y, count) {
      const surfaceR = radiusAtLayered(y)
      const r = surfaceR + 0.12
      addRing(y, r, count)
    }
    // Distribute ornaments across tiers
    const ringPlan = [
      { y: trunkHeight + 0.5, count: 10 },
      { y: tiers[0].yBottom + tiers[0].height * 0.35, count: 12 },
      { y: tiers[0].yBottom + tiers[0].height * 0.75, count: 12 },
      { y: tiers[1].yBottom + tiers[1].height * 0.50, count: 12 },
      { y: tiers[2].yBottom + tiers[2].height * 0.50, count: 10 },
      { y: tiers[3].yBottom + tiers[3].height * 0.50, count: 8 },
    ]
    ringPlan.forEach((rp) => addRingByY(rp.y, rp.count))

    // Garland lights: a gentle spiral of glowing bulbs around the tree
    const garlandBulbs = []
    ;(function addGarland() {
      const turns = 5
      const steps = 160
      const yStart = trunkHeight + 0.35
      const yEnd = topY - 0.10
      const colors = [0xff4d4f, 0x4da3ff, 0x30c463, 0xff80b5, 0x9b6cff, 0xff9c33]
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1)
        const y = yStart + (yEnd - yStart) * t
        const rSurface = radiusAtLayered(y)
        const r = rSurface + 0.08
        const theta = t * turns * Math.PI * 2
        const x = Math.cos(theta) * r
        const z = Math.sin(theta) * r
        const mat = new THREE.MeshStandardMaterial({
          color: colors[i % colors.length],
          emissive: colors[i % colors.length],
          emissiveIntensity: 0.6,
          roughness: 0.45,
          metalness: 0.25,
        })
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), mat)
        bulb.position.set(x, y, z)
        bulb.castShadow = true
        tree.add(bulb)
        garlandBulbs.push(bulb)
      }
    })()

    // Scale the entire tree group
    tree.scale.set(scale, scale, scale)
    tree.rotation.x = -0.08

    // Enable shadows on meshes
    tree.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
      }
    })

    // Snow field ground (visible, receives shadows)
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xeef2f6, roughness: 1.0, metalness: 0.0 })
    const snowGround = new THREE.Mesh(new THREE.PlaneGeometry(30, 30, 64, 64), snowMat)
    snowGround.rotation.x = -Math.PI / 2
    snowGround.position.y = 0
    snowGround.receiveShadow = true
    // subtle undulations for natural snow surface
    const posAttr = snowGround.geometry.attributes.position
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i)
      const z = posAttr.getZ(i)
      const r = Math.sqrt(x * x + z * z)
      const undulate = 0.03 * (Math.sin(x * 0.35) + Math.cos(z * 0.28)) * Math.exp(-r * 0.05)
      posAttr.setY(i, posAttr.getY(i) + undulate)
    }
    posAttr.needsUpdate = true
    scene.add(snowGround)
    // soft sky/ground ambient
    const hemi = new THREE.HemisphereLight(0xffffff, 0xa7bccc, 0.25)
    scene.add(hemi)

    // Starfield background (subtle)
    const stars = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, sizeAttenuation: true, transparent: true, opacity: 0.9 })
    )
    const starCount = 400
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const radius = 20 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * (Math.cos(phi) * 0.6 + 0.2)
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    stars.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    scene.add(stars)

    // Small gifts at base
    const giftColors = [0xe63946, 0x457b9d, 0xf4a261]
    function addGift(x, z, c) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.45), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, metalness: 0.2 }))
      box.position.set(x, 0.175, z)
      box.castShadow = true
      scene.add(box)
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }))
      ribbon.position.set(x, 0.365, z)
      ribbon.castShadow = true
      scene.add(ribbon)
    }
    addGift(1.2, 0.9, giftColors[0])
    addGift(-1.0, -0.8, giftColors[1])
    addGift(0.2, -1.2, giftColors[2])

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 4.8
    controls.maxDistance = 9.2
    controls.minPolarAngle = Math.PI / 3
    controls.maxPolarAngle = Math.PI / 1.9

    // Animation loop
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    // reduce bloom strength and raise threshold so only very bright elements glow
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.7, 0.85)
    composer.addPass(bloom)

    let rafId = 0
    const clock = new THREE.Clock()
    let spinSpeed = 0.12
    function animate() {
      const t = clock.getElapsedTime()
      tree.rotation.y = t * spinSpeed
      tree.rotation.x = Math.sin(t * 0.4) * 0.03
      // twinkle
      ornaments.forEach((o, i) => {
        const mat = o.material
        const base = 0.4 + 0.3 * Math.sin(t * 2 + i * 0.6)
        mat.emissiveIntensity = base
      })
      // garland pulse with traveling wave
      garlandBulbs.forEach((b, i) => {
        const mat = b.material
        const wave = 0.35 + 0.35 * Math.sin(t * 2.5 + i * 0.25)
        mat.emissiveIntensity = wave
      })
      starMat.emissiveIntensity = 0.6 + 0.3 * Math.sin(t * 1.8)
      const flicker = 0.85 + 0.15 * Math.sin(t * 0.7)
      stars.material.opacity = flicker
      controls.update()
      composer.render()
      rafId = requestAnimationFrame(animate)
    }
    camera.lookAt(0, (topY + trunkHeight) * 0.55, 0)
    animate()

    // Resize
    function onResize() {
      const w = width
      const h = height
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Toggle spin speed on click
    function onClick() {
      if (!interactive) return
      spinSpeed = spinSpeed === 0.12 ? 0.06 : 0.12
    }
    renderer.domElement.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      // dispose scene
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry && obj.geometry.dispose()
          obj.material && obj.material.dispose && obj.material.dispose()
        }
      })
    }
  }, [width, height])

  return <div ref={containerRef} style={{ width, height, margin: '0 auto' }} />
}
