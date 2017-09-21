
var Exec_Enter = 1000;
var Exec_Ready = 1001;
var Exec_Build = 1002;
var Exec_UpdatePath = 1003;
var Exec_Deconstruct = 1004;
var Exec_MultipleGameReady = 1005;

var DefalutPlayerID = 9527;
var PlayerID = DefalutPlayerID;
var net = require('net');
var clientList = [];
var playerReadyCnt = 0;
var server = net.createServer(function(socket)
{
  socket.on('data', function(data)
  {
    var msg = data.toString();
    var json = JSON.parse(msg);

    console.log(msg);
    var exc = parseInt(json["exec"]);
    switch (exc) {
      case Exec_Enter:
      {
        Terrain.init();
        var msg =  "{\"exec\" : " + Exec_Enter.toString();
        msg += ", \"uid\" : " + PlayerID.toString() + "}";
        socket.write(msg);
        PlayerID++;
        clientList.push(socket);
      }
        break;
      case Exec_Ready:
      {
        var msg =  "{\"exec\" : " + Exec_Ready.toString();
        msg += ", \"start\"   : " + Terrain.getStartPointTag().toString();
        msg += ", \"end\"     : " + Terrain.getEndPointTag().toString();
        msg += ", \"team\"    : " + JSON.stringify(Battle.getEnemyTeam()) + "}";
        console.log(msg);
        socket.write(msg);
      }
      break;

      case Exec_MultipleGameReady:
      {
        playerReadyCnt++;
        console.log("player : " + playerReadyCnt);
        if(playerReadyCnt == clientList.length)
        {
          var msg =  "{\"exec\" : " + Exec_Ready.toString();
          msg += ", \"start\"   : " + Terrain.getStartPointTag().toString();
          msg += ", \"end\"     : " + Terrain.getEndPointTag().toString();
          msg += ", \"team\"    : " + JSON.stringify(Battle.getEnemyTeam()) + "}";
          broadcastMsg(msg, null);
        }
      }
      break;
      case Exec_Build:
      {
        var tileIdx = parseInt(json["tileIdx"]);
        Terrain.updateConfigTileEnable(tileIdx, 0);
        var towerName = json["tower"];

        var msg =  "{\"exec\" : " + Exec_UpdatePath.toString();
        msg += ", \"tower\"  : " + JSON.stringify(towerName);
        msg += ", \"tileIdx\"  : " + json["tileIdx"];
        msg += ", \"userID\"  : " + JSON.stringify(json["userID"]) + "}";
        broadcastMsg(msg, null);

      }
      break;
      case Exec_Deconstruct:
      {
        var tileIdx = parseInt(json["tileIdx"]);
        Terrain.updateConfigTileEnable(tileIdx, 1);
        var msg =  "{\"exec\" : " + Exec_UpdatePath.toString();
        var config = JSON.stringify(Terrain.getTerrainConfig());
        msg += ", \"tileIdx\"  : " + json["tileIdx"];
        msg += ", \"userID\"  : " + JSON.stringify(json["userID"])+ "}";

        broadcastMsg(msg, null);
      }
      break;
      default:
        break;
    }
  });
});
function broadcastMsg(msg, client)
{
  for(var i=0; i<clientList.length; i++)
  {
    if (client!=clientList[i])
    {
        clientList[i].write(msg);
    }
  }
}
server.listen(8888,function()
{
    console.log(" opened server on address %j ", server.address());
});
function test(){console.log("en ? ");}
var Terrain = require('./Terrain.js');
var Battle = require('./Battle.js');
