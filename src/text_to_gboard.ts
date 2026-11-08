import JSZip from 'jszip'

const inputElem = document.querySelector('#input') as HTMLTextAreaElement
const outputElem = document.querySelector('#output') as HTMLTextAreaElement
const langInputElem = document.querySelector('#lang-input') as HTMLInputElement
const updateBtnElem = document.querySelector('#update-btn') as HTMLButtonElement
const dlBtnElem = document.querySelector('#dl-btn') as HTMLButtonElement

type Dict = {
    [word: string]: string // shortcut (Optional)
}
function createDict(): Dict {
    let dict: Dict = {}
    const lowerTexts = inputElem.value.toLowerCase().split('\n')
    for (let rawLine of lowerTexts) {
        const line = rawLine.trim()
        if (line.length === 0) continue
        const delimiter = /[,\/]/
        if (line.indexOf('　') >= 0) {
            const words = line.split('　')
            const shortcut = words[0].trim()
            words.slice(1).forEach((rawWords) => {
                const words = rawWords.split(delimiter)
                for (let rawWord of words) {
                    const word = rawWord.trim()
                    if (word.trim().length === 0) continue
                    dict[word] = shortcut
                }
            })
        } else if (line.match(delimiter)) {
            const words = line.split(delimiter)
            words.forEach((rawWord) => {
                const word = rawWord.trim()
                dict[word] = word
            })
        } else {
            continue
        }
    }
    dict = Object.fromEntries(Object.entries(dict).sort((a, b) => a[0].localeCompare(b[0])))
    return dict
}

updateBtnElem.addEventListener('click', () => {
    outputElem.value = JSON.stringify(createDict(), undefined, 4)
})

dlBtnElem.addEventListener('click', () => {
    const dict = createDict()
    generateGboardZip(dict).then((blob) => {
        downloadBlob(blob, 'PersonalDictionary.zip')
    })
})

async function generateGboardZip(
    jsonInput: Dict,
    outputFileName: string = 'dictionary.txt',
): Promise<Blob> {
    const lang = langInputElem.value.trim()
    let txtContent = '# Gboard Dictionary version:1\n'
    for (const [word, shortcut] of Object.entries(jsonInput)) {
        txtContent += `${word}\t${shortcut}\t${lang}\n`
    }
    const zip = new JSZip()
    zip.file(outputFileName, txtContent)
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    return zipBlob
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
