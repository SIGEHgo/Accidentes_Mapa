setwd("C:/Users/SIGEH/Desktop/Lalo/Gob/Proyectos")

### 2025

datos = sf::read_sf("Accidentes_Mapa/Datos/Sin filtrar/2025_C5/siniestros_bien.shp")
datos$EDO = "Hidalgo"
datos = datos |> dplyr::select(TIPACCI, CLASACC, AÑO, MES, DIASEMA , DIA, ID_HORA, ID_MINU, EDO, ID_MUNI, SEXO, ID_EDAD, CAUSAAC) |>
  dplyr::arrange(AÑO, MES, DIA, ID_HORA, ID_MINU)
colnames(datos) = c("TIPACCID", "CLASE", "ANIO", "MES", "DIASEMANA" , "DIA", "HORA", "MINUTOS", "EDO", "NOM_MUN", "SEXO", "EDAD", "CAUSAACCI", "geometry")

accidentes_por_mes = datos |> dplyr::select(MES) |> sf::st_drop_geometry() |>
  dplyr::group_by(MES) |>
  dplyr::summarise(NumeroAccidentes = dplyr::n())
colnames(accidentes_por_mes) = c("Mes", "Frecuencia_2025")
write.csv(accidentes_por_mes, "Accidentes_Mapa/Datos/Graficas/accidentes_por_mes.csv", fileEncoding = "UTF-8", row.names = F)


corte = seq(15, 100, by = 5)
corte = c(15,30,60,100)
labels = paste(corte[-length(corte)], corte[-1] - 1, sep = "-")
datos$grupo_edad = cut(as.numeric(datos$EDAD), breaks = corte, labels = labels, right = FALSE)



grupo_edad = datos |>
  dplyr::select(grupo_edad) |> 
  sf::st_drop_geometry() |>
  dplyr::group_by(grupo_edad) |>
  dplyr::summarise(conteo = dplyr::n())
colnames(grupo_edad) = c("Grupo_Edad", "Frecuencia_2025")
write.csv(grupo_edad, "Accidentes_Mapa/Datos/Graficas/grupo_edad.csv", fileEncoding = "UTF-8", row.names = F)


sexo = datos |>
  dplyr::select(SEXO) |>
  sf::st_drop_geometry() |>
  dplyr::group_by(SEXO) |>
  dplyr::summarise(conteo = dplyr::n())
colnames(sexo) = c("Sexo", "Frecuencia_2025")
write.csv(sexo, "Accidentes_Mapa/Datos/Graficas/sexo.csv", fileEncoding = "UTF-8", row.names = F)



dia_semana = datos |>
  dplyr::select(DIASEMANA) |>
  sf::st_drop_geometry() |>
  dplyr::group_by(DIASEMANA) |>
  dplyr::summarise(conteo = dplyr::n())
colnames(dia_semana) = c("Dia_Semana", "Frecuencia_2025")

dia_semana = dia_semana[c(3,4,5,2,7,6,1), ]
write.csv(dia_semana, "Accidentes_Mapa/Datos/Graficas/dia_semana.csv", fileEncoding = "UTF-8", row.names = F)



tipo_accidente = datos |>
  dplyr::select(TIPACCID) |>
  sf::st_drop_geometry() |>
  dplyr::group_by(TIPACCID) |>
  dplyr::summarise(conteo = dplyr::n())

colnames(tipo_accidente) = c("Tipo_Accidente", "Frecuencia_2025")
tipo_accidente$Tipo_Accidente = gsub("\\s+", " ", tipo_accidente$Tipo_Accidente)
write.csv(tipo_accidente, "Accidentes_Mapa/Datos/Graficas/tipo_accidente.csv", fileEncoding = "UTF-8", row.names = F)


municipios_accidente = datos |>
  dplyr::select(NOM_MUN) |> sf::st_drop_geometry() |>
  dplyr::group_by(NOM_MUN) |> dplyr::summarise(conteo = dplyr::n())

municipios_accidente = municipios_accidente[order(municipios_accidente$conteo, decreasing = T),]
municipios_accidente = municipios_accidente[c(1:5),]
colnames(municipios_accidente) = c("Municipio", "Frecuencia_2025")
write.csv(municipios_accidente, "Accidentes_Mapa/Datos/Graficas/municipios_accidente.csv", fileEncoding = "UTF-8", row.names = F)



posible_causa = datos |>
  dplyr::select(CAUSAACCI) |> sf::st_drop_geometry() |>
  dplyr::group_by(CAUSAACCI) |> dplyr::summarise(conteo = dplyr::n())
colnames(posible_causa) = c("Posible_causa", "Frecuencia_2025")
write.csv(posible_causa, "Accidentes_Mapa/Datos/Graficas/posible_causa.csv", fileEncoding = "UTF-8", row.names = F)


clase = datos |> dplyr::select(CLASE) |> sf::st_drop_geometry() |>
  dplyr::group_by(CLASE) |> dplyr::summarise(conteo = dplyr::n())

colnames(clase) = c("Clase", "Frecuencia_2025")
write.csv(clase, "Accidentes_Mapa/Datos/Graficas/clase.csv", fileEncoding = "UTF-8", row.names = F)



###################
##### General #####
###################

setwd("C:/Users/SIGEH/Desktop/Lalo/Gob/Proyectos")

archivos = list.files("Accidentes_Mapa/Datos/Sin filtrar/", full.names = T, recursive = T, pattern = "\\.shp$")
archivos = archivos[-length(archivos)]

anios = gsub(x = basename(archivos), pattern = "BASE MUNICIPAL_ACCIDENTES DE TRANSITO GEORREFERENCIADOS_", replacement = "")
anios = gsub(x = anios, pattern = ".shp", replacement = "")

# Abrimos archivos previos
accidentes = read.csv("Accidentes_Mapa/Datos/Graficas/accidentes_por_mes.csv")
edad = read.csv("Accidentes_Mapa/Datos/Graficas/grupo_edad.csv")
sexo = read.csv("Accidentes_Mapa/Datos/Graficas/sexo.csv")
dia_semana = read.csv("Accidentes_Mapa/Datos/Graficas/dia_semana.csv")
tipo_accidente = read.csv("Accidentes_Mapa/Datos/Graficas/tipo_accidente.csv")
posible_causa = read.csv("Accidentes_Mapa/Datos/Graficas/posible_causa.csv")
clase = read.csv("Accidentes_Mapa/Datos/Graficas/clase.csv")

sexo_correcion = function(str) {
  return(switch(as.character(str),
                "1" = "Se fugó",
                "2" = "Hombre",
                "3" = "Mujer",
                str  # valor por defecto si no hay coincidencia
  ))
}
dia_semanal = function(str) {
  return(switch(as.character(str),
                "1" = "Lunes",
                "2" = "Martes",
                "3" = "Miércoles",
                "4" = "Jueves",
                "5" = "Viernes",
                "6" = "Sábado",
                "7" = "Domingo",
                str  # valor por defecto si no hay coincidencia
  ))
}
mes = function(str) {
  return(switch(as.character(str),
                "1" = "Enero",
                "2" = "Febrero",
                "3" = "Marzo",
                "4" = "Abril",
                "5" = "Mayo",
                "6" = "Junio",
                "7" = "Julio",
                "8" = "Agosto",
                "9" = "Septiembre",
                "10" = "Octubre",
                "11" = "Noviembre",
                "12" = "Diciembre",
                str  # valor por defecto si no hay coincidencia
  ))
}
tipaccid_correcion = function(str) {
  return(switch(as.character(str),
                "0" = "Certificado cero",
                "1" = "Colisión con vehículo automotor",
                "2" = "Colisión con peatón (atropellamiento)",
                "3" = "Colisión con animal",
                "4" = "Colisión con objeto fijo",
                "5" = "Volcadura",
                "6" = "Caída de pasajero",
                "7" = "Salida del camino",
                "8" = "Incendio",
                "9" = "Colisión con ferrocarril",
                "10" = "Colisión con motocicleta",
                "11" = "Colisión con ciclista",
                "12" = "Otro",
                str  # valor por defecto si no hay coincidencia
  ))
}
causaacci_correcion = function(str) {
  return(switch(as.character(str),
                "1" = "Conductor",
                "2" = "Peatón o pasajero",
                "3" = "Falla del vehículo",
                "4" = "Mala condición del camino",
                "5" = "Otra",
                str  # valor por defecto si no hay coincidencia
  ))
}
clase_correcion = function(str) {
  return(switch(as.character(str),
                "1" = "Fatal",
                "2" = "No fatal",
                "3" = "Sólo daños",
                str  # valor por defecto si no hay coincidencia
  ))
}



for (i in seq_along(anios)) {
  datos = sf::read_sf(archivos[i])
  datos = datos |> sf::st_drop_geometry() |> dplyr::filter(EDO == 13) 
  
  ### Accidentes por mes
  accidentes_por_mes = datos |> dplyr::select(MES)|>
    dplyr::group_by(MES) |> dplyr::summarise(NumeroAccidentes = dplyr::n())
  
  colnames(accidentes_por_mes) = c("Mes", paste0("Frecuencia_", anios[i]))
  accidentes = merge(x = accidentes, y = accidentes_por_mes, by = "Mes", all.x = T, all.y = T)
  
  
  ### Grupo de Edad
  datos$EDAD[datos$EDAD %in% c(0,99)] = "Sin dato"
  
  corte = c(15,30,60,100)
  labels = paste(corte[-length(corte)], corte[-1] - 1, sep = "-")
  datos$grupo_edad = cut(as.numeric(datos$EDAD), breaks = corte, labels = labels, right = FALSE)
  
  grupo_edad = datos |> dplyr::select(grupo_edad) |> 
    dplyr::group_by(grupo_edad) |> dplyr::summarise(conteo = dplyr::n())
  colnames(grupo_edad) = c("Grupo_Edad", paste0("Frecuencia_", anios[i]))
  edad = merge(x = edad, y = grupo_edad, by = "Grupo_Edad", all.x = T, all.y = T )
  
  
  ### Sexo
  datos$SEXO = sapply(datos$SEXO, sexo_correcion, simplify = T, USE.NAMES = F)
  s = datos |> dplyr::select(SEXO) |>
    dplyr::group_by(SEXO) |> dplyr::summarise(conteo = dplyr::n())
  colnames(s) = c("Sexo", paste0("Frecuencia_", anios[i]))
  sexo = merge(x = sexo, y = s, by = "Sexo", all.x = T, all.y = T)
  
  
  ### Dia de la semana
  datos$DIASEMANA = sapply(datos$DIASEMANA, dia_semanal, simplify = T, USE.NAMES = F)
  day_week = datos |> dplyr::select(DIASEMANA) |>
    dplyr::group_by(DIASEMANA) |> dplyr::summarise(conteo = dplyr::n())
  colnames(day_week) = c("Dia_Semana", paste0("Frecuencia_", anios[i]))
  dia_semana = merge(x = dia_semana, y = day_week, by = "Dia_Semana", all.x = T, all.y = T )
  
  
  ### Tipo de Accidente
  datos$TIPACCID = sapply(datos$TIPACCID, tipaccid_correcion, simplify = T, USE.NAMES = F)
  tipa = datos |>
    dplyr::select(TIPACCID) |>
    sf::st_drop_geometry() |>
    dplyr::group_by(TIPACCID) |>
    dplyr::summarise(conteo = dplyr::n())
  colnames(tipa) = c("Tipo_Accidente", paste0("Frecuencia_", anios[i]))
  tipo_accidente = merge(x = tipo_accidente, y = tipa, by = "Tipo_Accidente", all.x = T, all.y = T)
  
  ### Posible Causa
  datos$CAUSAACCI = sapply(datos$CAUSAACCI, causaacci_correcion, simplify = T, USE.NAMES = F)
  po = datos |> dplyr::select(CAUSAACCI) |> dplyr::group_by(CAUSAACCI) |>
    dplyr::summarise(conteo = dplyr::n())
  colnames(po) = c("Posible_causa", paste0("Frecuencia_", anios[i]))
  posible_causa = merge(x = posible_causa, y = po, by = "Posible_causa", all.x = T, all.y = T)
  
  
  ### Clase de accidente
  datos$CLASE = sapply(datos$CLASE, clase_correcion, simplify = T, USE.NAMES = F)
  c = datos |> dplyr::select(CLASE) |> 
    dplyr::group_by(CLASE) |> dplyr::summarise(conteo = dplyr::n())
  
  colnames(c) = c("Clase", paste0("Frecuencia_", anios[i]))
  clase = merge(x = clase, y = c, by = "Clase", all.x = T, all.y = T)
}

### Accidentes por mes
accidentes = accidentes |> dplyr::select(Mes, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
accidentes$Mes = sapply(accidentes$Mes, mes, simplify = T, USE.NAMES = F)
accidentes[is.na(accidentes)] = 0
write.csv(accidentes, "Accidentes_Mapa/Datos/Graficas/accidentes_por_mes.csv", fileEncoding = "UTF-8", row.names = F)

### Grupo de Edad
edad = edad |> dplyr::select(Grupo_Edad, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
edad[is.na(edad)] = 0
write.csv(edad, "Accidentes_Mapa/Datos/Graficas/grupo_edad.csv", fileEncoding = "UTF-8", row.names = F)

### Sexo
sexo = sexo |> dplyr::select(Sexo, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
sexo[is.na(sexo)] = 0
write.csv(sexo, "Accidentes_Mapa/Datos/Graficas/sexo.csv", fileEncoding = "UTF-8", row.names = F)

### Dia de la semana
dia_semana = dia_semana |> dplyr::select(Dia_Semana, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
dia_semana = dia_semana[c(3, 4, 5, 2, 7, 6, 1), ]
dia_semana[is.na(dia_semana)] = 0
write.csv(dia_semana, "Accidentes_Mapa/Datos/Graficas/dia_semana.csv", fileEncoding = "UTF-8", row.names = F)

### Tipo de Accidente
tipo_accidente = tipo_accidente |> dplyr::select(Tipo_Accidente, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025) 
tipo_accidente[is.na(tipo_accidente)] = 0
write.csv(tipo_accidente, "Accidentes_Mapa/Datos/Graficas/tipo_accidente.csv", fileEncoding = "UTF-8", row.names = F)

### Posible Causa
posible_causa = posible_causa |> dplyr::select(Posible_causa, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
posible_causa[is.na(posible_causa)]  = 0
write.csv(posible_causa, "Accidentes_Mapa/Datos/Graficas/posible_causa.csv", fileEncoding = "UTF-8", row.names = F)


### Clase de accidente
clase = clase |> dplyr::select(Clase, Frecuencia_2021:Frecuencia_2023, Frecuencia_2025)
clase[is.na(clase)] = 0
write.csv(clase, "Accidentes_Mapa/Datos/Graficas/clase.csv", fileEncoding = "UTF-8", row.names = F)

