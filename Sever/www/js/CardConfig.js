var CardConfig = {
  cardNumCnt : 58,//58, //数值卡
  cardCoverCnt : 10, //日食月食卡
  cardSizeW : 100,
  cardSizeH : 100*1.7,
  cardSpaceBetween : 8,
  cardCollectMinCnt : 5,
  Type_Day : 1,
  Type_Night : 2,
  BgColor_Day : 0xf5f5d2,
  BgColor_Night : 0x3b3c3c,
  LblValMarginBtm : 10,
  CardMinValue : 1,
  CardMaxValue : 58*0.5,
  CardDefaultTag : 1000,

  GenerateInitList:function(){
    return this.GenerateRandomList(CardConfig.cardNumCnt+CardConfig.cardCoverCnt);
  },

  GenerateRandomList : function(length){
    var tmp = [];
    for (var i = 0; i < length; i++) {
      tmp[i] = i;
    }
    tmp.sort(function(){return 0.5 - Math.random();});
    return tmp;
  }
}
module.exports=CardConfig;
