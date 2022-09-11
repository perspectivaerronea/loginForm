import mongoose from 'mongoose';

const MensajesCollection = 'mensajes';

const MensajeSchema = new mongoose.Schema({
    autor: {
        email: {type: String, required: true},
        nombre: { type: String, required: true, maxLength: 100 },    
        apellido: { type: String, required: true, maxLength: 100  },    
        edad: { type: Number, required: true, maxLength: 5 },
        alias: { type: String, required: true, maxLength: 100  },    
        avatar: { type: String, required: true },    
    },  
    texto: { type: String, required: true  },    
})


export const mensajes_schema = mongoose.model(MensajesCollection, MensajeSchema);