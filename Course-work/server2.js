const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static("./public"));
app.use(bodyParser.json());

app.get("/products", (req, res) => {
	fs.readFile("./db/products.json", "utf-8", (err, data) => {
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
	res.send(data);
	});
});	

app.get("/cart", (req, res) => {
	fs.readFile("./db/cart.json", "utf-8", (err, data) => {
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
	const cart = JSON.parse(data);		
	res.send({
	total:  cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
	items: cart,
		});
	});
});	

app.post("/cart", (req, res) => {
	fs.readFile("./db/cart.json", "utf-8", (err, data) => {
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
	const cart = JSON.parse(data);
	cart.push(req.body);
	fs.writeFile("./db/cart.json", JSON.stringify(cart), () => {
	res.send({item: req.body, total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0)});
		});
	});	
});

app.patch("/cart/:id", (req, res) => {
	fs.readFile("./db/cart.json", "utf-8", (err, data) => {
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
	let cart = JSON.parse(data);
	cart = cart.map((item) => {
		if(+item.id === +req.params.id){
			item.quantity = req.body.quantity;
		}
		return item;
	});
	fs.writeFile("./db/cart.json", JSON.stringify(cart), () => {
	res.send({
		item: cart.find((item) => +item.id ===+req.params.id),
		total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0)});
		});
	});	
})

app.delete("/cart/:id", (req, res) => {
	fs.readFile("./db/cart.json", "utf-8", (err, data) => {
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
	let cart = JSON.parse(data);
    const item = cart.find((item) => item.id === +req.params.id);
    cart = cart.filter((item) => item.id !== +req.params.id);
                                 
	fs.writeFile("./db/cart.json", JSON.stringify(cart), () => {
	res.send({
		item,
		total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0)});
		});
	});	
});

app.post('/accounts', (req, res) => fs.readFile('./db/accounts.json', 'utf-8', (err, data) => { //регистрация
    if (err) res.send('Произошла ошибка' + err)
    const accBody = req.body
    const accounts = JSON.parse(data)
    if (inAccounts = accounts.find((account) => accBody.email == account.email)) {
        res.status(403).send(accBody.email)
    } else {
        accBody.id = accounts.length + 1
        accounts.push(accBody)
        fs.writeFile('./db/accounts.json', JSON.stringify(accounts), () => res.status(200).send(accBody))
    }
}))

app.patch('/login/:email', (req, res) => fs.readFile('./db/accounts.json', 'utf-8', (err, data) => {  
    if (err) res.send('Произошла ошибка' + err)
    const accounts = JSON.parse(data)
    const inAccountList = accounts.find(account => account.email == req.body.email)
    if (!inAccountList) res.status(403).send(req.body.email) // пользователь с такие e-mail не зарегистрирован
    else {
        if (inAccountList.password != req.body.password) res.status(403).send(req.body.email) // неверный пароль
        else {
            fs.writeFile('./db/accounts.json', JSON.stringify(accounts), () => {
                res.status(200).send({
                    email: inAccountList.email, 
                    cipher: inAccountList.cipher,
                    })
                })
            }
        }
}))

app.patch('/logout/:email', (req, res) => fs.readFile('./db/accounts.json', 'utf-8', (err, data) => {  // выход из аккаунта
    if (err) res.send('Произошла ошибка' + err)
    const accounts = JSON.parse(data)
    const inAccountList = accounts.find((account) => account.email == req.body.email) 
    fs.writeFile('./db/accounts.json', JSON.stringify(accounts), () => res.status(200).send())
}))

app.post('/comments', (req, res) => fs.readFile('./db/comments.json', 'utf-8', (err, data) => { // добавление нового комментария
    if (err) res.send('Произошла ошибка' + err)
    const comment = req.body
    const comments = JSON.parse(data)
    comment.id = comments.length + 1
    comments.push(comment)
    fs.writeFile('./db/comments.json', JSON.stringify(comments), () => res.status(200).send(comment))
}))

app.get('/comments', (req, res) => fs.readFile('./db/comments.json', 'utf-8', (err, data) => { // получение списка комментариев
    if(err){
    console.error(err);
    res.send("Произошла ошибка");
	}
    res.send(data)
	}));


app.listen(3000, () => {
	console.log("Server has been started");
});