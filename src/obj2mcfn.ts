import { loadFile } from './common/utils'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { BlocksMcpacker, Block } from 'blocks-mcpacker'

window.addEventListener('load', () => {
    const pixelsNum = 100
    const mesh2pixelRatio = 50
    const cameraDepth = pixelsNum / mesh2pixelRatio
    const bm = new BlocksMcpacker(pixelsNum * 2, pixelsNum * 2, pixelsNum * 2)

    // Three
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(512, 512)
    document.body.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('rgb(240, 230, 255)')
    const directionalLight = new THREE.DirectionalLight('#ffffff', 0.1)
    directionalLight.position.set(0, 1000, 0)
    scene.add(directionalLight)
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
    scene.add(ambientLight)
    const camera = new THREE.PerspectiveCamera(45, renderer.domElement.width / renderer.domElement.height, 1, cameraDepth * 10)
    camera.position.set(0, 0, cameraDepth)
    camera.lookAt(0, 0, 0)
    const controls = new OrbitControls(camera, renderer.domElement)
    function animate() {
        controls.update()
        renderer.render(scene, camera)
    }
    setInterval(() => {
        animate()
    }, 1000 / 15)
    animate()

    // Load
    let loadedGroup = new THREE.Group()
    scene.add(loadedGroup)
    let pixelGroup = new THREE.Group()
    scene.add(pixelGroup)
    const fileInput = document.querySelector('#file-input') as HTMLInputElement
    let fileName = 'default'
    fileInput.addEventListener('change', async (e) => {
        const res = await loadFile(fileInput)
        if (!res) {
            return
        }
        const file = (fileInput.files as FileList)[0]
        const fileExtMatches = file.name.match(/\.(\w+)$/)
        if (!fileExtMatches) {
            return
        }
        const ext = fileExtMatches[1]
        fileName = file.name.replace(/\..+$/, '')
        let mesh: THREE.Mesh | THREE.Group
        if (ext.match(/gltf/)) {
            const loader = new GLTFLoader()
            mesh = (await loader.parseAsync(res, 'new.gltf')).scene
        } else if (ext.match(/obj/)) {
            const loader = new OBJLoader()
            mesh = loader.parse(`${res}`)
        } else {
            alert('Invalid File Extension')
            return
        }
        // Update
        scene.remove(loadedGroup)
        loadedGroup = new THREE.Group()
        loadedGroup.add(mesh)
        scene.add(loadedGroup)
    })

    // Solve
    const solveButton = document.querySelector('#solve-button') as HTMLButtonElement
    solveButton.addEventListener('click', () => {
        const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 0, cameraDepth), new THREE.Vector3(0, 0, -1), 0, cameraDepth * 3)
        const cameraVectors = [
            [1, 2, cameraDepth, 0, 0, -1],
            [1, 2, -cameraDepth, 0, 0, 1],
            //
            [-cameraDepth, 1, 2, 1, 0, 0],
            [cameraDepth, 1, 2, -1, 0, 0],
            //
            [1, cameraDepth, 2, 0, -1, 0],
            [1, -cameraDepth, 2, 0, 1, 0],
        ]
        const scanNum = Math.floor(pixelsNum / mesh2pixelRatio)
        const scanStep = 1 / mesh2pixelRatio
        const materials: { [r_g_b: string]: THREE.Material } = {}
        scene.remove(pixelGroup)
        pixelGroup = new THREE.Group()
        for (let c = 0; c < cameraVectors.length; c++) {
            const cv = cameraVectors[c]
            for (let l2 = -scanNum; l2 < scanNum; l2 += scanStep) {
                for (let l1 = -scanNum; l1 < scanNum; l1 += scanStep) {
                    const x = cv[0] === 1 ? l1 : cv[0] === 2 ? l2 : cv[0]
                    const y = cv[1] === 1 ? l1 : cv[1] === 2 ? l2 : cv[1]
                    const z = cv[2] === 1 ? l1 : cv[2] === 2 ? l2 : cv[2]
                    raycaster.set(new THREE.Vector3(x, y, z), new THREE.Vector3(cv[3], cv[4], cv[5]))
                    const intersects = raycaster.intersectObjects(scene.children)
                    if (intersects.length) {
                        intersects.forEach((intersect) => {
                            const { point, object } = intersect
                            const z = Math.floor(point.z * mesh2pixelRatio)
                            const y = Math.floor(point.y * mesh2pixelRatio)
                            const x = Math.floor(point.x * mesh2pixelRatio)
                            if (object.name === 'intersect' || bm.blocks[z][y][x]) {
                                return
                            }
                            const color = ((object as THREE.Mesh).material as any).color as THREE.Color
                            if (color?.isColor) {
                                const r = Math.floor(255 * color?.r)
                                const g = Math.floor(255 * color?.g)
                                const b = Math.floor(255 * color?.b)
                                bm.blocks[z][y][x] = new Block(rgbToMinecraftBlockName(r, g, b))
                                const geo = new THREE.BoxGeometry(scanStep, scanStep, scanStep)
                                const mat = materials[`${r}_${g}_${b}`] ?? new THREE.MeshLambertMaterial({ color: `rgb(${r}, ${g}, ${b})` })
                                materials[`${r}_${g}_${b}`] = mat
                                const mesh = new THREE.Mesh(geo, mat)
                                mesh.position.set(x / mesh2pixelRatio, y / mesh2pixelRatio, z / mesh2pixelRatio)
                                mesh.name = 'intersect'
                                pixelGroup.add(mesh)
                            }
                        })
                    }
                }
            }
        }
        scene.remove(loadedGroup)
        scene.add(pixelGroup)
    })

    //
    const rgbToMinecraftBlockName = (r: number, g: number, b: number) => {
        const list = {
            '0_0_0': 'black_wool',
            '1_1_1': 'light_gray_wool',
            '2_2_2': 'white_wool',
            //
            '1_0_0': 'brown_wool',
            '1_1_0': 'yellow_wool',
            '2_0_0': 'red_wool',
            '2_1_0': 'orange_wool',
            '2_2_0': 'yellow_wool',
            //
            '0_0_1': 'blue_wool',
            '0_0_2': 'light_blue_wool',
            '0_1_0': 'green_wool',
            '0_1_1': 'cyan_wool',
            '0_1_2': 'cyan_wool',
            '0_2_0': 'lime_wool',
            '0_2_1': 'lime_wool',
            '0_2_2': 'cyan_wool',
            //
            '1_0_1': 'purple_wool',
            '1_0_2': 'purple_wool',
            '2_0_1': 'magenta_wool',
            '2_0_2': 'magenta_wool',
        }
        return list[`${Math.min(Math.floor(r / 85), 2)}_${Math.min(Math.floor(g / 85), 2)}_${Math.min(Math.floor(b / 85), 2)}`] || 'stone'
    }

    // Export
    const exportButton = document.querySelector('#export-button') as HTMLButtonElement
    exportButton.addEventListener('click', async () => bm.export('c'))
})
