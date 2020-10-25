document.querySelectorAll('.desc').forEach(item => item.addEventListener('click', function(e) {
    document.querySelectorAll('.desc').forEach(item => item.classList.remove('desc-active'))
    this.classList.add('desc-active')
    const mode = this.getAttribute('data-mode')
    // 1. check website in dif modes

    // send msg to content script with new active mode
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { activeMode: mode }, resp => {
            if (resp.closePopup === true) {
                window.close()
            }
        })
    })

    return false
}))
