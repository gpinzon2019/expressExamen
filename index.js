var express = require('express')
var app = express()
var passwordHash = require('password-hash')
// se incorpora el modulo de mongo
 mongoose = require('mongoose');
//importamos el schema de login para poder usar
var usuarios = require('./model/login');
//cargamos el modulos JWT
jwt = require('jsonwebtoken')
//vamos a proteger las rutas que no queremos que accedan sin el token 
var expressJwt = require('express-jwt')
//integramos el CORS para que no este molestando anguala rjejeje
var cors = require('cors') 
//configuraciones que tenemos de lado de nuestro servidor--secretos 
var conf = require('./conf/conf.json');
const BodyParser = require("body-parser");

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
//usamos el cors
app.use(cors())
//asignamos la url que van a estar desprotegidas para poder hacer peticiones sin token
app.use(expressJwt({ secret: conf.SECRETO }).unless({ path: ['/','/login'] }))
//asignamos la llave del jwt para usarlo en el paso de creacion del token
app.set('llave', conf.SECRETO);
//este seria el endpoint principal del sevidor
app.get('/', function (req, res) {
  res.send('hello world');
})
app.post('/login', function (req,res) {
    //res.send('hola. entraste a login')
    
    usuarios.find({email:req.body.email},function (err, response) {
        if (err) console.log(err);
    if(typeof response[0].contrasena != undefined){ 
        //varificamos el hash de la contraseña// para crear el password nuevo se usa //passwordHash.generate(req.body.password)
        if (passwordHash.verify(req.body.password, response[0].contrasena) === true) {
            //creamos el token tomando en cuenta la respuesta la llave asinada y podemos asignar tiempo de delay
            const token = jwt.sign({ datos: response},app.get('llave'),{ expiresIn: '1h'});
            //rendemos con un token y la informacion del usuario
              res.status(202).json({ data :response, token : token})
              // console.log(bears)
            } else {
                //enviamos un no localizado o no encontrado
              res.status(404).json({ mensage: 'Password Y/o Contraseña incorrecto', error: 401 })
            }
          }else{
                   res.status(301).json({
                     msg:"error en la consulta",
                     error :1
                   })
          } 
      })
  })
//mandamos un Objeto X de a bae de datos para poder dar acceso al home de angular
  app.post('/home', function (req,res) {
    //res.send('hola. entraste a login')
    usuarios.find({email:req.body.email},function (err, response) {
        if (err) console.log(err);
        if (passwordHash.verify(req.body.password, response[0].contrasena) === true) {
              res.status(202).json({ response})
              // console.log(bears)
            } else {
              res.json({ mensage: 'Password Y/o Contraseña incorrecto', error: 401 })
            }
        //res.json({response})
      })
  })
//aqui colocamos la conexion a la base de datos
  mongoose.connect(conf.MONGO_URL,{dbName: conf.DB})
    .then(() => {
        // Cuando se realiza la conexión marca OK
        console.log("Ok Database")
        app.listen(conf.PORT, () => {
            console.log("servidor en puerto: "+conf.PORT);
        });
    })
    // Si no se conecta marcamos el error
    .catch(err => console.log(err));
app.use(express.static('public'));
module.exports = app;