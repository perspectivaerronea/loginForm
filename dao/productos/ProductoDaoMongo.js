
import ContenedorMongo from "../../contenedores/ContenedorMongo.js";
import { productos_schema } from "../../DB/mongosSchema/productos_schema.js";

class ProductoDaoMongo extends ContenedorMongo{
    constructor(){        
        super();                         
        this.tabla = productos_schema;
    }

    async actualizar(elemento) {
        const arr = await this.obtenerRegistros();
        try {                       
            const index = arr.findIndex((el) => (el.id == elemento.id));
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
            
            await this.tabla.updateOne({ _id: arr[index].id }, {
                $set: {
                    nombre: arr[index].nombre,
                    descripcion: arr[index].descripcion,
                    codigo: arr[index].codigo,
                    foto: arr[index].foto,
                    precio: arr[index].precio,
                    stock: arr[index].stock,                    
                }
            });
            
            return elemento.id;
        } catch (err) {
            return { error: ' ID No Encontrado' };
        }
    }    
}

export default ProductoDaoMongo;