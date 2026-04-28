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

function main() {
    const fileInput = document.querySelector<HTMLInputElement>('#file-input')
    const italicCheckInput = document.querySelector<HTMLInputElement>('#italic-check')
    const bgColorInput = document.querySelector<HTMLInputElement>('#bg-color')
    const outlineColorInput = document.querySelector<HTMLInputElement>('#outline-color')
    const lineColorInput = document.querySelector<HTMLInputElement>('#line-color')
    const textColorInput = document.querySelector<HTMLInputElement>('#text-color')
    const textInputs: HTMLInputElement[] = [
        document.querySelector('#text-input-1') as HTMLInputElement,
        document.querySelector('#text-input-2') as HTMLInputElement,
        document.querySelector('#text-input-3') as HTMLInputElement,
        document.querySelector('#text-input-4') as HTMLInputElement,
    ]
    textInputs.forEach((textInput, i) => {
        textInput.value = messages[i % messages.length]
    })
    const genButton = document.querySelector<HTMLButtonElement>('#gen-button')
    const previewArea = document.querySelector<HTMLDivElement>('#preview')
    let images: HTMLImageElement[] = []

    fileInput?.addEventListener('change', () => {
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

    genButton?.addEventListener('click', () => {
        if (!previewArea) return
        previewArea.innerHTML = ''
        images.forEach((img) => {
            textInputs.forEach((textInput) => {
                const text = textInput.value.trim()
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                canvas.title = `${img.title}_${text}`
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
                ctx.drawImage(img, 0, 0)

                // Box
                const boxSize = img.height / 4
                const borderSize = img.height / 100
                ctx.fillStyle = bgColorInput?.value || '#000000'
                ctx.fillRect(0, img.height - boxSize, canvas.width, boxSize)

                // text
                ctx.font = `${italicCheckInput?.checked ? 'italic ' : ''}bold ${Math.min((img.width / text.length) * 1.5, boxSize / 2)}px sans-serif`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'

                ctx.lineWidth = borderSize * 3
                ctx.strokeStyle = outlineColorInput?.value || '#ffffff'
                ctx.strokeText(text, canvas.width / 2, img.height - boxSize / 2)
                ctx.lineWidth = borderSize * 2
                ctx.strokeStyle = lineColorInput?.value || '#000000'
                ctx.strokeText(text, canvas.width / 2, img.height - boxSize / 2)
                ctx.lineWidth = 0
                ctx.fillStyle = textColorInput?.value || '#ffffff'
                ctx.fillText(text, canvas.width / 2, img.height - boxSize / 2)

                previewArea.appendChild(canvas)
            })
            previewArea.appendChild(document.createElement('hr'))
        })
    })
}

main()
