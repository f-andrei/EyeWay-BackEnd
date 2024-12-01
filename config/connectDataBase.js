const mysql = require('mysql');

const db = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "123456",
   database: "EyeWay"
});

db.connect((err) =>{
    if(err){ 
        console.log("Erro ao conectar no banco de dados " + err);
        return;
    }
    console.log("Conexão realizada com o MYSQL!! com o id: " + db.threadId);
});

module.exports = db;