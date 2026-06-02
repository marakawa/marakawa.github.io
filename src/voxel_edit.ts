import * as THREE from 'three'
import { createWorld3d } from './world3d'

const WORLD_SIZE = 8
const LS_KEY = 'VOXEL_STATE'
const w3 = createWorld3d(WORLD_SIZE, document.querySelector('.container') as HTMLDivElement)

// Controls
let colorType = 'COLOR'
let putType = 'ADD'
const colorButton = document.querySelector('.color-btn') as HTMLButtonElement
const blackButton = document.querySelector('.black-btn') as HTMLButtonElement
const addButton = document.querySelector('.add-btn') as HTMLButtonElement
const removeButton = document.querySelector('.remove-btn') as HTMLButtonElement
const removeLineButton = document.querySelector('.remove-line-btn') as HTMLButtonElement
const resetButton = document.querySelector('.reset-btn') as HTMLButtonElement
colorButton.addEventListener('pointerdown', () => (colorType = 'COLOR'))
blackButton.addEventListener('pointerdown', () => (colorType = 'BLACK'))
addButton.addEventListener('pointerdown', () => (putType = 'ADD'))
removeButton.addEventListener('pointerdown', () => (putType = 'REMOVE'))
removeLineButton.addEventListener('pointerdown', () => (putType = 'REMOVE_LINE'))
resetButton.addEventListener('pointerdown', () => {
    localStorage.removeItem(LS_KEY)
    location.reload()
})

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
    type: string // "ADD" "REMOVE" "REMOVE_LINE"
    box: Box
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
function xyzToColor(x: number, y: number, z: number) {
    return `hsl(${(y / WORLD_SIZE) * 0.3 * 360}, ${30 + x * 5}%, ${30 + z * 5}%)`
}
if (state._boxMeshes.length === 0) {
    for (let x = 0; x < WORLD_SIZE; x++) {
        for (let y = 0; y < WORLD_SIZE; y++) {
            for (let z = 0; z < WORLD_SIZE; z++) {
                const box = createBox(x, y, z, xyzToColor(x, y, z))
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

    if (boxHistory.type === 'REMOVE') {
        removeVoxel(boxHistory.box)
    } else if (boxHistory.type === 'ADD') {
        addVoxel(boxHistory.box)
    }
    state._boxHistoryIndex = nextHistoryIndex
}
function undo() {
    const currentHistoryIndex = state._boxHistoryIndex
    if (!state._boxHistories[currentHistoryIndex]) return
    const boxHistory = state._boxHistories[currentHistoryIndex]

    if (boxHistory.type === 'REMOVE') {
        addVoxel(boxHistory.box)
    } else if (boxHistory.type === 'ADD') {
        removeVoxel(boxHistory.box)
    }
    state._boxHistoryIndex = currentHistoryIndex - 1
}
function pushHistory(type: string, box: Box) {
    state._boxHistoryIndex += 1
    state._boxHistories = state._boxHistories.slice(0, state._boxHistoryIndex)
    state._boxHistories.push({ type, box })
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
    // REMOVE
    if (putType === 'REMOVE' || putType === 'REMOVE_LINE') {
        intersects.forEach((intersect, i) => {
            if (putType === 'REMOVE' && i > 0) return
            const hit = intersect.object as THREE.Mesh
            const cb = hit.userData.box as Box
            const box = cb
            removeVoxel(box)
            pushHistory('REMOVE', box)
            const mirrorX = WORLD_SIZE - 1 - box.x
            const existsBox = state.boxes.find(
                (b) => b.x === mirrorX && b.y === box.y && b.z === box.z,
            )
            if (existsBox) {
                const mirrorBox = existsBox
                removeVoxel(mirrorBox)
                pushHistory('REMOVE', mirrorBox)
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
            let color = colorType === 'COLOR' ? xyzToColor(cb.x, cb.y, cb.z) : '#333333'
            if (intersect.point.x <= cb.x - 0.5) {
                box = createBox(cb.x - 1, cb.y, cb.z, color)
            } else if (intersect.point.x >= cb.x + 0.5) {
                box = createBox(cb.x + 1, cb.y, cb.z, color)
            } else if (intersect.point.y <= cb.y - 0.5) {
                color = colorType === 'COLOR' ? xyzToColor(cb.x, cb.y - 1, cb.z) : '#333333'
                box = createBox(cb.x, cb.y - 1, cb.z, color)
            } else if (intersect.point.y >= cb.y + 0.5) {
                color = colorType === 'COLOR' ? xyzToColor(cb.x, cb.y + 1, cb.z) : '#333333'
                box = createBox(cb.x, cb.y + 1, cb.z, color)
            } else if (intersect.point.z <= cb.z - 0.5) {
                box = createBox(cb.x, cb.y, cb.z - 1, color)
            } else {
                box = createBox(cb.x, cb.y, cb.z + 1, color)
            }
            addVoxel(box)
            pushHistory('ADD', box)
            const mirrorX = WORLD_SIZE - 1 - box.x
            const existsBox = state.boxes.find(
                (b) => b.x === mirrorX && b.y === box.y && b.z === box.z,
            )
            if (!existsBox) {
                const mirrorBox = createBox(mirrorX, box.y, box.z, color)
                addVoxel(mirrorBox)
                pushHistory('ADD', mirrorBox)
            }
        })
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
    if (Math.hypot(e.pageY - downPointer.y, e.pageX - downPointer.x) < 10) {
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
