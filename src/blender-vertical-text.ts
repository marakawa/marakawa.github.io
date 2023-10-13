window.addEventListener('load', () => {
    const inputElem = document.querySelector('#input') as HTMLInputElement
    const outputElem = document.querySelector('#output') as HTMLInputElement
    inputElem.addEventListener('keyup', (e) => {
        const inputLines = inputElem.value.trim().replace(' ', '　').replace('ー', '⼁').split('\n')
        let outputText = ''
        let maxCharNum = 0
        inputLines.forEach((line) => (maxCharNum = Math.max(maxCharNum, line.length)))
        for (let y = 0; y < maxCharNum; y++) {
            ;[...inputLines].reverse().forEach((line) => {
                outputText += line.charAt(y) || '　'
            })
            outputText += '\n'
        }
        outputElem.value = outputText.trim()
    })
})
