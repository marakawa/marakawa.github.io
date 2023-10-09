window.addEventListener('load', () => {
    const inputElem = document.querySelector('#input') as HTMLInputElement
    const outputElem = document.querySelector('#output') as HTMLInputElement
    inputElem.addEventListener('keyup', (e) => {
        const inputText = inputElem.value.trim()
        const outputJson = {
            scope: 'javascript,typescript,typescriptreact',
            prefix: '_',
            body: inputText.split('\n').map((line) => line.replace('"', '\\"').replace('$', '\\$')),
        }
        outputElem.value = JSON.stringify(outputJson, undefined, 4)
    })
})
