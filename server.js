// importing libraries
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);   
const cors = require("cors")
const port = process.env.PORT || 8000
app.use(cors())

const {Server} = require("socket.io")  // server class from socket.io

// setting constants
let arr = new Array(9);

function checkForWin(num, symbol) {
  let index = num - 1;

  function horizontalMatch() {
    // for horizontal match
    if (index < 3) {
      // +3,+6
      if (arr[index + 3] == symbol && arr[index + 6] == symbol) {
        return true;
      }
    } else if (index < 6) {
      // -3,+3
      if (arr[index - 3] == symbol && arr[index + 3] == symbol) {
        return true;
      }
    } else {
      // -6,-3
      if (arr[index - 3] == symbol && arr[index - 6] == symbol) {
        return true;
      }
    }
    return false;
  }

  function verticalMatch() {
    // for vertical match
    if (index % 3 == 0) {
      // +1,+2
      if (arr[index + 1] == symbol && arr[index + 2] == symbol) {
        return true;
      }
    } else if (index % 3 == 1) {
      // -1,+1
      if (arr[index - 1] == symbol && arr[index + 1] == symbol) {
        return true;
      }
    } else {
      // -2,-1
      if (arr[index - 1] == symbol && arr[index - 2] == symbol) {
        return true;
      }
    }

    return false;
  }

  function diagonalMatch() {
    // for diagonal match
    if (
      (arr[0] == symbol && arr[4] == symbol && arr[8] == symbol) ||
      (arr[2] == symbol && arr[4] == symbol && arr[6] == symbol)
    ) {
      return true;
    }

    return false;
  }

  if (diagonalMatch() || horizontalMatch() || verticalMatch()) {
    // alert(symbol + " Won!!!");
    return true;
  }
}

// middlewares
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"),
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});



// IO object creation

const io = new Server(server, {
  cors: {
    // origin: ["https://criss-cross-pvp.netlify.app/"],
    origin: ["http://localhost:3000"]
  },
});

// listening to calls and functions

io.on("connection",(socket)=>{

    socket.on("move-played-to-backend",(data)=>{
      arr[data.num-1]=(data.nextMove=="X")?"O":"X";
      if(checkForWin(data.num,(data.nextMove=="X")?"O":"X")){
        socket.broadcast.emit("move-played-from-backend",{arr,nextMove:data.nextMove,chance:false});
        socket.emit("game-won",(data.nextMove=="X")?"O":"X");
        return;
      }
      socket.broadcast.emit("move-played-from-backend",{arr,nextMove:data.nextMove,chance:true});
    })

    socket.on("join-room",(room)=>{
      if(room!=socket.id){
        socket.to(room).emit("chance-to-play",true);
      }
    })

    socket.on("clear-array",()=>{
      arr = Array(9).fill("");
    })
})



app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

server.listen(port, () => {
  console.log("listening on :",port);
});
