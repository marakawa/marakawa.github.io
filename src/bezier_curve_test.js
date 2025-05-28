function main() {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return
    }

    // Events
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
    }
    let isPressed = false
    let layers = []
    let currentPoints = []
    const POINT_SPAN = 1
    const APPLY_SPAN = 5
    const getPointByE = (e) => {
        const rect = e.target.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        return new Point(x, y)
    }
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        currentPoints = []
        layers = []
    })
    canvas.addEventListener('mousedown', (e) => {
        if (isPressed) {
            return
        }
        isPressed = true
        const point = getPointByE(e)
        currentPoints = [point, point]
        const layer = [point, point]
        layers.push(layer)
    })
    canvas.addEventListener('mousemove', (e) => {
        if (!isPressed) {
            return
        }
        const point = getPointByE(e)
        const lastPoint = currentPoints[currentPoints.length - 1]
        if (Math.sqrt(Math.pow(point.y - lastPoint.y, 2) + Math.pow(point.x - lastPoint.x, 2)) >= POINT_SPAN) {
            currentPoints.push(point)
        }
        const lastLayer = layers[layers.length - 1]
        if (lastLayer.length > 0) {
            const lastPoint = lastLayer[lastLayer.length - 1]
            if (currentPoints.length >= APPLY_SPAN) {
                currentPoints = [point]
                lastLayer.push(point)
            }
        }
    })
    canvas.addEventListener('mouseup', (e) => {
        if (!isPressed) {
            return
        }
        isPressed = false
        const point = getPointByE(e)
        currentPoints = []
        if (layers.length > 0) {
            const lastLayer = layers[layers.length - 1]
            if (lastLayer.length >= 3) {
                lastLayer[lastLayer.length - 1].x = point.x
                lastLayer[lastLayer.length - 1].y = point.y
            } else {
                lastLayer.push(point)
            }
        }
    })

    // Render
    const render = () => {
        // BG
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // Common
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        // Current
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        currentPoints.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y)
            } else {
                ctx.lineTo(point.x, point.y)
            }
        })
        ctx.stroke()
        ctx.closePath()
        // Points
        let cnt = 0
        layers.forEach((rawPoints) => {
            rawPoints.forEach((point) => {
                ctx.fillStyle = '#f00'
                ctx.fillRect(point.x - 5, point.y - 5, 10, 10)
                cnt++
            })
        })
        ctx.fillStyle = '#fff'
        ctx.fillText(`${cnt}`, 10, 10)
        // Curve
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 5
        layers.forEach((rawPoints) => {
            if (rawPoints.length === 0) {
                return
            }
            ctx.beginPath()
            ctx.moveTo(rawPoints[0].x, rawPoints[0].y)
            if (rawPoints.length === 2) {
                ctx.lineTo(rawPoints[1].x, rawPoints[1].y)
            } else if (rawPoints.length > 2) {
                let points = [...rawPoints, rawPoints[rawPoints.length - 1]]
                for (let i = 1; i < points.length - 2; i++) {
                    const p0 = points[i - 1]
                    const p1 = points[i]
                    const p2 = points[i + 1]
                    const p3 = points[i + 2]
                    const cp1x = p1.x + (p2.x - p0.x) / 6
                    const cp1y = p1.y + (p2.y - p0.y) / 6
                    const cp2x = p2.x - (p3.x - p1.x) / 6
                    const cp2y = p2.y - (p3.y - p1.y) / 6
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
                }
            }
            ctx.stroke()
            ctx.closePath()
        })
    }
    render()
    setInterval(() => render(), 1000 / 15)
}

window.addEventListener('load', main)
