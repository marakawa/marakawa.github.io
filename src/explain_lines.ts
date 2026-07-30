const inputTextarea = document.querySelector('#input') as HTMLTextAreaElement
const outputDiv = document.querySelector('#output') as HTMLDivElement

function esc(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

inputTextarea.addEventListener('keyup', () => {
    const inputTexts = inputTextarea.value
        .trim()
        .split('\n')
        .filter((row) => row.trim().length)
    let html = ''
    inputTexts.forEach((row) => {
        html += `<p><a href="https://chatgpt.com/?q=${encodeURIComponent(`単語ごとに教えて！　${row}`)}" target="_blank">${esc(row)}</a></p>`
    })
    outputDiv.innerHTML = html
})
