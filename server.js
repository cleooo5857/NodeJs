const express = require("express"); // express 문법으로 쓰겠다
const app = express();

//정적인 파일 불러오기(cssFile ....)
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
/*
.body 쓸려면 아래 코드 작성
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { MongoClient, ObjectId } = require("mongodb");

/*
MongoClient(url).connect() 몽고DB에 접속 

*/
let db;
const url =
  "mongodb+srv://admin:xqc30709@cluster0.knc35bb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// 서버 띄우는

// 서버 기능
/*
__dirname 절대경로 
*/
app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/news", () => {
  // 몽고DB post 폴더에 데이터 집어넣기
  db.collection("post").insertOne({ title: "어쩌구" });
  //   응답.send("오늘 비옴?");
});

app.get("/list", async (요청, 응답) => {
  // 몽고DB post 폴더에 데이터 꺼내오기
  let result = await db.collection("post").find().toArray();
  /* 
   응답은 한번만 ex:)) send 
   유저에게 ejs 파일 보내는법
  */
  응답.render("list.ejs", { board: result });
});

app.get("/write", async (요청, 응답) => {
  응답.render("write.ejs");
});

app.post("/add", async (요청, 응답) => {
  console.log(요청.body);

  try {
    if (요청.body.title === "" || 요청.body.content === "") {
      return 응답.send("데이터를 입력해주세요.");
    }
    await db
      .collection("post")
      // insertOne DB에 데이터 저장시키기
      .insertOne({ title: 요청.body.title, content: 요청.body.content });
    응답.redirect("/list");
  } catch (e) {
    console.log(e);
    응답.status(500).send("서버에러남");
  }
});

app.get("/detail/:id", async (요청, 응답) => {
  // ex:)) .ejs 옆 {} 작성시 필요한 데이터 보내주기
  // 요청.params 유저가 보낸 URL 값 받아오기
  console.log(요청.params.id);
  let detailpage = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  console.log(detailpage);
  응답.render("detail.ejs", { detailpage: detailpage });
});
