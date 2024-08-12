let confirmedUserName = ""; // Almacenar el nombre confirmado
let confirmedCustomMessage = ""; // Almacenar el mensaje personalizado confirmado
const EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

// Función para confirmar el nombre del usuario
function confirmUserName() {
  const userNameInput = document.getElementById("userName");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userName = userNameInput.value.trim();

  // Guardar el nombre en localStorage
  if (userName) {
    localStorage.setItem("userName", userName);
    confirmedUserName = userName;
    userNameDisplay.textContent = `Nombre confirmado: ${confirmedUserName}`;
    userNameDisplay.classList.remove("hidden");

    // Limpiar el campo después de confirmar
    userNameInput.value = "";
  } else {
    alert("Por favor ingresa tu nombre antes de confirmar.");
  }
}

// Función para eliminar el nombre del usuario
function clearUserName() {
  localStorage.removeItem("userName");
  confirmedUserName = "";

  // Limpiar la visualización y el campo de entrada
  document.getElementById("userNameDisplay").textContent = "";
  document.getElementById("userNameDisplay").classList.add("hidden");
  document.getElementById("userName").value = "";
}

// Función para confirmar el mensaje personalizado
function confirmCustomMessage() {
  const customMessageInput = document.getElementById("customMessage");
  const customMessageDisplay = document.getElementById("customMessageDisplay");
  const customMessage = customMessageInput.value;

  // Validar que el mensaje no esté vacío
  if (customMessage) {
    // Guardar el mensaje en localStorage
    localStorage.setItem("customMessage", customMessage);
    confirmedCustomMessage = customMessage;

    // Mostrar el mensaje de confirmación
    customMessageDisplay.innerHTML = "<strong>Mensaje confirmado</strong>";
    customMessageDisplay.classList.remove("hidden");
  } else {
    alert("Por favor ingresa un mensaje personalizado antes de confirmar.");
  }
}

// Función para eliminar el mensaje personalizado
function clearCustomMessage() {
  localStorage.removeItem("customMessage");
  confirmedCustomMessage = "";

  // Limpiar la visualización y el campo de entrada
  document.getElementById("customMessageDisplay").textContent = "";
  document.getElementById("customMessageDisplay").classList.add("hidden");
  document.getElementById("customMessage").value = "";
}

// Función para mostrar los enlaces almacenados en localStorage
function displayLinks() {
  const linksList = document.getElementById("linksList");
  linksList.innerHTML = "";

  const storedLinks = localStorage.getItem("links");
  const storedTimestamp = localStorage.getItem("linksTimestamp");

  if (storedLinks && storedTimestamp) {
    const currentTime = new Date().getTime();
    const savedTime = parseInt(storedTimestamp, 10);

    // Verificar si los enlaces han expirado
    if (currentTime - savedTime > EXPIRATION_TIME) {
      // Borrar los datos si han expirado
      localStorage.removeItem("links");
      localStorage.removeItem("linksTimestamp");
      alert("Los enlaces han expirado y se han eliminado.");
      return;
    }

    const links = JSON.parse(storedLinks);

    for (const linkData of links) {
      const { telefono, mensaje, nombre, apellido } = linkData;

      // Crear elemento <li> para agregar el enlace a la lista
      const listItem = document.createElement("li");

      // Crear enlace <a> para enviar el mensaje por WhatsApp
      const link = document.createElement("a");
      link.href = `https://web.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(
        mensaje
      )}`;
      link.target = "_blank";
      link.textContent = `Enviar mensaje a ${telefono} de ${nombre} ${apellido}`; // Agregar número de teléfono

      // Restaurar la clase de color de clic si ya ha sido clickeado antes
      if (localStorage.getItem(`clicked_${telefono}`)) {
        link.classList.add("clicked");
      }

      // Agregar el evento de clic para cambiar el color
      link.addEventListener("click", function () {
        link.classList.add("clicked");
        // Guardar el estado del clic en localStorage
        localStorage.setItem(`clicked_${telefono}`, "true");
      });

      // Agregar el enlace al elemento <li>
      listItem.appendChild(link);

      // Agregar elemento <li> a la lista ordenada <ol>
      linksList.appendChild(listItem);
    }
  }
}

// Función para guardar los datos del Excel y los enlaces en localStorage
function saveLinksData(linksData) {
  localStorage.setItem("links", JSON.stringify(linksData));
  localStorage.setItem("linksTimestamp", new Date().getTime()); // Guardar timestamp actual
}

// Función para procesar el archivo Excel y guardar los datos en localStorage
async function enviarMensajes() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor selecciona un archivo Excel (.xlsx, .xls).");
    return;
  }

  if (!confirmedUserName) {
    alert("Por favor confirma tu nombre antes de generar los enlaces.");
    return;
  }

  if (!confirmedCustomMessage) {
    alert(
      "Por favor confirma el mensaje personalizado antes de generar los enlaces."
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const codigoColumna = "A";
    const dniColumna = "B";
    const nombreColumna = "C";
    const apellidoColumna = "D";
    const telefonoColumna = "E";

    let rowNum = 2; // Empezamos en la fila 2 para omitir el encabezado

    const linksData = []; // Array para almacenar los datos del Excel

    // Iterar sobre las filas del Excel
    while (true) {
      const codigo = sheet[codigoColumna + rowNum]?.v;
      const dni = sheet[dniColumna + rowNum]?.v;
      const nombre = sheet[nombreColumna + rowNum]?.v;
      const apellido = sheet[apellidoColumna + rowNum]?.v;
      const telefono = sheet[telefonoColumna + rowNum]?.v;

      if (!codigo || !telefono) break; // Salir del bucle si no hay más datos

      let mensaje;

      // Decide el mensaje según el código
      if (codigo === 556) {
        mensaje =
          `¡Hola ${nombre}! 👋🏻 ¿Cómo estás?\n` +
          `Soy *${confirmedUserName}, asesor de Naranja X*.\n\n` +
          `Me contacto por la solicitud que iniciaste para sacar la tarjeta de crédito por la *APP NX* y quedó sin finalizar.\n\n` +
          `${confirmedCustomMessage}\n\n` +
          `¡Aguardamos tu respuesta!`;
      } else {
        mensaje =
          `¡Hola ${nombre}! 👋🏻 ¿Cómo estás?\n` +
          `Soy *${confirmedUserName}, asesor de Naranja X*.\n\n` +
          `Me contacto por la solicitud que iniciaste para sacar la tarjeta de crédito online y quedó sin finalizar.\n\n` +
          `${confirmedCustomMessage}\n\n` +
          `¡Aguardamos tu respuesta!`;
      }

      // Agregar los datos del enlace al array
      linksData.push({ telefono, mensaje, nombre, apellido });

      rowNum++; // Pasar a la siguiente fila
    }

    saveLinksData(linksData); // Guardar los enlaces en localStorage
    displayLinks(); // Mostrar los enlaces generados

    alert(
      "Se han generado todos los enlaces para enviar mensajes por WhatsApp."
    );
  };

  reader.readAsArrayBuffer(file);
}

// Función para borrar los enlaces almacenados en localStorage
function clearLinks() {
  localStorage.removeItem("links");
  localStorage.removeItem("linksTimestamp");
  displayLinks(); // Actualizar la lista de enlaces
  alert("Todos los enlaces han sido eliminados.");
}

// Cargar los datos de la página al cargar
window.onload = function () {
  // Cargar nombre del usuario
  const storedUserName = localStorage.getItem("userName");
  if (storedUserName) {
    confirmedUserName = storedUserName;
    document.getElementById(
      "userNameDisplay"
    ).textContent = `Nombre confirmado: ${storedUserName}`;
    document.getElementById("userNameDisplay").classList.remove("hidden");
  }

  // Cargar mensaje personalizado
  const storedCustomMessage = localStorage.getItem("customMessage");
  if (storedCustomMessage) {
    confirmedCustomMessage = storedCustomMessage;
    document.getElementById(
      "customMessageDisplay"
    ).textContent = `Mensaje personalizado confirmado: ${storedCustomMessage}`;
    document.getElementById("customMessageDisplay").classList.remove("hidden");
  }

  displayLinks(); // Mostrar los enlaces almacenados
};
