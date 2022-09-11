import mongoose from 'mongoose';

const ProductosCollection = 'productos';

const ProductoSchema = new mongoose.Schema({
    nombre: { type: String, required: true},    
    precio: { type: Number, required: true, maxLength: 10 },
    foto: { type: String, required: true },    
})


export const productos_schema = mongoose.model(ProductosCollection, ProductoSchema);