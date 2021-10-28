//
let minimist=require("minimist");
let puppeteer=require("puppeteer");
let fs=require("fs");
const { runMain } = require("module");
const { url } = require("inspector");
let arg=minimist(process.argv);
//console.log(arg.url);
//console.log(arg.info);
let infojson=fs.readFileSync(arg.info,"utf-8");
let info=JSON.parse(infojson);
//console.log(info.userid);
async function run(){
    let browser=await puppeteer.launch({
        headless:false,
        args:[
            '--start-maximised'
        ],
        defaultViewport:null
    });
    let pages=await browser.pages();
    let page=pages[0];
     await page.goto(arg.url);
     await page.waitForSelector("a[data-event-action='Login']");
     await page.click("a[data-event-action='Login']");
     
     await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
     await page.click("a[href='https://www.hackerrank.com/login']");

     await page.waitForSelector("input[name='username']");
     await page.type("input[name='username']",info.userid,{delay:30});

     await page.waitForSelector("input[name='password']");
     await page.type("input[name='password']",info.password,{delay:30});

     await page.waitForSelector("button[data-analytics='LoginPassword']");
     await page.click("button[data-analytics='LoginPassword']");

     await page.waitForSelector("a[data-analytics='NavBarContests']");
     await page.click("a[data-analytics='NavBarContests']");

     await page.waitForSelector("a[href='/administration/contests/']");
     await page.click("a[href='/administration/contests/']");

     await page.waitForSelector("a[data-attr1='Last']");
     let numpages=await page.$eval("a[data-attr1='Last']",function(tags){
         let np=parseInt(tags.getAttribute('data-page'));
         return np;
     })
     
     //move throgh all pages
     for(let i=1;i<=numpages-1;i++)
{
    await handlepage(browser,page);
     }
      
}
  async function handlepage(browser,page) {
      await page.waitForSelector("a.backbone.block-center");
      let curls=await page.$$eval("a.backbone.block-center",function(tags){
        let iurls=[];
        for(let i=0;i<tags.length;i++){
            let url=tags[i].getAttribute('href');
            iurls.push(url);
        }
        return iurls;
      })

    for(let i=0;i<curls.length;i++){
        await handlecontest(browser,page,curls[i]);
    }
    
    await page.waitFor(1500);
    await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
  }
  async function handlecontest(browser,page,curl) {
      let npage=await browser.newPage();
      await npage.goto(arg.url+curl);
     await npage.waitFor(1500);
     await npage.close();
     await page.waitFor(1500);
  }
run();

