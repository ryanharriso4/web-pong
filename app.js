/*const express = require("express")
const app = express()
const port = 3000

app.use(express.static(__dirname + '/src'))
app.get('/', (req,res) => res.sendFile('index.html'))


app.listen(port, () => console.log('App listening on port ' + port))*/

import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));



let numRooms = 0
let numInRoom = 0





app.get("/", (req,res) => {
  res.sendFile(join(__dirname, '/src/startscreen.html'))
})



app.get('/game', (req, res) => {
  res.sendFile(join(__dirname, '/src/game.html'));
});




io.on('connection', (socket) => {



  if(numInRoom < 2) {
    socket.join("room-" + numRooms)
    console.log(numInRoom)
    socket.emit("player num", numInRoom + 1, 2)
    io.sockets.in("room-" + numRooms).emit("room num", numRooms)
    numInRoom++
    console.log(numInRoom + " " + numRooms)
  }else{
    numInRoom = 0
    numRooms++
    socket.emit("player num", numInRoom + 1, 2)
    socket.join("room-" + numRooms)
    numInRoom++
    console.log(numInRoom + " " + numRooms)
  }

  if(numInRoom == 2){
    io.sockets.in("room-" + numRooms).emit('start')
  }

  //added x and y change to match in other code
  
  socket.on('ball reset', ( side, roomNum) => {
    io.sockets.in("room-" + roomNum).emit('ball reset', side)
  })
  
  socket.on('paddleL input', (msg, roomNum) => {
    io.sockets.in("room-" + roomNum).emit('paddleL input', msg)
  })

  socket.on('paddleR input', (msg, roomNum) => {
    io.sockets.in("room-" + roomNum).emit('paddleR input', msg)
  })

  socket.on('ball dx', (msg, x, y, roomNum) => {
    io.sockets.in("room-" + roomNum).emit('ball dx',  msg, x, y)
  })

  socket.on('ball dy', (msg, roomNum) => {
    io.sockets.in("room-" + roomNum).emit('ball dy',  msg)
  })

  socket.on('change player', (cPlayer, roomNum) => {
    io.sockets.in("room-" + roomNum).emit("change player", cPlayer)
  })

  socket.on('update pos', (x, y, playerNum, roomNum) => {
    io.sockets.in("room-" + roomNum).emit("update pos", x, y, playerNum)
  })
})

app.use(express.static(__dirname + "/src"))

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});