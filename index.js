const pool = require("./database");
const express = require("express");
const app = express();
const cors = require("cors");
const server = app.listen(process.env.PORT || 3001)
const io = require('socket.io')(server);
// Let’s make node/socketio listen on port 3000
// var io = require('socket.io').listen(3001)
var url = "https://starlineadmin.co.in:10001";
var prjName = "surajjewellers";
app.use(cors());

const socketClient = require("socket.io-client")(url, {
  transports: ['websocket'], secure: true, reconnection: true, rejectUnauthorized: false
}
);

socketClient.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

socketClient.on('connect', function () {
  socketClient.emit('Client', prjName);
});

socketClient.on('connect', function () {
  socketClient.emit('room', prjName);
});
socketClient.on('Liverate', function (data) {
  console.log("data", "workinggg")
  io.sockets.emit('update note', notes)
  io.sockets.emit('Liverate', data)
});

// Define/initialize our global vars
var notes = []


var isInitNotes = false
var socketCount = 0

io.sockets.on('connection', function (socket) {
  // Socket has connected, increase socket count
  socketCount++
  // Let all sockets know how many are connected
  io.sockets.emit('users connected', socketCount)

  socket.on('disconnect', function () {
    // Decrease the socket count on a disconnect, emit
    socketCount--
    io.sockets.emit('users connected', socketCount)
  })

  socket.on('add record', function (data) {
    // Use node's db injection format to filter incoming data
    pool.query(`INSERT INTO live_stock 
    (name, sell, buy, defaultgold, defaultsilver, src, active) VALUES
    ('${data.name}', ${data.sell}, ${data.buy}, ${data.defaultgold}, ${data.defaultsilver}, '${data.src}', ${data.active})`, (x, i) => {
      data.id = i.insertId
      notes.push(data)
      // New note added, push to all sockets and insert into db
      io.sockets.emit('add record', [...notes])
    })
  })

  socket.on('delete', function (id) {
    notes.splice(notes.indexOf(notes.find((x) => x.id == id)), 1)
    socket.emit("delete", notes)
    pool.query(`DELETE FROM live_stock WHERE id=${id}`)
  })

  socket.on('update note', function (data) {
    // New note added, push to all sockets and insert into db
    notes.map((x) => {
      if (x.id == data.id) {
        Object.assign(x, data)
      }
    })
    io.sockets.emit('update note', notes)
    // Use node's db injection format to filter incoming data
    pool.query(`UPDATE live_stock SET buy=${data.buy}, sell=${data.sell}, active=${data.active} where id = ${data.id}`)
  })

  // Check to see if initial query/notes are set
  if (!isInitNotes) {
    // Initial app start, run db query
    pool.query('SELECT * FROM live_stock')
      .on('result', function (data) {
        // console.log("data", data)
        // Push results onto the notes array
        notes.push(data)
      })
      .on('end', function () {
        // Only emit notes after query has been completed
        socket.emit('initial notes', notes)
      })
    isInitNotes = true
  } else {
    // Initial notes already exist, send out
    socket.emit('initial notes', notes)
  }
})
