class Point {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
}

window.addEventListener('load', () => {
    const canvas = document.querySelector('#canvas') as HTMLCanvasElement
    canvas.width = 512
    canvas.height = 768
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    let painting = false
    let lastPoint: Point
    let startPoint: Point
    let points: Point[] = []

    ctx.lineWidth = 5
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#000'
    canvas.addEventListener('mousedown', (e) => {
        painting = true
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        lastPoint = new Point(x, y)
        startPoint = new Point(x, y)
        points = [startPoint]
    })
    canvas.addEventListener('mousemove', (e) => {
        if (painting) {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            ctx.beginPath()
            ctx.moveTo(lastPoint.x, lastPoint.y)
            ctx.lineTo(x, y)
            ctx.stroke()
            ctx.closePath()
            lastPoint = new Point(x, y)
            points.push(lastPoint)
        }
    })
    canvas.addEventListener('mouseup', () => {
        painting = false

        ctx.beginPath()
        ctx.moveTo(lastPoint.x, lastPoint.y)
        ctx.lineTo(startPoint.x, startPoint.y)
        ctx.stroke()
        ctx.closePath()

        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.fill()
        ctx.closePath()
    })

    // DL
    const downloadBtn = document.querySelector('#download-btn')
    downloadBtn?.addEventListener('click', () => {
        const linkElem = document.createElement('a')
        document.body.appendChild(linkElem)
        linkElem.download = 'depth.png'
        linkElem.href = canvas.toDataURL('image/png')
        linkElem.click()
        linkElem.remove()
    })
})
