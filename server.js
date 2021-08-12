const app = require("fastify")({ logger: false });
const cheerio = require("cheerio");
const rs = require("request");
const baseURL = "https://anizm.tv/";

app.get("/", async(req, res) => {
  let info = {
    new: "https://animeapi.glitch.me/api/new/:page",
    details: "https://animeapi.glitch.me/api/details/:name",
    search: "https://animeapi.glitch.me/api/search/:query/:page",
  };
  res.send(info);
});

app.get("/api/search/:word/:page", async(req,res) =>{
  let results = [];
  let search = req.params.word;
  let page = req.params.page && !isNaN(req.params.page) && Number(req.params.page) >= 1 && Math.floor(req.params.page) == req.params.page ? Number(req.params.page) : 1;
  rs(`${baseURL}ara?s=${search}&sayfa=${page}`, (error, response, html) => {
    if (!error) {
      try {
      var $ = cheerio.load(html);
      $("a.pfull").each(function (index, element) {
       let img = $(this).find(".anizm_avatar").attr().src;
       let title = $(this).find(".anizm_textUpper").text().trim();
       let name = title.toLowerCase().split(" ").join("-");
  
       results[index] = {title,img,name}
     })
      res.send({results})
    } catch(e) {
      res.send({results:"Error"})
    }
   }
 });
});

app.get("/api/new/:page", async(req,res) => {
  let page = req.params.page && !isNaN(req.params.page) && Number(req.params.page) >= 1 && Math.floor(req.params.page) == req.params.page ? Number(req.params.page) : 1;
  let results = [];
  rs(`${baseURL}anime-izle?sayfa=${page}`, (error, response, html) => {
    if (!error) {
      var $ = cheerio.load(html);
      $(".three").each(function (index, element) {
        let title = $(this).find(".title").text().trim();
        let img = $(this).find(".anizm_shadow").attr().src;
        let link = $(this).find(".anizm_colorDefault").attr().href;
        let episode = $(this).find(".posterAlt").text().trim();
       results[index] = { title,episode,img }
      });
      res.send({ name: "Son Eklenen Animeler", results });
     }
  });
});

app.get("/api/details/:name", async(req,res) => {
  let name = req.params.name;
  rs(`${baseURL}${name}`, (error, response, html) => {
    if (!error) {
     var $ = cheerio.load(html);
    try {
     let title = $(".anizm_pageTitle").text().trim();
     let episode = $(".anizm_verticalList").text().slice(6).trim();
     let description = $(".infoDesc").text().trim();
     let img = "https://anizm.tv"+$(".infoPosterImgItem").attr().src;
     let vote = $(".circle-chart__percent").text().trim();
     let trailer = $("iframe").attr().src;
     let category = $(".tag").text().trim().replace("\n",",");
      res.send({ title, description, vote, category, episode, img, trailer })
    } catch(e){
      res.send({error: "Hata"})
    } 
    }
  });
});

const start = async () => {
  try {
    await app.listen(3000)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
