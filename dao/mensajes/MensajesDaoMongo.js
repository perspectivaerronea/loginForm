
import ContenedorMongo from "../../contenedores/ContenedorMongo.js";
import { mensajes_schema } from "./schemas/mensajes_schema.js";

class CarritoDaoMongo extends ContenedorMongo {
    constructor() {
        super();
        this.tabla = mensajes_schema;
    }

}

export default CarritoDaoMongo;
