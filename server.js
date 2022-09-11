//ENV
import { } from 'dotenv/config';

//EXPRESS
import express from 'express';
import { Server as IOServer } from 'socket.io';
import { Server as httpServer } from 'http';
import { engine } from 'express-handlebars'

//PATH
import path from 'path';
import { fileURLToPath } from 'url';

//DB
import ContenedorMongo from "./contenedores/ContenedorMongo.js";
import { productos_schema } from "./schemas/productos_schema.js";
import { mensajes_schema } from "./schemas/mensajes_schema.js";

//COOKIE
// import cookieParser, { signedCookie } from 'cookie-parser';

//SESSION
import session from 'express-session';
import MongoStore from 'connect-mongo';

//FAKER
import { faker } from '@faker-js/faker';

//NORMALIZR
import { schema, normalize, denormalize } from 'normalizr';

//CLASES DB
class MensajeDaoMongo extends ContenedorMongo {
    constructor() {
        super();
        this.tabla = mensajes_schema;
    }

}
class ProductoDaoMongo extends ContenedorMongo {
    constructor() {
        super();
        this.tabla = productos_schema;
    }

}

async function inicio_mensajes() {
    const ar = new MensajeDaoMongo;
    ar.abrir();

    return ar;
}

async function inicio_productos() {
    const ar = new ProductoDaoMongo;
    ar.abrir();

    return ar;
}

const app = express();
const httpServerV = new httpServer(app);
const io = new IOServer(httpServerV);
const hbs = { engine };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mensajesDB = await inicio_mensajes();
const productosDB = await inicio_productos();

function productosFaker() {
    const cantidad = 5;
    const arr = [];

    for (let i = 1; i <= cantidad; i++) {
        arr.push({
            id: i,
            nombre: faker.commerce.product(),
            precio: faker.commerce.price(),
            foto: faker.image.imageUrl(),
        })
    }

    return arr;
}

//Schema para el autor
const schemaAutor = new schema.Entity('autor', {}, { idAttribute: 'email' });

const schemaDoc = new schema.Entity('_doc', { autor: schemaAutor }, { idAttribute: '_id' });

//Schema para el mensaje
const schemaMensaje = new schema.Entity('post', { _doc: schemaDoc });

//Schema para el conjunto de mensajes
const schemaMensajes = new schema.Entity('posts', { post: [schemaMensaje] });

function normalizarMensajes(mensajesSinNormalizar) {
    const debug = false;

    const mensajesNormalizados = normalize(mensajesSinNormalizar, schemaMensajes);

    if (debug) {
        console.log("Sin Normalizar");
        console.log(mensajesSinNormalizar);
        console.log("Normalizados");
        console.log(mensajesNormalizados);
    }

    return mensajesNormalizados;
}

function autorizacion(req, res, next) {
    if (req.session.conectado) {        
        return next();
    } else {                
        res.status(301).redirect("../api/logout");
    }
}

// Sesión
const usuario = [];

// Indicamos que queremos cargar los archivos estáticos que se encuentran en dicha carpeta
app.use(express.static('./public'))

//Las siguientes líneas son para que el código reconozca el req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Sesión
const advanceOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const sesionMongo = session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGOATLAS,
        mongoOptions: advanceOptions
    }),
    dbname: process.env.MONTOATLASBASE,
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {        
        expires: (1000 * 10)
    }
});


app.use(sesionMongo);

//Configuro el Engine para usar HandleBars
app.engine('hbs', hbs.engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutDir: __dirname + '/views/layouts',
    partialDir: __dirname + '/views/partials'
}));

app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/', async (req, res) => {
    res.render('main', { layout: 'login' });
})

app.get('/api', autorizacion, async (req, res) => {
    //Creo la cookie con el nombre de usuario
    res.status(201).render('./partials/tabla', { usuario: req.session.userLogin });
});

app.get('/api/productos-test', autorizacion, async (req, res) => {
    res.render('main', { layout: 'productosPrueba', listaProductosPrueba: productosFaker() });
});

app.post('/', async (req, res) => {
    req.session.userLogin = req.body.userLogin;
    req.session.conectado = true;
    usuario.push(req.body.userLogin);
    res.status(301).redirect("./api");

})

app.get('/api/logout', (req, res) => {
    res.render('main', { layout: 'logout', usuario: usuario[usuario.length - 1] });
});

io.on('connection', (socket) => {

    socket.on('nuevoUsuario', async () => {

        //Envio Lista de Productos                
        const arr = await productosDB.obtenerRegistros();
        const listaProductos = arr;

        io.sockets.emit('listaProductos', listaProductos);

        //Envio Mensajes en el Chat
        const msg = await mensajesDB.obtenerRegistros();

        //Obtención Mensajes Normalizados
        const arrMsgN = normalizarMensajes({ id: 'mensajes', post: msg });

        io.sockets.emit('mensaje', arrMsgN);

    })

    socket.on('nuevoProducto', async (pr) => {

        await productosDB.guardar(pr)
        const listaProductos = await productosDB.obtenerRegistros();

        io.sockets.emit('listaProductos', listaProductos);
    })

    socket.on('nuevoMensaje', async (data) => {

        await mensajesDB.guardar(data)
        const msg = await mensajesDB.obtenerRegistros();

        const arrMsgN = normalizarMensajes({ id: 'mensajes', post: msg });

        io.sockets.emit('mensaje', arrMsgN);
    });

})

// El servidor funcionando en el puerto 3000
httpServerV.listen(process.env.PORT, () => console.log('SERVER ON'));