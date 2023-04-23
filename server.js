const express = require("express");
const app = express()
const http = require('http');
const server = http.createServer(app)
const port = process.env.PORT || 3000
app.use(express.static('public'))
const io = require("socket.io")(server, {
    cors: {
      methods: ["GET", "POST"]
    }
  });
server.listen(port)

app.get('/name', (req, res) => {
    res.sendFile(__dirname + '/public/html/name.html');
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/name.html');
})

app.get('/play', (req, res) => {
    res.sendFile(__dirname + '/public/html/play.html');
})

const questions = [
    ["Which animal would you rather have as a pet?", "Dog", "Cat", "Goldfish"],
    ["What is your favorite type of pizza?", "Cheese", "Pepperoni", "Hawaiian (pineapple and ham)"],
    ["Which social media platform do you prefer?", "Instagram", "TikTok", "Twitter"],
    ["What is your favorite type of ice cream?", "Chocolate", "Vanilla", "Strawberry"],
    ["Which season do you enjoy the most?", "Spring", "Summer", "Winter"],
    ["What is your favorite type of movie?", "Action", "Comedy", "Romance"],
    ["Which type of music do you prefer?", "Pop", "Rock", "Hip hop"],
    ["Which type of dessert do you like the most?", "Cake", "Pie", "Ice cream"],
    ["Which outdoor activity do you enjoy the most?", "Hiking", "Biking", "Swimming"],
    ["Which fictional character would you rather be?", "Harry Potter", "Hermione Granger", "Ron Weasley"],
    ["Which type of cuisine do you enjoy the most?", "Italian", "Chinese", "Mexican"],
    ["What is your favorite color?", "Red", "Blue", "Green"],
    ["Which TV show do you like the most?", "Friends", "The Office", "Game of Thrones"],
    ["What is your favorite type of book?", "Mystery", "Romance", "Science fiction"],
    ["Which superhero power would you rather have?", "Invisibility", "Flight", "Super strength"],
    ["What is your favorite type of drink?", "Coffee", "Tea", "Soft drink"],
    ["Which type of exercise do you prefer?", "Yoga", "Weight lifting", "Cardio"],
    ["What is your favorite type of flower?", "Rose", "Lily", "Sunflower"],
    ["Which holiday do you enjoy the most?", "Christmas", "Halloween", "Thanksgiving"],
    ["Which type of weather do you prefer?", "Sunny", "Rainy", "Snowy"]
];  

class Game{
    constructor(){
        this.players = {};
        this.turn = 0;
        this.started = false;
        this.questions = questions;   
        this.answers = []
        this.ques = []
        this.round = 1;
    }

    startTurn(){
        this.started = true;
        let ids = Object.keys(this.players)
        console.log(this.turn, this.players)
        let random = Math.floor(Math.random() * questions.length)
        let q = this.questions[random];
        this.ques = q
        io.to(Object.keys(this.players)[this.turn]).emit('question', true, q, this.round);
        for(let i = 0; i<ids.length; i++){
            if(i!=this.turn){
                io.to(ids[i]).emit('question', false, q, this.round)
            }
        }
        this.questions.splice(random, 1)
        this.emitResults()
    }

    answer(socket, a){
        this.players[socket.id][2] = a
        this.players[socket.id][3] = true
        let all = true;
        let ids = Object.keys(this.players)
        for(let i = 0; i<ids.length; i++){
            if(!this.players[ids[i]][3]){
                all = false
            }
        }
        if(all){
            this.endTurn()
        }
        this.emitResults()
    }

    endTurn(){
        let ids = Object.keys(this.players)
        let answer = this.players[ids[this.turn]][2]
        for(let i = 0; i<ids.length; i++){
            if(this.players[ids[i]][2] == answer && i != this.turn){
                this.players[ids[i]][1]++
            }
            this.players[ids[i]][2] = 0
            this.players[ids[i]][3] = false
        }
        this.turn++
        if(this.turn == ids.length){
            this.turn = 0
            this.round++
        }
        this.startTurn()
    }

    emitResults(){
        io.emit('results', this.players, this.turn)
    }
}

let game = new Game()

io.on('connection', socket => {
    socket.on('startGame', n => {
        game.players[socket.id] = [n, 0, 0, false];
        if(Object.keys(game.players).length > 1 && !game.started){
            game.startTurn()
        } else if (Object.keys(game.players).length > 1 && game.started){
            socket.emit('question', false, game.ques, game.round)
        }
        game.emitResults()
    })

    socket.on('answer', a => {
        if(game.started){
            game.answer(socket, a)
        }
    }) 

    socket.on('disconnect', () => {
        delete game.players[socket.id]
        if(Object.keys(game.players).length < 2 && game.started){
            io.emit('dis')
            game = new Game()
        } else if (game.started){
            let ids = Object.keys(game.players)
            for(let i = 0; i<ids.length; i++){
                game.players[ids[i]][2] = 0
                game.players[ids[i]][3] = false
            }
            if(game.turn == ids.length){
                game.turn = 0
                game.round++
            }
            game.startTurn()
        }
    })
})