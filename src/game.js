const socket = io();
var canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')


canvas.width = 800
canvas.height = 600
ctx.font = "48px serif"
ctx.fillStyle = "white"

ctx.fillText(`Waiting for other player`, canvas.width / 5, canvas.height / 2)

let lscore = 0; 
let rscore = 0;
let roomNum
let playerNum 
let currentPlayer


const ball = {
    x: canvas.height / 2, 
    y: canvas.width / 2,
    dx: 5, 
    dy: 5, 
    radius: 25, 
    startAngle: 0, 
    endAngle: Math.PI * 2
}

const paddleR = {
    x: canvas.width - 50, 
    y: canvas.height / 2, 
    width: 20, 
    height: 60, 
    dy: 5, 
    speed: 0

}

const paddleL = {
    x: 50, 
    y: canvas.height / 2, 
    width: 20, 
    height: 60, 
    dy: 5, 
    speed: 0

}



function drawPaddleR(){
    if(playerNum == 2) ctx.fillStyle = "yellow"
    ctx.fillRect(paddleR.x, paddleR.y, paddleR.width, paddleR.height)
    ctx.fillStyle = "white"
}

function movePaddleR(){
    drawPaddleR()
    if(paddleR.y < 0){
        paddleR.y = 0
    }
    if(paddleR.y + (paddleR.height) > canvas.height){
        paddleR.y = canvas.height - paddleR.height
    }
    paddleR.y += paddleR.dy * paddleR.speed
    
}



function drawPaddleL(){
    if(playerNum == 1) ctx.fillStyle = "yellow"
    ctx.fillRect(paddleL.x, paddleL.y, paddleL.width, paddleL.height)
    ctx.fillStyle = "white"
    
}

function movePaddleL(){
    drawPaddleL()
    if(paddleL.y < 0){
        paddleL.y = 0
    }
    if(paddleL.y + (paddleL.height) > canvas.height){
        paddleL.y = canvas.height - paddleL.height
    }
    paddleL.y += paddleL.dy * paddleL.speed
    
}

function drawBall(){
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, ball.startAngle, ball.endAngle, false)
    ctx.fill()
}

function animateBall(){
    drawBall()

    //if(currentPlayer == playerNum){
    if( ball.x + ball.radius > canvas.width){
        ball.x = canvas.width / 2 
        ball.y = canvas.height / 2
        if(currentPlayer == playerNum) {socket.emit("ball reset", "l", roomNum )}
        //lscore++
    }

    if(  ball.x - ball.radius < 0){
        ball.x = canvas.width / 2 
        ball.y = canvas.height / 2
        if(currentPlayer == playerNum) {socket.emit("ball reset", "r", roomNum )}

        //rscore++
    }
   
    if( ball.y + ball.radius > canvas.height){
        ball.dy *= -1
        if(currentPlayer == playerNum) socket.emit("ball dy", ball.dy, roomNum)
    }

    if( ball.y - ball.radius < 0){
        ball.dy *= -1
        if(currentPlayer == playerNum) socket.emit("ball dy", ball.dy, roomNum)
    }
    //}

    ball.x += ball.dx
    ball.y += ball.dy

    
}

function showScore(){
    ctx.font = "48px serif"
    ctx.fillText(`${lscore}`, 200, 50)
    ctx.fillText(`${rscore}`, 600, 50)
}

function ballPadCollide(){
    
    if(currentPlayer == playerNum){

    if((ball.x - ball.radius <= paddleL.x)
        && (paddleL.x - paddleL.width <= ball.x)
        && (ball.y + ball.radius >= paddleL.y)
        && (paddleL.y + paddleL.height >= ball.y - ball.radius)) {ball.dx *= -1; socket.emit("ball dx", ball.dx, ball.x, ball.y,  roomNum) }

    else if(ball.x + ball.radius >= paddleR.x 
            && (paddleR.x + paddleR.width >= ball.x)
            && (ball.y + ball.radius >= paddleR.y)
            && (paddleR.y + paddleR.height >= ball.y - ball.radius)) {ball.dx *= -1; socket.emit("ball dx", ball.dx, ball.x, ball.y, roomNum) }
    
    
    }

    const middle = canvas.width / 2
    if(currentPlayer == 1 && ball.x > middle){ socket.emit("change player", 2, roomNum)}
    else if(currentPlayer == 2 && ball.x < middle){socket.emit("change player", 1, roomNum)}
    //if(ball.x === paddleR.x && ball.y === paddleR.y) {ball.dx *= -1; socket.emit("ball dx", ball.dx, roomNum) }}
}


function startGame(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    if(lscore >= 5 || rscore >= 5) {
        if(playerNum === 1 && lscore === 5){ 
            ctx.font = "48px serif"
            ctx.fillStyle = "white"
            ctx.fillText(`You Won`, canvas.width / 2.5, canvas.height / 2)}
        else if(playerNum === 2 && rscore === 5){ 
            ctx.font = "48px serif"
            ctx.fillStyle = "white"
            ctx.fillText(`You Won`, canvas.width / 2.5, canvas.height / 2)}
        else {
        ctx.font = "48px serif"
        ctx.fillStyle = "white"
        ctx.fillText(`You Lost`, canvas.width / 2.5, canvas.height / 2) }
        return
    }
    animateBall()
    movePaddleL()
    movePaddleR()
    ballPadCollide()
    showScore()
    requestAnimationFrame(startGame)
}

function displayResults(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
}


function keyDown(event){
    if(event.key === 'ArrowDown' || event.key === 'Down'){
        paddleR.speed = 1
        socket.emit("paddleR input", paddleR.speed, roomNum)
    }

    else if(event.key === 'ArrowUp' || event.key === 'Up'){
        paddleR.speed = -1
        socket.emit("paddleR input", paddleR.speed, roomNum)        
    }

    else if(event.key === 'w'){
        paddleL.speed = -1
        socket.emit("paddleL input", paddleL.speed, roomNum)
    }

    else if(event.key === 's'){
        paddleL.speed = 1
        socket.emit("paddleL input", paddleL.speed, roomNum)
    }

}

function keyUp(event){
    if(event.key === 'w' || event.key === 's') {paddleL.speed = 0; socket.emit("paddleL input", paddleL.speed, roomNum)}
    if(event.key === 'ArrowDown' || event.key === 'Down' ||  event.key === 'ArrowUp' || event.key === 'Up') {paddleR.speed = 0; socket.emit("paddleR input", paddleR.speed, roomNum)}
} 

document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)

socket.on("ball reset", (side) => {
    ball.x = canvas.width / 2 + 1
    ball.y = canvas.height / 2 + 1
    if(side === "r") rscore++
    else lscore++
})

socket.on("player num", (pNum, cPlayer) => {
    playerNum = pNum
    currentPlayer = cPlayer
})

socket.on("paddleL input", (msg) => {
    paddleL.speed = msg
})

socket.on("paddleR input", (msg) => {
    paddleR.speed = msg; 
})

socket.on("ball dx", (msg, x, y) => {
    ball.dx = msg
    ball.x = x
    ball.y = y
})

socket.on("ball dy", (msg) => {
    ball.dy = msg
    
})

socket.on("room num", (rNum) => {
    roomNum = rNum
})

socket.on("start", (msg) => {
    console.log(playerNum + " " + currentPlayer)
    startGame()
    requestAnimationFrame(displayResults)
    /*if(playerNum === 1 && lscore === 5){ 
        ctx.font = "48px serif"
        ctx.fillStyle = "white"
        ctx.fillText(`You Won`, canvas.width / 5, canvas.height / 2)}
    else if(playerNum === 2 && rscore === 5){ 
        ctx.font = "48px serif"
        ctx.fillStyle = "white"
        ctx.fillText(`You Won`, canvas.width / 5, canvas.height / 2)}
    else {
    ctx.font = "48px serif"
    ctx.fillStyle = "white"
    ctx.fillText(`You Lost`, canvas.width / 5, canvas.height / 2) }*/

    
})

socket.on("change player", (cPlayer) => {
    currentPlayer = cPlayer
})





// var canvas = document.getElementById('canvas')
// const ctx = canvas.getContext('2d')


// canvas.width = 800
// canvas.height = 600
// ctx.fillStyle = "white"


// let lscore = 0; 
// let rscore = 0; 


// const ball = {
//     x: canvas.height / 2, 
//     y: canvas.width / 2,
//     dx: 5, 
//     dy: 5, 
//     radius: 25, 
//     startAngle: 0, 
//     endAngle: Math.PI * 2
// }

// const paddleR = {
//     x: canvas.width - 50, 
//     y: canvas.height / 2, 
//     width: 20, 
//     height: 60, 
//     dy: 5, 
//     speed: 0

// }

// const paddleL = {
//     x: 50, 
//     y: canvas.height / 2, 
//     width: 20, 
//     height: 60, 
//     dy: 5, 
//     speed: 0

// }

// function drawBall(){
//     ctx.beginPath()
//     ctx.arc(ball.x, ball.y, ball.radius, ball.startAngle, ball.endAngle, false)
//     ctx.fill()
// }

// function animateBall(){
//     drawBall()

//     if(ball.x + ball.radius > canvas.width){
//         ball.x = canvas.width / 2 
//         ball.y = canvas.height / 2
//         lscore++
//     }

//     if(ball.x - ball.radius < 0){
//         ball.x = canvas.width / 2 
//         ball.y = canvas.height / 2
//         rscore++
//     }

//     if(ball.y + ball.radius > canvas.height){
//         ball.dy *= -1
//     }

//     if(ball.y - ball.radius < 0){
//         ball.dy *= -1
//     }
//     ball.x += ball.dx
//     ball.y += ball.dy
// }

// function calcScore(){
//     ctx.font = "48px serif"
//     ctx.fillText()
// }


// function drawPaddleR(){
//     ctx.fillRect(paddleR.x, paddleR.y, paddleR.width, paddleR.height)
    
// }

// function movePaddleR(){
//     drawPaddleR()
//     if(paddleR.y < 0){
//         paddleR.y = 0
//     }
//     if(paddleR.y + (paddleR.height) > canvas.height){
//         paddleR.y = canvas.height - paddleR.height
//     }
//     paddleR.y += paddleR.dy * paddleR.speed
    
// }



// function drawPaddleL(){
//     ctx.fillRect(paddleL.x, paddleL.y, paddleL.width, paddleL.height)
    
// }

// function movePaddleL(){
//     drawPaddleL()
//     if(paddleL.y < 0){
//         paddleL.y = 0
//     }
//     if(paddleL.y + (paddleL.height) > canvas.height){
//         paddleL.y = canvas.height - paddleL.height
//     }
//     paddleL.y += paddleL.dy * paddleL.speed
    
// }

// function ballPadCollide(){
    

//     if((ball.x - ball.radius <= paddleL.x)
//         && (paddleL.x - paddleL.width <= ball.x)
//         && (ball.y + ball.radius >= paddleL.y)
//         && (paddleL.y + paddleL.height >= ball.y - ball.radius)) ball.dx *= -1

//     else if(ball.x + ball.radius >= paddleR.x 
//             && (paddleR.x + paddleR.width >= ball.x)
//             && (ball.y + ball.radius >= paddleR.y)
//             && (paddleR.y + paddleR.height >= ball.y - ball.radius)) ball.dx *= -1
    
    
//     if(ball.x === paddleR.x && ball.y === paddleR.y) ball.dx *= -1
// }

// function showScore(){
//     ctx.font = "48px serif"
//     ctx.fillText(`${lscore}`, 200, 50)
//     ctx.fillText(`${rscore}`, 600, 50)
// }


// function startGame(){
//     ctx.clearRect(0,0, canvas.width, canvas.height)
//     showScore()
//     movePaddleL()
//     movePaddleR()
//     animateBall()
//     ballPadCollide()
//     requestAnimationFrame(startGame)
// }



// function keyDown(event){
//     if(event.key === 'ArrowDown' || event.key === 'Down'){
//         paddleR.speed = 1
//     }

//     if(event.key === 'ArrowUp' || event.key === 'Up'){
//         paddleR.speed = -1
//     }

//     if(event.key == 'w'){
//         paddleL.speed = -1
//     }

//     if(event.key == 's'){
//         paddleL.speed = 1
//     }
// }

// function keyUp(event){
//     if(event.key === 'w' || event.key === 's') paddleL.speed = 0
//     if(event.key === 'ArrowDown' || event.key === 'Down' ||  event.key === 'ArrowUp' || event.key === 'Up') paddleR.speed = 0
// }

// document.addEventListener('keydown', keyDown)
// document.addEventListener('keyup', keyUp)


// startGame()