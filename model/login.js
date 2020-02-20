//creamos este archivo para la configuracion del modelo para poder escribir o modificar el modelo 
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var usuarios = new Schema({
  contrasena: String,
  email: String,
})
//exportamos el modelo para poder usarlo en el index
module.exports = mongoose.model('usuarios', usuarios);
