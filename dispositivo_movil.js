if (Math.min(window.screen.width, window.screen.height) < 768) {
  console.log("Dispositivo movil");
  document.getElementById("contenedor_global").style.display = "block";
  document.getElementById("primera_mitad").style.width = "100vw";
  document.getElementById("primera_mitad").style.height = "70vh";
  document.getElementById("map").style.width = "100vw";
  document.getElementById("map").style.height = "70vh";
  document.getElementById("segunda_mitad").style.width = "100vw";
  document.getElementById("segunda_mitad").style.height = "30vh";
  document.getElementById("segunda_mitad").style.overflowX = "scroll";
  document.getElementById("segunda_mitad").style.overflowY = "hidden";
  document.getElementById("segunda_mitad").style.flexDirection = "row";

  document.getElementById("accidentes_mes").style.width = "50vw";

  document.getElementById("dia_semana").style.width = "40vw";

  document.getElementById("hora").style.width = "40vw";

  document.getElementById("tipo_accidente").style.width = "60vw";
  document.getElementById("tipo_accidente").style.height = "30vh";
  document.getElementById("tipo_accidente").parentElement.style.margin = "0";

  document.getElementById("clase_accidente").style.width = "40vw";

  document.getElementById("grupo_edad").style.width = "60vw";
  document.getElementById("grupo_edad").style.height = "30vh";
  document.getElementById("grupo_edad").parentElement.style.margin = "0";

  document.getElementById("sexo").style.width = "40vw";

  document.getElementById("posible_causa").style.width = "60vw";
  document.getElementById("posible_causa").style.height = "30vh";
  document.getElementById("posible_causa").parentElement.style.margin = "0";

  document.getElementById("afectados").style.width = "60vw";
  document.getElementById("afectados").style.height = "30vh";
  document.getElementById("afectados").parentElement.style.margin = "0";

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementsByClassName(
      "info_tablero_seg legend legend_seguridad leaflet-control"
    )[0].children[2].style.width = "15vw";
  });
}
