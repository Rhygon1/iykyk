let apply = document.querySelector('.apply')
let n = document.querySelector('.name')
let game = document.querySelector('.game')

apply.addEventListener('click', () => {
    if(n.value != ""){
        localStorage.setItem('name', n.value)
    }
    n.value = ""
})

n.addEventListener('keydown', e => {
    if(e.which === 13){
        if(n.value != ""){
            localStorage.setItem('name', n.value)
        }
        n.value = ""
    }
})

game.addEventListener('click', () => {
    window.location.href = '/play'
})