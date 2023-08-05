import { downloadCanvas, loadImage } from './common/utils'
import { Noise } from 'noisejs'

const run = (title: string, canvasSize: number, callback: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void) => {
    const itemElem = document.createElement('div')
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    canvas.addEventListener('click', () => downloadCanvas(canvas))
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.save()
    callback(canvas, ctx)
    ctx.restore()
    canvas.style.maxWidth = '100%'
    const titleElem = document.createElement('div')
    titleElem.innerText = title
    itemElem.appendChild(titleElem)
    itemElem.appendChild(canvas)
    const container = document.querySelector('#canvases') as HTMLElement
    container.appendChild(itemElem)
}

const runs = (canvasSize: number, bgLineWidth: number, lineWidth: number, backColor: string, foreColor: string, invert = false, sub = false, img?: HTMLImageElement | HTMLCanvasElement) => {
    if (bgLineWidth === 0 || lineWidth === 0) {
        return
    }
    const container = document.querySelector('#canvases') as HTMLElement
    container.innerHTML = ''
    // Flat
    run('flat', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = invert ? foreColor : backColor
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        } else {
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
    })
    // Grad
    run('grad', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = invert ? foreColor : backColor
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
            grad.addColorStop(0, invert ? foreColor : backColor)
            grad.addColorStop(1, invert ? backColor : foreColor)
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
    })
    // +
    for (let i = 0; i < 6; i++) {
        run('plus', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = invert ? foreColor : backColor
            ctx.strokeStyle = invert ? backColor : foreColor
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            } else {
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            const type = i < 2 ? 'cross' : i < 4 ? 'vertical' : 'horizontal'
            const isGlitch = i % 2 === 1
            for (let v = lineWidth / 2; v <= canvas.height; v += lineWidth + bgLineWidth) {
                ctx.lineWidth = lineWidth * (isGlitch ? 0.5 + 0.5 * Math.random() : 1)
                ctx.beginPath()
                if (type === 'cross' || type === 'vertical') {
                    ctx.moveTo(v, 0)
                    ctx.lineTo(v, canvas.height)
                }
                if (type === 'cross' || type === 'horizontal') {
                    ctx.moveTo(0, v)
                    ctx.lineTo(canvas.width, v)
                }
                ctx.stroke()
                ctx.closePath()
            }
        })
    }
    // x
    for (let i = 0; i < 6; i++) {
        run('cross', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = invert ? foreColor : backColor
            ctx.strokeStyle = invert ? backColor : foreColor
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            } else {
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            const type = i < 2 ? 'cross' : i < 4 ? 'slash' : 'backslash'
            const isGlitch = i % 2 === 1
            for (let y = 0; y <= canvas.height; y += lineWidth + bgLineWidth * 1.5) {
                ctx.lineWidth = lineWidth * (isGlitch ? 0.5 + 0.5 * Math.random() : 1)
                ctx.lineCap = 'square'
                ctx.beginPath()
                if (type === 'cross' || type === 'slash') {
                    ctx.moveTo(0, y)
                    ctx.lineTo(canvas.width, y - canvas.width)
                    //
                    ctx.moveTo(0, y + canvas.height)
                    ctx.lineTo(canvas.width, y - canvas.width + canvas.height)
                }
                if (type === 'cross' || type === 'backslash') {
                    ctx.moveTo(0, y - canvas.height)
                    ctx.lineTo(canvas.width, y + canvas.height - canvas.height)
                    //
                    ctx.moveTo(0, y)
                    ctx.lineTo(canvas.width, y + canvas.height)
                }
                ctx.stroke()
                ctx.closePath()
            }
        })
    }
    // .
    for (let i = 0; i < 4; i++) {
        run('dots', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = invert ? foreColor : backColor
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            } else {
                ctx.fillRect(0, 0, canvas.width, canvas.height)
            }
            ctx.fillStyle = invert ? backColor : foreColor
            const isSorted = i < 2
            const isGlitch = i % 2 === 1
            let lineNum = 0
            for (let y = lineWidth / 2; y <= canvas.height * 2; y += lineWidth + bgLineWidth) {
                for (let x = lineWidth / 2 + (!isSorted && lineNum % 2 === 0 ? lineWidth / 2 + bgLineWidth / 2 : 0); x <= canvas.width * 2; x += lineWidth + bgLineWidth) {
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                    ctx.arc(x, y, (lineWidth / 2) * (isGlitch ? 0.8 + 0.2 * Math.random() : 1), 0, Math.PI * 2)
                    ctx.fill()
                    ctx.closePath()
                }
                lineNum++
            }
        })
    }
    // simplex
    run('simplex', canvasSize, (canvas, ctx) => {
        const noise = new Noise(Math.random())
        ctx.fillStyle = invert ? foreColor : backColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = invert ? backColor : foreColor
        for (let y = 0; y < canvas.height; y += lineWidth) {
            for (let x = 0; x < canvas.height; x += lineWidth) {
                const n = noise.simplex2(x / (bgLineWidth * 10) + 1, y / (bgLineWidth * 10) + 1)
                if (n < 0) {
                    ctx.fillRect(x, y, lineWidth, lineWidth)
                }
            }
        }
    })
    // Human Generator T-shirt
    run('human generator t-shirt', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = invert ? backColor : foreColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = invert ? foreColor : backColor
        if (img) {
            ctx.translate((canvas.width / 10) * 5, (canvas.height / 10) * 6)
            ctx.rotate(Math.PI / 2)
            const w = (canvas.width / 10) * 3
            ctx.drawImage(img, 0, 0, w, w * (img.height / img.width))
        } else {
            ctx.fillRect(canvas.width / 10, (canvas.height / 10) * 6, (canvas.width / 10) * 4, (canvas.height / 10) * 3)
        }
    })
    // Unity VRM T-shirt
    run('unity vrm', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = invert ? backColor : foreColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = invert ? foreColor : backColor
        if (img) {
            ctx.translate((canvas.width / 8) * 3, (canvas.height / 8) * 1.5)
            const w = (canvas.width / 8) * 2
            ctx.drawImage(img, 0, 0, w, (w * (img.height / img.width)) / 2)
        } else {
            ctx.fillRect((canvas.width / 8) * 3, (canvas.height / 8) * 1.5, (canvas.width / 8) * 2, (canvas.height / 8) * 2)
        }
    })
    // Unity Space Robot Kyle
    run('unity space robot kyle', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = invert ? backColor : foreColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = invert ? foreColor : backColor
        if (img) {
            ctx.save()
            ctx.translate((canvas.width / 1000) * 770, (canvas.height / 1000) * 470)
            const w = (canvas.width / 1000) * 170
            ctx.drawImage(img, 0, 0, w, w * (img.height / img.width))
            ctx.restore()
            if (sub) {
                ctx.save()
                ctx.translate((canvas.width / 1000) * 180, (canvas.height / 1000) * 255)
                const w = (canvas.width / 1000) * 95
                ctx.drawImage(img, 0, 0, w, w * (img.height / img.width))
                ctx.restore()
            }
        } else {
            ctx.fillRect((canvas.width / 1000) * 770, (canvas.height / 1000) * 470, (canvas.width / 1000) * 170, (canvas.height / 1000) * 220)
            if (sub) {
                ctx.fillRect((canvas.width / 1000) * 180, (canvas.height / 1000) * 255, (canvas.width / 1000) * 95, (canvas.height / 1000) * 120)
            }
        }
    })
}

window.addEventListener('load', () => {
    const form = document.querySelector('#control-form') as HTMLFormElement
    const updateByForm = (img?: HTMLImageElement | HTMLCanvasElement) => {
        const formData = new FormData(form)
        runs(
            parseInt(formData.get('size') as string),
            parseInt(formData.get('back') as string),
            parseInt(formData.get('fore') as string),
            formData.get('backcolor') as string,
            formData.get('forecolor') as string,
            formData.get('invert') === 'on',
            formData.get('sub') === 'on',
            img,
        )
    }
    const createTextImage = (text) => {
        const formData = new FormData(form)
        const canvas = document.createElement('canvas')
        canvas.width = 300
        canvas.height = 400
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.fillStyle = formData.get('backcolor') as string
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        const textLines = text.trim().split('\n')
        const textLineHeight = canvas.height / textLines.length
        textLines.forEach((str, y) => {
            const fontSize = 100
            const cCanvas = document.createElement('canvas')
            let cCtx = cCanvas.getContext('2d') as CanvasRenderingContext2D
            // Reset by Text Size
            cCtx.font = `bold ${fontSize}px sans-serif`
            cCanvas.width = cCtx.measureText(str.trim()).width + fontSize / 5
            cCanvas.height = fontSize + fontSize / 10
            cCtx = cCanvas.getContext('2d') as CanvasRenderingContext2D
            // Draw
            cCtx.font = `bold ${fontSize}px sans-serif`
            cCtx.textAlign = 'left'
            cCtx.textBaseline = 'top'
            cCtx.fillStyle = formData.get('forecolor') as string
            cCtx.fillText(str.trim(), fontSize / 10, 0)
            ctx.drawImage(cCanvas, 0, 0, cCanvas.width, cCanvas.height, 0, y * textLineHeight, canvas.width, textLineHeight)
        })
        return canvas
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const textInput = document.querySelector('#text-input') as HTMLInputElement
        if (textInput.value.trim().length) {
            const img = createTextImage(textInput.value)
            updateByForm(img)
            return
        }
        const imageInput = document.querySelector('#image-input') as HTMLInputElement
        const img = await loadImage(imageInput)
        updateByForm(img)
    })
    updateByForm()
})
