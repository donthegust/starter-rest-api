require("dotenv").config();
const express = require("express");
const app = express();
const CyclicDB = require("@cyclic.sh/dynamodb");
const req = require("express/lib/request");
const db = CyclicDB(process.env.CYCLIC_DB);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
// var options = {
//   dotfiles: 'ignore',
//   etag: false,
//   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
//   index: ['index.html'],
//   maxAge: '1m',
//   redirect: false
// }
// app.use(express.static('public', options))
// #############################################################################

// { // Account Example
//   "accountId": 1,
//   "number":"000001",
//   "agency":"0001",
//   "accountType":"Corrente"
// };

// { // User Example
// {
//   "userId":1,
//   "name":"Test",
//   "motherName":"MotherTest",
//   "cpf":"123456789-10",
//   "userName":"Test",
//   "email":"teste@teste.com",
//   "account": ACCOUNT_MODEL,
//   "transactions":[
//      TRANSACTION_MODEL,
//      TRANSACTION_MODEL
//   ]
// }

// { // Transaction Example
//   "transactionId":1,
//   "transactionValue":200,
//   "transactionType":"Depósito",
//   "incomingAccount":{
//      "accountId":1,
//      "number":"000001",
//      "agency":"0328",
//      "accountType":"Corrente"
//   },
//   "outgoingAccount":{
//      "accountId":1,
//      "number":"000001",
//      "agency":"0328",
//      "accountType":"Corrente"
//   }
// };

// Create or Update an account
app.post("/accounts/:key", async (req, res) => {
  const key = req.params.key;
  const item = await db.collection("accounts").set(key, req.body);

  res.json(item).end();
});

// Create or Update an user
app.post("/users/:key", async (req, res) => {
  const key = req.params.key;
  const item = await db.collection("users").set(key, req.body);

  res.json(item).end();
});

// Create or Update an transaction
app.post("/transactions/:key", async (req, res) => {
  const key = req.params.key;
  const item = await db.collection("transactions").set(key, req.body);

  res.json(item).end();
});

// Delete an account
app.delete("/accounts/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("accounts").delete(key);
  res.json(item).end();
});

// Delete an user
app.delete("/users/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("users").delete(key);
  res.json(item).end();
});

// Delete an transaction
app.delete("/transactions/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("transactions").delete(key);
  res.json(item).end();
});

// Get a single account
app.get("/accounts/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("accounts").get(key);
  res.json(item).end();
});

// Get a single user
app.get("/users/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("users").get(key);

  if (item == null) res.json(false).end();

  res.json(item).end();
});

// Get a single transaction
app.get("/transactions/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("transactions").get(key);
  res.json(item).end();
});

// Get a full listing of accounts
app.get("/accounts", async (req, res) => {
  const items = await db.collection("accounts").list();
  res.json(items).end();
});

// Get a full listing of users
app.get("/users", async (req, res) => {
  const items = await db.collection("users").list();
  res.json(items).end();
});

// Get a full listing of transactions
app.get("/transactions", async (req, res) => {
  const items = await db.collection("transactions").list();
  res.json(items).end();
});

// Create or Update an account in the auth flux
app.post("/auth/:id", async (req, res) => {
  const id = req.params.id;
  await db.collection("auth").set(id, req.body);

  res.json({ auth: true });
});

// // Get a single auth
// app.get("/auth/:key", async (req, res) => {
//   const key = req.params.key;

//   const item = await db.collection("auth").get(key);
//   res.json(item).end();
// });

// Get a full listing of auths
app.get("/auth", async (req, res) => {
  const items = await db.collection("auth").list();
  res.json(items).end();
});

// Delete an auth
app.delete("/auth/:key", async (req, res) => {
  const key = req.params.key;

  const item = await db.collection("auth").delete(key);
  res.json(item).end();
});

// Auth flux
app.get("/auth/:acc_data", async (req, res) => {
  console.log("body: " + req.body);

  const accData = req.params.acc_data;
  console.log("key: " + accData);

  let authData = await db.collection("auth").get(accData);
  console.log("get user: " + authData);

  // If auth data not exist in db, return false
  if (!authData) {
    res.json({ authorized: false });
    return;
  }

  const allowLogin = req.body.password == authData.props.password;
  console.log(
    "allowLogin: " +
      allowLogin +
      " = " +
      req.body.password +
      "(get password) == " +
      authData.props.password +
      "(db password)"
  );

  const responseData = {
    authorized: allowLogin,
    user_id: allowLogin ? authData.props.user_id : null,
  };
  console.log(responseData);
  res.json(responseData);
});

// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.json({ msg: "no route handler found" }).end();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`index.js listening on ${port}`);
});
