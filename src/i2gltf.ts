import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import { saveAs } from 'file-saver'
import { loadImage } from './common/utils'

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

    //
    let alphaPositions: AlphaPositions = {}
    const depthInput = document.querySelector('#depth-input') as HTMLInputElement
    depthInput.addEventListener('change', async (e) => {
        const img = await loadImage(depthInput)
        if (!img) {
            return
        }
        const canvas = document.createElement('canvas')
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
    })

    //
    const frontCanvas = document.createElement('canvas')
    frontCanvas.width = 100
    frontCanvas.height = 100
    document.body.appendChild(frontCanvas)
    const frontInput = document.querySelector('#front-input') as HTMLInputElement
    frontInput.addEventListener('change', async (e) => {
        const img = await loadImage(frontInput)
        if (!img) {
            return
        }
        frontCanvas.width = img.width
        frontCanvas.height = img.height
        const ctx = frontCanvas.getContext('2d') as CanvasRenderingContext2D
        ctx.clearRect(0, 0, frontCanvas.width, frontCanvas.height)
        ctx.drawImage(img, 0, 0, frontCanvas.width, frontCanvas.height)
    })

    //
    const backCanvas = document.createElement('canvas')
    backCanvas.width = 100
    backCanvas.height = 100
    backCanvas.getContext('2d')?.fillRect(0, 0, backCanvas.width, backCanvas.height)
    document.body.appendChild(backCanvas)
    const backInput = document.querySelector('#back-input') as HTMLInputElement
    backInput.addEventListener('change', async (e) => {
        const img = await loadImage(backInput)
        if (!img) {
            return
        }
        backCanvas.width = img.width
        backCanvas.height = img.height
        const ctx = backCanvas.getContext('2d') as CanvasRenderingContext2D
        ctx.clearRect(0, 0, backCanvas.width, backCanvas.height)
        ctx.drawImage(img, 0, 0, backCanvas.width, backCanvas.height)
    })

    // Convert
    const convertBtn = document.querySelector('#convert-btn') as HTMLButtonElement
    convertBtn.addEventListener('click', async () => {
        scene.remove(renderGroup)
        renderGroup = canvas2Mesh(frontCanvas, backCanvas, alphaPositions) || new THREE.Group()
        scene.add(renderGroup)
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

const canvas2Mesh = (frontCanvas: HTMLCanvasElement, backCanvas: HTMLCanvasElement, alphaPositions = {}): THREE.Group | undefined => {
    const canvas = frontCanvas
    const ctx = frontCanvas.getContext('2d') as CanvasRenderingContext2D
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const pixels: (Pixel | undefined)[][] = []
    const meshRatio = 1 / canvas.width
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

    // Texture without pink
    const frontTextureCanvas = document.createElement('canvas')
    frontTextureCanvas.width = frontCanvas.width
    frontTextureCanvas.height = frontCanvas.height
    frontTextureCanvas.getContext('2d')?.drawImage(frontCanvas, 0, 0, frontCanvas.width, frontCanvas.height)
    const frontTexture = new THREE.CanvasTexture(frontTextureCanvas)
    frontTexture.needsUpdate = true
    const frontMaterial = new THREE.MeshBasicMaterial({
        map: frontTexture,
        transparent: true,
    })
    const backTextureCanvas = document.createElement('canvas')
    backTextureCanvas.width = backCanvas.width
    backTextureCanvas.height = backCanvas.height
    backTextureCanvas.getContext('2d')?.drawImage(backCanvas, 0, 0, backCanvas.width, backCanvas.height)
    const backTexture = new THREE.CanvasTexture(backTextureCanvas)
    backTexture.needsUpdate = true
    const backMaterial = new THREE.MeshBasicMaterial({
        map: backTexture,
        transparent: true,
    })

    //
    let startPoint: Pixel | undefined = undefined
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const pixel = pixels[y][x]
            if (
                pixel &&
                (x === 0 ||
                    y === 0 ||
                    x === canvas.width - 1 ||
                    y === canvas.height - 1 ||
                    !pixels[y - 1][x] ||
                    !pixels[y - 1][x + 1] ||
                    !pixels[y][x + 1] ||
                    !pixels[y + 1][x + 1] ||
                    !pixels[y + 1][x] ||
                    !pixels[y + 1][x - 1] ||
                    !pixels[y][x - 1] ||
                    !pixels[y - 1][x - 1])
            ) {
                ctx.fillStyle = '#f0f'
                ctx.fillRect(x, y, 1, 1)
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

    // Middle Plane
    const shape = new THREE.Shape()
    validPoints.forEach((point, i) => {
        if (!point) {
            return
        }
        const x = (point.x - frontCanvas.width / 2) * meshRatio
        const y = (-point.y + frontCanvas.height / 2) * meshRatio
        if (i === 0) {
            shape.moveTo(x, y)
        } else {
            shape.lineTo(x, y)
        }
    })
    shape.closePath()
    const middleMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: '#000', side: THREE.DoubleSide }))
    middleMesh.position.y += (frontCanvas.height * meshRatio) / 2
    renderGroup.add(middleMesh)

    // Front Plane
    const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(frontCanvas.width * meshRatio, frontCanvas.height * meshRatio, 10, 10), frontMaterial)
    frontMesh.position.z += 0.002
    frontMesh.position.y += (frontCanvas.height * meshRatio) / 2
    renderGroup.add(frontMesh)

    // Back Plane
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(backCanvas.width * meshRatio, backCanvas.height * meshRatio, 10, 10), backMaterial)
    backMesh.position.z -= 0.002
    backMesh.position.y += (backCanvas.height * meshRatio) / 2
    backMesh.rotateY(Math.PI)
    renderGroup.add(backMesh)

    return renderGroup
}
