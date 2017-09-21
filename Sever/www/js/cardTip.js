function CardTip(width, height)
{
    PIXI.Graphics.call(this);
    this.width = width;
    this.height = height;
    var lineW = 2;
    this.lineStyle(lineW, 0xff2222, 1);
    this.drawRect(-lineW*0.5,-lineW*0.5, width+lineW*2, height+lineW*2);
    this.visible = false;
    this.interactive = true;
    var tStyle = {
      fontFamily : 'Arial',
      fontSize: 18,
      fill : 0x66ff00,
      align : 'center'};

    var bugLbl = new PIXI.Text("s",tStyle);
    bugLbl.width = width;
    bugLbl.height = height;
    bugLbl.alpha = 0.01;
    this.addChild(bugLbl);

    this.setupCardBoardEvent = function(flg)//no use
    {
      var mouseoverCallback = function(event)
      {
        console.log("mouseoverCallback");
      };

      var mouseoutCallback = function()
      {
        console.log("mouseoutCallback");
      };

      if (flg)
      {
        this.on("pointerover", mouseoverCallback);
        this.on("pointerout", mouseoutCallback);
      }
      else
      {
        this.on("removeListener", mouseoverCallback);
        this.on("removeListener", mouseoutCallback);
      }
    };

  // this.setupCardBoardEvent(true);

}CardTip.prototype = Object.create(PIXI.Graphics.prototype);
