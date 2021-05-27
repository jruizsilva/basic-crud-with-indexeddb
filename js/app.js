// Variables globales
let db = null;
let arrProductos = [];
// Selectores
const contenedorProductos = document.querySelector("#contenedorProductos");
const btnAgregar = document.querySelector("#btnAgregar");
const btnEliminar = document.querySelector("#btnEliminar");

// Funciones
const agregarProducto = () => {
	const nombreProducto = document.querySelector("#producto").value;
	const precioProducto = document.querySelector("#precio").value;

	const producto = {
		nombre: nombreProducto,
		precio: precioProducto,
	};
	console.log("agregando producto...");
	console.log(producto);
	console.log(db);
	const tx = db.transaction("productos", "readwrite");
	const productos = tx.objectStore("productos");
	const request = productos.add(producto);
	console.log(request);
	request.onsuccess = () => {
		arrProductos = [...arrProductos, producto];
	};
	request.onerror = (e) => {
		console.error(e.target.error.message);
		modificarProducto();
	};
	tx.oncomplete = () => {
		mostrarProductos();
	};
};
const eliminarProducto = () => {
	const nombreProducto = document.querySelector("#producto").value;
	console.log("eliminando ", nombreProducto);
	const tx = db.transaction("productos", "readwrite");
	const productos = tx.objectStore("productos");
	const request = productos.delete(nombreProducto);
	console.log(request);
	request.onsuccess = () => {
		obtenerDataDB();
	};
};
const modificarProducto = () => {
	const nombreProducto = document.querySelector("#producto").value;
	const precioProducto = document.querySelector("#precio").value;

	const tx = db.transaction("productos", "readwrite");
	const productos = tx.objectStore("productos");
	const request = productos.get(nombreProducto);
	request.onsuccess = (e) => {
		console.log("modificando...");
		const productoObj = e.target.result;
		productoObj.nombre = nombreProducto;
		productoObj.precio = precioProducto;
		console.log(productoObj);
		const requestUpdate = productos.put(productoObj);
		requestUpdate.onsuccess = () => {
			console.log("modificado correctamente");
			obtenerDataDB();
		};
		requestUpdate.onerror = () => {
			console.error(e.target.error.message);
		};
	};
	tx.oncomplete = () => {
		mostrarProductos();
	};
};
const mostrarProductos = () => {
	limpiarHTML();
	const template = document.querySelector("#template-producto").content;
	const fragment = document.createDocumentFragment();
	arrProductos.forEach((producto) => {
		const { nombre, precio } = producto;
		template.querySelector("#producto").textContent = nombre;
		template.querySelector("#precio").textContent = `$${precio}`;

		const clone = template.cloneNode(true);
		fragment.appendChild(clone);
	});
	contenedorProductos.appendChild(fragment);
};
const limpiarHTML = () => {
	while (contenedorProductos.firstChild) {
		contenedorProductos.removeChild(contenedorProductos.firstChild);
	}
};
const crearDB = () => {
	const request = window.indexedDB.open("Lista de Productos", 1);
	request.onsuccess = (e) => {
		db = e.target.result;
		obtenerDataDB();
	};
	request.onupgradeneeded = (e) => {
		db = e.target.result;

		db.createObjectStore("productos", { keyPath: "nombre" });
	};
};
const obtenerDataDB = () => {
	arrProductos = [];
	const tx = db.transaction("productos");
	const productos = tx.objectStore("productos");
	const request = productos.openCursor();
	request.onsuccess = (e) => {
		const cursor = e.target.result;
		if (cursor) {
			const { nombre, precio } = cursor.value;
			const producto = { nombre, precio };
			arrProductos = [...arrProductos, producto];
			cursor.continue();
		}
	};
	tx.oncomplete = () => {
		console.log(arrProductos);
		mostrarProductos();
	};
};
crearDB();

btnAgregar.addEventListener("click", agregarProducto);
btnEliminar.addEventListener("click", eliminarProducto);
