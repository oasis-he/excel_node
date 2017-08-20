var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var until = require("util")
var fs = require('fs')
var xlsx = require("node-xlsx");

router.get('/', function (req, res, next) {

  console.log("get")
  var list = excelFn("./upload/test.xlsx")
  res.json(list)
})


router.post('/', function (req, res, next) {
  // console.log(req.body)
  var form = new multiparty.Form({
    uploadDir: "./upload/",

  });
  form.parse(req, function (err, fields, files) {
    var excelData = {}
    var filesTmp = JSON.stringify(files, null, 2);
    if (err) {
      console.log('parse files' + filesTmp)
    } else {
      // console.log(files)
      var inputFile = files.fileToUpload[0];
      var uploadedPath = inputFile.path;
      var dstPath = "./upload/" + inputFile.originalFilename;
      fs.rename(uploadedPath, dstPath, function (err) {
        if (err) {
          console.log("rename error" + err)
        } else {
          console.log("rename ok")
          excelData = excelFn(dstPath)
          res.json(excelData)
          // outFile(excelData)
        }
      })
    }
    
  });
});

var excelFn = function (excelName) {
  var list = xlsx.parse(excelName);
  var sheet = list[0]
  var data = sheet.data
  return unique(data)
}
var unique = function (data) {
  var res = {
    all: [],
    cc: [],
    wx: [],
    qq: [],
    tencent: []
  }
  var json = {}
  var listData=[];
  for (var n = 0; n < data.length; n++) {
    for(var m =0;m<data[n].length;m++){
      if(data[n][m]){
        listData.push(data[n][m])
      }
    }

  }
  for (var i = 0; i < listData.length; i++) {
    var item = listData[i];
    if(item){
      item=item.toString()
      if (!json[item]) {
        res.all.push(item);
        json[item] = 1;
        if (item.search("cc.163.com") >0) {
          console.log(item)
          res.cc.push(item)
        }else  if (item.search("@wx") >0) {
          res.wx.push(item)
        }else  if (item.search("@qq") >0) {
          res.qq.push(item)
        }else  if (item.search("@tencent") >0) {
          res.tencent.push(item)
        }
      }
    }
  }
  return res
}

var outFile=function(data){
  function deal(arg){
    var list =[];
    for(var i= 0;i<data[arg].length;i++){
      list.push([data[arg][i]]) 
    }
    return list

  }
  var outData=[]
  for(key in data){
    outData.push({
      name:key,
      data:deal(key)
    })

  }
  var buffer = xlsx.build(outData);
  fs.writeFileSync('b.xlsx', buffer, 'binary');


}


module.exports = router;
