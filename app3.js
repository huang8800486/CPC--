const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

let url = "http://www.u-cpc.com/product/list.html";

var toptens = [];  // 初始化json数组

/**
 * 获取图集的URL
 */

async function getUrl(){
    let linkArr = [];
    for(let i = 1; i <= 10; i++){
      const res = await request.get(url);
      const $ = cheerio.load(res.text);
      let pageUrl = url + '?page=' + i + '&cid=0&bid=0';
      linkArr.push(pageUrl);
    }
    return linkArr;
}
async function getPic(newUrl) {
  const topten = { // 设定爬取的json数组
    info: []
  };
  const res = await request.get(newUrl)
  const $ = cheerio.load(res.text)
  // 以图集名称来分目录  
  const dir = $('.curr').text()
  console.log(`创建${dir}文件夹`)
  await fs.mkdir(path.join(__dirname, '/images', dir))
  $(".product_ul li").each(function(i, elem){
    i += 1;
    const imgUrl = $(this).find("img").attr("data-original");
    const imgText = $(this).find(".productlist_title").text();
    topten.info.push({
      number: i,
      title: imgText,
      images: imgUrl
    })
    download(dir, imgUrl);
  });

  toptens.push({topten: topten}); // 从原有的json数据之前追加json数据
  const json = JSON.stringify(toptens); // json格式解析，这步也是一定要有
  downloadJson(json);
}

// 创建json文件
function downloadJson(json){
  const filename = "toptens.json";
  const file = path.join(__dirname, filename)
  fs.outputFile(file, json, function(err) {
    //file has now been created, including the directory it is to be placed in 
  });
}

// 下载图片
function download(dir, imgUrl) {
  console.log(`正在下载${imgUrl}`)
  const filename = imgUrl.split('/').pop()
  const req = request.get(imgUrl)
      .set({
          'Referer': 'http://www.u-cpc.com/product/list.html'
      })
  req.pipe(fs.createWriteStream(path.join(__dirname, 'images', dir, filename)))
}

async function init() {
  const getUrls = await getUrl();
  for(let i = 0; i < getUrls.length; i++){
    await getPic(getUrls[i])
  }
}
init();
