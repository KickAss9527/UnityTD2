function CardData(type, val){
  this.dayType = type;
  this.value = val;

  this.hasBug = function(){
    var value = this.value;
    if (value==1 || value==4 || value==9 || value==14 ||
        value==19 || value==20 || value==25 || value==29)
        {
          return true;
        }
    return false;
  }
}

function Card(data){

  this.getBgColor = function(){
    return this.data.dayType==CardConfig.Type_Day ? CardConfig.BgColor_Day : CardConfig.BgColor_Night;
  };

  this.getLblValueColor = function(){
    return this.data.dayType==CardConfig.Type_Day ? CardConfig.BgColor_Night : CardConfig.BgColor_Day;
  };

  this.getLogoImgName = function(){
    return this.data.dayType==CardConfig.Type_Day ? "img/sun.png" : "img/moon.png";
  };

  this.getBugImgName = function(){
    var idx = Math.floor(Math.random()*5);
    return "img/bug_" + idx + ".png";
  };

  this.tag = 0;
  this.data = data;

  PIXI.Container.call(this);
  this.width = CardConfig.cardSizeW;
  this.height = CardConfig.cardSizeH;

  this.background = new PIXI.Graphics();
  this.background.beginFill(this.getBgColor());
  this.background.drawRoundedRect(0,0, CardConfig.cardSizeW, CardConfig.cardSizeH, 8);
  this.background.endFill();
  this.background.position.set(0,0);
  this.addChild(this.background);

  var logoImgName = this.getLogoImgName();
  var te = PIXI.Texture.fromImage(logoImgName);
  this.logo = new PIXI.Sprite(te);
  this.logo.anchor.set(0.5, 0);
  this.logo.position.set(this.width*0.5, 10);
  var scale = 0.43;
  this.logo.scale.set(scale, scale);
  this.addChild(this.logo);

  if (this.data.hasBug())
  {
    te = PIXI.Texture.fromImage(this.getBugImgName());
    this.SpBug = new PIXI.Sprite(te);
    this.SpBug.position.set(this.width*0.5, this.height*0.5);
    scale = 0.25;
    this.SpBug.scale.set(scale, scale);
    this.SpBug.anchor.set(0.5,0.5);
    this.addChild(this.SpBug);
  }

  if (this.data.value>0) {
    var tStyle = {
      fontFamily : 'Chalkboard',
      fontSize: 40,
      fill : this.getLblValueColor(),
      align : 'center'};
    this.lblValue = new PIXI.Text(this.data.value.toString(),tStyle);
    this.lblValue.anchor.set(0.5, 1);
    this.lblValue.position.set(this.width*0.5, this.height - CardConfig.LblValMarginBtm);

    this.addChild(this.lblValue);
  }
}
Card.prototype = Object.create(PIXI.Container.prototype);

function CollectTipView(manager)
{
  PIXI.Graphics.call(this);
  var tStyle = {
    fontFamily : 'Arial',
    fontSize: 40,
    fill : 0x33FF33,
    align : 'center'};
  this.lblReady = new PIXI.Text("Collect!!!",tStyle);
  this.lblReady.anchor.set(0.5,0.5);
  this.addChild(this.lblReady);
  this.visible = false;

  this.collectInfo = null;
  this.manager = manager;

  this.updateDisplay = function(idxRange)
  {
    this.collectInfo = idxRange;

    if (this.collectInfo)
    {
      var cardCnt = idxRange.y - idxRange.x + 1;
      var width = cardCnt*CardConfig.cardSizeW + (cardCnt-1)*CardConfig.cardSpaceBetween;
      var height = CardConfig.cardSizeH;
      this.clear();
      this.lineStyle(2, 0x11FF11, 1);
      this.beginFill(0x33FF33, 0.05);
      this.drawRect(0, 0, width, height);
      this.endFill();
      this.lblReady.position.set(width*0.5, height*0.5);
      this.visible = true;
      this.interactive = true;
    }
    else {
      this.visible = false;
      this.interactive = false;
    }
  };

  var that = this;
  this.on('click', function(){
    this.manager.evtCollect();
  });
  this.on('touchend', function(){this.manager.evtCollect();});

}CollectTipView.prototype = Object.create(PIXI.Graphics.prototype);
