const fs = require("fs");
const puppeteer = require("puppeteer");
let link = "https://hard.rozetka.com.ua/videocards/c80087/";

const parseComputerComponents = async click => {
    try{
        let browser = await puppeteer.launch({headless:false, slowMo: 0, devtools: true});
        let page = await browser.newPage();

        await page.setViewport({width: 1920, height: 1080});

        await page.goto(link, {waitUntil: "domcontentloaded"});

        let html = await page.evaluate(async () => {
            let res = [];
            let container = await document.querySelectorAll("div.goods-tile");
            
            container.forEach(item => {
                let link = item.querySelector("a.goods-tile__heading").href;
                let title = item.querySelector("a.goods-tile__heading").title;
                
                res.push({
                    link,
                    title
                });
            })
            return res;
        })

        for(let i = 0; i < html.length; i++){
            await page.goto(html[i].link + "characteristics/", {waitUntil: "domcontentloaded"});
            console.log(html[i].link + "characteristics/");
            let characteristics = await page.evaluate(async () =>{
                let characteristicsArray = [];
                let characteristicsContainers = await document.querySelectorAll("div.characteristics-full__item");
                
                characteristicsContainers.forEach(item => {
                    let characteristicName = item.querySelector("dt.characteristics-full__label span").innerText;
                    let characteristicValue = item.querySelector("dd.characteristics-full__value ul.characteristics-full__sub-list").innerText;

                    characteristicsArray.push({[characteristicName]: characteristicValue});

                });
                return characteristicsArray;
            })

            html[i]['characteristics'] = characteristics;
            console.log(html[i]);
        }

        var htmlJson = JSON.stringify(html, null, "\t");
        htmlJson = htmlJson.replace(/\\n/g, ' ') 

        fs.writeFile("videocards.json", htmlJson, function(error){
            if(error) throw error;
            console.log("Succesfully saved videocards.json");
        });

    }catch(e){
        console.log(e);
    }
}

parseComputerComponents(0);