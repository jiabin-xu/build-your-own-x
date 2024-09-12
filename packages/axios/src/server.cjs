const Koa = require('koa');
const cors = require('@koa/cors');

const app = new Koa();
app.use(cors());

const people = [
  {
    "name": "Matt Zabriskie",
    "github": "mzabriskie",
    "twitter": "mzabriskie",
    "avatar": "199035"
  },
  {
    "name": "Ryan Florence",
    "github": "rpflorence",
    "twitter": "ryanflorence",
    "avatar": "100200"
  },
  {
    "name": "Kent C. Dodds",
    "github": "kentcdodds",
    "twitter": "kentcdodds",
    "avatar": "1500684"
  },
  {
    "name": "Chris Esplin",
    "github": "deltaepsilon",
    "twitter": "chrisesplin",
    "avatar": "878947"
  }
];



app.use(async (ctx) => {
  console.log('ctx :>> ', ctx);
  ctx.body = people;
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});