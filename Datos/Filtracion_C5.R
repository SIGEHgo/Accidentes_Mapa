datos = readxl::read_excel("Datos/Sin filtrar/2025_C5/SINIESTRALIDAD 2025.xlsx")


names(datos)
names(datos) = datos[2,]
names(datos)

names(datos)[c(1, 39, 40)] = c("NUM", "LATITUD", "LONGITUD")

### Nos quedamos con los datos que estan completos 
datos = datos |> 
  dplyr::filter(!is.na(NUM),
                !is.na(ID_ENTIDAD),
                !is.na(ID_MUNICIPIO))

### Renombramos para poder trabajar donde rename(nuevo_nombre = nombre_antiguo)
datos = datos  |> 
  dplyr::rename(
    ## Variables que detallan el accidente
    EDO = ID_ENTIDAD,
    NOM_MUN = ID_MUNICIPIO,
    ANIO = AÑO,
    MES = MES,
    DIA = DIA,
    DIASEMANA = DIASEMANA,
    HORA = ID.HORA,
    MINUTOS = ID_MINUTO,
    TIPACCID = TIPACCID,
    CAUSAACCI = CAUSAACCI,
    SEXO = SEXO,
    EDAD = ID_EDAD,
    CLASE = CLASACC,
    ## Variables de heridos y muertos
    CONDMUE = CONDMUERTO,
    PASAMUE = PASAMUERTO,
    PEATMUR = PEATMUERTO,
    CICLMUE = CICLMUERTO,
    OTROMUE = OTROMUERTO,
    CONDHER = CONDHERIDO,
    PASAHER = PASAHERIDO,
    PEATONH = PEATONHERIDO,
    CICLHER = CICLHERIDO,
    OTROHER = OTROHERIDO,
    ## Extras que solicitaron añadir
    ID_OPER = `ID OPERADOR`,
    NOM_OPER = `NOMBRE DEL OPERADOR`,
    PLACAS = PLACAS,
    NOM_CON = `NOMBRE DEL CONCESIONARIO`,
    RUTA = `RUTA O NEMOTECNICA`
    )

### Pasar a numerico algunas columnas
datos = datos |> 
  dplyr::mutate(
    dplyr::across(.cols = c(ANIO, MES, DIA, HORA, MINUTOS, 
                            CONDMUE, PASAMUE, PEATMUR, CICLMUE, OTROMUE, 
                            CONDHER, PASAHER, PEATONH, CICLHER, OTROHER), .fns = as.numeric
  )
  )


### Creamos las variables de total de muertos y total de heridos
datos = datos |> 
  dplyr::mutate(
    TOT_MUERT = rowSums(cbind(CONDMUE, PASAMUE, PEATMUR, CICLMUE, OTROMUE), na.rm = T),
    TOT_HER   = rowSums(cbind(CONDHER, PASAHER, PEATONH, CICLHER, OTROHER), na.rm = T),
  ) 


### Modificamos un poco la columna de CLASE
datos = datos |> 
  dplyr::mutate(CLASE = dplyr::if_else(condition = TOT_HER > 0 & TOT_MUERT == 0, true = "No fatal", 
                                       false = dplyr::if_else(condition = TOT_MUERT > 0, true = "Fatal", false = "Sólo daños")))


### Poner 0´s
datos = datos |> 
  dplyr::mutate(dplyr::across(CONDMUE:OTROHER, ~ dplyr::if_else(is.na(.x), 0, .x)))

### Ver los detalles de las columnas extras
datos$ID_OPER |>  unique()
datos$NOM_OPER |>  unique()
datos$PLACAS |>  unique()
datos$NOM_CON |>  unique()
datos$RUTA |>  unique()


## Limpieza de ID_Oper, NOM_OPER, Placas, NOM_CON, Ruta
datos = datos |> 
  dplyr::mutate(ID_OPER = stringr::str_squish(ID_OPER),
                ID_OPER = gsub(pattern = " ", replacement = "", ID_OPER),
                
                NOM_OPER = gsub(pattern = "\n", replacement = "", x = NOM_OPER),
                NOM_OPER = stringr::str_squish(NOM_OPER),
                NOM_OPER = dplyr::if_else(condition = NOM_OPER == "SIN DATOS", true = "S/D", false = NOM_OPER),
                NOM_OPER = gsub(pattern = "/ ", replacement = "/", x = NOM_OPER),
                NOM_OPER = gsub(pattern = " /", replacement = "/", x = NOM_OPER),
                NOM_OPER = stringr::str_to_title(NOM_OPER),
                
                PLACAS = gsub(pattern = " ", replacement = "", x = PLACAS),
                PLACAS = stringr::str_squish(PLACAS),
                
                NOM_CON = gsub(pattern = "\n", replacement = "", x = NOM_CON),
                NOM_CON = stringr::str_squish(NOM_CON),
                NOM_CON = gsub(pattern = "/ ", replacement = "/", x = NOM_CON),
                NOM_CON = gsub(pattern = " /", replacement = "/", x = NOM_CON),
                NOM_CON = stringr::str_to_title(NOM_CON),
                  
                RUTA = gsub(pattern = "\n", replacement = "", x = RUTA),
                RUTA = gsub(pattern = "/ ", replacement = "/", x = RUTA),
                RUTA = gsub(pattern = " /", replacement = "/", x = RUTA),
                RUTA = stringr::str_squish(RUTA))

# Ya homologados corregimos detalles

datos = datos |> 
  dplyr::mutate(ID_OPER = gsub(pattern = "/", replacement = " / ", x = ID_OPER),
                ID_OPER = gsub(pattern = "S / D", replacement = "S/D", x = ID_OPER),
                ID_OPER = gsub(pattern = "\\.0$", replacement = "", x = ID_OPER),
                
                NOM_OPER = gsub(pattern = "/", replacement = " / ", x = NOM_OPER),
                NOM_OPER = gsub(pattern = "S / D", replacement = "S/D", x = NOM_OPER),
                
                PLACAS = gsub(pattern = "/", replacement = " / ", x = PLACAS),
                PLACAS = gsub(pattern = "S / D", replacement = "S/D", x = PLACAS),
                
                NOM_CON = gsub(pattern = "/", replacement = " / ", x = NOM_CON),
                NOM_CON = gsub(pattern = "S / D", replacement = "S/D", x = NOM_CON),
                
                RUTA = gsub(pattern = "/", replacement = " / ", x = RUTA),
                RUTA = gsub(pattern = "S / D", replacement = "S/D", x = RUTA)
                )
                


#### Limpieza de coordenadas
datos = datos |> 
  dplyr::mutate(LATITUD = gsub(pattern = "\n", replacement = "", x = LATITUD),
                LATITUD = gsub(pattern = ",", replacement = ".", x = LATITUD),
                LATITUD = stringr::str_squish(LATITUD),
                LATITUD = as.numeric(LATITUD),
                LONGITUD = gsub(pattern = "\n", replacement = "", x = LONGITUD),
                LONGITUD = gsub(pattern = ",", replacement = ".", x = LONGITUD),
                LONGITUD = stringr::str_squish(LONGITUD),
                LONGITUD = as.numeric(LONGITUD))


#### Crear GEOJSON
mun = sf::read_sf("../../Importantes_documentos_usar/Municipios/municipiosjair.shp")

datos = datos |> 
  dplyr::mutate(PLACID = paste0(ID_OPER, "-", PLACAS)) |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS) |> 
  sf::st_as_sf(coords = c("LONGITUD", "LATITUD"), crs = sf::st_crs(x = mun))
  
sf::st_write(datos, "Datos/Filtrados/2025_C5/2025.geojson", driver = "GeoJSON", delete_dsn = T)
  


placas = datos |> 
  sf::st_drop_geometry() |> 
  dplyr::group_by(PLACAS) |> 
  dplyr::summarise(conteo = dplyr::n()) |> 
  dplyr::ungroup() |> 
  dplyr::filter(conteo > 1) |> 
  dplyr::arrange(conteo, PLACAS)


### Verificar si alguno esta fuera
dentro = sf::st_intersects(x = mun, y = datos)
dentro = dentro |>  unlist()

afuera = datos[-dentro,]
datos_dentro = datos[-which(datos$NUM %in% afuera$NUM),]

sf::st_write(datos_dentro, "Datos/Filtrados/2025_C5/2025_dentro", driver = "GeoJSON", rewrite=TRUE)
