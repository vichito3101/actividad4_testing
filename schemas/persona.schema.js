
import odm from "../config/mongoose.js";
import bcrypt from "bcrypt";

const personaSchema = new odm.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, trim: true },
    nro_documento: { type: String, required: true, trim: true },
    edad: { type: Number, required: true, min: 0, max: 120 },


    correo: { type: String, trim: true, lowercase: true, select: false },
    password: { type: String, select: false },

    tipo_documento: {
      id_tipodoc: { type: Number, required: true },
      nombre: { type: String, required: true, trim: true },
    },

    usuario: {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        select: false, 
      },
      rol: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        enum: ["admin", "cliente"], 
      },
    },

    fecha_registro: { type: Date, default: Date.now },
  },
  { collection: "persona", versionKey: "version" }
);

// Índices únicos consistentes
personaSchema.index({ "usuario.email": 1 }, { unique: true });
personaSchema.index({ nro_documento: 1 }, { unique: true });


personaSchema.virtual("nombre_completo").get(function () {
  return `${this.nombre ?? ""} ${this.apellido ?? ""}`.trim();
});

personaSchema.pre("save", async function (next) {
 
  if (this.isModified("nombre") && this.nombre)
    this.nombre = this.nombre.toUpperCase();
  if (this.isModified("apellido") && this.apellido)
    this.apellido = this.apellido.toUpperCase();


  if (this.isModified("usuario.rol") && this.usuario?.rol)
    this.usuario.rol = this.usuario.rol.toLowerCase();


  if (this.isModified("usuario.password") && this.usuario?.password) {
    const pwd = this.usuario.password;
    const seemsHashed = /^\$2[aby]\$/.test(pwd);
    if (!seemsHashed) {
      this.usuario.password = await bcrypt.hash(pwd, 12);
    }
  }

  next();
});

personaSchema.methods.comparePassword = async function (plain) {

  if (typeof this.usuario?.password === "string") {
    const stored = this.usuario.password;
    if (/^\$2[aby]\$/.test(stored)) {
      return bcrypt.compare(plain, stored);
    }
    return stored === plain; 
  }

  if (typeof this.password === "string") {
    const stored = this.password;
    if (/^\$2[aby]\$/.test(stored)) {
      return bcrypt.compare(plain, stored);
    }
    return stored === plain;
  }
  return false;
};

export const Persona = odm.model("persona", personaSchema);

// ==== Consultas ====

export const findAll = async () => {
  return Persona.find({});
};

export const findOneForLogin = async (email) => {
  return Persona.findOne({ "usuario.email": email })
    .select("+usuario.password"); // incluye el password
};

export const login = async (objUsuario) => {
  return Persona.find({ "usuario.email": objUsuario.email });
};

export const findById = async (id_persona) => {
  return Persona.find({ _id: id_persona });
};

export const create = async (objUsuario) => {
  return Persona.create(objUsuario); 
};

export const update = async (id_persona, objUsuario) => {
  const doc = await Persona.findById(id_persona).select("+usuario.password");
  if (!doc) return null;

  if (objUsuario.nombre != null) doc.nombre = objUsuario.nombre;
  if (objUsuario.apellido != null) doc.apellido = objUsuario.apellido;
  if (objUsuario.edad != null) doc.edad = objUsuario.edad;
  if (objUsuario.usuario?.password)
    doc.usuario.password = objUsuario.usuario.password;
  if (objUsuario.usuario?.rol) doc.usuario.rol = objUsuario.usuario.rol;

  await doc.save();
  return doc;
};


