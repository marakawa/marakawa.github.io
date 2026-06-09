import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createWorld3d(worldSize: number, container: HTMLElement, pixelRatio = 0.125) {
    // Back
    const sceneBack = new THREE.Scene()
    const rendererBack = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    rendererBack.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(rendererBack.domElement)
    const axesHelper = new THREE.AxesHelper(15)
    sceneBack.add(axesHelper)

    // Scene
    const scene = new THREE.Scene()
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.domElement.style.imageRendering = 'pixelated'
    renderer.setPixelRatio(pixelRatio)
    container.appendChild(renderer.domElement)

    // Camera
    const ENABLE_PERSPECTIVE = false
    const aspect = window.innerWidth / window.innerHeight
    const viewSize = 100
    const orthographicCamera = new THREE.OrthographicCamera(
        (-viewSize * aspect) / 2,
        (viewSize * aspect) / 2,
        viewSize / 2,
        -viewSize / 2,
        0.1,
        1000,
    )
    const perspectiveCamera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1000)
    const camera = ENABLE_PERSPECTIVE ? perspectiveCamera : orthographicCamera
    camera.position.set(
        worldSize / 2 + viewSize,
        worldSize / 2 + viewSize,
        worldSize / 2 + viewSize,
    )
    camera.lookAt(worldSize / 2, worldSize / 2, worldSize / 2)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(worldSize / 2, worldSize / 2, worldSize / 2)

    // Light
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(10, 20, 10)
    scene.add(dirLight)

    // Materials
    const materials: { [color: string]: THREE.Material } = {}

    // Resize
    window.addEventListener('resize', () => {
        rendererBack.setSize(window.innerWidth, window.innerHeight)
        renderer.setSize(window.innerWidth, window.innerHeight)
        const aspect = window.innerWidth / window.innerHeight
        orthographicCamera.left = (-viewSize * aspect) / 2
        orthographicCamera.right = (viewSize * aspect) / 2
        orthographicCamera.top = viewSize / 2
        orthographicCamera.bottom = -viewSize / 2
        orthographicCamera.updateProjectionMatrix()
        perspectiveCamera.aspect = aspect
        perspectiveCamera.updateProjectionMatrix()
        render()
    })

    // Render
    function render() {
        controls.update()
        rendererBack.render(sceneBack, camera)
        renderer.render(scene, camera)
    }
    render()

    return {
        scene,
        sceneBack,
        camera,
        controls,
        renderer,
        rendererBack,
        perspectiveCamera,
        orthographicCamera,
        viewSize,
        materials,
        render,
        showFront: () => {
            camera.position.set(worldSize / 2, worldSize / 2, worldSize / 2 + viewSize)
            camera.lookAt(worldSize / 2, worldSize / 2, worldSize / 2)
            render()
        },
        showSide: () => {
            camera.position.set(worldSize / 2 + viewSize, worldSize / 2, worldSize / 2)
            camera.lookAt(worldSize / 2, worldSize / 2, worldSize / 2)
            render()
        },
        showTop: () => {
            camera.position.set(worldSize / 2, worldSize / 2 + viewSize, worldSize / 2)
            camera.lookAt(worldSize / 2, worldSize / 2, worldSize / 2)
            render()
        },
    }
}
