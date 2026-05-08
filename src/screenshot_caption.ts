const messages = shuffle([
    'Relaxing',
    'Addictive',
    'Interesting',
    'Play Now',
    'Train Your Brain',
    '10000+ Levels',
    'Water Sort Puzzle',
    'Eye-Friendly',
    'Simple',
    'Classic Puzzle Game',
])

export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export function rnd(n: number, random = Math.random) {
    return Math.floor(random() * n)
}

function main() {
    const fileInput = document.querySelector('#file-input') as HTMLInputElement

    const bgTopColorInput = document.querySelector('#bg-top-color') as HTMLInputElement
    const bgBottomColorInput = document.querySelector('#bg-bottom-color') as HTMLInputElement
    const outlineColorInput = document.querySelector('#outline-color') as HTMLInputElement
    const lineColorInput = document.querySelector('#line-color') as HTMLInputElement
    const textColorInput = document.querySelector('#text-color') as HTMLInputElement
    const textInputs: HTMLInputElement[] = [
        document.querySelector('#text-input-1') as HTMLInputElement,
        document.querySelector('#text-input-2') as HTMLInputElement,
        document.querySelector('#text-input-3') as HTMLInputElement,
        document.querySelector('#text-input-4') as HTMLInputElement,
    ]
    textInputs.forEach((textInput, i) => {
        textInput.value = messages[i % messages.length]
    })
    const italicCheckInput = document.querySelector('#italic-check') as HTMLInputElement
    const upCheckInput = document.querySelector('#up-check') as HTMLInputElement
    const randomCheckInput = document.querySelector('#random-check') as HTMLInputElement
    const genButton = document.querySelector('#gen-button') as HTMLButtonElement
    const previewArea = document.querySelector('#preview') as HTMLDivElement
    let images: HTMLImageElement[] = []

    fileInput.addEventListener('change', () => {
        const files = fileInput.files
        if (!files || !previewArea) return
        previewArea.innerHTML = ''
        images = []
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) return
            const reader = new FileReader()
            reader.onload = () => {
                const img = new Image()
                img.src = reader.result as string
                img.onload = () => {
                    img.title = file.name
                    images.push(img)
                }
            }
            reader.readAsDataURL(file)
        })
    })

    genButton.addEventListener('click', () => {
        if (!previewArea) return
        previewArea.innerHTML = ''
        if (images.length) {
            images.forEach((img) => {
                addCanvas(img.width, img.height, img.title, img)
            })
        } else {
            addCanvas(350, 600, `${rnd(1000000)}`)
        }
    })

    const addCanvas = (width: number, height: number, title: string, img?: HTMLImageElement) => {
        const s = 60 + rnd(20)
        const l = 60 + rnd(20)
        textInputs.forEach((textInput) => {
            const text = textInput.value.trim()
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            canvas.title = `${title}_${text}`
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // DL
            canvas.addEventListener('click', () => {
                const link = document.createElement('a')
                link.href = canvas.toDataURL()
                link.download = `${canvas.title}.png`
                link.click()
            })

            // BG
            ctx.fillStyle = '#333'
            ctx.fillRect(0, 0, width, height)
            if (img) {
                ctx.save()
                ctx.translate(width / 2, height / 2)
                ctx.rotate(-Math.PI / 30 + (Math.PI / 30) * 2 * Math.random())
                if (rnd(2)) {
                    ctx.scale(1.1, 1.1)
                } else {
                    ctx.scale(2, 2)
                }
                ctx.drawImage(img, -width / 2, -height / 2)
                ctx.restore()
            }

            // Box
            const h = rnd(360)
            const bgTopColor = randomCheckInput.checked
                ? `hsl(${(h + 60) % 360}, ${s}%, ${l}%)`
                : bgTopColorInput.value
            const bgBottomColor = randomCheckInput.checked
                ? `hsl(${h}, ${s}%, ${l}%)`
                : bgBottomColorInput.value
            const boxSize = height / 4
            const fontSize = Math.min((width / text.length) * 1.5, boxSize / 2)
            const isUp = randomCheckInput.checked ? rnd(2) : upCheckInput.checked
            const textY = isUp ? boxSize / 2 : height - boxSize / 2
            const borderSize = height / 100
            const textGrad = ctx.createLinearGradient(
                0,
                textY - fontSize / 2,
                0,
                textY + fontSize / 2,
            )
            textGrad.addColorStop(0, '#ffffff')
            textGrad.addColorStop(0.5, '#ffffff')
            textGrad.addColorStop(1, bgTopColor)
            const bgGrad = ctx.createLinearGradient(0, textY - boxSize / 2, 0, textY + boxSize / 2)
            bgGrad.addColorStop(0, bgTopColor)
            bgGrad.addColorStop(1, bgBottomColor)
            ctx.fillStyle = bgGrad
            if (isUp) {
                ctx.fillRect(0, 0, canvas.width, boxSize)
            } else {
                ctx.fillRect(0, height - boxSize, canvas.width, boxSize)
            }

            // text
            ctx.font = `${italicCheckInput.checked ? 'italic ' : ''}bold ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            ctx.lineWidth = borderSize * 1.5
            ctx.strokeStyle = outlineColorInput.value || '#ffffff'
            ctx.strokeText(text, canvas.width / 2, textY)
            ctx.lineWidth = borderSize
            ctx.strokeStyle = lineColorInput.value || '#000000'
            ctx.strokeText(text, canvas.width / 2, textY)
            ctx.lineWidth = 0
            ctx.fillStyle = textGrad
            ctx.fillText(text, canvas.width / 2, textY)

            previewArea.appendChild(canvas)
        })
        previewArea.appendChild(document.createElement('hr'))
    }
}

main()
