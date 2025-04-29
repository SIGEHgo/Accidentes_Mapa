var map = L.map('map').setView([20, -98], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

let anio = 0;

    // Definir funciones que se usaran como predeterminadas despues
    function formatearFechaHora({ DIA, MES, ANIO, HORA, MINUTOS }) {
      const pad = v => String(v).padStart(2, '0');
      return {
        fecha: `${pad(DIA)}/${pad(MES)}/${ANIO}`,
        hora: `${pad(HORA)}:${pad(MINUTOS)}`
      };
    }


    function style_default() {
      return { color: '#FF5733', weight: 2 };
    }

    function pointToLayer_default(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 10,
        fillColor: '#0074D9',
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }


    onEachFeature_default = function(feature, layer) {
      const p = feature.properties;
      const { fecha, hora } = formatearFechaHora(p);
      const edad = p.EDAD?.toString();
      const edadInvalida = ["0", "99", "Se ignora edad", "Se fugó"];

        let responsable;
        if (edadInvalida.includes(edad)) {
            responsable = `${p.SEXO}`;
        } else {
            responsable = `${p.SEXO} de ${edad} años`;
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
      const saldoHtml = `
      <a href="#" class="notification" style="margin-left:0vw; text-align: center; display: inline-block; vertical-align: top;">
        <img src="imagenes/Muerto.png" alt="Muertos" style="vertical-align: middle;width: 100%; max-width: 50px; border: 1px solid #ddd; border-radius: 8px;">
        <span class="badge" style='right: -20px;'>${p.TOT_MUERT}</span>
        <div style="margin-top: 5px; font-size: 0.8em; color: #333; min-height: 1.2em;">${p.CONDMUE ? (p.CONDMUE > 1 ? p.CONDMUE + ' conductores' : p.CONDMUE + ' conductor') : '&nbsp;'}</div>
      </a>
      <a href="#" class="notification" style="margin-left:5vw; text-align: center; display: inline-block; vertical-align: top;">
        <img src="imagenes/Herido.png" alt="Heridos" style="vertical-align: middle;width: 100%; max-width: 50px; border: 1px solid #ddd; border-radius: 8px;">
        <span class="badge" style='right: -20px;'>${p.TOT_HER}</span>
        <div style="margin-top: 5px; font-size: 0.8em; color: #333; min-height: 1.2em;">${p.CONDHER ? (p.CONDHER > 1 ? p.CONDHER + ' conductores' : p.CONDHER + ' conductor') : '&nbsp;'}</div>
      </a>
      `;
      const vehiculosHtml = Object.entries(vehiculos)
        .map(([tipo, cantidad]) => `
          <a href="#" class="notification">
        <img src="imagenes/${tipo}.png" alt="${tipo}" style="vertical-align: middle;width: 100%; max-width: 120px; border: 1px solid #ddd; border-radius: 8px;">
        <span class="badge" style=''>${cantidad}</span>
          </a>
        `)
        .join('');
      const texto_final=p.TOT_MUERT!=null? 
          saldoHtml: 
          vehiculosHtml;
      const titulo_final=p.TOT_MUERT!=null? 
          `<h3 style="margin-top: 0.5vh;margin-bottom: 1vh;">Personas involucradas</h3>`:
          `<h3 style="margin-top: 0.5vh;margin-bottom: 1vh;">Vehículos involucrados</h3>`;
          vehiculosHtml;
      const generoHtml = `
        <a href="#" class="">
          <img src="${p.SEXO === 'Hombre' ? 'imagenes/hombre_2.png' : (p.SEXO === 'Mujer' ? 'imagenes/mujer_2.png' : 'imagenes/desconocido.png')}" alt="Gender" style="width: 50%; max-width: 120px; border: 1px solid #ddd; border-radius: 8px; background-color: transparent;">
        </a>
      `;
      
      const html = `
        <div class="card" style="margin-top: 24px;">
          <div style="border-radius: 8px 8px 0px 0px;height: 3vh;padding: 0px;margin: -4px -16px; background-color: #000000;"></div>
          ${titulo_final}
          ${texto_final}
            <div class="info" style="display: flex; justify-content: space-between; text-align: left;">
              <div style="width: 50%;">
              <span><strong>${p.TIPACCID} – ${p.CLASE} </strong> </span>
              <span style="padding-top: 10px;"> ${fecha_actualizacion}</span>
              <span style="padding-top: 10px;">${p.NOM_MUN}, Hidalgo</span>
              </div>
              <div style="width: 40%; text-align: center;">
                  ${generoHtml}
                <span> <strong>Posible causa:</strong> ${p.CAUSAACCI} </span>
                <span Responsable:</strong> ${responsable} </span>
              </div>
            </div>
        </div>
      `;
      
      layer.bindPopup(html);


      // Este es el tooltip para cuando te posicionas sobre el punto con el mouse
      if (feature.properties && feature.properties.TIPACCID) {
        layer.bindTooltip(feature.properties.TIPACCID, {
          sticky: true
        });
      }
      
    }

    // Los heatmaps 
    const heatLayer2021 = L.heatLayer(heatPoints_2021, { radius: 10, blur: 15, maxZoom: 1 });
    const heatLayer2022 = L.heatLayer(heatPoints_2022, { radius: 10, blur: 15, maxZoom: 1 });
    const heatLayer2023 = L.heatLayer(heatPoints_2023, { radius: 10, blur: 15, maxZoom: 1 });
    const heatLayer2025 = L.heatLayer(heatPoints_2025, { radius: 10, blur: 15, maxZoom: 1 });
    

    // Crea GeoJSON para cada año
    const markersLayer2021 = L.geoJSON(gjson2021, {
      style: style_default,
      pointToLayer: pointToLayer_default,
      onEachFeature: onEachFeature_default
    });
    const markersLayer2022 = L.geoJSON(gjson2022, {
      style: style_default,
      pointToLayer: pointToLayer_default,
      onEachFeature: onEachFeature_default
    });
    const markersLayer2023 = L.geoJSON(gjson2023, {
      style: style_default,
      pointToLayer: pointToLayer_default,
      onEachFeature: onEachFeature_default
    });
    const markersLayer2025 = L.geoJSON(gjson2025, {
      style: style_default,
      pointToLayer: pointToLayer_default,
      onEachFeature: onEachFeature_default
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
    const capa2021 = L.layerGroup([ heatLayer2021, markersCluster2021 ]);
    const capa2022 = L.layerGroup([ heatLayer2022, markersCluster2022 ]);
    const capa2023 = L.layerGroup([ heatLayer2023, markersCluster2023 ]);
    const capa2025 = L.layerGroup([ heatLayer2025, markersCluster2025 ]);

    // Añadir capa por defecto    
    capa2025.addTo(map);
    bounds = markersLayer2025.getBounds();
    map.fitBounds(bounds);

    // Control de capas
    const baseMaps = {
      "2021": capa2021,
      "2022": capa2022,
      "2023": capa2023,
      "2025": capa2025
    };

    
    L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);
    // Función para cambiar entre heatmap y marcadores según el zoom.
    function quitar_anadir_circulos() {
      const z = map.getZoom();
      let markers, heat;
        
      if (map.hasLayer(capa2021)) {
        markers = markersCluster2021;
        heat    = heatLayer2021;
      } else if (map.hasLayer(capa2022)) {
        markers = markersCluster2022;
        heat    = heatLayer2022;
      } else if (map.hasLayer(capa2023)) {
        markers = markersCluster2023;
        heat    = heatLayer2023;
      } else if (map.hasLayer(capa2025)) {
        markers = markersCluster2025;
        heat    = heatLayer2025;
      }

      if (z >= 17) {
        if (!map.hasLayer(markers)) {
          map.addLayer(markers);
        }
        if (map.hasLayer(heat)) {
          map.removeLayer(heat);
        }
      } else {
        if (map.hasLayer(markers)) {
          map.removeLayer(markers);
        }
        if (!map.hasLayer(heat)) {
          map.addLayer(heat);
        }
      }
    }
    quitar_anadir_circulos();

    var helloPopup = L.popup().setContent('Hello World!');

    L.easyButton('fa-solid fa-circle-info', function(btn, map){
        helloPopup.setLatLng(map.getCenter()).openOn(map);
    }).addTo(map);
    
    
    



    document.getElementsByClassName("leaflet-control-layers-base")[0].children[0].addEventListener("click", function() {
      console.log(this.children[0].children[1].innerHTML);
      quitar_anadir_circulos();
      bounds = markersLayer2021.getBounds();
      map.fitBounds(bounds);


      // Actualizador de graficas
      anio = parseInt(this.children[0].children[1].innerHTML, 10)
      console.log(anio);

      // accidentes_mes
      chart_accidentes_por_mes.data.datasets[0].data = frecuencias_accidentes_mes[anio];
      chart_accidentes_por_mes.options.plugins.title.text = `Número de accidentes por mes (${anio})`;
      chart_accidentes_por_mes.update();
    
      // dia_semana
      chart_dia_semana.data.datasets[0].data = frecuencias_dia_semana[anio];
      chart_dia_semana.options.plugins.title.text = `Incidencia de accidentes por día de la semana (${anio})`;
      chart_dia_semana.update();

      // grupo_edad
      chart_grupo_edad.data.datasets[0].data = frecuencias_grupo_edad[anio];
      chart_grupo_edad.options.plugins.title.text = `Distribución de accidentes por grupos de edad (${anio})`;
      chart_grupo_edad.update();

      // sexo
      chart_sexo.data.datasets[0].data = frecuencias_sexo[anio];
      chart_sexo.options.plugins.title.text = `Distribución de accidentes por sexo (${anio})`;
      chart_sexo.update(); 

      // posible_causa
      chart_posible_causa.data.datasets[0].data = frecuencias_posible_causa[anio];
      chart_posible_causa.options.plugins.title.text = `Distribución de accidentes por posible causa (${anio})`;
      chart_posible_causa.update();

      // tipo_accidente
      chart_tipo_accidente.data.datasets[0].data = frecuencias_tipo_accidente[anio];
      chart_tipo_accidente.options.plugins.title.text = `Distribución de accidentes por tipo (${anio})`;
      chart_tipo_accidente.update();

      // clase_accidente
      chart_clase_accidente.data.datasets[0].data = frecuencias_clase_accidente[anio];
      chart_clase_accidente.options.plugins.title.text = `Distribución de accidentes por clase (${anio})`;
      chart_clase_accidente.update();
    });

    document.getElementsByClassName("leaflet-control-layers-base")[0].children[1].addEventListener("click", function() {
      console.log(this.children[0].children[1].innerHTML);
      quitar_anadir_circulos();
      bounds = markersLayer2022.getBounds();
      map.fitBounds(bounds);


      // Actualizador de graficas
      anio = parseInt(this.children[0].children[1].innerHTML, 10)
      console.log(anio);

      // accidentes_mes
      chart_accidentes_por_mes.data.datasets[0].data = frecuencias_accidentes_mes[anio];
      chart_accidentes_por_mes.options.plugins.title.text = `Número de accidentes por mes (${anio})`;
      chart_accidentes_por_mes.update();

      // dia_semana
      chart_dia_semana.data.datasets[0].data = frecuencias_dia_semana[anio];
      chart_dia_semana.options.plugins.title.text = `Incidencia de accidentes por día de la semana (${anio})`;
      chart_dia_semana.update();

      // grupo_edad
      chart_grupo_edad.data.datasets[0].data = frecuencias_grupo_edad[anio];
      chart_grupo_edad.options.plugins.title.text = `Distribución de accidentes por grupos de edad (${anio})`;
      chart_grupo_edad.update();

      //sexo
      chart_sexo.data.datasets[0].data = frecuencias_sexo[anio];
      chart_sexo.options.plugins.title.text = `Distribución de accidentes por sexo (${anio})`;
      chart_sexo.update(); 

      // posible_causa
      chart_posible_causa.data.datasets[0].data = frecuencias_posible_causa[anio];
      chart_posible_causa.options.plugins.title.text = `Distribución de accidentes por posible causa (${anio})`;
      chart_posible_causa.update();

      // tipo_accidente
      chart_tipo_accidente.data.datasets[0].data = frecuencias_tipo_accidente[anio];
      chart_tipo_accidente.options.plugins.title.text = `Distribución de accidentes por tipo (${anio})`;
      chart_tipo_accidente.update();

      // clase_accidente
      chart_clase_accidente.data.datasets[0].data = frecuencias_clase_accidente[anio];
      chart_clase_accidente.options.plugins.title.text = `Distribución de accidentes por clase (${anio})`;
      chart_clase_accidente.update();
    });

    document.getElementsByClassName("leaflet-control-layers-base")[0].children[2].addEventListener("click", function() {
      console.log(this.children[0].children[1].innerHTML);
      quitar_anadir_circulos();
      bounds = markersLayer2023.getBounds();
      map.fitBounds(bounds);
      

      // Actualizador de graficas
      anio = parseInt(this.children[0].children[1].innerHTML, 10)
      console.log(anio);

      // accidentes_mes
      chart_accidentes_por_mes.data.datasets[0].data = frecuencias_accidentes_mes[anio];
      chart_accidentes_por_mes.options.plugins.title.text = `Número de accidentes por mes (${anio})`;
      chart_accidentes_por_mes.update();

      // dia_semana
      chart_dia_semana.data.datasets[0].data = frecuencias_dia_semana[anio];
      chart_dia_semana.options.plugins.title.text = `Incidencia de accidentes por día de la semana (${anio})`;
      chart_dia_semana.update();

      // grupo_edad
      chart_grupo_edad.data.datasets[0].data = frecuencias_grupo_edad[anio];
      chart_grupo_edad.options.plugins.title.text = `Distribución de accidentes por grupos de edad (${anio})`;
      chart_grupo_edad.update();

      //sexo
      chart_sexo.data.datasets[0].data = frecuencias_sexo[anio];
      chart_sexo.options.plugins.title.text = `Distribución de accidentes por sexo (${anio})`;
      chart_sexo.update();
      
      // posible_causa
      chart_posible_causa.data.datasets[0].data = frecuencias_posible_causa[anio];
      chart_posible_causa.options.plugins.title.text = `Distribución de accidentes por posible causa (${anio})`;
      chart_posible_causa.update();

      // tipo_accidente
      chart_tipo_accidente.data.datasets[0].data = frecuencias_tipo_accidente[anio];
      chart_tipo_accidente.options.plugins.title.text = `Distribución de accidentes por tipo (${anio})`;
      chart_tipo_accidente.update();

      // clase_accidente
      chart_clase_accidente.data.datasets[0].data = frecuencias_clase_accidente[anio];
      chart_clase_accidente.options.plugins.title.text = `Distribución de accidentes por clase (${anio})`;
      chart_clase_accidente.update();
    });

    document.getElementsByClassName("leaflet-control-layers-base")[0].children[3].addEventListener("click", function() {
      console.log(this.children[0].children[1].innerHTML);
      quitar_anadir_circulos();
      bounds = markersLayer2025.getBounds();
      map.fitBounds(bounds);


      // Actualizador de graficas
      anio = parseInt(this.children[0].children[1].innerHTML, 10)
      console.log(anio);
      
      // accidentes_mes
      chart_accidentes_por_mes.data.datasets[0].data = frecuencias_accidentes_mes[anio];
      chart_accidentes_por_mes.options.plugins.title.text = `Número de accidentes por mes (${anio})`;
      chart_accidentes_por_mes.update();

      // dia_semana
      chart_dia_semana.data.datasets[0].data = frecuencias_dia_semana[anio];
      chart_dia_semana.options.plugins.title.text = `Incidencia de accidentes por día de la semana (${anio})`;
      chart_dia_semana.update();

      // grupo_edad
      chart_grupo_edad.data.datasets[0].data = frecuencias_grupo_edad[anio];
      chart_grupo_edad.options.plugins.title.text = `Distribución de accidentes por grupos de edad (${anio})`;
      chart_grupo_edad.update();

      //sexo
      chart_sexo.data.datasets[0].data = frecuencias_sexo[anio];
      chart_sexo.options.plugins.title.text = `Distribución de accidentes por sexo (${anio})`;
      chart_sexo.update();
      
      // posible_causa
      chart_posible_causa.data.datasets[0].data = frecuencias_posible_causa[anio];
      chart_posible_causa.options.plugins.title.text = `Distribución de accidentes por posible causa (${anio})`;
      chart_posible_causa.update();

    // tipo_accidente
      chart_tipo_accidente.data.datasets[0].data = frecuencias_tipo_accidente[anio];
      chart_tipo_accidente.options.plugins.title.text = `Distribución de accidentes por tipo (${anio})`;
      chart_tipo_accidente.update();

      // clase_accidente
      chart_clase_accidente.data.datasets[0].data = frecuencias_clase_accidente[anio];
      chart_clase_accidente.options.plugins.title.text = `Distribución de accidentes por clase (${anio})`;
      chart_clase_accidente.update();
    });



    // Actualizar cuando el zoom termine.
    map.on('zoomend', quitar_anadir_circulos);