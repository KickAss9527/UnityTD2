var GameConfig ={
  sceneWidth : 1440,
  sceneHeight : 960,
  handCardCnt : 5,
  ViewTag_OpponentDay : 1,
  ViewTag_OpponentNight : 2,
  ViewTag_PlayerDay : 3,
  ViewTag_PlayerNight : 4,
  AnimDuration_Short : 150,
  AnimDuration_Normal : 250
}

var GameState = {
  Invalid : -1,
  Waiting : 0,
  PrepareFirstHand : 1,
  PrepareSecondHand : 2,
  PlayerTurn : 3,
  OpponentTurn : 4,
  CommunicateToServer : 5,
  Init : 6,
  PlayerTurnThinking : 7,
  OpponentTurnThinking : 8,
  GameEndStart : 9,
  GameEndComplete : 10
}

function Game(){

  this.state = GameState.Init;
  this.lblReady = null;
  this.connector = new Con();
  this.connector.init();
  this.stage = new PIXI.Container();
  this.lblReady = null;
  this.scores = new Array(0, 0);
  this.playerCardView = null;
  this.playerDayView = null;
  this.playerNightView = null;
  this.opponentDayView = null;
  this.opponentNightView = null;
  this.cardStack = null;
  this.cardStack_Discard = new Array();
  this.cardRandomList = null;
  this.opponentCardStack = null;
  this.btnDiscard = null;
  this.lblTurnInfo = null;
  this.lblEndInfo = null;
  this.askForMoreCardsCallback = null;
  this.fLastAction = false;
  this.viewGameInfo = null;
};

Game.prototype = {
  evtReady : function(evt)
  {
    gameInstance.lblReady.text = "Waiting...";
    gameInstance.lblReady.interactive = false;
    gameInstance.connector.playerReady();
  },

  initPrepareInfo : function()
  {
    var tStyle = {
      fontFamily : 'Arial',
      fontSize: 40,
      fill : 0x66ff00,
      align : 'center'};

    this.lblReady = new PIXI.Text("Ready?",tStyle);
    this.lblReady.anchor.set(0.5,0.5);
    this.lblReady.position.set(GameConfig.sceneWidth*0.5, GameConfig.sceneHeight*0.5);
    this.lblReady.interactive = true;
    this.lblReady.on('click', this.evtReady);
    this.lblReady.on('tap', this.evtReady);
    this.stage.addChild(this.lblReady);
  },

  loadBorderContainer : function(width, height)
  {
    var gra = new PIXI.Graphics();
    gra.lineStyle(1, 0x006666, 1);
    gra.beginFill(0x444444, 0);
    gra.drawRect(0, 0, width, height);
    gra.endFill();
    return gra;
  },

  initPlayerCardView : function()
  {
      this.lblReady.parent.removeChild(this.lblReady);
      var width = GameConfig.sceneWidth-2;
      var height = CardConfig.cardSizeH;
      this.playerCardView = new CardParentView(width, height, 0);
      this.playerCardView.position.set(1,GameConfig.sceneHeight - CardConfig.cardSizeH);

// load btn Discard
      var tStyle = {
        fontFamily : 'Arial',
        fontSize: 18,
        fill : 0x66ff00,
        align : 'center'};

      this.btnDiscard = new PIXI.Text("Discard",tStyle);
      this.btnDiscard.anchor.set(0.5,0.5);
      this.btnDiscard.position.set(50, 20);
      this.btnDiscard.interactive = true;
      var that = this;
      var discardEvt = function(){
        console.log(that.cardStack_Discard);
        that.discardCards();
        console.log("discard cnt : " + that.cardStack_Discard.length);
      };
      this.btnDiscard.on('click', discardEvt);
      this.btnDiscard.on('tap', discardEvt);
      this.playerCardView.addChild(this.btnDiscard);

//load 4 game card board

      this.playerDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.playerNightView = new CardParentView(width, height, CardConfig.Type_Night);
      this.opponentDayView = new CardParentView(width, height, CardConfig.Type_Day);
      this.opponentNightView = new CardParentView(width, height, CardConfig.Type_Night);
      this.playerDayView.tag = GameConfig.ViewTag_PlayerDay;
      this.playerNightView.tag = GameConfig.ViewTag_PlayerNight;
      this.opponentDayView.tag = GameConfig.ViewTag_OpponentDay;
      this.opponentNightView.tag = GameConfig.ViewTag_OpponentNight;

      this.stage.addChild(this.opponentDayView);
      this.stage.addChild(this.opponentNightView);
      this.stage.addChild(this.playerDayView);
      this.stage.addChild(this.playerNightView);
      this.stage.addChild(this.playerCardView);

      var viewSpace = 10;
      this.playerNightView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+viewSpace)*2);
      this.playerDayView.position.set(1, GameConfig.sceneHeight - (CardConfig.cardSizeH+viewSpace)*3);
      this.opponentNightView.position.set(1, CardConfig.cardSizeH + viewSpace*2);
      this.opponentDayView.position.set(1, viewSpace);

//load initial cardsprite
var posY = GameConfig.sceneHeight*0.5 - CardConfig.cardSizeH*0.5 - 10;
      console.log("stack count : %d", this.cardStack.length);
      this.opponentCardStack = new Array();
      this.lblTurnInfo = new PIXI.Text("TurnInfo",tStyle);
      this.lblTurnInfo.position.set(20, posY);
      this.lblTurnInfo.anchor.set(0, 0.5);
      this.stage.addChild(this.lblTurnInfo);

      this.lblEndInfo = new PIXI.Text("", tStyle);
      this.lblEndInfo.position.set(GameConfig.sceneWidth-10, posY);
      this.lblEndInfo.anchor.set(1, 0.5);
      this.stage.addChild(this.lblEndInfo);

      if (this.state == GameState.PrepareSecondHand)
      {
        this.lblTurnInfo.text = this.connector.userId + " _ Opponent Turn";
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
      for(var i=0; i<GameConfig.handCardCnt; i++)
      {
        var card = this.cardStack.pop();
        card.setupCardPlayerEvent(true);
        this.playerCardView.cardNodeParent.addChild(card);
      }
      this.refreshPlayerCardsLayout();
      if (this.state == GameState.PrepareFirstHand)
      {
        this.lblTurnInfo.text = this.connector.userId + " _ Your Turn";
        for(var i=0; i<GameConfig.handCardCnt; i++){this.opponentCardStack.push(this.cardStack.pop());}
      }
  },

  InitCardStack : function()
  {
    this.cardStack = new Array();
    for (var i = 1; i <= CardConfig.cardNumCnt*0.5; i++)
    {
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Day, i))));
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Night, i))));
    }
    for (var i = 0; i < CardConfig.cardCoverCnt*0.5; i++) {
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Day, -1))));
      this.cardStack.push(new CardOnBoard(new Card(new CardData(CardConfig.Type_Night, -1))));
    }
  },

  randomCardStack : function()
  {
    var newCardStack = new Array();
    this.sortCards(this.cardStack);
    for (var i = 0; i < this.cardStack.length; i++)
    {
      newCardStack.push(this.cardStack[this.cardRandomList[i]]);
    }
    this.cardStack = newCardStack;
  },

  canPlayThisCard : function (card)
  {
    var center = card.parent.toGlobal(card.position);
    center.x += 0.5*card.width;
    center.y += 0.5*card.height;
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      if (targetView.cardType == card.getData().dayType &&
          center.y <= targetView.y + targetView.height && center.y >= targetView.y)
          //在大队列范围内
      {
          if (targetView.canRecieveCard(card))
          {
            console.log("can play the card in this view");
            return targetView;
          }
      }
    }

    return null;
  },

  hidePlayCardTip : function(cardData)
  {
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      targetView.hidePlayCardTip(cardData);
    }
  },

  hideCollectTip : function()
  {
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      targetView.hideCollectTip();
    }
  },

  showPlayCardTip : function(cardData)
  {
    //检查 collect
    var parentView = new Array(this.playerNightView, this.playerDayView, this.opponentDayView,this.opponentNightView);
    for (var i = 0; i < parentView.length; i++)
    {
      var targetView = parentView[i];
      targetView.showPlayCardTip(cardData);
    }
  },

  showWaitingTip : function()
  {
      this.playerDayView.showCollectTip();
      this.playerNightView.showCollectTip();
  },

  sortCards : function(cards){
    cards.sort(function(a,b){
      return (a.getData().value + a.getData().dayType*100) - (b.getData().value + b.getData().dayType*100);
    });
  },

  refreshPlayerCardsLayout : function()
  {
    var nodes = this.playerCardView.cardNodeParent.children;
    this.sortCards(nodes);
    var cnt = nodes.length;
    if (cnt == 0) return;
    var cardW = nodes[0].width;
    var space = 10;

    var x = 0.5*(GameConfig.sceneWidth - cnt*cardW - (cnt-1)*space);
    for (var i = 0; i < cnt; i++) {
      var node = nodes[i];
      var newPos = new PIXI.Point(x + i*(space + cardW), node.y);
      var tween = PIXI.tweenManager.createTween(node);
      tween.time = GameConfig.AnimDuration_Short;
      tween.to(newPos);
      tween.start();
    }
  },

  opponentPlayCard : function(data)
  {
    var cardData = data[0];
    var tag = data[1];
    var idx = data[2];

    var targetView = null;
    if (tag == GameConfig.ViewTag_OpponentDay) targetView = this.playerDayView;
    else if (tag == GameConfig.ViewTag_OpponentNight) targetView = this.playerNightView;
    else if (tag == GameConfig.ViewTag_PlayerDay) targetView = this.opponentDayView;
    else if (tag == GameConfig.ViewTag_PlayerNight) targetView = this.opponentNightView;

    var targetCard = null;
    for (var i = 0; i < this.opponentCardStack.length; i++) {
      var card = this.opponentCardStack[i];
      if (card.getData().value == cardData.value &&
          card.getData().dayType == cardData.dayType) {
        targetCard = card;
        this.opponentCardStack.splice(i, 1);
        break;
      }
    }
    if(!targetCard) {
      console.log("?");
    }
    targetView.recieveCardFromOpponent(targetCard, idx);
    this.updateEndInfo();

    if (targetCard.getData().hasBug()) {
      if (!this.canAskForMoreCards() && this.opponentCardStack.length == 0) {
        this.state = GameState.PlayerTurn;
        return;
      }
    }
    else if(this.opponentCardStack.length == 0)
    {
      if (!this.canAskForMoreCards()) {
        this.state = GameState.PlayerTurn;
        return;
      }
      this.askForMoreCardsCallback = function(){
        this.state = GameState.PlayerTurn;
      };
    }
    else {
      var tween = PIXI.tweenManager.createTween(this.playerCardView);
      tween.time = GameConfig.AnimDuration_Short+1;
      tween.to({"x":this.playerCardView.position.x, "y":this.playerCardView.position.y});
      tween.start();
      tween.on('end', function(){
        gameInstance.state = GameState.PlayerTurn;
      });

    }
  },

  playCard : function(cardData, viewTag, idx){
    this.updateEndInfo();
    this.hideCollectTip();
    this.connector.playCard(cardData, viewTag, idx);
    if (cardData.hasBug())
    {
        if (!this.canAskForMoreCards() && this.playerCardView.cardNodeParent.children.length == 0) {
          this.state = GameState.OpponentTurn;
          return;
        }
        //continue
        if(this.playerCardView.cardNodeParent.children.length == 0)
        {
          this.askForMoreCardsCallback = null;
          this.askForMoreCards();
        }
    }
    else if(this.playerCardView.cardNodeParent.children.length == 0)
    {
      if (!this.canAskForMoreCards() && this.playerCardView.cardNodeParent.children.length == 0) {
        this.state = GameState.OpponentTurn;
        return;
      }
      this.askForMoreCardsCallback = function(){
        if (gameInstance.state == GameState.OpponentTurnThinking) {
          gameInstance.state = GameState.PlayerTurn;
        }
        else{
          gameInstance.state = GameState.OpponentTurn;
        }
      };
      this.askForMoreCards();
    }
    else
    {
      this.state = GameState.OpponentTurn;
    }
  },

  canAskForMoreCards : function(){
    return this.cardStack.length + this.cardStack_Discard.length > 0;
  },
  askForMoreCards : function(){
    var left = this.cardStack.length - GameConfig.handCardCnt;
    if (left >= 0 || this.cardStack_Discard == 0) this.connector.askForMoreCards(null);
    else this.connector.askForMoreCards(this.cardStack_Discard.length);

  },
  recieveAskForMoreCardsMsg : function(data)
  {
    var cards;
    var left = this.cardStack.length - GameConfig.handCardCnt;
    if (this.state == GameState.OpponentTurnThinking)
    {
      if(left >= 0 || this.cardStack_Discard.length == 0)
      {
        cards = this.cardStack.splice(this.cardStack.length-GameConfig.handCardCnt, GameConfig.handCardCnt);
        this.opponentCardStack = cards;
      }
      else {
        left *= -1;
        this.opponentCardStack = this.cardStack;
        this.cardStack = this.cardStack_Discard;
        this.cardStack_Discard = new Array();
        if (!data) alert("drop card !error");
        this.cardRandomList = data[0];
        this.randomCardStack();
        var more = this.cardStack.splice(this.cardStack.length-left, left);
        this.opponentCardStack = this.opponentCardStack.concat(more);
        for (var i = 0; i < this.opponentCardStack.length; i++) {
          var card = this.opponentCardStack[i];
          console.log(card.getData().value);
        }
      }
    }
    else
    {
      if (left >= 0 || this.cardStack_Discard.length == 0)
      {
        cards = this.cardStack.splice(this.cardStack.length-GameConfig.handCardCnt, GameConfig.handCardCnt);
      }
      else
      {
        left *= -1;
        cards = this.cardStack;
        this.cardStack = this.cardStack_Discard;
        this.cardStack_Discard = new Array();
        if (!data[0]) alert("drop card !error");
        this.cardRandomList = data[0];
        this.randomCardStack();
        var more = this.cardStack.splice(this.cardStack.length-left, left);
        cards = cards.concat(more);
      }
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.setupCardPlayerEvent(true);
        this.playerCardView.cardNodeParent.addChild(card);
      }
    }

    this.hideCollectTip();
    this.refreshPlayerCardsLayout();
    this.updateEndInfo();

    if (this.askForMoreCardsCallback) {
      this.askForMoreCardsCallback();
      this.askForMoreCardsCallback = null;
    }
  },

  updateEndInfo : function()
  {
    var cnt = this.cardStack.length + this.cardStack_Discard.length;
    if (cnt == 0)
    {
      this.lblEndInfo.text = "No cards left, opponent has " + this.opponentCardStack.length + " cards";
    }
    else
    {
      this.lblEndInfo.text = cnt + " cards total left";
    }
  },

  recieveDiscard : function(data)
  {
    if (this.state == GameState.OpponentTurnThinking)
    {
      //弃对手牌
      var cards = new Array();
      cards = cards.concat(this.opponentDayView.dropAllCards())
      cards = cards.concat(this.opponentNightView.dropAllCards());
      cards = cards.concat(this.opponentCardStack);

      //添加进弃牌堆
      this.cardStack_Discard = this.cardStack_Discard.concat(cards);
      this.askForMoreCardsCallback = function(){this.state = GameState.PlayerTurn;};
    }
    else
    {
      this.askForMoreCardsCallback = function(){this.state = GameState.OpponentTurn;};
    }
    this.recieveAskForMoreCardsMsg(data);

  },
  discardCards : function()
  {
    var left = this.cardStack.length - GameConfig.handCardCnt;
    var cards = new Array();
    //手牌，打出去的牌
    cards = cards.concat(this.playerNightView.dropAllCards());
    cards = cards.concat(this.playerDayView.dropAllCards());
    cards = cards.concat(this.playerCardView.dropAllCards());
    //添加进弃牌堆
    this.cardStack_Discard = cards.concat(this.cardStack_Discard);
    //如果牌堆不够，向服务器请求 新的随机顺序，给弃牌堆洗牌
    if (left >= 0 || this.cardStack_Discard == 0) this.connector.discardCards(null);
    else this.connector.discardCards(this.cardStack_Discard.length);

  },

  playerCollect : function(tag, info, score)
  {
    this.connector.collect(tag, info);
    this.addScoreToPlayer(true, score);
    this.updateTurnInfo();
    this.hideCollectTip();
    this.state = GameState.OpponentTurn;
  },

  recieveCollectMsg : function(data)
  {
    var tag = data[0];
    var info = data[1];
    var targetView = null;
    if (tag == GameConfig.ViewTag_PlayerDay) targetView = this.opponentDayView;
    else if (tag == GameConfig.ViewTag_PlayerNight) targetView = this.opponentNightView;
    var score = targetView.collect(info);
    this.addScoreToPlayer(false, score);
    this.updateTurnInfo();
    this.state = GameState.PlayerTurn;

  },

  addScoreToPlayer : function(flgPlayer, score)
  {
    this.scores[flgPlayer?0:1] += score*10;
  },

  updateTurnInfo : function(){
    var text = "";
    text += this.connector.userId.substring(19, 24) + " | ";
    text += this.state == GameState.PlayerTurn ? " Your Turn Now!!!" : " Opponent Turn..."
    text += " | Cards Left : " + this.cardStack.length + "; Cards Discard : " + this.cardStack_Discard.length;
    text += ";   Score: " + this.scores[0] + " : " + this.scores[1] + " ** ";
    this.lblTurnInfo.text = text;
  },

  setupPlayerControl : function(flgEnable)
  {
    this.btnDiscard.interactive = flgEnable;
    var cards = this.playerCardView.cardNodeParent.children;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i]
      card.interactive = flgEnable;
    }
  },

  checkLastAction : function()
  {
      if ((this.state == GameState.PlayerTurn && this.opponentCardStack.length == 0) ||
          (this.state == GameState.OpponentTurn && this.playerCardView.cardNodeParent.children.length == 0))
      {
          this.fLastAction = true;
      }
      else this.fLastAction = false;
  },
  checkEndGame : function(){

    if (this.fLastAction)
    {
      this.state = GameState.GameEndStart;
      return true;
    }

    return false;
  },

  endGame : function(){
    var flg = this.scores[0] - this.scores[1];
    if (flg > 0) {
      alert("You Win!");
    }
    else if(flg < 0)
    {
      alert("You Lose!");
    }
    else
    {
        alert("平手诶！！")
    }

    this.state = GameState.GameEndComplete;
  }

};

var gameInstance = new Game();
var allCards = new Array();
var renderer = PIXI.autoDetectRenderer(GameConfig.sceneWidth, GameConfig.sceneHeight,{backgroundColor : 0x333333});
document.getElementsByTagName('body')[0].appendChild(renderer.view);

animate();
function animate() {
    switch (gameInstance.state)
    {
      case GameState.Init:
      {
        gameInstance.initPrepareInfo();
        gameInstance.state = GameState.Waiting;
      }
      break;
      case GameState.Waiting:{}break;
      case GameState.PrepareFirstHand:
      case GameState.PrepareSecondHand:
      {
        gameInstance.InitCardStack();
        gameInstance.randomCardStack();
        gameInstance.initPlayerCardView();
        gameInstance.setupPlayerControl(false);
        gameInstance.state = gameInstance.state==GameState.PrepareFirstHand ? GameState.PlayerTurn : GameState.OpponentTurn;
      }break;
      case GameState.PlayerTurn:
      {
        if(gameInstance.checkEndGame()) break;
        gameInstance.checkLastAction();
        gameInstance.setupPlayerControl(true);
        gameInstance.showWaitingTip();
        gameInstance.updateTurnInfo();
        gameInstance.state = GameState.PlayerTurnThinking;
      }break;
      case GameState.PlayerTurnThinking:{}break;
      case GameState.OpponentTurn:
      {
        if(gameInstance.checkEndGame()) break;
        gameInstance.checkLastAction();
        gameInstance.setupPlayerControl(false);
        gameInstance.updateTurnInfo();
        gameInstance.state = GameState.OpponentTurnThinking;
      }break;
      case GameState.OpponentTurnThinking:{}break;
      case GameState.GameEndStart:
      {
        gameInstance.endGame();
      }break;
      default:break;

    }
    requestAnimationFrame(animate);
    renderer.render(gameInstance.stage);
    PIXI.tweenManager.update();
}


// create the root of the scene graph
