import { CSSProperties, MouseEventHandler, ReactNode, useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './TextureGenerator.module.scss'
import { downloadCanvas, loadImage, rnd } from '../../common/utils'
import { Noise } from 'noisejs'

// Run
const run = (container: HTMLElement, title: string, canvasSize: number, callback: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void) => {
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
    container.appendChild(itemElem)
}

// Run
const runs = (canvasSize: number, bgLineWidth: number, fgLineWidth: number, bgColor: string, fgColor: string, sub = false, img?: HTMLImageElement | HTMLCanvasElement) => {
    if (bgLineWidth === 0 || fgLineWidth === 0) {
        return
    }
    const container = document.querySelector('#canvases') as HTMLElement
    container.innerHTML = ''
    // Flat
    run(container, 'flat', canvasSize, (canvas, ctx) => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
    })
    // Grad
    run(container, 'grad', canvasSize, (canvas, ctx) => {
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
        run(container, 'plus', canvasSize, (canvas, ctx) => {
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
        run(container, 'cross', canvasSize, (canvas, ctx) => {
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
        run(container, 'dots', canvasSize, (canvas, ctx) => {
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
    run(container, 'effect line', canvasSize, (canvas, ctx) => {
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
    run(container, 'simplex', canvasSize, (canvas, ctx) => {
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
    // paper
    for (let r = 0; r < 1; r++) {
        run(container, `paper_${r}`, canvasSize, (canvas, ctx) => {
            const noise = new Noise(Math.random())
            ctx.fillStyle = bgColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            if (img) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
            // const ratios: number[] = []
            // for (let i = 1; i <= 100; i = i * 2) {
            //     ratios.push(i)
            // }
            const ratios = [1, 5, 5, 10, 10, 10, 20, 20, 20, 20, 50, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100]
            ratios.forEach((ratio, z) => {
                for (let y = 0; y < canvas.height; y += fgLineWidth) {
                    for (let x = 0; x < canvas.height; x += fgLineWidth) {
                        const n = noise.simplex3(x / (bgLineWidth * ratio) + 1, y / (bgLineWidth * ratio) + 1, z)
                        if (n > 0) {
                            ctx.globalAlpha = 0.1 * n
                            ctx.fillStyle = fgColor
                            ctx.fillRect(x, y, fgLineWidth, fgLineWidth)
                        }
                    }
                }
            })
            //
            for (let i = 0; i < canvas.width / 5; i++) {
                const v = Math.random() < 0.5 ? 0 : 255
                ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${0.1 * Math.random()})`
                ctx.beginPath()
                ctx.arc(rnd(canvas.width), rnd(canvas.height), canvas.height * 0.005 * Math.random(), 0, Math.PI * 2)
                ctx.fill()
                ctx.closePath()
            }
            //
            for (let i = 0; i < canvas.width / 10; i++) {
                const v = 0
                ctx.strokeStyle = `rgba(${v}, ${v}, ${v}, ${0.1 * Math.random()})`
                ctx.lineCap = 'round'
                ctx.lineWidth = canvas.height * 0.005 * Math.random()
                ctx.beginPath()
                const sx = rnd(canvas.width)
                const sy = rnd(canvas.height)
                const len = canvas.width * (0.02 * Math.random())
                const angle = Math.PI * 2 * Math.random()
                const ex = sx + len * Math.cos(angle)
                const ey = sy + len * Math.sin(angle)
                ctx.moveTo(sx, sy)
                ctx.lineTo(ex, ey)
                ctx.stroke()
                ctx.closePath()
            }
        })
    }
    // Procreate Split Pen 2
    run(container, 'Procreate Split-Pen 2', canvasSize, (canvas, ctx) => {
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
    run(container, 'Procreate Split-Pen 3', canvasSize, (canvas, ctx) => {
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
    run(container, 'Procreate Split-Pen 4', canvasSize, (canvas, ctx) => {
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
    run(container, 'human generator t-shirt', canvasSize, (canvas, ctx) => {
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
    run(container, 'unity vrm', canvasSize, (canvas, ctx) => {
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
    run(container, 'unity space robot kyle', canvasSize, (canvas, ctx) => {
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

interface Props {
    children?: ReactNode
    className?: string
    style?: CSSProperties
    onClick?: MouseEventHandler<HTMLDivElement>
}

function TextureGenerator({ children, className, style, onClick }: Props): JSX.Element {
    const [tShirtText, setTShirtText] = useState<string>('')

    //
    const updateByForm = (form: HTMLFormElement, img?: HTMLImageElement | HTMLCanvasElement) => {
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

    //
    const createTextCanvas = (form: HTMLFormElement, text: string) => {
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

    //
    const onSubmit = async (e: any) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        let textCanvas = tShirtText.trim().length ? createTextCanvas(form, tShirtText.trim()) : undefined
        const imageInput = document.querySelector('#image-input') as HTMLInputElement
        let imgCanvas = (await loadImage(imageInput, true)) as HTMLCanvasElement | undefined
        if (imgCanvas && textCanvas) {
            imgCanvas.getContext('2d')?.drawImage(textCanvas, 0, 0, imgCanvas.width, imgCanvas.height)
            updateByForm(form, imgCanvas)
        } else if (imgCanvas) {
            updateByForm(form, imgCanvas)
        } else if (textCanvas) {
            updateByForm(form, textCanvas)
        } else {
            updateByForm(form)
        }
    }

    // Render
    return (
        <div className={classNames(styles.TextureGenerator, className)} style={style} onClick={(e) => onClick && (e.target as HTMLElement).classList.contains(styles.TextureGenerator) && onClick(e)}>
            <form onSubmit={onSubmit}>
                <div>
                    <span>size</span>
                    <input type="number" name="size" defaultValue="720" />
                </div>
                <div>
                    <span>bg</span>
                    <input type="number" name="bgLineWidth" defaultValue="3" />
                    <input type="color" name="bgColor" defaultValue="#ffffff" />
                </div>
                <div>
                    <span>transparent</span>
                    <input type="checkbox" name="transparent" />
                </div>
                <div>
                    <span>line</span>
                    <input type="number" name="fgLineWidth" defaultValue="3" />
                    <input type="color" name="fgColor" defaultValue="#000000" />
                </div>
                <div>
                    <textarea id="text-input" name="text" placeholder="T-Shirt Text" onChange={(e) => setTShirtText(e.target.value)} value={tShirtText}></textarea>
                </div>
                <div>
                    <span>image</span>
                    <input id="image-input" type="file" name="image" />
                </div>
                <div>
                    <span>sub mode</span>
                    <input type="checkbox" name="sub" />
                    <button type="submit">Update</button>
                </div>
            </form>
            <hr />
            <div id="canvases"></div>
            {children}
        </div>
    )
}

export default TextureGenerator
