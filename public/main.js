let confirmedUserName = "";
let confirmedCustomMessage = "";

// Función para confirmar el nombre del usuario
function confirmUserName() {
  const userNameInput = document.getElementById("userName");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userName = userNameInput.value.trim();

  if (userName) {
    confirmedUserName = userName;
    userNameDisplay.textContent = `Nombre confirmado: ${confirmedUserName}`;
    userNameDisplay.classList.remove("hidden");
    userNameInput.value = "";
  } else {
    alert("Por favor ingresa tu nombre antes de confirmar.");
  }
}

// Función para eliminar el nombre del usuario
function clearUserName() {
  confirmedUserName = "";
  document.getElementById("userNameDisplay").textContent = "";
  document.getElementById("userNameDisplay").classList.add("hidden");
  document.getElementById("userName").value = "";
}

// Función para confirmar el mensaje personalizado
function confirmCustomMessage() {
  const customMessageInput = document.getElementById("customMessage");
  const customMessageDisplay = document.getElementById("customMessageDisplay");
  const customMessage = customMessageInput.value.trim();

  if (customMessage) {
    confirmedCustomMessage = customMessage;
    customMessageDisplay.innerHTML = "<strong>Mensaje confirmado</strong>";
    customMessageDisplay.classList.remove("hidden");
  } else {
    alert("Por favor ingresa un mensaje personalizado antes de confirmar.");
  }
}

// Función para eliminar el mensaje personalizado
function clearCustomMessage() {
  confirmedCustomMessage = "";
  document.getElementById("customMessageDisplay").textContent = "";
  document.getElementById("customMessageDisplay").classList.add("hidden");
  document.getElementById("customMessage").value = "";
}

// Función para mostrar los enlaces
function displayLinks(linksData = []) {
  const linksList = document.getElementById("linksList");
  linksList.innerHTML = "";

  if (linksData.length > 0) {
    for (const linkData of linksData) {
      const { telefono, mensaje, nombre, apellido } = linkData;

      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = `https://web.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(
        mensaje
      )}`;
      link.target = "_blank";
      link.textContent = `Enviar mensaje a ${telefono} de ${nombre} ${apellido}`;

      // Restaurar la clase de color de clic si ya ha sido clickeado antes
      if (link.classList.contains("clicked")) {
        link.classList.add("clicked");
      }

      // Agregar el evento de clic para cambiar el color
      link.addEventListener("click", function () {
        link.classList.add("clicked");
      });

      listItem.appendChild(link);
      linksList.appendChild(listItem);
    }
  }
}

// Función para procesar el archivo Excel y generar los enlaces
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

    const linksData = [];

    while (true) {
      const codigo = sheet[codigoColumna + rowNum]?.v;
      const dni = sheet[dniColumna + rowNum]?.v;
      const nombre = sheet[nombreColumna + rowNum]?.v;
      const apellido = sheet[apellidoColumna + rowNum]?.v;
      const telefono = sheet[telefonoColumna + rowNum]?.v;

      if (!codigo || !telefono) break;

      let mensaje;

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

      linksData.push({ telefono, mensaje, nombre, apellido });

      rowNum++;
    }

    displayLinks(linksData);
    alert(
      "Se han generado todos los enlaces para enviar mensajes por WhatsApp."
    );
  };

  reader.readAsArrayBuffer(file);
}

// Función para borrar los enlaces mostrados
function clearLinks() {
  displayLinks([]);
}

// Cargar los datos de la página al cargar
window.onload = function () {
  // Cargar nombre del usuario
  if (confirmedUserName) {
    document.getElementById(
      "userNameDisplay"
    ).textContent = `Nombre confirmado: ${confirmedUserName}`;
    document.getElementById("userNameDisplay").classList.remove("hidden");
  } else {
    document.getElementById("userNameDisplay").textContent = "";
    document.getElementById("userNameDisplay").classList.add("hidden");
  }

  // Solo actualiza la lista de enlaces si hay datos que mostrar
  // No se elimina ningún dato al cargar
  const linksData = []; // Aquí podrías cargar datos si es necesario
  displayLinks(linksData);
};
