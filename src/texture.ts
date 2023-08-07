import { downloadCanvas, loadImage, rnd } from './common/utils'
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

const runs = (canvasSize: number, bgLineWidth: number, fgLineWidth: number, bgColor: string, fgColor: string, sub = false, img?: HTMLImageElement | HTMLCanvasElement) => {
    if (bgLineWidth === 0 || fgLineWidth === 0) {
        return
    }
    const container = document.querySelector('#canvases') as HTMLElement
    container.innerHTML = ''
    // Flat
    run('flat', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    })
    // Grad
    run('grad', canvasSize, (canvas, ctx) => {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
        grad.addColorStop(0, bgColor)
        grad.addColorStop(1, fgColor)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    })
    // +
    for (let i = 0; i < 3; i++) {
        run('plus', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            ctx.strokeStyle = fgColor
            const type = i === 0 ? 'cross' : i === 1 ? 'vertical' : 'horizontal'
            for (let v = fgLineWidth / 2; v < canvas.height; v += fgLineWidth + bgLineWidth) {
                ctx.lineWidth = fgLineWidth * 0.5 + fgLineWidth * 0.5 * Math.random()
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
    for (let i = 0; i < 3; i++) {
        run('cross', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            ctx.strokeStyle = fgColor
            const type = i === 0 ? 'cross' : i === 1 ? 'slash' : 'backslash'
            for (let y = 0; y < canvas.height; y += fgLineWidth + bgLineWidth * 1.5) {
                ctx.lineWidth = fgLineWidth * 0.5 + fgLineWidth * 0.5 * Math.random()
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
    for (let i = 0; i < 2; i++) {
        run('dots', canvasSize, (canvas, ctx) => {
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            ctx.fillStyle = fgColor
            const isSorted = i === 0
            let lineNum = 0
            for (let y = fgLineWidth / 2; y < canvas.height * 2; y += fgLineWidth + bgLineWidth) {
                for (let x = fgLineWidth / 2 + (!isSorted && lineNum % 2 === 0 ? fgLineWidth / 2 + bgLineWidth / 2 : 0); x < canvas.width * 2; x += fgLineWidth + bgLineWidth) {
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                    ctx.arc(x, y, (fgLineWidth / 2) * 0.7 + (fgLineWidth / 2) * 0.3 * Math.random(), 0, Math.PI * 2)
                    ctx.fill()
                    ctx.closePath()
                }
                lineNum++
            }
        })
    }
    // effect line
    run('effect line', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        for (let angle = 0; angle < Math.PI * 2; ) {
            const span = (Math.PI / 360) * rnd(Math.max(fgLineWidth, 2))
            ctx.fillStyle = rnd(2) === 0 ? fgColor : bgColor
            ctx.beginPath()
            const startLen = bgLineWidth * 10 + rnd(bgLineWidth * 10)
            const x0 = canvas.width / 2 + startLen * Math.cos(angle)
            const y0 = canvas.height / 2 + startLen * Math.sin(angle)
            ctx.moveTo(x0, y0)
            const x1 = canvas.width / 2 + canvas.width * Math.cos(angle)
            const y1 = canvas.height / 2 + canvas.width * Math.sin(angle)
            ctx.lineTo(x1, y1)
            const x2 = canvas.width / 2 + canvas.width * Math.cos(angle + span)
            const y2 = canvas.height / 2 + canvas.width * Math.sin(angle + span)
            ctx.lineTo(x2, y2)
            ctx.lineTo(x0, y0)
            ctx.closePath()
            ctx.fill()
            angle += span
        }
    })
    // simplex
    run('simplex', canvasSize, (canvas, ctx) => {
        const noise = new Noise(Math.random())
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        ctx.fillStyle = fgColor
        for (let y = 0; y < canvas.height; y += fgLineWidth) {
            for (let x = 0; x < canvas.height; x += fgLineWidth) {
                const n = noise.simplex2(x / (bgLineWidth * 10) + 1, y / (bgLineWidth * 10) + 1)
                if (n < 0) {
                    ctx.fillRect(x, y, fgLineWidth, fgLineWidth)
                }
            }
        }
    })
    // Procreate Split Pen 2
    run('Procreate Split-Pen 2', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        const r = canvas.height / 16
        ctx.fillStyle = fgColor
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 0 + r, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, canvas.height - r, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
    // Procreate Split Pen 3
    run('Procreate Split-Pen 3', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        const r = canvas.height / 16
        ctx.fillStyle = fgColor
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 0 + r, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, canvas.height - r, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
    // Procreate Split Pen 4
    run('Procreate Split-Pen 4', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        const r = canvas.height / 16
        ctx.fillStyle = fgColor
        ctx.beginPath()
        ctx.arc(canvas.width / 2, 0 + r, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, r + (canvas.height - r * 2) / 3, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, r + ((canvas.height - r * 2) / 3) * 2, r, 0, Math.PI * 2)
        ctx.arc(canvas.width / 2, canvas.height - r, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
    // Human Generator T-shirt
    run('human generator t-shirt', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = fgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = bgColor
        ctx.fillRect(canvas.width / 10, (canvas.height / 10) * 6, (canvas.width / 10) * 4, (canvas.height / 10) * 3)
        if (img) {
            ctx.translate((canvas.width / 10) * 5, (canvas.height / 10) * 6)
            ctx.rotate(Math.PI / 2)
            const w = (canvas.width / 10) * 3
            ctx.drawImage(img, 0, 0, w, w * (img.height / img.width))
        }
    })
    // Unity VRM T-shirt
    run('unity vrm', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = fgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = bgColor
        ctx.fillRect((canvas.width / 8) * 3, (canvas.height / 8) * 1.5, (canvas.width / 8) * 2, (canvas.height / 8) * 2)
        if (img) {
            ctx.translate((canvas.width / 8) * 3, (canvas.height / 8) * 1.5)
            const w = (canvas.width / 8) * 2
            ctx.drawImage(img, 0, 0, w, w * (img.height / img.width))
        }
    })
    // Unity Space Robot Kyle
    run('unity space robot kyle', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = fgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = bgColor
        ctx.fillRect((canvas.width / 1000) * 770, (canvas.height / 1000) * 470, (canvas.width / 1000) * 170, (canvas.height / 1000) * 220)
        if (sub) {
            ctx.fillRect((canvas.width / 1000) * 180, (canvas.height / 1000) * 255, (canvas.width / 1000) * 95, (canvas.height / 1000) * 120)
        }
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
        }
    })
}

window.addEventListener('load', () => {
    const form = document.querySelector('#control-form') as HTMLFormElement
    const updateByForm = (img?: HTMLImageElement | HTMLCanvasElement) => {
        const formData = new FormData(form)
        const fgColor = formData.get('fgColor') as string
        const bgColor = formData.get('bgColor') as string
        runs(
            parseInt(formData.get('size') as string),
            parseInt(formData.get('bgLineWidth') as string),
            parseInt(formData.get('fgLineWidth') as string),
            formData.get('transparent') === 'on' ? 'rgba(0, 0, 0, 0)' : bgColor,
            fgColor,
            formData.get('sub') === 'on',
            img,
        )
    }
    const createTextCanvas = (text: string) => {
        const formData = new FormData(form)
        const canvas = document.createElement('canvas')
        canvas.width = 300
        canvas.height = 400
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
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
            cCtx.fillStyle = formData.get('fgColor') as string
            cCtx.fillText(str.trim(), fontSize / 10, 0)
            ctx.drawImage(cCanvas, 0, 0, cCanvas.width, cCanvas.height, 0, y * textLineHeight, canvas.width, textLineHeight)
        })
        return canvas
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const textInput = document.querySelector('#text-input') as HTMLInputElement
        let textCanvas = textInput.value.trim().length ? createTextCanvas(textInput.value) : undefined
        const imageInput = document.querySelector('#image-input') as HTMLInputElement
        let imgCanvas = (await loadImage(imageInput, true)) as HTMLCanvasElement | undefined
        if (imgCanvas && textCanvas) {
            imgCanvas.getContext('2d')?.drawImage(textCanvas, 0, 0, imgCanvas.width, imgCanvas.height)
            updateByForm(imgCanvas)
        } else if (imgCanvas) {
            updateByForm(imgCanvas)
        } else if (textCanvas) {
            updateByForm(textCanvas)
        } else {
            updateByForm()
        }
    })
    updateByForm()

    // Invert
    const invertBtn = document.querySelector('.invert-btn')
    invertBtn?.addEventListener('click', () => {
        const colorElem1 = document.querySelector('input[name="bgColor"]') as HTMLInputElement
        const colorElem2 = document.querySelector('input[name="fgColor"]') as HTMLInputElement
        if (colorElem1 && colorElem2) {
            const color1 = colorElem1.value
            const color2 = colorElem2.value
            colorElem1.setAttribute('value', color2)
            colorElem2.setAttribute('value', color1)
        }
    })
})
