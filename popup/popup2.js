document.querySelectorAll('.desc').forEach(item => item.addEventListener('click', function(e) {
    document.querySelectorAll('.desc').forEach(item => item.classList.remove('desc-active'))
    this.classList.add('desc-active')
    const mode = this.getAttribute('data-mode')
    // 1. check website in dif modes
    // 2. send msg to content script with new active mode
    return false
}))
