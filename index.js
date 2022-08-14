const pool = require("./database");
// Let’s make node/socketio listen on port 3000
// var io = require('socket.io').listen(3001)
const io = require('socket.io')(3001);

// Define/initialize our global vars
var notes = []
var isInitNotes = false
var socketCount = 0
var prjName = "surajjewellers";

io.sockets.on('connection', function (socket) {
  // console.log("tesstt server")
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
    // New note added, push to all sockets and insert into db
    notes.push(data)
    io.sockets.emit('add record', notes)
    // Use node's db injection format to filter incoming data
    pool.query(`INSERT INTO live_stock 
    (name, sell, buy, defaultgold, defaultsilver,src) VALUES
    ('${data.name}', ${data.sell}, ${data.buy}, ${0}, '${data.src}')`)
  })

  socket.on('trigger event', function (data) {
    // console.log("data", data)
    notes.map((x) => {
      if (x.id == 34) {
        Object.assign(x, { ...x, defaultgold: data.find((x) => x.SymbolId == 34).Ask })
      }
      if (x.id == 50) {
        Object.assign(x, { ...x, defaultsilver: data.find((x) => x.SymbolId == 34).Ask })
      }
    })
    // console.log("notes", notes)
    pool.query(`UPDATE live_stock SET defaultgold=${data.find((x) => x.SymbolId == 34).Ask}, defaultsilver = ${data.find((x) => x.SymbolId == 50).Ask}`)
    io.sockets.emit('trigger event', notes)
  })

  socket.on('new note', function (data) {
    // New note added, push to all sockets and insert into db
    notes.map((x) => {
      if (x.id == data.id) {
        Object.assign(x, data)
      }
    })
    io.sockets.emit('new note', notes)
    // Use node's db injection format to filter incoming data
    pool.query(`UPDATE live_stock SET buy=${data.buy}, sell=${data.sell} where id = ${data.id}`)
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
