const socket = io.connect();

class Producto {
    constructor(nombre, precio, foto) {
        this.nombre = nombre;
        this.precio = precio;
        this.foto = foto;
    }
};

class Autor {
    constructor(email, nombre, apellido, edad, alias, avatar) {
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.alias = alias;
        this.avatar = avatar;
    }
}

class Mensaje {
    constructor(id, nombre, apellido, edad, alias, avatar, mensaje) {
        this.autor = new Autor(id, nombre, apellido, edad, alias, avatar);
        this.texto = mensaje;
    }
};

//DENORMALIZACION
//Schema para el autor
const schemaAutor = new normalizr.schema.Entity('autor', {}, { idAttribute: 'email' });

//Schema _doc
const schemaDoc = new normalizr.schema.Entity('_doc', { autor: schemaAutor }, { idAttribute: '_id' });

//Schema para el mensaje
const schemaMensaje = new normalizr.schema.Entity('post', { _doc: schemaDoc });

//Schema para el conjunto de mensajes
const schemaMensajes = new normalizr.schema.Entity('posts', { post: [schemaMensaje] });

function render(data) {

    const debug = false;

    let tamMensajesNormalizados = JSON.stringify(data).length;
    if (debug) {
        console.log("--------------");
        console.log("Normalizados");
        console.log(data, tamMensajesNormalizados);
    }

    let mensajesDesnormalizados = normalizr.denormalize(data.result, schemaMensajes, data.entities);

    let tamMensajesDesormalizados = JSON.stringify(mensajesDesnormalizados).length;
    if (debug) {
        console.log("--------------");
        console.log("Sin Normalizar");
        console.log(mensajesDesnormalizados, tamMensajesDesormalizados);
    }

    let porcentajeCompresion = parseInt((tamMensajesNormalizados * 100) / tamMensajesDesormalizados);    
    document.getElementById('porcentajeCompresion').innerText = `${porcentajeCompresion}% de Compresión`;
    
    const listaMensajes = mensajesDesnormalizados.post;    

    const htmlMensaje = listaMensajes.map((post, index) => {
        const elem = post._doc;
        return (`<div>
            <img class="rounded" src="${elem.autor.avatar}" width="10%" height="10%" />
            <strong>${elem.autor.email} - ${elem.autor.alias} (${elem.autor.nombre} ${elem.autor.apellido}) [${elem.autor.edad}] </strong><br>                        
            <em style="color: green">${elem.texto}</em> </div>`)
    }).join(" ");
    document.getElementById('mensajes').innerHTML = htmlMensaje;
}


function renderTabla(listaProductos) {
    const html = ((listaProductos.length > 0) ? listaProductos.map((prod, index) => {
        return (`
        <tr >
            <td width="25%">${prod.nombre}</td>
            <td width="10%">${prod.precio}</td>
            <td width="65%"><img class="rounded mx-auto d-block" src="${prod.foto}" width="530px" height="300px" /></td>                
        </tr>
            `)
    }).join(" ") : `<td colspan=3>No hay productos</td>`);

    document.getElementById('cuerpoTabla').innerHTML = html;
}

function nuevoProducto(e) {
    const pr = new Producto(document.getElementById('nombre').value, parseFloat(document.getElementById('precio').value), document.getElementById('foto').value);

    socket.emit('nuevoProducto', pr);

    return false;
}

function addMessage(e) {

    const msg = new Mensaje(document.getElementById('idUsuario').value, document.getElementById('msgNombre').value, document.getElementById('msgApellido').value, parseFloat(document.getElementById('msgEdad').value), document.getElementById('msgAlias').value, document.getElementById('msgAvatar').value, document.getElementById('texto').value,)
    socket.emit('nuevoMensaje', msg);

    //El return false previene el funcionamiento del comportamiento por default del submit que hace un refresh de la página, con el 'false' ya se previene esa acción no deseada.
    return false;
}

function desconectar(data){
    console.log("logout - client");
    console.log(data);
    window.location.href = "../api/logout";
}

socket.emit('nuevoUsuario');
socket.on('mensaje', data => { render(data); });
socket.on('listaProductos', data => { renderTabla(data); });
socket.on('nuevoUsuario', data => { render(data); });
socket.on('connect_error',  data => { desconectar(data); });