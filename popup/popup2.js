document.querySelectorAll('.desc').forEach(item => item.addEventListener('click', function(e) {
    document.querySelectorAll('.desc').forEach(item => item.classList.remove('desc-active'))
    this.classList.add('desc-active')
    return false
}))
