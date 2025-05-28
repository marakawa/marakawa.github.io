class Vec2 {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }
    // ベクトル同士の引き算
    subtract(v: Vec2) {
        return new Vec2(this.x - v.x, this.y - v.y)
    }
    // ベクトルの外積 (2D)
    cross(v: Vec2) {
        return this.x * v.y - this.y * v.x
    }
    // 点A, B, Cが時計回りか反時計回りかを判定
    isClockwise(a: Vec2, b: Vec2, c: Vec2) {
        return b.subtract(a).cross(c.subtract(b)) < 0
    }
}

// ベクトル積を使って三角形の向きを確認（反時計回りか時計回りか）
function cross(a: Vec2, b: Vec2, o: Vec2) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

// 耳の切り取り法で三角形を分割する関数
function triangulate(points: Vec2[]) {
    const triangles: Vec2[][] = []
    const vertices = [...points] // 元の点をコピー

    if (isClockwise(vertices)) {
        vertices.reverse()
    }

    while (vertices.length > 3) {
        let earFound = false
        for (let i = 0; i < vertices.length; i++) {
            const prev = vertices[(i - 1 + vertices.length) % vertices.length]
            const curr = vertices[i]
            const next = vertices[(i + 1) % vertices.length]

            // 凸角かつ多角形の他の頂点が三角形に入らないかを確認
            if (isConvex(prev, curr, next) && isEar(prev, curr, next, vertices)) {
                // 三角形を切り取る
                triangles.push([prev, curr, next])
                // 次のサイクルに向けて頂点を削除
                vertices.splice(i, 1)
                earFound = true
                break
            }
        }
        if (!earFound) {
            throw new Error('Could not find an ear in the polygon. This might be due to an invalid or self-intersecting polygon.')
        }
    }

    // 最後の三角形を追加
    triangles.push([vertices[0], vertices[1], vertices[2]])
    return triangles
}

// 時計回りか反時計回りかを判定する関数
function isClockwise(vertices: Vec2[]) {
    let sum = 0
    for (let i = 0; i < vertices.length; i++) {
        const curr = vertices[i]
        const next = vertices[(i + 1) % vertices.length]
        sum += (next.x - curr.x) * (next.y + curr.y)
    }
    return sum > 0 // 正なら時計回り
}

// 凸角かどうかを判定（反時計回りの多角形でも対応）
function isConvex(a: Vec2, b: Vec2, c: Vec2) {
    // 外積の符号が正ならば反時計回り（凸角）
    return b.subtract(a).cross(c.subtract(b)) > 0
}

// 三角形が有効かどうかを判定（耳の剪定法で使う）
function isEar(a: Vec2, b: Vec2, c: Vec2, polygon: Vec2[]) {
    // 三角形内部に他の点が含まれていないか確認
    for (let i = 0; i < polygon.length; i++) {
        const point = polygon[i]
        if (point !== a && point !== b && point !== c && isPointInTriangle(point, a, b, c)) {
            return false
        }
    }
    return true
}

// 点が三角形内にあるかどうかを確認する関数（バリューが0未満の場合、内部）
function isPointInTriangle(p: Vec2, a: Vec2, b: Vec2, c: Vec2) {
    const cross1 = b.subtract(a).cross(p.subtract(a))
    const cross2 = c.subtract(b).cross(p.subtract(b))
    const cross3 = a.subtract(c).cross(p.subtract(c))
    return cross1 >= 0 && cross2 >= 0 && cross3 >= 0
}

function main() {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    let ctx = canvas.getContext('2d')
    if (!ctx) {
        return
    }
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        ctx = canvas.getContext('2d')
    })

    // Events
    let isPressed = false
    const pointsList: Vec2[][] = []
    let currentPoints: Vec2[] = []
    const trianglesList: Vec2[][][] = []
    const drawSpan = 50
    canvas.addEventListener('mousedown', (e) => {
        if (isPressed) {
            return
        }
        isPressed = true
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const point = new Vec2(e.clientX - rect.left, e.clientY - rect.top)
        currentPoints = [point]
        pointsList.push(currentPoints)
    })
    canvas.addEventListener('mousemove', (e) => {
        if (!isPressed) {
            return
        }
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const point = new Vec2(e.clientX - rect.left, e.clientY - rect.top)
        const lastPoint = currentPoints[currentPoints.length - 1]
        if (lastPoint && Math.sqrt(Math.pow(point.y - lastPoint.y, 2) + Math.pow(point.x - lastPoint.x, 2)) > drawSpan) {
            currentPoints.push(point)
        }
    })
    canvas.addEventListener('mouseup', (e) => {
        if (!isPressed) {
            return
        }
        isPressed = false
        trianglesList.push(triangulate(currentPoints))
    })

    // Render
    const render = () => {
        if (!ctx) {
            return
        }
        // BG
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        //
        ctx.strokeStyle = '#ffffff'
        ctx.strokeRect((canvas.width - 510) / 2, (canvas.height - 510) / 2, 510, 510)
        ctx.strokeStyle = '#333333'
        ctx.strokeRect(0, canvas.height / 2, canvas.width, 1)
        ctx.strokeRect(canvas.width / 2, 0, 1, canvas.height)
        //
        trianglesList.forEach((tris, ts) => {
            tris.forEach((tri, t) => {
                if (!ctx) {
                    return
                }
                ctx.fillStyle = `hsl(${Math.floor((t / tris.length) * 360)}, 50%, 50%)`
                ctx.beginPath()
                ctx.moveTo(tri[0].x, tri[0].y)
                ctx.lineTo(tri[1].x, tri[1].y)
                ctx.lineTo(tri[2].x, tri[2].y)
                ctx.closePath()
                ctx.fill()
            })
        })
        //
        pointsList.forEach((points, ps) => {
            if (!ctx) {
                return
            }
            ctx.strokeStyle = '#ffffff'
            ctx.beginPath()
            points.forEach((point, p) => {
                if (!ctx) {
                    return
                }
                if (p === 0) {
                    ctx.moveTo(point.x, point.y)
                } else {
                    ctx.lineTo(point.x, point.y)
                }
            })
            ctx.closePath()
            ctx.stroke()
        })
    }
    render()
    setInterval(() => render(), 1000 / 15)
}

window.addEventListener('load', main)
