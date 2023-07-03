import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { saveAs } from 'file-saver'

const wait = (d: number) => new Promise((resolve) => setTimeout(resolve, d))

const alphaRange = 10

window.addEventListener('load', () => {
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(512, 512)
    document.body.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('rgb(240, 230, 255)')
    const camera = new THREE.PerspectiveCamera(45, renderer.domElement.width / renderer.domElement.height, 1, 1000)
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)
    const controls = new OrbitControls(camera, renderer.domElement)
    function animate() {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }
    animate()
    let renderGroup = new THREE.Group()
    scene.add(renderGroup)

    // Canvas
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    document.body.appendChild(canvas)

    //
    let alphaPositions: AlphaPositions = {}
    const depthInput = document.querySelector('#depth-input') as HTMLInputElement
    depthInput.addEventListener('change', (e) => {
        const files = depthInput.files
        if (!files) {
            return
        }
        const file = files[0]
        const img = new Image()
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    //
                    alphaPositions = {}
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const i = y * canvas.width * 4 + x * 4
                            const r = imageData.data[i + 0]
                            const g = imageData.data[i + 1]
                            const b = imageData.data[i + 2]
                            if (r < alphaRange && g < alphaRange && b < alphaRange) {
                                alphaPositions[`${x}_${y}`] = true
                            }
                        }
                    }
                }
                img.src = reader.result as string
            }
        }
        reader.readAsDataURL(file)
    })

    //
    const fileInput = document.querySelector('#file-input') as HTMLInputElement
    fileInput.addEventListener('change', (e) => {
        const files = fileInput.files
        if (!files) {
            return
        }
        const file = files[0]
        const img = new Image()
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                img.onload = () => {
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    //
                    scene.remove(renderGroup)
                    renderGroup = canvas2Mesh(canvas, alphaPositions) || new THREE.Group()
                    renderGroup.scale.set(0.005, 0.005, 0.005)
                    scene.add(renderGroup)
                }
                img.src = reader.result as string
            }
        }
        reader.readAsDataURL(file)
    })

    // Export
    const exportBtn = document.querySelector('#export-btn') as HTMLButtonElement
    exportBtn.addEventListener('click', async () => {
        const gltfExporter = new GLTFExporter()
        gltfExporter.parse(
            scene,
            (gltfJson) => saveAs(new Blob([JSON.stringify(gltfJson)], { type: 'application/json' }), `download.glb`),
            () => {},
        )
    })
})

interface Pixel {
    x: number
    y: number
    r: number
    g: number
    b: number
    a: number
    line: boolean
}

interface AlphaPositions {
    [x_y: string]: boolean
}

const canvas2Mesh = (canvas: HTMLCanvasElement, alphaPositions = {}): THREE.Group | undefined => {
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const pixels: (Pixel | undefined)[][] = []
    for (let y = 0; y < canvas.height; y++) {
        pixels[y] = []
        for (let x = 0; x < canvas.width; x++) {
            const i = y * canvas.width * 4 + x * 4
            const pixel = (pixels[y][x] = {
                x,
                y,
                r: pixelData[i + 0],
                g: pixelData[i + 1],
                b: pixelData[i + 2],
                a: pixelData[i + 3],
                line: false,
            })
            if (alphaPositions[`${pixel.x}_${pixel.y}`]) {
                pixel.a = 0
            }
            if (pixel.a < 256 - alphaRange) {
                pixels[y][x] = undefined
                ctx.clearRect(x, y, 1, 1)
            }
        }
    }
    let startPoint: Pixel | undefined = undefined
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const pixel = pixels[y][x]
            if (
                pixel &&
                !(x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) &&
                (!pixels[y - 1][x] || !pixels[y - 1][x + 1] || !pixels[y][x + 1] || !pixels[y + 1][x + 1] || !pixels[y + 1][x] || !pixels[y + 1][x - 1] || !pixels[y][x - 1] || !pixels[y - 1][x - 1])
            ) {
                // ctx.fillStyle = '#f0f'
                // ctx.fillRect(x, y, 1, 1)
                pixel.line = true
                startPoint = pixel
            }
        }
    }
    if (!startPoint) {
        return
    }
    let p: Pixel | undefined
    const validPoints: Pixel[] = []
    const checkedPoints: Pixel[] = []
    const next = (cp: Pixel) => {
        if (!cp) {
            return
        }
        if (checkedPoints.indexOf(cp) >= 0) {
            return checkedPoints.length > 1 && startPoint === cp
        }
        checkedPoints.push(cp)
        if (
            (cp.y > 0 && cp.x > 0 && (p = pixels[cp.y - 1][cp.x - 1]) && p.line && next(p)) ||
            (cp.y > 0 && (p = pixels[cp.y - 1][cp.x]) && p.line && next(p)) ||
            (cp.y > 0 && cp.x < canvas.width - 1 && (p = pixels[cp.y - 1][cp.x + 1]) && p.line && next(p)) ||
            (cp.x < canvas.width - 1 && (p = pixels[cp.y][cp.x + 1]) && p.line && next(p)) ||
            (cp.y < canvas.height - 1 && cp.x < canvas.width - 1 && (p = pixels[cp.y + 1][cp.x + 1]) && p.line && next(p)) ||
            (cp.y < canvas.height - 1 && (p = pixels[cp.y + 1][cp.x]) && p.line && next(p)) ||
            (cp.y < canvas.height - 1 && cp.x > 0 && (p = pixels[cp.y + 1][cp.x - 1]) && p.line && next(p)) ||
            (cp.x > 0 && (p = pixels[cp.y][cp.x - 1]) && p.line && next(p))
        ) {
            validPoints.push(cp)
            return true
        } else {
            return false
        }
    }
    next(startPoint)
    if (validPoints.length <= 1) {
        throw new Error('Invalid Points')
    }

    // Smooth
    for (let i = validPoints.length - 1; i >= 2; i--) {
        const p = validPoints[i]
        if (p) {
            for (let c = i - 2; c >= 1; c--) {
                if ((p.x === validPoints[c]?.x && p.x === validPoints[c + 1]?.x) || (p.y === validPoints[c]?.y && p.y === validPoints[c + 1]?.y)) {
                    delete validPoints[c + 1]
                }
            }
        }
    }

    // 3D
    const renderGroup = new THREE.Group()

    // Back Plane
    const shape = new THREE.Shape()
    validPoints.forEach((point, i) => {
        if (!point) {
            return
        }
        const x = point.x - canvas.width / 2
        const y = -point.y + canvas.height / 2
        if (i === 0) {
            shape.moveTo(x, y)
        } else {
            shape.lineTo(x, y)
        }
    })
    shape.closePath()
    const backMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: '#000', side: THREE.DoubleSide }))
    backMesh.position.z -= 0.5
    backMesh.position.y += canvas.height / 2
    renderGroup.add(backMesh)

    // Front Plane
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
    })
    const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width, canvas.height), material)
    frontMesh.position.z += 0.5
    frontMesh.position.y += canvas.height / 2
    renderGroup.add(frontMesh)

    return renderGroup
}
