const pool = require("./database");
const express = require("express");
const app = express();
const cors = require("cors");
const server = app.listen(process.env.PORT || 3001)
const io = require('socket.io')(server);
const bank = require('./query/bank/bank')
const contact = require('./query/contact/contact')
const appinfo = require('./query/appinfo/appinfo')
const bodyParser = require('body-parser');

// Let’s make node/socketio listen on port 3000
// var io = require('socket.io').listen(3001)

// phase1
// var url = "http://starlinejewellers.in:10004";
// var prjName = "rkjewellers";

//phase3
var url = "http://starlinebullion.in:10001";
var prjName = "vggold";

// phase2
// var url = "https://starlineadmin.co.in:10001";
// var prjName = "surajjewellers";

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
const socketClient = require("socket.io-client")(url, {
  transports: ['websocket'], secure: true, reconnection: true, rejectUnauthorized: false
});

app.use("/hello", (req, res) => {
  res.send('hello')
})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});




//
app.use(bank)
app.use(contact)
app.use(appinfo)

socketClient.on("connect_error", (err) => {
  console.log(`connect_error due to ${err}`);
});

socketClient.on('connect', function () {
  socketClient.emit('room', prjName);
  socketClient.emit('ClientData', prjName);
  socketClient.emit('Liverateroom', 'Liverate');
});

socketClient.on("Liverateroom", function (data) {
  console.log("working")
  io.sockets.emit('Liverate', JSON.parse(data))
});

socketClient.on('connect', function () {
  socketClient.emit('Client', prjName);
});

socketClient.on('connect', function () {
  socketClient.emit('room', prjName);
});

socketClient.on('Liverateroom', function (data) {
  // console.log("data", "workinggg")
  io.sockets.emit('Liverate', JSON.parse(data))
});

// Define/initialize our global vars
var notes = []


var isInitNotes = false
var socketCount = 0

io.sockets.on('connection', function (socket) {
  socketCount++
  io.sockets.emit('users connected', socketCount)

  socket.on('disconnect', function () {
    socketCount--
    io.sockets.emit('users connected', socketCount)
  })

  socket.on('add record', function (data) {
    // Use node's db injection format to filter incoming data
    console.log("test", `INSERT INTO live_stock 
    (name, sell, buy, defaultgold, defaultsilver, src, active, fix, isfix) VALUES
    ('${data.name}', ${data.sell}, ${data.buy}, ${data.defaultgold}, ${data.defaultsilver}, '${data.src}', ${data.active}, ${false}, ${false})`)
    pool.query(`INSERT INTO live_stock 
    (name, sell, buy, defaultgold, defaultsilver, src, active, fix, isfix) VALUES
    ('${data.name}', ${data.sell}, ${data.buy}, ${data.defaultgold}, ${data.defaultsilver}, '${data.src}', ${data.active}, ${false}, ${false})`, (x, i) => {
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
    pool.query(`UPDATE live_stock SET buy=${data.buy}, sell=${data.sell}, active=${data.active}, sellactive=${data.sellactive}, buyactive=${data.buyactive}, isfix=${data.isfix} where id = ${data.id}`)
  })

  // Check to see if initial query/notes are set
  if (!isInitNotes) {
    // Initial app start, run db query
    pool.query('SELECT * FROM live_stock')
      .on('result', function (data) {
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

  socket.on('instant mcx', function (data) {
    io.sockets.emit('instant mcx', data)
  })

  //check if data exist in db if it then skip else insert
  // socket.on('update mcx', function (mcxData) {
  //   console.log("mcxData", mcxData)
  //   for (var i = 0; i < mcxData.length; i++) {
  //     console.log("running update qry")
  //     pool.query(`UPDATE live_mcx SET name='${mcxData[i].symbol}', bid=${mcxData[i].Bid}, ask=${mcxData[i].Ask}, high=${mcxData[i].High}, low=${mcxData[i].Low} where id='${mcxData[i].symbol}'`, (error, results) => {
  //       if (error) {
  //         console.log(error)
  //         throw error
  //       } else {
  //         console.log("Rows " + JSON.stringify(results.rows));
  //       }
  //     });
  //   }
  // })
})
