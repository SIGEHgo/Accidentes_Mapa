var map = L.map("map").setView([20, -98], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

L.geoJSON(hidalgo, {
  style: {
    color: "gray",
    opacity: 0.5,
    weight: 1,
    fillColor: "gray",
    fillOpacity: 0.1,
  },
}).addTo(map);

var invisible2025 = L.geoJSON(gjson2025, {
  style: {
    color: "#e03",
    opacity: 0,
    weight: 1,
    fillColor: "#e03",
    fillOpacity: 0,
  },
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      color: "#e03",
      opacity: 0,
      fillOpacity: 0,
    });
  },
}).addTo(map);

// Agregar control de búsqueda
var searchControl = new L.Control.Search({
  layer: invisible2025,
  propertyName: "PLACID",
  textSearch: true,
  initial: false,
  marker: false,
  moveToLocation: function (latlng, title, map) {
    let caja_coordenadas = [];

    invisible2025.eachLayer(function (layer) {
      const props = layer.feature?.properties;
      if (props && props.PLACID === title) {
        const coordenadas = layer.getLatLng();
        caja_coordenadas.push(coordenadas);

        const circle = L.circle(coordenadas, {
          radius: 300,
          weight: 5,
          color: "#e03",
          stroke: true,
          fill: false,
        }).addTo(map);

        animateCircle(circle);
      }
    });

    if (caja_coordenadas.length > 0) {
      const caja = L.latLngBounds(caja_coordenadas);
      map.fitBounds(caja, { padding: [50, 50] }); // Un padding para no andar al borde
    }
  },
  textPlaceholder: "Buscar placa o ID Operador",
});


map.addControl(searchControl);

// Animación del círculo
function animateCircle(circle) {
  let radius = 300;
  const interval = setInterval(() => {
    radius -= 20;
    if (radius < 5) {
      map.removeLayer(circle);
      clearInterval(interval);
    } else {
      circle.setRadius(radius);
    }
  }, 100);
}

// Agregar título al LayerControl

var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info_tablero_seg legend legend_seguridad"),
    colors = ["blue", "cyan", "lime", "yellow", "red"];

  // Crear el gradiente
  var gradient = "linear-gradient(to right, " + colors.join(", ") + ")";
  // Estilos adicionales para el contenedor de la leyenda
  div.style.backgroundColor = "rgb(255, 255, 255)"; // gris claro
  div.style.padding = "10px";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";
  div.style.fontSize = "13px";

  // Agregar el contenido con el gradiente y etiquetas alineadas
  div.innerHTML =
    "<strong>Simbología</strong><br>" +
    '<div style="width: 10vw; height: 10px; background: ' +
    gradient +
    '; margin-bottom: 4px;"></div>' +
    '<div style="display: flex; justify-content: space-between; font-size: 12px;">' +
    "<span>Baja</span><span>Alta</span>" +
    "</div>";

  return div;
};

legend.addTo(map);
let anio = 2025;
let capa_actual = gjson2025;

// Definir funciones que se usaran como predeterminadas despues
function formatearFechaHora({ DIA, MES, ANIO, HORA, MINUTOS }) {
  const pad = (v) => String(v).padStart(2, "0");
  return {
    fecha: `${pad(DIA)}/${pad(MES)}/${ANIO}`,
    hora: `${pad(HORA)}:${pad(MINUTOS)}`,
  };
}

function style_default() {
  return { color: "#FF5733", weight: 2 };
}

function pointToLayer_default(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 10,
    fillColor: "#0074D9",
    color: "#fff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  });
}

onEachFeature_default = function (feature, layer) {
  const p = feature.properties;
  const { fecha, hora } = formatearFechaHora(p);
  const edad = p.EDAD?.toString();
  const edadInvalida = ["0", "99", "Se ignora edad", "Se fugó"];

  let responsable;
  if (edadInvalida.includes(edad)) {
    responsable = `${p.SEXO}`;
  } else {
    responsable = `${p.SEXO} de ${parseInt(edad)} años`;
  }

  let fecha_actualizacion;
  if (!hora || hora === "null:null") {
    fecha_actualizacion = `${fecha}`;
  } else if (p.MINUTOS == null) {
    fecha_actualizacion = `${fecha} a las ${p.HORA} hrs`;
  } else if (p.HORA == null) {
    fecha_actualizacion = `${fecha}`;
  } else {
    fecha_actualizacion = `${fecha} a las ${hora} hrs`;
  }

  //Necesitamos una lista de los tipos de vehiculos invlucrados
  let vehiculos = {};
  let partes;
  let cantidad;
  if (p.vehi_invol) {
    partes = p.vehi_invol.trim().split(/\s+/);
    for (let i = 0; i < partes.length; i += 2) {
      cantidad = parseInt(partes[i], 10);
      const tipo = partes[i + 1];
      vehiculos[tipo] = cantidad;
    }
  }

  // Empezamos a crear las tarjetas del popup
  const saldoHtml = `
        <div style="display: flex; justify-content: center; gap: 40px;">
          <div style="text-align: center;">
            <div style="position: relative; display: inline-block;">
              <img src="imagenes/Iconos/Muerto.png" alt="Muertos" style="width: 80px; height: 110px; border: 1px solid #ddd; border-radius: 8px;">
              <span class="badge" style="position: absolute; top: -10px; right: -10px; background: #600; color: white; border-radius: 50%; padding: 3px 8px; font-size: 12px;">${
                p.TOT_MUERT
              }</span>
            </div>
            <div style="margin-top: 5px; font-size: 0.3em; color: #333; min-height: 1.2em;">
              ${
                p.CONDMUE
                  ? p.CONDMUE > 1
                    ? p.CONDMUE + " conductores"
                    : p.CONDMUE + " conductor"
                  : "&nbsp;"
              }
            </div>
          </div>

          <div style="text-align: center;">
            <div style="position: relative; display: inline-block;">
              <img src="imagenes/Iconos/herido.png" alt="Heridos" style="width: 80px; height: 110px; border: 1px solid #ddd; border-radius: 8px;">
              <span class="badge" style="position: absolute; top: -10px; right: -10px; background: #600; color: white; border-radius: 50%; padding: 3px 8px; font-size: 12px;">${
                p.TOT_HER
              }</span>
            </div>
            <div style="margin-top: 5px; font-size: 0.3em; color: #333; min-height: 1.2em;">
              ${
                p.CONDHER
                  ? p.CONDHER > 1
                    ? p.CONDHER + " conductores"
                    : p.CONDHER + " conductor"
                  : "&nbsp;"
              }
            </div>
          </div>
        </div>
      `;
  const vehiculosHtml = Object.entries(vehiculos)
    .map(
      ([tipo, cantidad]) => `
          <a href="#" class="notification">
        <img src="imagenes/Iconos/${tipo}.png" alt="${tipo}" style="vertical-align: middle;width: 100%; max-width: 120px; border: 1px solid #ddd; border-radius: 8px;">
        <span class="badge" style=''>${cantidad}</span>
          </a>
        `
    )
    .join("");

  // const html = `
  //   <div class="card" style="margin-top: 24px;">
  //     <div style="border-radius: 8px 8px 0px 0px;height: 3vh;padding: 0px;margin: -4px -16px; background-color: #000000;"></div>
  //     ${titulo_final}
  //     ${texto_final}
  //       <div class="info" style="display: flex; justify-content: space-between; text-align: left;">
  //         <div style="width: 50%;">
  //         <span><strong>${p.TIPACCID} – ${p.CLASE} </strong> </span>
  //         <span style="padding-top: 10px;"> ${fecha_actualizacion}</span>
  //         <span style="padding-top: 10px;">${p.NOM_MUN}, Hidalgo</span>
  //         </div>
  //         <div style="width: 40%; text-align: center;">
  //             ${generoHtml}
  //           <span> <strong>Posible causa:</strong> ${p.CAUSAACCI} </span>
  //           <span Responsable:</strong> ${responsable} </span>
  //         </div>
  //       </div>
  //   </div>
  // `;

  const html = `
        <div class="container" style="border: 6px solid #e60000; padding: 20px; width: 400px; text-align: center; font-family: Arial, sans-serif; background-color: white;">
          <div class="header" style="background-color: #e60000; color: white; font-weight: bold; padding: 10px; margin-bottom: 10px;">
            ${
              p.ANIO == 2025
                ? "PERSONAS INVOLUCRADAS"
                : "VEHÍCULOS INVOLUCRADOS"
            }
          </div>

          <div class="icon" style="width: 100px; margin: 0 auto 10px;">
            ${p.ANIO == 2025 ? saldoHtml : vehiculosHtml}
          </div>

          <div class="sub-header" style="background-color: #e60000; color: white; font-weight: bold; padding: 10px; margin-bottom: 10px;">
            ${p.TIPACCID} - ${p.CLASE} <br>Tipo de transporte: ${
    p["TIPO DE TRANSPORTE" ] || "No especificado"
  }
          </div>

          <div class="informacion" style="display: flex; margin-top: 0px; height: 160px;">
            <div class="izquierda" style="width: 20%; height: 100%;">
              <img src="${
                p.SEXO === "Hombre"
                  ? "imagenes/Iconos/hombre.png"
                  : p.SEXO === "Mujer"
                  ? "imagenes/Iconos/mujer.png"
                  : "imagenes/Iconos/desconocido.png"
              }" height="100%">
            </div>
            <div class="derecha" style="width: 80%; text-align: left; padding-left: 10px;">
              <div class = "causa" style="font-size: 14px; ">Posible causa: <strong> ${
                responsable
              } </strong> </div>
              <div class="nombre_operador" style="font-size: 14px; ">Nombre del operador: <strong> ${
                p.NOM_OPER || "No hay dato"
              } </strong> </div>
              <div class="id_conductor" style="font-size: 14px; "> ID Operador: <strong> ${
                p.ID_OPER || "No hay dato"
              } </strong> </div>
              <div class="placas" style="font-size: 14px; ">Placa: <strong> ${
                p.PLACAS || "No hay dato"
              } </strong> </div>
              <div class="ruta" style="font-size: 14px; ">Ruta: <strong> ${
                p.RUTA || "No hay dato"
              } </strong> </div>
              <div class="nombre_concesionario" style="font-size: 14px; "> Nombre del concesionario: <strong> ${
                p.NOM_CON || "No hay dato"
              } </strong> </div>
              <div class="date-time" style="font-size: 14px; ">Fecha: <strong> ${fecha_actualizacion} </strong> </div>
            </div>
          </div>

          <div class="location" style="font-size: 20px; margin-top: 20px; border-top: 4px solid #e60000; padding-top: 10px; font-weight: bold;">
            ${p.NOM_MUN || "Municipio desconocido"}, Hidalgo
          </div>
        </div>
      `;

  layer.bindPopup(html);

  // Este es el tooltip para cuando te posicionas sobre el punto con el mouse
  if (feature.properties && feature.properties.TIPACCID) {
    layer.bindTooltip(feature.properties.TIPACCID, {
      sticky: true,
    });
  }
};

// Los heatmaps
const heatLayer2021 = L.heatLayer(
  gjson2021.features.map((feat) => {
    const coordinates = feat.geometry.coordinates;
    return [coordinates[1], coordinates[0]];
  }),
  { radius: 10, blur: 15, maxZoom: 1 }
);
const heatLayer2022 = L.heatLayer(
  gjson2022.features.map((feat) => {
    const coordinates = feat.geometry.coordinates;
    return [coordinates[1], coordinates[0]];
  }),
  { radius: 10, blur: 15, maxZoom: 1 }
);
const heatLayer2023 = L.heatLayer(
  gjson2023.features.map((feat) => {
    const coordinates = feat.geometry.coordinates;
    return [coordinates[1], coordinates[0]];
  }),
  { radius: 10, blur: 15, maxZoom: 1 }
);
const heatLayer2025 = L.heatLayer(
  gjson2025.features.map((feat) => {
    const coordinates = feat.geometry.coordinates;
    return [coordinates[1], coordinates[0]];
  }),
  { radius: 10, blur: 15, maxZoom: 1 }
);

// Crea GeoJSON para cada año
const markersLayer2021 = L.geoJSON(gjson2021, {
  style: style_default,
  pointToLayer: pointToLayer_default,
  onEachFeature: onEachFeature_default,
});
const markersLayer2022 = L.geoJSON(gjson2022, {
  style: style_default,
  pointToLayer: pointToLayer_default,
  onEachFeature: onEachFeature_default,
});
const markersLayer2023 = L.geoJSON(gjson2023, {
  style: style_default,
  pointToLayer: pointToLayer_default,
  onEachFeature: onEachFeature_default,
});
const markersLayer2025 = L.geoJSON(gjson2025, {
  style: style_default,
  pointToLayer: pointToLayer_default,
  onEachFeature: onEachFeature_default,
});

// Agrupar los marcadores en markerCluster
const markersCluster2021 = L.markerClusterGroup();
markersCluster2021.addLayer(markersLayer2021);

const markersCluster2022 = L.markerClusterGroup();
markersCluster2022.addLayer(markersLayer2022);

const markersCluster2023 = L.markerClusterGroup();
markersCluster2023.addLayer(markersLayer2023);

const markersCluster2025 = L.markerClusterGroup();
markersCluster2025.addLayer(markersLayer2025);

// LayerGroup para cada año. Puedes elegir usar clusters para más de uno.
const capa2021 = L.layerGroup([heatLayer2021, markersCluster2021]);
const capa2022 = L.layerGroup([heatLayer2022, markersCluster2022]);
const capa2023 = L.layerGroup([heatLayer2023, markersCluster2023]);
const capa2025 = L.layerGroup([heatLayer2025, markersCluster2025]);

// Añadir capa por defecto
capa2025.addTo(map);
bounds = markersLayer2025.getBounds();
map.fitBounds(bounds);

// Control de capas
const baseMaps = {
  2021: capa2021,
  2022: capa2022,
  2023: capa2023,
  2025: capa2025,
};


L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);
let layerContainer = document.querySelector(".leaflet-control-layers-base");
if (layerContainer) {
  let title = document.createElement("div");
  title.className = "layer-control-title";
  title.innerText = "Seleccione un año:";
  layerContainer.parentElement.insertBefore(title, layerContainer);
}

// Función para cambiar entre heatmap y marcadores según el zoom.
function quitar_anadir_circulos() {
  const z = map.getZoom();
  let markers, heat;

  if (map.hasLayer(capa2021)) {
    markers = markersCluster2021;
    heat = heatLayer2021;
  } else if (map.hasLayer(capa2022)) {
    markers = markersCluster2022;
    heat = heatLayer2022;
  } else if (map.hasLayer(capa2023)) {
    markers = markersCluster2023;
    heat = heatLayer2023;
  } else if (map.hasLayer(capa2025)) {
    markers = markersCluster2025;
    heat = heatLayer2025;
  }

  if (z >= 15) {
    document.getElementsByClassName(
      "info_tablero_seg legend legend_seguridad"
    )[0].style.display = "none";
    if (!map.hasLayer(markers)) {
      map.addLayer(markers);
    }
    if (map.hasLayer(heat)) {
      map.removeLayer(heat);
    }
  } else {
    document.getElementsByClassName(
      "info_tablero_seg legend legend_seguridad"
    )[0].style.display = "block";
    if (map.hasLayer(markers)) {
      map.removeLayer(markers);
    }
    if (!map.hasLayer(heat)) {
      map.addLayer(heat);
    }
  }
}
quitar_anadir_circulos();

var helloPopup = L.popup().setContent("Hello World!");

L.easyButton(
  "fa-info-circle",
  function (btn, map) {
    $("#exampleModal").modal("show");
  },
  "Mostrar modal"
).addTo(map);

//Marca de Agua
L.Control.Watermark = L.Control.extend({
  onAdd: function (map) {
    var img = L.DomUtil.create("img");
    img.src = "imagenes/Logos/Juntos.png";
    img.style.width = "25vw";
    img.style.marginBottom = "4vh";
    return img;
  },
  onRemove: function (map) {
    // Nothing to do here
  },
});
L.control.watermark = function (opts) {
  return new L.Control.Watermark(opts);
};
L.control.watermark({ position: "bottomleft" }).addTo(map);





function actualizarGraficasBasadoEnFeaturesVisibles() {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const histogram_horas = Array(24).fill(0);
  const frecuencias_accidentes_mes = Array(12).fill(0);
  const frecuencias_dia_semana = Array(7).fill(0);
  const frecuencias_grupo_edad = Array(4).fill(0);
  const frecuencias_genero = Array(3).fill(0);
  const frecuencias_causaA = Array(5).fill(0);
  const frecuencias_tipoAcc = Array(13).fill(0);
  const vehiculos_conteo = Array(7).fill(0);
  //AUTOMOVIL BICICLETA CAMION CAMIONETA CAMPASAJ FERROCARRI MICROBUS MOTOCICLET OMNIBUS PASCAMION TRACTOR
  //   [1] "Caída de pasajero"                     "Colisión con animal"                   "Colisión con ciclista"
  //   [4] "Colisión con ferrocarril"              "Colisión con motocicleta"              "Colisión con objeto fijo"
  //   [7] "Colisión con peatón (atropellamiento)" "Colisión con vehículo automotor"       "Incendio"
  //  [10] "Otro"                                  "Salida del camino"                     "Volcadura"
  const frecuencias_magnitud = Array(3).fill(0);
  let totMuertos = 0;
  let totHeridos = 0;
  let totCondMuertos = 0;
  let totCondHeridos = 0;
  const Contenedor_vehiculo = document.getElementById(
    "vehiculos_involucrados"
  ).parentElement;
  if (anio === 2025) {
    Contenedor_vehiculo.style.display = "none";
  } else {
    if (window.screen.width < 768) {
      Contenedor_vehiculo.style.display = "block";
      Contenedor_vehiculo.style.width = "40vw";
    } else {
      Contenedor_vehiculo.style.display = "block";
      Contenedor_vehiculo.style.height = "33vh";
    }
  }

  capa_actual.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const latlng = L.latLng(coords[1], coords[0]);

    // Check if the feature is within the current bounds
    if (bounds.contains(latlng)) {
      const hora = feature.properties.HORA;
      const mes = feature.properties.MES - 1;
      const dia = feature.properties.DIASEMANA;
      const edad =
        feature.properties.EDAD == "Se fugó"
          ? 99
          : feature.properties.EDAD == "Se ignora edad"
          ? 0
          : parseFloat(feature.properties.EDAD);
      const genero = feature.properties.SEXO;
      const causa = feature.properties.CAUSAACCI;
      const tipoAcc = feature.properties.TIPACCID;
      const magnitud = feature.properties.CLASE;
      const vehiculos_as_string = feature.properties.vehi_invol;
      const total_muertos = feature.properties.TOT_MUERT;
      const total_heridos = feature.properties.TOT_HER;
      const conductor_muertos = feature.properties.CONDMUE;
      const conductor_heridos = feature.properties.CONDHER;

      //const saldo_vehiculos_o_personas

      let partes_conteo;
      let cantidad_conteo;
      if (vehiculos_as_string) {
        partes_conteo = vehiculos_as_string.trim().split(/\s+/);
        for (let i = 0; i < partes_conteo.length; i += 2) {
          cantidad_conteo = parseInt(partes_conteo[i], 10);
          const tipo_ = partes_conteo[i + 1];
          switch (tipo_) {
            case "AUTOMOVIL":
              vehiculos_conteo[0] += cantidad_conteo;
              break;
            case "MOTOCICLET":
              vehiculos_conteo[1] += cantidad_conteo;
              break;
            case "BICICLETA":
              vehiculos_conteo[2] += cantidad_conteo;
              break;
            case "CAMIONETA":
              vehiculos_conteo[3] += cantidad_conteo;
              break;
            case "CAMPASAJ":
              vehiculos_conteo[4] += cantidad_conteo;
              break;
            case "PASCAMION":
              vehiculos_conteo[4] += cantidad_conteo;
              break;
            case "MICROBUS":
              vehiculos_conteo[4] += cantidad_conteo;
              break;
            case "CAMION":
              vehiculos_conteo[4] += cantidad_conteo;
              break;
            case "OMNIBUS":
              vehiculos_conteo[4] += cantidad_conteo;
              break;
            case "TRACTOR":
              vehiculos_conteo[5] += cantidad_conteo;
              break;
            case "FERROCARRI":
              vehiculos_conteo[6] += cantidad_conteo;
              break;
          }
        }
      }
      if (typeof hora === "number" && hora >= 0 && hora < 24) {
        histogram_horas[hora]++;
      }
      if (typeof mes === "number" && mes >= 0 && mes < 12) {
        frecuencias_accidentes_mes[mes]++;
      }
      if (typeof dia === "string") {
        switch (dia) {
          case "Lunes":
            frecuencias_dia_semana[0]++;
            break;
          case "Martes":
            frecuencias_dia_semana[1]++;
            break;
          case "Miércoles":
            frecuencias_dia_semana[2]++;
            break;
          case "Jueves":
            frecuencias_dia_semana[3]++;
            break;
          case "Viernes":
            frecuencias_dia_semana[4]++;
            break;
          case "Sábado":
            frecuencias_dia_semana[5]++;
            break;
          case "Domingo":
            frecuencias_dia_semana[6]++;
            break;
        }
      }
      if (typeof edad === "number" && edad >= 15 && edad <= 29) {
        frecuencias_grupo_edad[0]++;
      } else {
        if (typeof edad === "number" && edad >= 30 && edad <= 59) {
          frecuencias_grupo_edad[1]++;
        } else {
          if (typeof edad === "number" && edad >= 60 && edad <= 98) {
            frecuencias_grupo_edad[2]++;
          } else {
            frecuencias_grupo_edad[3]++;
          }
        }
      }
      if (genero === "Hombre") {
        frecuencias_genero[0]++;
      } else if (genero === "Mujer") {
        frecuencias_genero[1]++;
      } else {
        frecuencias_genero[2]++;
      }
      if (causa) {
        switch (causa) {
          case "Conductor":
            frecuencias_causaA[0]++;
            break;
          case "Falla del vehículo":
            frecuencias_causaA[1]++;
            break;
          case "Mala condición del camino":
            frecuencias_causaA[2]++;
            break;
          case "Peatón o pasajero":
            frecuencias_causaA[3]++;
            break;
          case "Otra":
            frecuencias_causaA[4]++;
            break;
        }
      }
      if (tipoAcc) {
        switch (tipoAcc) {
          case "Colisión con objeto fijo":
            frecuencias_tipoAcc[0]++;
            break;
          case "Colisión con vehículo automotor":
            frecuencias_tipoAcc[1]++;
            break;
          case "Colisión con motocicleta":
            frecuencias_tipoAcc[2]++;
            break;
          case "Volcadura":
            frecuencias_tipoAcc[3]++;
            break;
          case "Salida del camino":
            frecuencias_tipoAcc[4]++;
            break;
          case "Colisión con peatón (atropellamiento)":
            frecuencias_tipoAcc[5]++;
            break;
          case "Colisión con ciclista":
            frecuencias_tipoAcc[6]++;
            break;
          case "Otro":
            frecuencias_tipoAcc[7]++;
            break;
          case "Colisión con ferrocarril":
            frecuencias_tipoAcc[8]++;
            break;
          case "Colisión con animal":
            frecuencias_tipoAcc[9]++;
            break;
          case "Caída de pasajero":
            frecuencias_tipoAcc[10]++;
            break;
          case "Incendio":
            frecuencias_tipoAcc[11]++;
            break;
          case "Colisión entre transporte público":
            frecuencias_tipoAcc[12]++;
            break;
        }
      }
      if (magnitud) {
        switch (magnitud) {
          case "Sólo daños":
            frecuencias_magnitud[0]++;
            break;
          case "No fatal":
            frecuencias_magnitud[1]++;
            break;
          case "Fatal":
            frecuencias_magnitud[2]++;
            break;
        }
      }

      totMuertos += total_muertos;
      totHeridos += total_heridos;
      totCondMuertos += conductor_muertos;
      totCondHeridos += conductor_heridos;
    }
  });

  totMuertos = totMuertos - totCondMuertos;
  totHeridos = totHeridos - totCondHeridos;

  // console.log(histogram_horas)
  // console.log(frecuencias_accidentes_mes)
  // console.log(frecuencias_dia_semana)
  // console.log(frecuencias_grupo_edad)
  //Actualizamos las graficas

  chart_accidentes_por_mes.data.datasets[0].data = frecuencias_accidentes_mes;
  chart_accidentes_por_mes.options.plugins.title.text = `Número de accidentes por mes (${anio})`;
  chart_accidentes_por_mes.update();

  chart_dia_semana.data.datasets[0].data = frecuencias_dia_semana;
  chart_dia_semana.options.plugins.title.text = `Incidencia de accidentes por día de la semana (${anio})`;
  chart_dia_semana.update();

  chart_grupo_edad.data.datasets[0].data = frecuencias_grupo_edad;
  chart_grupo_edad.options.plugins.title.text = `Distribución de accidentes por grupos de edad (${anio})`;
  chart_grupo_edad.update();

  //sexo
  chart_sexo.data.datasets[0].data = frecuencias_genero;
  chart_sexo.options.plugins.title.text = `Accidentes por género (${anio})`;
  chart_sexo.update();

  // posible_causa
  chart_posible_causa.data.datasets[0].data = frecuencias_causaA;
  chart_posible_causa.options.plugins.title.text = `Posible causa del accidente (${anio})`;
  chart_posible_causa.update();

  // tipo_accidente
  const tipo_accidentes = [
    "Colisión con objeto fijo",
    "Colisión con vehículo automotor",
    "Colisión con motocicleta",
    "Volcadura",
    "Salida del camino",
    "Colisión con peatón (atropellamiento)",
    "Colisión con ciclista",
    "Otro",
    "Colisión con ferrocarril",
    "Colisión con animal",
    "Caída de pasajero",
    "Incendio",
    "Colisión entre transporte público",
  ];
  const sortedData = frecuencias_tipoAcc
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);

  const sortedValues = sortedData.map((item) => item.value);
  const sortedIndexes = sortedData.map((item) => tipo_accidentes[item.index]);
  chart_tipo_accidente.data.datasets[0].data = sortedValues;
  chart_tipo_accidente.data.labels = sortedIndexes;
  chart_tipo_accidente.options.plugins.title.text = `Distribución de accidentes por tipo (${anio})`;
  chart_tipo_accidente.update();

  // clase_accidente
  chart_clase_accidente.data.datasets[0].data = frecuencias_magnitud;
  chart_clase_accidente.options.plugins.title.text = `Distribución de los accidentes por magnitud (${anio})`;
  chart_clase_accidente.update();

  // vehiculos involucrados
  const allLabels = [
    "Automóvil",
    "Motocicleta",
    "Bicicleta",
    "Camioneta",
    "Camión",
    "Tractor",
    "Ferrocarril",
  ];

  // Filter labels and data to include only those with values > 0
  const filteredData = vehiculos_conteo
    .map((value, index) => ({ label: allLabels[index], value }))
    .filter((item) => item.value > 0);

  const filteredLabels = filteredData.map((item) => item.label);
  const filteredValues = filteredData.map((item) => item.value);

  // Vehiculos involucrados
  chart_vehiculos_involucrados.data.labels = filteredLabels;
  chart_vehiculos_involucrados.data.datasets[0].data = filteredValues;
  chart_vehiculos_involucrados.options.plugins.title.text = `Número de vehículos involucrados en accidentes (${anio})`;
  chart_vehiculos_involucrados.update();

  // histogram_horas
  chart_hora.data.datasets[0].data = histogram_horas;
  chart_hora.options.plugins.title.text = `Horas en las que suceden los accidentes (${anio})`;
  chart_hora.update();

  // Afectados
  chart_afectados.data.datasets[0].data = [totHeridos, totMuertos];
  chart_afectados.data.datasets[1].data = [totCondHeridos, totCondMuertos];
  chart_afectados.options.plugins.title.text = `Número de personas involucradas (${anio})`;
  chart_afectados.update();

  // Placas
  const frecuencias_placas = {};
  capa_actual.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const latlng = L.latLng(coords[1], coords[0]);

    if (map.getBounds().contains(latlng)) {
      const placa = feature.properties.PLACAS;
      if (placa) {
        frecuencias_placas[placa] = (frecuencias_placas[placa] || 0) + 1;
      }
    }
  });

  // Ordenar por frecuencia descendente y tomar top 5
  const placas_ordenadas = Object.entries(frecuencias_placas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const labels_placas = placas_ordenadas.map(item => item[0]);
  const data_placas = placas_ordenadas.map(item => item[1]);

  // Actualizar gráfico chart_placas
  chart_placas.data.labels = labels_placas;
  chart_placas.data.datasets[0].data = data_placas;
  chart_placas.options.plugins.title.text = `Placas involucradas (${anio})`;
  chart_placas.update();


  // Operador
  const frecuencias_operador = {};

  capa_actual.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const latlng = L.latLng(coords[1], coords[0]);

    if (map.getBounds().contains(latlng)) {
      const id_oper = feature.properties.ID_OPER;
      if (id_oper) {
        frecuencias_operador[id_oper] = (frecuencias_operador[id_oper] || 0) + 1;
      }
    }
  });

  // Ordenar por frecuencia descendente y tomar top 5
  const operadores_ordenados = Object.entries(frecuencias_operador)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels_operador = operadores_ordenados.map(item => item[0]);
  const data_operador = operadores_ordenados.map(item => item[1]);

  // Actualizar gráfico chart_operador
  chart_operador.data.labels = labels_operador;
  chart_operador.data.datasets[0].data = data_operador;
  chart_operador.options.plugins.title.text = `Incidencia de accidentes por operador  (${anio})`;
  chart_operador.update();


  // Tipo de transporte
  const frecuencias_tipo_transporte = {};
  capa_actual.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const latlng = L.latLng(coords[1], coords[0]);

    if (map.getBounds().contains(latlng)) {
      const tipo_transporte = feature.properties["TIPO DE TRANSPORTE"];
      if (tipo_transporte) {
        frecuencias_tipo_transporte[tipo_transporte] = (frecuencias_tipo_transporte[tipo_transporte] || 0) + 1;
      }
    }
  });
  // Ordenar por frecuencia descendente y tomar top 5
  const transporte_ordenados = Object.entries(frecuencias_tipo_transporte)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const labels_transporte = transporte_ordenados.map(item => item[0]);
  const data_transporte = transporte_ordenados.map(item => item[1]);
  // Actualizar gráfico chart_tipo_transporte
  chart_tipo_transporte.data.labels = labels_transporte
  chart_tipo_transporte.data.datasets[0].data = data_transporte;
  chart_tipo_transporte.options.plugins.title.text = `Frecuencia de accidentes según tipo de transporte (${anio})`;
  chart_tipo_transporte.update();


  // Ruta
  const frecuencias_ruta = {};
  capa_actual.features.forEach((feature) => {
    const coords = feature.geometry.coordinates;
    const latlng = L.latLng(coords[1], coords[0]);

    if (map.getBounds().contains(latlng)) {
      const ruta = feature.properties.RUTA;
      if (ruta) {
        frecuencias_ruta[ruta] = (frecuencias_ruta[ruta] || 0) + 1;
      }
    }
  });
  // Ordenar por frecuencia descendente y tomar top 5
  const rutas_ordenadas = Object.entries(frecuencias_ruta)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const labels_ruta = rutas_ordenadas.map(item => item[0]);
  const data_ruta = rutas_ordenadas.map(item => item[1]);
  // Actualizar gráfico chart_ruta
  chart_ruta.data.labels = labels_ruta;
  chart_ruta.data.datasets[0].data = data_ruta;
  chart_ruta.options.plugins.title.text = `Concentración de accidentes en rutas viales (${anio})`;
  chart_ruta.update();

}

document
  .getElementsByClassName("leaflet-control-layers-base")[0]
  .children[0].addEventListener("click", function () {
    anio = parseInt(this.children[0].children[1].innerHTML, 10);

    quitar_anadir_circulos();
    bounds = markersLayer2021.getBounds();
    map.fitBounds(bounds);
    capa_actual = gjson2021;
    actualizarGraficasBasadoEnFeaturesVisibles();
  });

document
  .getElementsByClassName("leaflet-control-layers-base")[0]
  .children[1].addEventListener("click", function () {
    quitar_anadir_circulos();
    bounds = markersLayer2022.getBounds();
    map.fitBounds(bounds);

    // Actualizador de graficas
    anio = parseInt(this.children[0].children[1].innerHTML, 10);
    capa_actual = gjson2022;
    actualizarGraficasBasadoEnFeaturesVisibles();
  });

document
  .getElementsByClassName("leaflet-control-layers-base")[0]
  .children[2].addEventListener("click", function () {
    quitar_anadir_circulos();
    bounds = markersLayer2023.getBounds();
    map.fitBounds(bounds);

    // Actualizador de graficas
    anio = parseInt(this.children[0].children[1].innerHTML, 10);
    capa_actual = gjson2023;
    actualizarGraficasBasadoEnFeaturesVisibles();
  });

document
  .getElementsByClassName("leaflet-control-layers-base")[0]
  .children[3].addEventListener("click", function () {
    quitar_anadir_circulos();
    bounds = markersLayer2025.getBounds();
    map.fitBounds(bounds);
    // Actualizador de graficas
    anio = parseInt(this.children[0].children[1].innerHTML, 10);
    capa_actual = gjson2025;
    actualizarGraficasBasadoEnFeaturesVisibles();
  });

// Actualizar cuando el zoom termine.
map.on("zoomend", quitar_anadir_circulos);
map.on("zoomend dragend", actualizarGraficasBasadoEnFeaturesVisibles);
actualizarGraficasBasadoEnFeaturesVisibles();
