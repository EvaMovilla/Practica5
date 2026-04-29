const API = "http://localhost:8080/api/carritos";

const productos = {
  auriculares: {
    idArticulo: 1,
    nombre: "Auriculares inalámbricos",
    precioUnitario: 59.99
  },
  teclado: {
    idArticulo: 2,
    nombre: "Teclado mecánico",
    precioUnitario: 79.99
  },
  raton: {
    idArticulo: 3,
    nombre: "Ratón ergonómico",
    precioUnitario: 29.99
  }
};

function getIdCarrito() {
  return localStorage.getItem("idCarrito");
}

function crearHeaders(conJson = false) {
  const headers = {};

  if (conJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function mostrarSalida(datos) {
  console.log(datos);
}

function mostrarError(error) {
  console.error("Error:", error.message);
  alert("Error: " + error.message);
}

async function procesarRespuesta(respuesta) {
  const texto = await respuesta.text();

  let datos;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    const mensaje = datos ? JSON.stringify(datos) : "HTTP " + respuesta.status;
    throw new Error(mensaje);
  }

  return datos;
}

async function crearCarrito() {
  try {
    const datos = {
      idUsuario: 1,
      correoUsuario: "eva@email.com"
    };

    const respuesta = await fetch(API, {
      method: "POST",
      headers: crearHeaders(true),
      body: JSON.stringify(datos)
    });

    const carrito = await procesarRespuesta(respuesta);

    localStorage.setItem("idCarrito", carrito.idCarrito);

    mostrarSalida(carrito);
    alert("Carrito creado con ID: " + carrito.idCarrito);

  } catch (error) {
    mostrarError(error);
  }
}

async function agregarProducto(producto, unidades) {
  try {
    const idCarrito = getIdCarrito();

    if (!idCarrito) {
      alert("Primero crea un carrito o introduce un ID de carrito");
      return;
    }

    const linea = {
      idArticulo: producto.idArticulo,
      precioUnitario: producto.precioUnitario,
      unidades: unidades
    };

    const respuesta = await fetch(`${API}/${idCarrito}/lineas`, {
      method: "POST",
      headers: crearHeaders(true),
      body: JSON.stringify(linea)
    });

    const carrito = await procesarRespuesta(respuesta);

    mostrarSalida(carrito);
    alert("Producto añadido. Total actual: " + carrito.totalPrecio + " €");

  } catch (error) {
    mostrarError(error);
  }
}

async function cargarCarrito() {
  try {
    const idCarrito = getIdCarrito();

    if (!idCarrito) {
      document.getElementById("tabla-carrito").innerHTML =
        "<p>No hay carrito seleccionado.</p>";
      return;
    }

    const respuesta = await fetch(`${API}/${idCarrito}`, {
      method: "GET",
      headers: crearHeaders()
    });

    const carrito = await procesarRespuesta(respuesta);

    let html = `
      <table>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Total línea</th>
          <th>Acción</th>
        </tr>
    `;

    carrito.lineas.forEach(function(linea) {
      html += `
        <tr>
          <td>${obtenerNombreProducto(linea.idArticulo)}</td>
          <td>${linea.precioUnitario} €</td>
          <td>${linea.unidades}</td>
          <td>${linea.costeLinea} €</td>
          <td>
            <button onclick="borrarLinea(${linea.idLinea})">Eliminar</button>
          </td>
        </tr>
      `;
    });

    html += `
        <tr>
          <td colspan="3"><strong>Total</strong></td>
          <td colspan="2"><strong>${carrito.totalPrecio} €</strong></td>
        </tr>
      </table>
    `;

    document.getElementById("tabla-carrito").innerHTML = html;

    mostrarSalida(carrito);

  } catch (error) {
    mostrarError(error);
  }
}

async function borrarLinea(idLinea) {
  try {
    const idCarrito = getIdCarrito();

    if (!idCarrito) {
      alert("Introduce un ID de carrito");
      return;
    }

    const respuesta = await fetch(`${API}/${idCarrito}/lineas/${idLinea}`, {
      method: "DELETE",
      headers: crearHeaders()
    });

    await procesarRespuesta(respuesta);

    alert("Línea eliminada correctamente");
    cargarCarrito();

  } catch (error) {
    mostrarError(error);
  }
}

async function borrarCarrito() {
  try {
    const idCarrito = getIdCarrito();

    if (!idCarrito) {
      alert("Introduce un ID de carrito");
      return;
    }

    const respuesta = await fetch(`${API}/${idCarrito}`, {
      method: "DELETE",
      headers: crearHeaders()
    });

    await procesarRespuesta(respuesta);

    localStorage.removeItem("idCarrito");
    document.getElementById("tabla-carrito").innerHTML =
      "<p>Carrito borrado correctamente.</p>";

    mostrarSalida("Carrito borrado correctamente");

  } catch (error) {
    mostrarError(error);
  }
}

function obtenerNombreProducto(idArticulo) {
  for (const clave in productos) {
    if (productos[clave].idArticulo === idArticulo) {
      return productos[clave].nombre;
    }
  }

  return "Producto " + idArticulo;
}