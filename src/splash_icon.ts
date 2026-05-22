function createCanvas(fullMd: string) {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 2048
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        return canvas
    }
    canvas.title = `${Date.now()}`
    canvas.addEventListener('click', () => {
        const link = document.createElement('a')
        link.href = canvas.toDataURL()
        link.download = `${canvas.title}.png`
        link.click()
    })

    // BG
    const textRectSize = Math.floor((canvas.width / 3) * 2)
    const padding = textRectSize / 10
    const baseFontSize = Math.floor(textRectSize / 15)
    const baseX = (canvas.width - textRectSize) / 2 + padding
    const baseY = (canvas.height - textRectSize) / 2 + padding

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Md
    const serifRegex = /^_([^_\n]+)_/
    const h2Regex = /^## */
    const h1Regex = /^# */
    let x = 0
    let y = 0
    let fontSize = baseFontSize
    let fontWeight = 'normal'
    let fontFamily = 'sans-serif'
    let lineHeight = baseFontSize
    interface Elem {
        x: number
        y: number
        fontSize: number
        textWidth: number
        fontWeight: string
        fontFamily: string
        text: string
    }
    let currentElemLine: Elem[] = []
    const elemLines = [currentElemLine]
    function pushElem(text: string, textWidth: number) {
        currentElemLine.push({
            x,
            y,
            fontSize,
            fontWeight,
            fontFamily,
            textWidth,
            text,
        })
    }
    for (let pc = 0; pc < fullMd.length; ) {
        const md = fullMd.slice(pc)
        let m: RegExpMatchArray | null
        //
        if ((m = md.match(/^\n/))) {
            // Mark: Line Break
            x = 0
            y += lineHeight
            fontSize = baseFontSize
            fontWeight = 'normal'
            fontFamily = 'sans-serif'
            lineHeight = baseFontSize
            currentElemLine = []
            elemLines.push(currentElemLine)
            pc += 1
        } else if ((m = md.match(h2Regex))) {
            // Mark: H2
            fontSize = Math.floor(baseFontSize * 1.5)
            fontWeight = 'bold'
            pc += m[0].length
        } else if ((m = md.match(h1Regex))) {
            // Mark: H1
            fontSize = Math.floor(baseFontSize * 2)
            fontWeight = 'bold'
            pc += m[0].length
        } else if ((m = md.match(serifRegex))) {
            // Mark: Serif
            const text = m[1]
            fontFamily = 'serif'
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            const textWidth = ctx.measureText(text).width
            pushElem(text, textWidth)
            //
            fontFamily = 'sans-serif'
            x += textWidth
            lineHeight = Math.max(lineHeight, fontSize)
            pc += m[0].length
        } else {
            // Mark: Plain Text
            const text = md.charAt(0)
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            const textWidth = ctx.measureText(text).width
            pushElem(text, textWidth)
            //
            x += textWidth
            lineHeight = Math.max(lineHeight, fontSize)
            pc += 1
        }
    }

    // Render
    const center = true
    elemLines.forEach((line) => {
        let lineWidth = 0
        line.forEach((elem) => {
            lineWidth += elem.textWidth
        })
        const x = center ? (canvas.width - lineWidth) / 2 : baseX
        const y = baseY
        line.forEach((elem) => {
            ctx.font = `${elem.fontWeight} ${elem.fontSize}px ${elem.fontFamily}`
            ctx.fillText(elem.text, x + elem.x, y + elem.y)
        })
    })

    return canvas
}

function main() {
    const mdTextarea = document.querySelector('#md-textarea') as HTMLTextAreaElement
    const resArea = document.querySelector('#res') as HTMLDivElement
    const update = () => {
        const canvas = createCanvas(mdTextarea.value)
        resArea.innerHTML = ''
        resArea.appendChild(canvas)
    }
    mdTextarea.addEventListener('keyup', update)
    update()
}

document.fonts.ready.then(() => main())
