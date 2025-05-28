const INSTS = [
    // [81, 'Open Triangle'],
    // [80, 'Mute Triangle'],
    // [79, 'Open Cuica'],
    // [78, 'Mute Cuica'],
    // [77, 'Low Wood Block'],
    // [76, 'High Wood Block'],
    // [75, 'Claves'],
    // [74, 'Long Guiro'],
    // [73, 'Short Guiro'],
    // [72, 'Long Whistle'],
    // [71, 'Short Whistle'],
    // [70, 'Maracas'],
    // [69, 'Cabasa'],
    // [68, 'Low Agogo'],
    // [67, 'High Agogo'],
    // [66, 'Low Timbale'],
    // [65, 'High Timbale'],
    // [64, 'Low Conga'],
    // [63, 'Open High Conga'],
    // [62, 'Mute High Conga'],
    // [61, 'Low Bongo'],
    // [60, 'High Bongo'],
    // [59, 'Ride Cymbal 2'],
    // [58, 'Vibra-slap'],
    // [57, 'Crash Cymbal 2'],
    // [56, 'Cowbell'],
    // [55, 'Splash Cymbal'],
    // [54, 'Tambourine'],
    // [53, 'Ride Bell'],
    [52, 'Chinese Cymbal'],
    [51, 'Ride Cymbal 1'],
    [50, 'High Tom'],
    [49, 'Crash Cymbal 1'],
    [48, 'High Mid Tom'],
    [47, 'Low-Mid Tom'],
    [46, 'Open Hi-hat'],
    [45, 'Low Tom'],
    [44, 'Pedal Hi-hat'],
    [43, 'High Floor Tom'],
    [42, 'Closed Hi-hat'],
    [41, 'Low Floor Tom'],
    [40, 'Electric Snare'],
    [39, 'Hand Clap'],
    [38, 'Acoustic Snare'],
    [37, 'Side Stick'],
    [36, 'Bass Drum 1'],
]
const instIds = INSTS.map((inst) => inst[0])
const instNames = INSTS.map((inst) => inst[1])
const CELL_SIZE = Math.floor((window.innerHeight - 20) / INSTS.length)
const BPM = 120
const NOTES_IN_BAR = 8
const BAR_NUM = 20

function main() {
    const canvas = document.createElement('canvas')
    canvas.width = CELL_SIZE * NOTES_IN_BAR * BAR_NUM
    canvas.height = CELL_SIZE * INSTS.length
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return
    }

    //
    const logElem = document.querySelector('#log')
    const dlBtn = document.querySelector('#dl-btn')
    const clearBtn = document.querySelector('#clear-btn')

    //
    class Vector2 {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }
    const load = () => {
        return JSON.parse(localStorage.getItem('RC10R_DRUMS_NOTES') || '[]')
    }
    const save = () => {
        localStorage.setItem('RC10R_DRUMS_NOTES', JSON.stringify(notes))
    }
    let notes = load()

    // Events
    let isPressed = false
    let mousedownPosition = new Vector2(0, 0)
    const getMousePositionByE = (e) => {
        const rect = e.target.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }
    canvas.addEventListener('mousedown', (e) => {
        const mpos = getMousePositionByE(e)
        const xIndex = Math.floor(mpos.x / CELL_SIZE)
        const instIndex = Math.floor(mpos.y / CELL_SIZE)
        mousedownPosition = new Vector2(xIndex, instIndex)
        //
        if (isPressed) {
            return
        }
        isPressed = true
    })
    canvas.addEventListener('mousemove', (e) => {
        if (!isPressed) {
            return
        }
    })
    canvas.addEventListener('mouseup', (e) => {
        const mpos = getMousePositionByE(e)
        const instIndex = Math.floor(mpos.y / CELL_SIZE)
        const xIndex = Math.floor(mpos.x / CELL_SIZE)
        if (mousedownPosition.x === xIndex && mousedownPosition.y === instIndex) {
            const existsNoteIndex = notes.findIndex((n) => n.x === xIndex && n.y === instIndex)
            if (existsNoteIndex >= 0) {
                notes.splice(existsNoteIndex, 1)
            } else {
                notes.push(new Vector2(xIndex, instIndex))
            }
            save()
        }
        //
        if (!isPressed) {
            return
        }
        isPressed = false
    })

    //
    clearBtn.addEventListener('click', () => {
        notes = []
        save()
    })
    dlBtn.addEventListener('click', () => {
        const midi = new Midi()
        const track = midi.addTrack()
        const cellDuration = 1 / (BPM / 60) / (NOTES_IN_BAR / 4)
        notes.forEach((note) => {
            track.addNote({
                midi: instIds[note.y],
                time: cellDuration * note.x,
                duration: cellDuration,
            })
        })
        const blob = new Blob([midi.toArray()], { type: 'audio/midi' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'download.mid'
        a.click()
        URL.revokeObjectURL(url)
    })

    // Render
    const render = () => {
        // BG
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        //
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
        ctx.fillRect(0, 0, NOTES_IN_BAR * CELL_SIZE * 1, canvas.height)
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)'
        ctx.fillRect(NOTES_IN_BAR * CELL_SIZE, 0, NOTES_IN_BAR * CELL_SIZE * 8, canvas.height)
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
        ctx.fillRect(NOTES_IN_BAR * CELL_SIZE * 9, 0, NOTES_IN_BAR * CELL_SIZE * 1, canvas.height)
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'
        ctx.fillRect(NOTES_IN_BAR * CELL_SIZE * 10, 0, NOTES_IN_BAR * CELL_SIZE * 8, canvas.height)
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)'
        ctx.fillRect(NOTES_IN_BAR * CELL_SIZE * 18, 0, NOTES_IN_BAR * CELL_SIZE * 1, canvas.height)
        ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'
        ctx.fillRect(NOTES_IN_BAR * CELL_SIZE * 19, 0, NOTES_IN_BAR * CELL_SIZE * 1, canvas.height)
        //
        for (let x = 0; x < NOTES_IN_BAR * BAR_NUM; x += NOTES_IN_BAR) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(x * CELL_SIZE, (INSTS.length - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
        for (let x = NOTES_IN_BAR / 2; x < NOTES_IN_BAR * BAR_NUM; x += NOTES_IN_BAR) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(x * CELL_SIZE, (INSTS.length - 3) * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
        //
        for (let x = 0; x < NOTES_IN_BAR * BAR_NUM; x += 1) {
            ctx.fillStyle = x % NOTES_IN_BAR === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
            ctx.fillRect(x * CELL_SIZE, 0, 1, canvas.height)
        }
        for (let y = 0; y < instNames.length; y += 1) {
            ctx.fillStyle = '#333'
            ctx.fillRect(0, y * CELL_SIZE, canvas.width, 1)
        }
        //
        for (let x = 0; x < NOTES_IN_BAR * BAR_NUM; x += NOTES_IN_BAR * 2) {
            for (let y = 0; y < instNames.length; y += 1) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
                ctx.font = `${CELL_SIZE}px sans-serif`
                ctx.textBaseline = 'top'
                ctx.fillText(instNames[y], x * CELL_SIZE, y * CELL_SIZE)
            }
        }
        //
        notes.forEach((note) => {
            ctx.fillStyle = '#fff'
            ctx.fillRect(note.x * CELL_SIZE, note.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        })
    }
    render()
    setInterval(() => render(), 1000 / 8)
}

window.addEventListener('load', main)
