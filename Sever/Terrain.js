//path ----------
//12w x 10h
var defaultTerrain = [
 "OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO","OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO",
 "OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO","OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO",
 "OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO","OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO",
 "OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO","OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO",
 "OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO","OOOOOOOOOOOOOOOOOOOO", "OOOOOOOOOOOOOOOOOOOO",];//9
 var TerrainConfig;
 this.init = function()
 {
   TerrainConfig = [20];
   for (var i = 0; i < defaultTerrain.length; i++) {
     TerrainConfig[i] = defaultTerrain[i];
   }
 }
 this.init();
// 0123456789
var TerrainWidth = TerrainConfig[0].length;
var TerrainHeight = TerrainConfig.length;
var PointA = new TerrainTile(new TerrainTilePoint(17, 17));
var PointB = new TerrainTile(new TerrainTilePoint(0, 0));
this.getStartPointTag = function(){return PointA.objPoint.tId;}
this.getEndPointTag = function(){return PointB.objPoint.tId;}

this.updateConfigTileEnable = function(idx, flgEnable)
{
  var x = idx%TerrainWidth;
  var y = parseInt(idx/TerrainWidth);
  if(y >= TerrainHeight)
  {
    console.log("Invalid building tile idx");
    return;
}
  console.log("x", x);
  console.log("y", y);
  var str = TerrainConfig[y];
  str = str.substr(0, x) + (flgEnable==1 ? "O":"X") + str.substr(x+1, str.length);
  TerrainConfig[y] = str;
}
this.getTerrainConfig = function()
{
  return TerrainConfig;
}
function convertXYToId(x, y){return x + y*TerrainWidth;}
function TerrainTilePoint(x, y)
{
  this.iX = x;
  this.iY = y;
  this.tId = convertXYToId(x, y);
  this.getDistance = function(obj)
  {
    // return Math.pow(obj.iX - this.iX, 2) + Math.pow(obj.iY - this.iY, 2);
    return Math.abs(obj.iX - this.iX) + Math.abs(obj.iY - this.iY);
  }
}
function TerrainTile(tileObj)
{
    this.objPoint = tileObj;
    this.iFromValue = 0;//起点到self的距离
    this.iToValue = 0;//self到终点的距离
    this.iFValue = 0;//总距离
    this.objParent = null;
}
var defaultPath = null;
function findPath(terrain)
{
  PointB.objParent = null; //清空上次记录
  var arrOpen = [PointA];
  var arrClose = [];

  function isInCloseList(tId)
  {
    for (var i = 0; i < arrClose.length; i++)
    {
       var tile = arrClose[i];
       if (tile.objPoint.tId == tId) return true;
    }
    return false;
  }

  function findInOpenList(tId)
  {
    for (var i = 0; i < arrOpen.length; i++) {
       var tile = arrOpen[i];
       if (tile.objPoint.tId == tId)
       {
          return tile;
       }
    }
    return null;
  }

  function isTileEnable(x, y)
  {
    return TerrainConfig[y][x] != 'X';
  }

  var neighborOffset = [[-1, 0], [0, -1], [1, 0], [0, 1]];//左 上 右 下
  var minLen = 9999999;
  while (arrOpen.length > 0)// && !PointB.objParent)
  {
    var cur = null;
     if(arrOpen.length > 1)
     {
       var idx = 0;
       for (var i=0; i<arrOpen.length; i++)
       {
         if(!cur || cur.iFValue > arrOpen[i].iFValue)
         {
           cur = arrOpen[i];
           idx = i;
         }
       }
       arrOpen.splice(idx, 1);
     }
     else
     {
       cur = arrOpen.pop();
     }

      arrClose.push(cur);

      for (var i = 0; i < neighborOffset.length; i++)
      {
        var offset = neighborOffset[i];
        var tmpX = cur.objPoint.iX + offset[0];
        var tmpY = cur.objPoint.iY + offset[1];
        //超出范围 不要
        if (tmpX < 0 || tmpX >= TerrainWidth ||
            tmpY < 0 || tmpY >= TerrainHeight)
        {
          continue;
        }

        //被占用了 不要
        if (!isTileEnable(tmpX, tmpY)) continue;
        var tmpTid = convertXYToId(tmpX, tmpY);

        //available path found
        if (tmpTid == PointB.objPoint.tId && cur.iFValue < minLen)
        {
          PointB.objParent = cur;
          minLen = cur.iFValue;
          continue;
        }

        //不要
        if (isInCloseList(tmpTid)) continue;

        var existTile = findInOpenList(tmpTid);
        if (existTile)
        {
          //需要重新计算，看有没有更短
          //a->c or a -> cur -> c, update gValue, c's parent -> cur

          if (cur.iFromValue + 1 + existTile.iToValue < existTile.iFromValue)
          {
              existTile.iFromValue = cur.iFromValue+1;
              existTile.iFValue = cur.iFromValue + cur.iToValue;
              existTile.objParent = cur;
          }
        }
        else //新加入open
        {
          var point = new TerrainTilePoint(tmpX, tmpY);
          var obj = new TerrainTile(point);
          obj.objParent = cur;
          obj.iFromValue = cur.iFromValue + 1;
          obj.iToValue = point.getDistance(PointB.objPoint);
          obj.iFValue = obj.iFromValue + obj.iToValue;
          arrOpen.push(obj);
        }
      }

  }

  if (PointB.objParent)//找到了
  {
    var res = [PointB.objPoint.tId];
    var cur = PointB;
    while (cur.objParent)
    {
        res.push(cur.objParent.objPoint.tId);
        cur = cur.objParent;
    }
    res.reverse();
    if (!defaultPath) defaultPath = res;
    return res;
  }
  else//堵死了
  {
    console.log("no available path..");
    return defaultPath;
  }
}
console.log('module terrain..');
this.searchPath = function()
{
  return findPath(TerrainConfig);
};
// console.log(this.searchPath());
