import { denormalizeObject } from '../../src/utils/schema-normalizr.js';

const socket = io.connect();

function enviarMensaje() {
  const email = document.getElementById('email');
  const mensaje = document.getElementById('mensaje');
  const nombre = document.getElementById('nombre');
  const apellido = document.getElementById('apellido');
  const alias = document.getElementById('alias');
  const edad = document.getElementById('edad');
  const avatar = document.getElementById('avatar');

  if (
    !email.value ||
    !mensaje.value ||
    !nombre.value ||
    !apellido.value ||
    !alias.value ||
    !edad.value ||
    !avatar.value
  ) {
    alert('Debe completar todos los campos');
    return false;
  }

  socket.emit('mensajeNuevo', {
    author: {
      email: email.value,
      nombre: nombre.value,
      apellido: apellido.value,
      edad: edad.value,
      alias: alias.value,
      avatar: avatar.value,
    },
    text: mensaje.value,
  });
  mensaje.value = '';
  return false;
}

socket.on('mensajes', (mensajes) => {
  let denormalizeMsjObject = denormalizeObject(mensajes);

  let mensajesHtml = denormalizeMsjObject
    .map(
      (mensaje) =>
        `<div>
        <b style="color:blue;">${mensaje.email}</b>
        [<span style="color:brown;">${mensaje.timestamp}</span>] :
        <i style="color:green;">${mensaje.text}</i>
        </div>`,
    )
    .join('<br>');

  document.getElementById('listaMensajes').innerHTML = mensajesHtml;
});

const createProductTable = async (products) => {
  const template = await (await fetch('views/products.hbs')).text();
  const templateCompiled = Handlebars.compile(template);
  return templateCompiled({ products });
};

const addProduct = () => {
  const title = document.getElementById('title');
  const price = document.getElementById('price');
  const thumbnail = document.getElementById('thumbnail');

  if (!title.value || !price.value) {
    alert('Debe completar los campos');
  }

  socket.emit('add-product', {
    title: title.value,
    price: price.value,
    thumbnail: thumbnail.value,
  });
  title.value = '';
  price.value = '';
  thumbnail.value = '';
};

document.getElementById('add-product').addEventListener('click', addProduct);

socket.on('products', async (products) => {
  const template = await createProductTable(products);
  document.getElementById('products').innerHTML = template;
});
