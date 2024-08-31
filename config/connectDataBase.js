const mysql = require('mysql');

const connect = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "12082023Km@",
   database: "EyeWay"
});

connect.connect((err) =>{
    if(err){ 
        console.log("Erro ao conectar no banco de dados " + err);
        return;
    }
    console.log("Conexão realizada com o MYSQL!! com o id: " + connect.threadId);
});

module.exports = connect;