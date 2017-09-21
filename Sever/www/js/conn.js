// window.onload = function() {
//     var con = new Con();
//     con.init();
// };

var ServerConfig = {
  Msg_Login : "login",
  Msg_GameStart : "start",
  Ser_Room : "room",
  Ser_Test : "test",
  Game_Collect : "collect",
  Game_PlayCard : "play",
  Game_Discard : "discard",
  Game_MoreCards : "moreCards"
}


var Con = function() {
    this.socket = null;
    this.userId = Date().toString();
};
Con.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function(socket) {
            console.log('link to server ok!');
            that.socket.on(ServerConfig.Msg_GameStart, function(data)
            {
              gameInstance.cardRandomList = data[0];
              var firstHand = that.userId==data[1];
              gameInstance.state = firstHand ? GameState.PrepareFirstHand : GameState.PrepareSecondHand;
            }).on(ServerConfig.Game_PlayCard, function(data)
            {
              gameInstance.opponentPlayCard(data);
            }).on(ServerConfig.Game_Discard, function(data)
            {
              gameInstance.recieveDiscard(data);
            }).on(ServerConfig.Game_Collect, function(data){
              gameInstance.recieveCollectMsg(data);
            }).on(ServerConfig.Game_MoreCards, function(data){
              gameInstance.recieveAskForMoreCardsMsg(data);
            });
        });
   },

   collect : function(tag, info)
   {
     this.socket.emit(ServerConfig.Game_Collect, new Array(tag, info));
   },

   playCard : function(cardData, viewTag, idx){
     console.log(cardData.value + "_" + viewTag + "_" + idx);
     this.socket.emit(ServerConfig.Game_PlayCard, new Array(cardData, viewTag, idx));
   },

   discardCards : function(moreCardCnt)
   {
     this.socket.emit(ServerConfig.Game_Discard, [moreCardCnt]);
   },

   playerReady : function()
   {
     this.socket.emit(ServerConfig.Msg_Login,this.userId);
   },

   askForMoreCards : function(moreCardCnt)
   {
     this.socket.emit(ServerConfig.Game_MoreCards, [moreCardCnt]);
   }

}
module.exports=ServerConfig;
