const request = require('superagent')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

let url = "http://www.u-cpc.com/product/list.html";

// http://www.u-cpc.com/Product/List.html?page=3&cid=0&bid=0

// request.get(url).then(function(res){
//   console.log(res.text);
// })

// async function getUrl(){
//     const res = await request.get(url);
//     const $ = cheerio.load(res.text);
//     $(".product_ul li").each(function(i, elem){
//         const href = $(this).find("img").attr("data-original")
//         const title = $(this).find(".productlist_title").text();
//         console.log("标题是: " + title)
//         console.log("地址是: " + href)
//     })
// }
// getUrl();

/**
 * 获取图集的URL
 */
async function getUrl(){
    let linkArr = [];
    for(let i = 0; i <= 10; i++){
      const res = await request.get(url);
      const $ = cheerio.load(res.text);

      $(".product_ul li").each(function(i, elem){
          const href = $(this).find("img").attr("data-original")
          const title = $(this).find(".productlist_title").text();
          linkArr.push(href)
      })
    }
}
async function getPic(url) {
  const res = await request.get(url)
  const $ = cheerio.load(res.text)
  // 以图集名称来分目录  
  const dir = $('.curr').text()
  console.log(`创建${dir}文件夹`)
  await fs.mkdir(path.join(__dirname, '/images', dir))
  for(let i = 1; i <= 10; i++){
    let pageUrl = url + '?page=' + i + '&cid=0&bid=0';
    const data = await request.get(pageUrl)
    const _$ = cheerio.load(data.text)
    _$(".product_ul li").each(function(i, elem){
      const imgUrl = $(this).find("img").attr("data-original");
      download(dir, imgUrl)
    })
  }
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
  getUrl();
  getPic(url)
}
// init();
download();
function download() {
  const url2 = "https://codeload.github.com/cheeriojs/cheerio/zip/master"
  const filename = url2.split('/').pop() + ".zip"
  const req = request.get(url2)
  req.pipe(fs.createWriteStream(path.join(__dirname, 'images', filename)))
}