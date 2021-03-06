const mysql = require('sync-mysql');
const host = 'us-cdbr-iron-east-04.cleardb.net',
      usuario ='bd9dc389335c87',
      senha ='737ead3c',
      banco = 'heroku_6eb9ea850d4b68c';

const conexaoDb = new mysql({
  host: host,
  user: usuario,
  password: senha,
  database: banco
});

module.exports.executarQuery = function (sql){
  return conexaoDb.query(sql);
}

module.exports.resetDb = function(){
  queries=[
    `drop table imagens`,
    `drop table notas`,
    `drop table fundo`,
    'drop table usuario',
    `create table usuario(
      codigo int(11) not null auto_increment,
      usuario varchar(45) not null,
      email varchar(200) not null,
      senha char(32) not null,
      ghost varchar(45) not null,
      CONSTRAINT email_unico UNIQUE (email),
      CONSTRAINT usuario_unico UNIQUE (usuario),
      PRIMARY KEY (codigo)
    )`,
    'describe usuario',
    `create table imagens(
      codigo int(11) not null auto_increment,
      usuario int(11) not null,
      url varchar(200) not null,
      foreign key (usuario) references usuario(codigo) on update cascade,
      primary key (codigo)
    )`,
    'describe imagens',
    `create table notas(
      codigo int(11) not null auto_increment,
      usuario int(11) not null,
      nota varchar(200) not null,
      foreign key (usuario) references usuario(codigo) on update cascade,
      primary key (codigo)
    )`,
    'describe notas',
    `create table fundo(
	  codigo int auto_increment,
    tipo_atual varchar(10) not null,
    cor1 varchar(10),
    cor2 varchar(10),
    urlImage varchar(200),
    tipo_atual_chao varchar(10) not null,
    cor1_chao varchar(10),
    cor2_chao varchar(10),
    urlImage_chao varchar(200),
    usuario int,
    primary key (codigo),
    constraint fk_usuario foreign key (usuario) references usuario(codigo) on update cascade,
    constraint usuario_unico unique (usuario));`,
    'drop table audios',
    `create table audios(
      codigo int(11) not null auto_increment,
      usuario int(11) not null,
      titulo varchar(100) not null,
      url varchar(200) not null,
      foreign key (usuario) references usuario(codigo) on update cascade,
      primary key (codigo)
    )`,
    'describe audios'
  ]

  for (const q of queries){
    console.log(q);
    try {
      console.log(conexaoDb.query(q))
    } catch(e) {
      console.log(e)
    }
    console.log();
  }
}
