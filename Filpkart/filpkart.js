const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const session = require("express-session");
app.use(express.urlencoded({ extended: true }));
const { v4: uuidv4 } = require('uuid');

app.use(express.json());

function generateId() {
  return `#${uuidv4()}-${Date.now()}`;
}

console.log(generateId());

app.use(session({
  secret: 'ekfghfrty545tr5se43vyt46u57y5q36',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));
const userinfo = path.join(__dirname, 'user.json');
const sallerinfo = path.join(__dirname, 'saller.json');
const products = path.join(__dirname, 'products.json');





app.use('/img', express.static(path.join(__dirname, 'img')));

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname + "/style.css");
})


app.get("/", (req, res) => {
     if (req.session.user) {
    res.sendFile(__dirname + "/dashboard.html");
  }
  else {
     res.sendFile(__dirname + "/home.html");
  }
 
})
app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + "/dashboard.html");
  }
  else {
    res.redirect("/login");
  }
})
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
})
app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
})



app.post("/signup-data", (req, res) => {
  let u = fs.readFileSync(userinfo, 'utf8');
  let user = JSON.parse(u);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  let data = { name: name, email: email, password: password, orders: [] };
  user.push(data);
  fs.writeFileSync(userinfo, JSON.stringify(user, null, 2), 'utf-8');
  res.redirect("/login");
})

app.post("/login-data", (req, res) => {
  let u = fs.readFileSync(userinfo, 'utf8');
  let user = JSON.parse(u);
  let email = req.body.email;
  let password = req.body.password;
  let userfound = false;
  for (let i = 0; i < user.length; i++) {
    if (user[i].email == email && user[i].password == password) {
      userfound = true;
      break;
    }
  }
  if (userfound) {
    req.session.user = email;
    req.session.password = password;
    res.redirect("/dashboard");
  }
  else {
    res.send("User not found!");
  }

})




app.get("/list-products", (req, res) => {



    const data = fs.readFileSync(products, "utf-8");
    const dc = JSON.parse(data);
    res.send(dc);


})


app.post("/productid", (req, res) => {

  req.session.productId = req.body.productid;
  res.json({ success: true });
}
)




app.get("/info-product", (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + "/product.html");
  }
  else {
    res.redirect("/login");
  }
})
app.get("/ordered", (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + "/ordered.html");
  }
  else {
    res.redirect("/login");
  }
})
app.get("/ordered-item", (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + "/ordered-item.html");
  }
  else {
    res.redirect("/login");
  }
})

app.get("/fetch-product", (req, res) => {


  if (req.session.user) {
    const data = fs.readFileSync(products, "utf-8");
    const dc = JSON.parse(data);
    const productId = req.session.productId;

    for (let i = 0; i < dc.length; i++) {
      if (dc[i].productid == productId) {
        req.session.sallerid = dc[i].sallerid;
        req.session.img = dc[i].img;
        req.session.title = dc[i].title;
        res.send(dc[i]);
        break;
      }
    }

  }
  else {
    res.redirect("/login");
  }


})


app.post("/buyproduct", (req, res) => {

  req.session.productId = req.body.productid;

  res.json({ success: true });
}
)




app.post("/order-request", (req, res) => {


  let u = fs.readFileSync(userinfo, 'utf8');
  let user = JSON.parse(u);
  let s = fs.readFileSync(sallerinfo, 'utf8');
  let saller = JSON.parse(s);
  let address = req.body.address;
  let city = req.body.city;
  let state = req.body.state;
  let pincode = req.body.pincode;
  let phone = req.body.phone;
  let payment = req.body.payment;
  let productId = req.session.productId;
  let sellarId = req.session.sallerid;
  let img = req.session.img;
  let title = req.session.title;
  let email = req.session.user;
  let password = req.session.password;
  let orderId = generateId();

  for (let i = 0; i < user.length; i++) {
    if (user[i].email == email && user[i].password == password) {
      let order = {
        productId: productId,
        sellarId: sellarId,
        img: img,
        title: title,
        orderId: orderId,
        payment: payment,
        delivery: { reach: false, shipped: false, delivered: false },
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        phone: phone
      }
      user[i].orders.push(order);
      fs.writeFileSync(userinfo, JSON.stringify(user, null, 2), 'utf-8');
      break;
    }
  }
  for (let i = 0; i < saller.length; i++) {
    if (saller[i].sallerid == sellarId) {
      let order = {
        productId: productId,
        sellarId: sellarId,
        img: img,
        title: title,
        orderId: orderId,
        payment: payment,
        delivery: { reach: false, shipped: false, delivered: false },
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        phone: phone
      }
      saller[i].orders.push(order);
      fs.writeFileSync(sallerinfo, JSON.stringify(saller, null, 2), 'utf-8');
      break;
    }
  }
  res.redirect("/ordered");



})




app.get("/list-orders", (req, res) => {


  if (req.session.user) {
    let email = req.session.user;
    let password = req.session.password;

    const data = fs.readFileSync(userinfo, "utf-8");
    const dc = JSON.parse(data);

    for (let i = 0; i < dc.length; i++) {
      if (dc[i].email == email && dc[i].password == password) {
        res.send(dc[i].orders);
        break;
      }
    }
  }
  else {
    res.redirect("/login");
  }


})



app.post("/ordered-productid", (req, res) => {

  req.session.orderId = req.body.orderid;
  res.json({ success: true });
}
)


app.get("/ordered-product", (req, res) => {


  if (req.session.user) {
    console.log("hitted")
    let email = req.session.user;
    let password = req.session.password;
    console.log(req.session)
    let orderId=req.session.orderId;
console.log("hitted1")
    const data = fs.readFileSync(userinfo, "utf-8");
    const dc = JSON.parse(data);

    for (let i = 0; i < dc.length; i++) {
      if (dc[i].email == email && dc[i].password == password) {
        console.log("hitted1")
        let ordersLen=dc[i].orders.length;
        console.log(ordersLen);
        
        for(let j=0; j<ordersLen; j++){
         
         if(dc[i].orders[j].orderId==orderId){
          console.log(dc[i].orders[j]);
             res.send(dc[i].orders[j]);
        break;
         }
        }
       
      }
    }
  }
  else {
    res.redirect("/login");
  }


})


app.listen(3000, () => {
  console.log("Server is running on 3000");
})