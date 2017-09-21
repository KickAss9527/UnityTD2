
function CardParentView(width, height, cardType)
{
    PIXI.Container.call(this);
    this.cardType = cardType;

    this.width = width;
    this.height = height;
    this.borderLayer = new PIXI.Graphics();
    this.arrCardNode = new Array();
    this.arrCardTip = new Array();
    this.cardTipParent = new PIXI.Container();
    this.cardNodeParent = new PIXI.Container();
    this.addChild(this.cardTipParent);
    this.addChild(this.cardNodeParent);

    this.cardTipParent.width = this.cardNodeParent.width = width;
    this.cardTipParent.height = this.cardNodeParent.height = height;

    this.viewCollectTip = new CollectTipView(this);
    this.addChild(this.viewCollectTip);

    this.tag = 0;

    this.getBorderColor = function()
    {
      var color = 0x444444;
      if (this.cardType == CardConfig.Type_Day)
      {
        color = 0xffffff;
      }
      else if(this.cardType == CardConfig.Type_Night)
      {
        color = 0x0000FF;
      }
      return color;
    };
    this.borderLayer.lineStyle(1, this.getBorderColor(), 1);
    this.borderLayer.drawRect(0, 0, width, height);
    this.addChild(this.borderLayer);

    this.getMatchedCardNode = function(cardCenter)
    {
      if(this.arrCardTip.length == 0) return null;
      for (var i = 0; i < this.arrCardTip.length; i++) {
        var node = this.arrCardTip[i];
        if (node.x < cardCenter.x && cardCenter.x < node.x + node.width &&
            node.y < cardCenter.y && cardCenter.y < node.y + node.height){
            return node;
        }
      }
      return null;
    }

    this.loadCardTip = function()
    {
      var tipCard = new CardTip(CardConfig.cardSizeW, CardConfig.cardSizeH);
      this.cardTipParent.addChild(tipCard);
      this.arrCardTip.push(tipCard);
      return tipCard;
    }

    this.refreshCardsLayout = function()
    {
      for (var i = 0; i < this.arrCardNode.length; i++) {
        var arr = this.arrCardNode[i];
        var pos = this.arrCardTip[i+1].position;

        for (var j = 0; j < arr.length; j++) {
          var card = arr[j];
          var tween = PIXI.tweenManager.createTween(card);
          tween.time = GameConfig.AnimDuration_Short;
          tween.to({"x":pos.x, "y":pos.y});
          tween.start();
          // if (j == arr.length - 1 && i == this.arrCardNode.length-1) {
          //   var that = this;
          //   tween.on('end', function(){});
          // }
        }
      }
    };

    this.refreshCardTipsLayout = function()
    {
      var cardW = CardConfig.cardSizeW;
      var cnt = this.arrCardTip.length;

      var x = 0.5*this.width - 0.5*(cnt*cardW + (cnt-1)*CardConfig.cardSpaceBetween);

      for (var i = 0; i < cnt; i++) {
        var node = this.arrCardTip[i];
        var newPos = new PIXI.Point(x + i*(CardConfig.cardSpaceBetween + cardW), 0);
        node.x = newPos.x;
      }
    };

    this.dropAllCards = function()
    {
      var cards = this.cardNodeParent.children.concat();
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.setupCardPlayerEvent(false);
      }
      this.cardNodeParent.removeChildren();
      this.cardTipParent.removeChildren();
      this.arrCardTip = new Array();
      this.arrCardNode = new Array();
      if (this.cardType > 0) {
        this.prepareNextCards();
      }

      return cards;
    };

    this.prepareNextCards = function()
    {
      if (this.arrCardTip.length == 0)
      {
        this.loadCardTip();
      }
      else {
        var surfaceCards = this.getSurfaceArr();
        while (this.arrCardTip.length < surfaceCards.length + 2) {
          this.loadCardTip();
        };
      }
      this.refreshCardTipsLayout();
    };
    if(this.cardType > 0) this.prepareNextCards();

    this.evtCollect = function()
    {
      var info = this.viewCollectTip.collectInfo;
      console.log(info);
      var score = this.collect(info);
      gameInstance.playerCollect(this.tag, info, score);
      this.showCollectScore(score);
    };

    this.showCollectScore = function(value)
    {
      var tStyle = {
        fontFamily : 'Arial',
        fontSize: 40,
        fill : 0x33FF33,
        align : 'center'};
      var lblScore = new PIXI.Text("+" + value,tStyle);
      lblScore.anchor.set(0.5,0.5);
      lblScore.position.set(this.viewCollectTip.x + this.viewCollectTip.width*0.5,
                            this.viewCollectTip.y + this.viewCollectTip.height*0.5+20);
      this.addChild(lblScore);
      var tween = PIXI.tweenManager.createTween(lblScore);
      tween.time = 1000;
      tween.to({"x":lblScore.x, "y":lblScore.y-100, "alpha":0});
      tween.start();
      tween.on('end', function(){
        lblScore.parent.removeChild(lblScore);
      });
    };

    this.collect = function(info){
      var score = 0;
      for (var i = info.x; i <= info.y; i++)
      {
        var arr = this.arrCardNode[i];
        for (var j = 0; j < arr.length; j++) {
          var card = arr[j];
          card.parent.removeChild(card);
          if(card.getData().value > 0) score++;
        }
      }
      this.arrCardNode.splice(info.x, info.y-info.x + 1);
      var leftTipCnt = 0;
      if(this.arrCardNode.length==0) leftTipCnt = 1;
      else leftTipCnt = this.arrCardNode.length+2;
      for (var i = this.arrCardTip.length-1; i >= leftTipCnt; i--)
      {
        var tip = this.arrCardTip[i];
        tip.parent.removeChild(tip);
      }
      this.arrCardTip = new Array();
      for (var i = 0; i < this.cardTipParent.children.length; i++) {
        this.arrCardTip.push(this.cardTipParent.children[i]);
      }
      this.refreshCardTipsLayout();
      this.refreshCardsLayout();
      this.hideCollectTip();
      return score;
    }

    this.recieveCardFromOpponent = function(card, idx)
    {
      var tipNode = this.arrCardTip[idx];
      this.addCard(card,new PIXI.Point(this.width*0.5, -this.y-130), idx);
      this.prepareNextCards();
      this.refreshCardsLayout();
    };

    this.recieveCard = function(card)
    {
      var pos = this.getPlayerCardLocalPos(card);
      var tipNode = this.getMatchedCardNode(new PIXI.Point(pos.x + card.width*0.5, pos.y + card.height*0.5));
      console.log(tipNode);
      var idx = this.arrCardTip.indexOf(tipNode);
      this.addCard(card,pos,idx);//加入新的view
      this.prepareNextCards();
      this.refreshCardsLayout();
      gameInstance.playCard(card.getData(), this.tag, idx);
    };

    this.addCard = function(card, pos, idx)//加入node，但card作为子节点保持当前位置，之后用动画位移
    {
      if (card.parent)
      {
        card.parent.removeChild(card);
      }
      card.setupCardPlayerEvent(false);
      card.position = pos;
      this.cardNodeParent.addChild(card);

      var head = this.getHeadNode();
      if(head) idx--;
      if (idx >= this.arrCardNode.length ) {
        this.arrCardNode.splice(idx, 0, new Array());
      }
      else if(idx < 0)
      {
        idx = 0;
        this.arrCardNode.splice(0, 0, new Array());
      }

      var arr = this.arrCardNode[idx];
      arr.push(card);
      console.log(idx+"_"+arr);
    };

    this.getHeadNode = function()
    {
      var surfaceCards = this.getSurfaceArr();

      if (surfaceCards.length == 0) {
        return null;
      }
      else {
        return surfaceCards[0];
      }
    };

    this.getTailNode = function()
    {
      var surfaceCards = this.getSurfaceArr();

      if (surfaceCards.length == 0) {
        return null;
      }
      else {
        return surfaceCards[surfaceCards.length-1];
      }
    };

    this.getAcceptiveCards = function()
    {
      var res = new Array();
      var surfaceCards = this.getSurfaceArr();
      for (var i = 0; i < surfaceCards.length; i++) {
        var node = surfaceCards[i];
        if (node.canPlaceHere()) res.push(node);
      }

      var leftNode = surfaceCards[0].left;
      if(leftNode!=null && leftNode.canPlaceHere()) res.push(leftNode);

      var rightNode = surfaceCards[surfaceCards.length-1].right;
      if(rightNode!=null && rightNode.canPlaceHere()) res.push(rightNode);
      return res;
    };

    this.getPlayerCardLocalPos = function(card)
    {
      var cardWorldPos = card.parent.toGlobal(card.position);
      var cardLocalPos = this.toLocal(cardWorldPos);
      return cardLocalPos;
    };

    this.canRecieveCard = function(card)
    {
      if (this.arrCardNode.length == 0 && card.getData.value > 0)
      {
        return true;
      }
      var center = this.getPlayerCardLocalPos(card);
      center.x += card.width*0.5;
      center.y += card.height*0.5;
      var cardTip = this.getMatchedCardNode(center);
      return cardTip && cardTip.visible;
    };

    this.getSurfaceArr = function(){
      var surfaceCards = new Array();
      for (var i = 0; i < this.arrCardNode.length; i++) {
        var arr = this.arrCardNode[i];
        surfaceCards.push(arr[arr.length-1]);
      }
      return surfaceCards;
    };

    this.canShowTip = function(cardData)
    {
      if (!cardData) {
        return true;
      }
      else if(cardData.dayType == CardConfig.Type_Night)
      {
        if (this.tag == GameConfig.ViewTag_PlayerNight || this.tag == GameConfig.ViewTag_OpponentNight)
        {
          return true;
        }
        return false;
      }
      else if(cardData.dayType == CardConfig.Type_Day)
      {
        if (this.tag == GameConfig.ViewTag_PlayerDay || this.tag == GameConfig.ViewTag_OpponentDay)
        {
          return true;
        }
        return false;
      }

      return false;
    };

    this.hideTip = function(cardData)
    {
      if (!this.canShowTip(cardData))
      {
        return;
      }
      console.log("card parent view hide tip");
      this.hideCollectTip();
      this.hidePlayCardTip();
    };

    this.hidePlayCardTip = function(cardData)
    {
      for (var i = 0; i < this.cardTipParent.children.length; i++) {
        var node = this.cardTipParent.children[i];
        node.visible = false;
      }
    };

    this.hideCollectTip = function()
    {
      this.viewCollectTip.updateDisplay(null);
    };

    this.canCollect = function(surfaceCards)
    {
      var cnt = 0;
      var idxStart = -1;
      var idxEnd = -1;
      var res = new PIXI.Point(-1, -1);
      for (var i = 0; i < surfaceCards.length; i++)
      {
        var card = surfaceCards[i];
        if (card.getData().value > 0)
        {
          if (res.x < 0) {
            res.x = i;
          }
          cnt++;
          if (cnt >= CardConfig.cardCollectMinCnt)
          {
            res.y = i;
          }
        }
        else {
          if (res.y > 0)
          {
            return res;
          }
          cnt = 0;
        }
      }
      if (res.y > 0)
      {
        return res;
      }
      else return null;
    };

    this.showCollectTip = function(){
      var surfaceCards = this.getSurfaceArr();
      var collectInfo = this.canCollect(surfaceCards);
      this.viewCollectTip.updateDisplay(collectInfo);
      if (collectInfo)
      {
          this.viewCollectTip.x = this.arrCardNode[collectInfo.x][0].x;
      }
    };

    this.checkCanCollet = function()
    {
      var surfaceCards = this.getSurfaceArr();
      return this.canCollect(surfaceCards)!=null;
    };

    this.showPlayCardTip = function(cardData)
    {
      // console.log(this.tag+"--"+cardData.dayType);
      if (!this.canShowTip(cardData))
      {
        return;
      }
      var surfaceCards = this.getSurfaceArr();
      if (cardData.value < 0) {
        for (var i = 0; i < surfaceCards.length; i++) {
          var node = surfaceCards[i];
          if (node.getData().value > 0) {
              this.arrCardTip[i+1].visible = true;
          }
        }
      }
      else
     {
        //出牌是 数值卡， 最上 是 日食月食
        //左右两边是否可放置
        if(surfaceCards.length == 0)
        {
          this.arrCardTip[0].visible = true;
          return;
        }
        var headNode = surfaceCards[0];
        var tailNode = surfaceCards[surfaceCards.length-1];
        if (headNode.getData().value > cardData.value)
        {
            this.arrCardTip[0].visible = true;
        }
        else if(tailNode.getData().value < cardData.value && tailNode.getData().value>0)
        {
            this.arrCardTip[this.arrCardTip.length-1].visible = true;
        }
        else if(surfaceCards.length==1 && headNode.getData().value < 0)
        {
          this.arrCardTip[1].visible = true;
        }
        else
        {
          var prevValue = -999;
          for (var i = 0; i < surfaceCards.length; i++) {
            var node = surfaceCards[i];
            if (node.getData().value < 0)//找出 日食月食
            {
              if (cardData.value > prevValue)
              {
                var rightValue = 9999;
                var rightNode;
                var tmpI = i;
                do{//find the right nearest valid node
                  if (tmpI >= surfaceCards.length) {
                    break;
                  }
                  rightNode = surfaceCards[tmpI++];
                  rightValue = rightNode.getData().value;
                }while(rightValue < 0);

                if(prevValue < -1 && rightValue == -1)//全部是 食
                {
                  for (var i=1; i<=this.arrCardNode.length; i++) {
                    this.arrCardTip[i].visible = true;
                  }
                  break;
                }
                else if(prevValue < cardData.value && cardData.value < rightValue)//若干食被截断 x000xxx / 000x
                {
                  if (prevValue < -1) {//食 开头,只显示离数字最近的tip
                    this.arrCardTip[tmpI-1].visible = true;
                  }
                  else {
                    for (var j = i+1; j < tmpI; j++) {//夹中间
                      this.arrCardTip[j].visible = true;
                    }
                  }
                }
                else if(prevValue < cardData.value && rightValue == -1)//x000
                {
                  this.arrCardTip[i+1].visible = true;
                  break;
                }
              }
            }
            else
            {
              prevValue = surfaceCards[i].getData().value;
            }
          }
        }
      }

    };
}
CardParentView.prototype = Object.create(PIXI.Container.prototype);
