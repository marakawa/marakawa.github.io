export const rnd = (v: number) => Math.floor(Math.random() * v)

export const loadImage = (fileInput: HTMLInputElement, enableCanvas = false): Promise<HTMLImageElement | HTMLCanvasElement | undefined> =>
    new Promise((resolve) => {
        loadFile(fileInput).then((res) => {
            if (!res) {
                resolve(undefined)
            }
            let img = new Image()
            img.onload = () => {
                if (enableCanvas) {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const ctx = canvas.getContext('2d')
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
                    resolve(canvas)
                } else {
                    resolve(img)
                }
            }
            img.src = res as string
        })
    })

export const loadFile = (fileInput: HTMLInputElement): Promise<undefined | string | ArrayBuffer> =>
    new Promise((resolve) => {
        const files = fileInput.files
        if (!files || !files[0]) {
            resolve(undefined)
            return undefined
        }
        const file = files[0]
        const isImage = file.name.match(/\.(png|jpe?g|gif)$/)
        const reader = new FileReader()
        reader.onload = () => {
            if (reader.result) {
                resolve(reader.result)
            }
        }
        if (isImage) {
            reader.readAsDataURL(file)
        } else {
            reader.readAsText(file)
        }
    })

export const downloadCanvas = function (canvas: HTMLCanvasElement, fileName = 'texture.png') {
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
}
