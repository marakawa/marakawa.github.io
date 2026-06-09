import * as THREE from 'three'
import { createWorld3d } from './world3d'

const WORLD_SIZE = 16
const LS_KEY = 'VOXEL_STATE'
const w3 = createWorld3d(WORLD_SIZE, document.querySelector('.container') as HTMLDivElement, 1)

type COLOR_TYPE = 'COLOR1' | 'COLOR2' | 'COLOR3' | 'COLOR4'
type PUT_TYPE = 'PAINT' | 'ADD' | 'REMOVE' | 'REMOVE_LINE'

// Controls
let colorType: COLOR_TYPE = 'COLOR1'
let putType: PUT_TYPE = 'ADD'
const undoButton = document.querySelector('.undo-btn') as HTMLButtonElement
const redoButton = document.querySelector('.redo-btn') as HTMLButtonElement
const resetButton = document.querySelector('.reset-btn') as HTMLButtonElement
const frontButton = document.querySelector('.front-btn') as HTMLButtonElement
const sideButton = document.querySelector('.side-btn') as HTMLButtonElement
const topButton = document.querySelector('.top-btn') as HTMLButtonElement
const color1Button = document.querySelector('.color1-btn') as HTMLButtonElement
const color2Button = document.querySelector('.color2-btn') as HTMLButtonElement
const color3Button = document.querySelector('.color3-btn') as HTMLButtonElement
const color4Button = document.querySelector('.color4-btn') as HTMLButtonElement
const paintButton = document.querySelector('.paint-btn') as HTMLButtonElement
const addButton = document.querySelector('.add-btn') as HTMLButtonElement
const removeButton = document.querySelector('.remove-btn') as HTMLButtonElement
const removeLineButton = document.querySelector('.remove-line-btn') as HTMLButtonElement

undoButton.addEventListener('click', () => undo())
redoButton.addEventListener('click', () => redo())
resetButton.addEventListener('click', () => {
    localStorage.removeItem(LS_KEY)
    location.reload()
})
frontButton.addEventListener('click', () => w3.showFront())
sideButton.addEventListener('click', () => w3.showSide())
topButton.addEventListener('click', () => w3.showTop())

color1Button.addEventListener('click', () => (colorType = 'COLOR1'))
color2Button.addEventListener('click', () => (colorType = 'COLOR2'))
color3Button.addEventListener('click', () => (colorType = 'COLOR3'))
color4Button.addEventListener('click', () => (colorType = 'COLOR4'))
paintButton.addEventListener('click', () => (putType = 'PAINT'))
addButton.addEventListener('click', () => (putType = 'ADD'))
removeButton.addEventListener('click', () => (putType = 'REMOVE'))
removeLineButton.addEventListener('click', () => (putType = 'REMOVE_LINE'))

// Box
interface Box {
    x: number
    y: number
    z: number
    color: string
}
function createBox(x: number, y: number, z: number, color: string) {
    const box: Box = { x, y, z, color }
    return box
}

// History
interface BoxHistory {
    type: PUT_TYPE
    boxes: Box[]
    value?: string
}

// State
interface State {
    boxes: Box[]
    _boxHistoryIndex: number
    _boxHistories: BoxHistory[]
    _boxMeshes: THREE.Mesh[]
}
const state: State = {
    boxes: [],
    _boxHistoryIndex: -1,
    _boxHistories: [],
    _boxMeshes: [],
}

// Save & Load
const geometry = new THREE.BoxGeometry(1, 1, 1)
function addVoxel(box: Box, forLoad = false) {
    const index = state.boxes.findIndex((b) => box.x === b.x && box.y === b.y && box.z === b.z)
    if (!forLoad && index >= 0) {
        return
    }
    // Mesh
    if (!w3.materials[box.color]) {
        w3.materials[box.color] = new THREE.MeshStandardMaterial({ color: box.color })
    }
    const mesh = new THREE.Mesh(geometry, w3.materials[box.color])
    mesh.userData.box = box
    mesh.position.set(box.x, box.y, box.z)
    // Add
    w3.scene.add(mesh)
    if (!forLoad) {
        state.boxes.push(box)
    }
    state._boxMeshes.push(mesh)
    save()
    w3.render()
}
function removeVoxel(box: Box) {
    const index = state.boxes.findIndex((b) => box.x === b.x && box.y === b.y && box.z === b.z)
    if (index === -1) {
        return
    }
    // Mesh
    const mesh = state._boxMeshes[index]
    // Remove
    w3.scene.remove(mesh)
    state.boxes.splice(index, 1)
    state._boxMeshes.splice(index, 1)
    save()
    w3.render()
}
function paintVoxel(box: Box, color: string) {
    const index = state.boxes.findIndex((b) => box.x === b.x && box.y === b.y && box.z === b.z)
    if (index === -1) {
        return
    }
    // Mesh
    const mesh = state._boxMeshes[index]
    // Paint
    if (!w3.materials[color]) {
        w3.materials[color] = new THREE.MeshStandardMaterial({ color })
    }
    mesh.material = w3.materials[color]
    state.boxes[index].color = color
    save()
    w3.render()
}
function save() {
    const savedState: any = { ...state }
    Object.keys(savedState).forEach((stateKey) => {
        if (stateKey.startsWith('_')) {
            delete savedState[stateKey]
        }
    })
    localStorage.setItem(LS_KEY, JSON.stringify(savedState))
}
function load() {
    const loadedState = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
    Object.keys(state).forEach((stateKey) => {
        if (stateKey in loadedState) {
            // @ts-ignore
            state[stateKey] = loadedState[stateKey]
        }
    })
    state.boxes.forEach((b) => {
        addVoxel(b, true)
    })
}
load()
if (state._boxMeshes.length === 0) {
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let z = 0; z < WORLD_SIZE; z++) {
            if (
                x === Math.floor(WORLD_SIZE / 2) ||
                x === Math.floor(WORLD_SIZE / 2 - 1) ||
                z === Math.floor(WORLD_SIZE / 2) ||
                z === Math.floor(WORLD_SIZE / 2 - 1)
            ) {
                const box = createBox(x, -1, z, '#fff')
                addVoxel(box)
            }
        }
    }
}
save()

// History
function redo() {
    const nextHistoryIndex = state._boxHistoryIndex + 1
    if (!state._boxHistories[nextHistoryIndex]) return
    const boxHistory = state._boxHistories[nextHistoryIndex]

    if (boxHistory.type === 'PAINT') {
        boxHistory.boxes.forEach((box) => {
            paintVoxel(box, box.color)
        })
    } else if (boxHistory.type === 'REMOVE') {
        boxHistory.boxes.forEach((box) => {
            removeVoxel(box)
        })
    } else if (boxHistory.type === 'ADD') {
        boxHistory.boxes.forEach((box) => {
            addVoxel(box)
        })
    }
    state._boxHistoryIndex = nextHistoryIndex
}
function undo() {
    const currentHistoryIndex = state._boxHistoryIndex
    if (!state._boxHistories[currentHistoryIndex]) return
    const boxHistory = state._boxHistories[currentHistoryIndex]

    if (boxHistory.type === 'PAINT') {
        boxHistory.boxes.forEach((box) => {
            paintVoxel(box, boxHistory.value || '#f0f')
        })
    } else if (boxHistory.type === 'REMOVE') {
        boxHistory.boxes.forEach((box) => {
            addVoxel(box)
        })
    } else if (boxHistory.type === 'ADD') {
        boxHistory.boxes.forEach((box) => {
            removeVoxel(box)
        })
    }
    state._boxHistoryIndex = currentHistoryIndex - 1
}
function pushHistory(type: PUT_TYPE, boxes: Box[], value: string | undefined = undefined) {
    state._boxHistoryIndex += 1
    state._boxHistories = state._boxHistories.slice(0, state._boxHistoryIndex)
    state._boxHistories.push({ type, boxes: [...boxes.map((b) => ({ ...b }))], value })
}

// Remove
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
function shoot(event: PointerEvent) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, w3.camera)
    const intersects = raycaster.intersectObjects(state._boxMeshes)
    if (intersects.length === 0) return
    // PAINT
    if (putType === 'PAINT') {
        intersects.forEach((intersect, i) => {
            if (putType === 'PAINT' && i > 0) return
            const hit = intersect.object as THREE.Mesh
            const cb = hit.userData.box as Box
            const box = cb
            if (box.y < 0) return
            const prevColor = box.color
            const nextColor = getColor(colorType)
            const mirrorX = WORLD_SIZE - 1 - box.x
            const existsBox = state.boxes.find(
                (b) => b.x === mirrorX && b.y === box.y && b.z === box.z,
            )
            if (existsBox) {
                const mirrorBox = existsBox
                paintVoxel(box, nextColor)
                paintVoxel(mirrorBox, nextColor)
                pushHistory('PAINT', [box, mirrorBox], prevColor)
            }
        })
    }
    // REMOVE
    if (putType === 'REMOVE' || putType === 'REMOVE_LINE') {
        intersects.forEach((intersect, i) => {
            if (putType === 'REMOVE' && i > 0) return
            const hit = intersect.object as THREE.Mesh
            const cb = hit.userData.box as Box
            const box = cb
            if (box.y < 0) return
            const mirrorX = WORLD_SIZE - 1 - box.x
            const existsBox = state.boxes.find(
                (b) => b.x === mirrorX && b.y === box.y && b.z === box.z,
            )
            if (existsBox) {
                const mirrorBox = existsBox
                removeVoxel(box)
                removeVoxel(mirrorBox)
                pushHistory('REMOVE', [box, mirrorBox])
            }
        })
    }
    // ADD
    if (putType === 'ADD') {
        intersects.forEach((intersect, i) => {
            if (putType === 'ADD' && i > 0) return
            const hit = intersect.object as THREE.Mesh
            const cb = hit.userData.box as Box
            let box: Box
            let color = getColor(colorType)
            if (intersect.point.x <= cb.x - 0.5) {
                box = createBox(cb.x - 1, cb.y, cb.z, color)
            } else if (intersect.point.x >= cb.x + 0.5) {
                box = createBox(cb.x + 1, cb.y, cb.z, color)
            } else if (intersect.point.y <= cb.y - 0.5) {
                box = createBox(cb.x, cb.y - 1, cb.z, color)
            } else if (intersect.point.y >= cb.y + 0.5) {
                box = createBox(cb.x, cb.y + 1, cb.z, color)
            } else if (intersect.point.z <= cb.z - 0.5) {
                box = createBox(cb.x, cb.y, cb.z - 1, color)
            } else {
                box = createBox(cb.x, cb.y, cb.z + 1, color)
            }
            if (box.y < 0) return
            const mirrorX = WORLD_SIZE - 1 - box.x
            const existsBox = state.boxes.find(
                (b) => b.x === mirrorX && b.y === box.y && b.z === box.z,
            )
            if (!existsBox) {
                const mirrorBox = createBox(mirrorX, box.y, box.z, color)
                addVoxel(box)
                addVoxel(mirrorBox)
                pushHistory('ADD', [box, mirrorBox])
            }
        })
    }
}

function getColor(colorType: COLOR_TYPE) {
    if (colorType === 'COLOR1') {
        return '#336'
    } else if (colorType === 'COLOR2') {
        return '#66c'
    } else if (colorType === 'COLOR3') {
        return '#99e'
    } else {
        return '#eee'
    }
}

// Event
let downPointer: { x: number; y: number } | undefined = undefined
window.addEventListener('pointerdown', (e) => {
    downPointer = { x: e.pageX, y: e.pageY }
    w3.render()
})
window.addEventListener('pointermove', () => {
    if (!downPointer) return
    w3.render()
})
window.addEventListener('pointerup', (e) => {
    if (!downPointer) return
    if (
        e.target === w3.renderer.domElement &&
        Math.hypot(e.pageY - downPointer.y, e.pageX - downPointer.x) < 10
    ) {
        shoot(e)
    }
    w3.render()
    downPointer = undefined
})
window.addEventListener('wheel', () => {
    w3.render()
})
window.addEventListener('keydown', (e) => {
    if (e.metaKey && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        redo()
    } else if (e.metaKey && e.key === 'z') {
        e.preventDefault()
        undo()
    }
})

// Render
w3.render()
