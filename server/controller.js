const usuario = require('./usuario.js');
const imagens = require('./imagens.js');
const notas = require('./notas.js');
const fundo = require('./fundo.js');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const multer = require("multer");


module.exports.set = function(app) {
    app.get('/', function(req, res) {
        res.render('paginaInicial');
    });

    app.post('/cadastrar', function (req, res) {
       if (usuario.cadastrarUsuario(req.body)){
            u = usuario.logarUsuario(req.body);
            fundo.cadastrarFundoPadrao(u.codigo);
            //cria diretório de imagens
            fs.mkdirSync(`./userdata/${u.codigo}`);
            fs.mkdirSync(`./userdata/${u.codigo}/img`);
            res.send("Sucesso ao cadastrar");
        } else {
            res.status(400).send("Falha ao cadastrar");
       }
    });

    app.post('/logar', function (req, res) {
        const retornoUsuario = usuario.logarUsuario(req.body);
        if (retornoUsuario){
            res.send(retornoUsuario);
         } else {
            res.status(400).send("Não foi possível realizar login.");
        }
    });

    app.get('/world/:codigo', function(req, res) {
      const u = usuario.recuperarUsuario(req.params.codigo);
      if(u){
        res.render('world', u)
      } else {
        res.status(400).send("Mundo não encontrado.");
      }
    });

    app.get('/usuario/:codigo/imagelist', function(req, res) {
      let resultado = imagens.listaImagensUsuario(req.params.codigo);
      if(resultado.length != 0){
        resultado = resultado.map(x => `/usuario/${req.params.codigo}/img/${x.url}`)
      }
      res.send(JSON.stringify(resultado));
    });

    const upload = multer({
      dest: "usuario",
      limits: { fieldSize: 15 * 1024 * 1024 }
    });

    app.post('/usuario/:codigo/alterarGhost', function(req, res) {
        if ( usuario.alterarGhostUsuario(req.params.codigo,req.body.ghost)){
            res.send("Alterado com sucesso");
         } else {
            res.status(400).send("Não foi possível alterar.");
        }
    });

    app.get('/usuario/:codigo/obterGhost', function(req, res) {
        let g = usuario.recuperarGhost(req.params.codigo);
        if(g){
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ghost:g}))
        } else {
          res.status(400).send("Ghost não encontrado.");
        }
    });


    app.post("/usuario/:codigo/adicionarImagem", upload.single("file"),function  (req, res) {
        const extensao = RegExp(/^data:image\/(.{3,5});base64,/).exec(req.body.image)[1]
        const nome = `${imagens.buscaProximoNomeImagemUsuario(req.params.codigo)}.${extensao}`;
        const localDeEscrita = path.join(__dirname, `../userdata/${req.params.codigo}/img/${nome}`);
        const base64Data = req.body.image.substring(req.body.image.indexOf(',')+1)
        try{
            fs.writeFileSync(localDeEscrita, base64Data, 'base64');
            if (imagens.cadastrarImagemUsuario({
                url:nome,
                usuario:req.params.codigo
            })){
                res.send(`/usuario/${req.params.codigo}/img/${nome}`);
            } else {
                res.status(400).send("Falha ao cadastrar");
            }
        }catch(err){
            console.log(err);
            res.status(400).send("Falha ao cadastrar");
        }
      }
    );

    app.get('/usuario/:usuario/img/:arquivo', function(req, res) {
      const usuario=req.params.usuario
      const arquivo=req.params.arquivo
      const s = fs.createReadStream(path.join('userdata',usuario,'img',arquivo));
      const mimetype = mime.lookup(arquivo);
      s.on('open', function () {
        res.set('Content-Type', mimetype);
        s.pipe(res);
      });
      s.on('error', function () {
        res.set('Content-Type', 'etext/plain');
        res.status(404).end('Not found');
      });
    });

    app.post('/nota/updateNota', function(req, res) {
        let query = notas.updateNota(req.body.codigo, req.body.usuario, req.body.text);
        if(query != 'update'){
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(query[0]))
        }else{
            res.send(JSON.stringify({'codigo': req.body.codigo}));
        }
    });

    app.get('/nota/:codigo/obter', function(req, res) {
        let n = notas.recuperarNota(req.params.codigo);

        if(n){
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(n))
          } else {
            res.status(400).send("Nota não encontrado.");
        }
    });


    app.get('/fundo/:codigo/obter', function(req, res) {
        let f = fundo.recuperarFundo(req.params.codigo);
        if(f){
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(f))
        } else {
          res.status(400).send("Fundo não encontrado.");
        }
    });

    app.post('/fundo/:codigo/cadastrar', function(req, res) {
        let f = fundo.recuperarFundo(req.params.codigo);
        if (req.body.tipo_atual){
            f.cor1=req.body.cor1;
            f.cor2=req.body.cor2;
            f.urlImage=req.body.urlImage;
            f.tipo_atual=req.body.tipo_atual;
        }else{
            f.cor1_chao=req.body.cor1_chao;
            f.cor2_chao=req.body.cor2_chao;
            f.urlImage_chao=req.body.urlImage_chao;
            f.tipo_atual_chao=req.body.tipo_atual_chao;
        }
        if(fundo.alterarFundo(f)){
            res.send("Fundo alterado com sucesso");
          } else {
            res.status(400).send("Fundo não alterado.");
          }
    });

    app.delete('/usuario/:cod_usuario/imagem/:url_img', function(req, res) {
      const sucesso = imagens.removerImagemUsuario(req.params.url_img, req.params.cod_usuario);
      if(sucesso){
        res.send("ok");
      } else {
        res.status(400).send("Imagem do usuário não existe");
      }
    })
    app.delete('/usuario/:cod_usuario/nota/:codigo_nota', function(req, res) {
      const sucesso = notas.removerNotaUsuario(req.params.codigo_nota, req.params.cod_usuario);
      if(sucesso){
        res.send("ok");
      } else {
        res.status(400).send("Nota do usuário não existe");
      }
    })
}
