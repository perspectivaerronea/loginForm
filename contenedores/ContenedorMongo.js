import mongoose from "mongoose";

export class ContenedorMongo {

    /*
        C   -   CREATE
        R   -   READ
        U   -   UPDATE  
        D   -   DELETE
    */

    constructor() {
        this.admin = true;
    }

    cambiaAdmin() {
        this.admin = !this.admin
        return this.admin;
    }

    soyAdmin() {
        return this.admin;
    }

    //  C   -   CREATE

    async abrir() {
        try {

            // this.connection = await mongoose.connect("mongodb://127.0.0.1:27017/ecommerce", { useNewUrlParser: true, useUnifiedTopology: true });

            this.connection =  await mongoose.connect(process.env.MONGO + '/productosMensajes', { useNewUrlParser: true, useUnifiedTopology: true });
            // return await this.tabla.find();

        }    
        catch (err) {

            console.log(err);
        }
    }

    //  R   -   READ

    async obtenerRegistros() {
        try {
            return await this.tabla.find();
        }
        catch (err) {
            console.log(err);
        }
    }

    async obtenerRegistrosPorID(id) {
        try {            
            const registro = await this.tabla.findById(id)
            return registro;
        }
        catch (err) {
            return { error: ' ID No Encontrado' };
        }
    }

    //  U   -   Update

    async guardar(elemento) {
        console.log(elemento);
        try {
            const nuevoProducto = new this.tabla(elemento);
            await nuevoProducto.save();
            return nuevoProducto.id;
        }
        catch (error) {
            console.log("No se pudo agregar el objeto al archivo." + error);
            return null;
        }
    }

    async actualizar(elemento) {
        const arr = await this.obtenerRegistros();

        try {
            const index = arr.findIndex((el) => {
                (el.id == elemento.id)
                });
            if (index >= 0) {
                for (const propiedadElementoArchivo in arr[index]) {
                    for (const propiedadElemento in elemento) {
                        if (propiedadElemento == propiedadElementoArchivo && propiedadElementoArchivo != 'id' && propiedadElementoArchivo != 'timestamp') {
                            if (arr[index][propiedadElementoArchivo] != elemento[propiedadElemento] && elemento[propiedadElemento] != 0 && elemento[propiedadElemento] != '') {
                                arr[index][propiedadElementoArchivo] = elemento[propiedadElemento]
                            }
                        }
                    }
                }
            }

            return elemento.id;
        } catch (err) {
            return { error: ' ID No Encontrado' };
        }
    }

    //  D   -   DELETE

    async borrarRegistro(id) {
        try {
            await this.tabla.deleteOne({ "id": id })
            return id;
        }
        catch (error) {
            return { 'No se pudo eliminar el registro': id }
        }
    }

    async borrarTodo() {
        try {
            await this.tabla.deleteMany({})
            return JSON.parse(this.obtenerRegistros());
        }
        catch (err) {
            return { error: "No se pudieron borrar los registros" };
        }
    }

}

export default ContenedorMongo;
