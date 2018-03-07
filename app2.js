
const charset = require('superagent-charset');
const request = charset(require('superagent'));
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')
superagent
    .get(url) // 获取网页内容
    .charset('gb2312') // 转码-将gb2312格式转成utf-8
    .then(function(err, res){ 
    });
var url = 'http://bbs.byr.cn/rss/topten';
var toptens = []; // 初始化json数组

request.get(url) // 获取网页内容
  .charset('gb2312')
  .end(function (err, res) {
    // 常规的错误处理
    if (err) {
      return next(err);
    }
    var $ = cheerio.load(res.text,{
      xmlMode: true // 由于从rss里读取xml，所以这一步一定要有，切记
    });
    
    var d = new Date();
    var date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+(d.getDate()); // 取得爬取的日期

    var topten = { // 设定爬取的json数组
      date: date,
      info: []
    };

    // 具体爬取内容，主要都是cheerio操作了
    $('item').each(function(i,el){
      i += 1;
      topten.info.push({
        topno: i,
        title: $(this).find('title').text(),
        author: $(this).find('author').text(),
        pubDate: $(this).find('pubDate').text(),
        boardName: $(this).find('guid').text().replace(/http:\/\/bbs.byr.cn\/article\//,'').replace(/\/\d+/,'').trim(),
        link: $(this).find('link').text(),
        content: $(this).find('description').text()
      })
    })
    toptens.unshift({topten: topten}); // 从原有的json数据之前追加json数据

    var json = JSON.stringify(toptens); // json格式解析，这步也是一定要有

    fs.writeFile('toptens.json', json, 'utf-8', function(err){
      if (err) throw err;
      else console.log('JSON写入成功'+'\r\n' + json)
    });
  });