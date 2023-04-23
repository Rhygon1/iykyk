let user = localStorage.getItem('name')
if(!user){
    window.location.href = '/name'
}

let socket = io(window.location.host)

socket.emit('startGame', user)
let r = [{'PAiTk-AKP8gyFbnhAAAD': [ 'Opera', 0, 0, false ] },{ "uQ1dDVTu2z071zDMAAAF": [ 'Opera', 0, 0, false ] }]
let question = ["Which animal would you rather have as a pet?", "Dog", "Cat", "Goldfish"]
let enabled = false

socket.on('dis', () => {
    window.location.href = '/name' 
})

let nChange = document.querySelector('.nameChange')
nChange.addEventListener('click', () => {
    window.location.href = '/name'
})

socket.on('results', (r, turn) => {
    document.querySelector('.players').innerHTML = ''
    let ids = Object.keys(r)
    for(let i = 0; i<ids.length; i++){
        let div = document.createElement('div')
        div.classList.add('player')
        let p = document.createElement('p')
        p.classList.add('name')
        p.textContent = r[ids[i]][0]
        div.appendChild(p)
        p = document.createElement('p')
        p.classList.add('score')
        p.textContent = 'Score: ' + r[ids[i]][1]
        div.appendChild(p)
        p = document.createElement('p')
        p.classList.add('answered')
        p.textContent = 'Answered: ' + (r[ids[i]][3] ? 'Yes' : 'No')
        div.appendChild(p)
        if (i == turn){
            div.classList.add('owner')
        }
        document.querySelector('.players').appendChild(div)
    }
})

socket.on('question', (owner, q, round) => {
    enabled = true
    document.querySelector('.rounds').textContent = 'Round: ' + round
    document.querySelector('.card').innerHTML = ''
    let p = document.createElement('p')
    p.classList.add('question')
    p.innerText = q[0]
    document.querySelector('.card').appendChild(p)
    for(let i = 1; i<q.length; i++){
        let p = document.createElement('button')
        p.classList.add('option')
        p.innerText = q[i]
        document.querySelector('.card').appendChild(p)
        p.addEventListener('click', () => {
            if(enabled){
                socket.emit('answer', i)
                enabled = false
            }
        })
    }
})