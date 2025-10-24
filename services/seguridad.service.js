// sesion13/services/seguridad.service.js
import { findOneForLogin as findOneForLoginSchema } from "../schemas/persona.schema.js";



export const findAll = async function () {
  console.log("------------service------------");
  //let results= await modelPersona.findAll();
  let results = await schemaPersona.findAll();
  console.log("luego del modelo");
  console.log(results);
  return results;
};




export const login = async function (objUsuario) {
  console.log("------------service------------");
  //let results= await modelPersona.login(objUsuario);
  let results = await schemaPersona.login(objUsuario);
  console.log("luego del modelo");
  console.log(results);
  return results;
};

export const findById = async function (id_persona) {
  console.log("------------service------------");
  let results = await schemaPersona.findById(id_persona);
  return results;
};

export const create = async function (objUsuario) {
  console.log("------------service------------");
  let results = await schemaPersona.create(objUsuario);
  return results;
};


export const findOneForLogin = async (email) => {
  return findOneForLoginSchema(email);
};