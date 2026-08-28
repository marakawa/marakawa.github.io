import JSZip from 'jszip'

const inputElem = document.querySelector('#input') as HTMLTextAreaElement
const outputElem = document.querySelector('#output') as HTMLTextAreaElement
const dlBtnElem = document.querySelector('#dl-btn') as HTMLButtonElement
const clearBtnElem = document.querySelector('#clear-btn') as HTMLButtonElement

type Dict = {
    [en: string]: string // ja
}
const LS_KEY = 'TXT2GB_DICT'
let dict = JSON.parse(localStorage.getItem(LS_KEY) || '{}') as Dict
render()

inputElem.addEventListener('keyup', () => {
    const lowerText = inputElem.value.toLowerCase()
    const matches = lowerText.match(/[a-z][a-z]+/g)
    if (!matches) return
    for (let word of matches) {
        if (word.trim().length === 0) continue
        if (typeof dict[word] !== 'undefined') continue
        dict[word] = word
    }
    dict = Object.fromEntries(Object.entries(dict).sort((a, b) => a[0].localeCompare(b[0])))
    const json = render()
    localStorage.setItem(LS_KEY, json)
})

outputElem.addEventListener('keyup', () => {
    const text = outputElem.value
    outputElem.style.color = '#c00'
    const newDict = JSON.parse(text)
    localStorage.setItem(LS_KEY, JSON.stringify(newDict))
    outputElem.style.color = '#fff'
    dict = newDict
})

dlBtnElem.addEventListener('click', () => {
    generateGboardZip(dict).then((blob) => {
        downloadBlob(blob, 'PersonalDictionary.zip')
    })
})

clearBtnElem.addEventListener('click', () => {
    dict = {}
    const json = render()
    localStorage.setItem(LS_KEY, json)
})

function render() {
    const json = JSON.stringify(dict, undefined, 4)
    outputElem.value = json
    outputElem.style.color = '#fff'
    return json
}

async function generateGboardZip(
    jsonInput: Dict,
    outputFileName: string = 'dictionary.txt',
): Promise<Blob> {
    let txtContent = '# Gboard Dictionary version:1\n'
    for (const [word, shortcut] of Object.entries(jsonInput)) {
        txtContent += `${word}\t${shortcut}\tja-JP\n`
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
