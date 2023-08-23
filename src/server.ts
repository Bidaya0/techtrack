import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
const server = express()
server.use(bodyParser.json());

var objs: [
  {
    name: string;
    url: string;
  },
] 

fs.readFile("./data.json", (err: any, data: { toString: () => string; }) => {
  if (err) {
    return;
  }
  objs = JSON.parse(data.toString());
});

server.get('/api/raderdata', (_req: any, res) => {
    res.send(objs);
  })

  server.post('/api/raderdata', async (req, res) => {
    console.log(req.body)
    await fs.writeFile("data222.json", JSON.stringify(req.body), (err:any) => {
      if (err) throw err;
      console.log("Data written to file");
    });
    res.send("update success")
  })


server.listen(3001, () => {
  console.log('ready')
})
