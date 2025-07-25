#El presente código busca dar una estructura base para generar los códigos de los puntos del geojson
#para el mapaweb, para ello se utilizó los datos recabados hasta junio del 2025.

#Siempre que usted encuentre un "[AJUSTAR]" al inicio del comentario  quiere decir que el 
#fragmento de código subsecuente debe ser analizado y, de ser necesario, adecuarlo a las
#rutas, número de columnas, número de filas o similares de su situación

library(sf)
library(stringr)
library(purrr)

#[AJUSTAR] Procedemos a abrir el .xlsx con los siniestros
Data=openxlsx::read.xlsx("../SINIESTRALIDAD 2025 (2).xlsx")

#[AJUSTAR] En caso de que el xlsx tenga filas vacías hacia el final, tomamos solo las primeras 
#filas con datos  y quitemos las primera tres por que al chile no sirven y solo estorban
Data=Data[4:211,]

#Primero arreglamos y renombramos las columnas que ocuparemos

#[AJUSTAR] Primero las coordenadas, en este caso había coordenadas con espacios demás, comas en 
#lugar de puntos y una con un \n al inicio
Data$X38=gsub("\n","",Data$X38)
Data$X39=gsub("\n","",Data$X39)
Data$X38=gsub(",",".",Data$X38)
Data$X39=gsub(",",".",Data$X39)
Data$X38=str_squish(Data$X38)
Data$X39=str_squish(Data$X39)
Data$X38=as.numeric(Data$X38)
Data$X39=as.numeric(Data$X39)

#[AJUSTAR] Creamos un nuevo sf con la columna geometry, en este caso X39 es longitud y X38 latitud
DatosF=st_as_sf(Data, coords = c("X39", "X38"), crs = 4326)

#[AJUSTAR] Seguimos arreglando ahora las variables que detallan el accidente
colnames(DatosF)[1]="ID"
colnames(DatosF)[2]="EDO"
colnames(DatosF)[3]="NOM_MUN"
colnames(DatosF)[4]="ANIO"
DatosF$ANIO=as.numeric(DatosF$ANIO)
colnames(DatosF)[5]="MES"
DatosF$MES=as.numeric(DatosF$MES)
colnames(DatosF)[6]="DIA"
DatosF$DIA=as.numeric(DatosF$DIA)
colnames(DatosF)[7]="DIASEMANA"
colnames(DatosF)[8]="HORA"
DatosF$HORA=as.numeric(DatosF$HORA)
colnames(DatosF)[9]="MINUTOS"
DatosF$MINUTOS=as.numeric(DatosF$MINUTOS)
colnames(DatosF)[12]="TIPACCID"
colnames(DatosF)[19]="CAUSAACCI"
colnames(DatosF)[21]="SEXO"
colnames(DatosF)[24]="EDAD"
colnames(DatosF)[36]="CLASE"

#[AJUSTAR] Ahora las variables de heridos y muertos
colnames(DatosF)[26]="CONDMUE"
DatosF$CONDMUE=as.numeric(DatosF$CONDMUE)
colnames(DatosF)[28]="PASAMUE"
DatosF$PASAMUE=as.numeric(DatosF$PASAMUE)
colnames(DatosF)[30]="PEATMUE"
DatosF$PEATMUE=as.numeric(DatosF$PEATMUE)
colnames(DatosF)[32]="CICLMUE"
DatosF$CICLMUE=as.numeric(DatosF$CICLMUE)
colnames(DatosF)[34]="OTROMUE"
DatosF$OTROMUE=as.numeric(DatosF$OTROMUE)
colnames(DatosF)[27]="CONDHER"
DatosF$CONDHER=as.numeric(DatosF$CONDHER)
colnames(DatosF)[29]="PASAHER"
DatosF$PASAHER=as.numeric(DatosF$PASAHER)
colnames(DatosF)[31]="PEATONH"
DatosF$PEATONH=as.numeric(DatosF$PEATONH)
colnames(DatosF)[33]="CICLHER"
DatosF$CICLHER=as.numeric(DatosF$CICLHER)
colnames(DatosF)[35]="OTROHER"
DatosF$OTROHER=as.numeric(DatosF$OTROHER)

#Creamos las variables de total de muertos y total de heridos

DatosF$TOT_MUERT=DatosF |> dplyr::select(CONDMUE,PASAMUE,PEATMUE,CICLMUE,OTROMUE) |> st_drop_geometry() |> rowSums(na.rm = T)
DatosF$TOT_HER=DatosF |> dplyr::select(CONDHER,PASAHER,PEATONH,CICLHER,OTROHER) |> st_drop_geometry() |> rowSums(na.rm = T)
DatosF=DatosF |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS)

#Que queden bonitas 
DatosF$TIPACCID=DatosF$TIPACCID |> stringr::str_squish()
DatosF$CONDMUE[is.na(DatosF$CONDMUE)]=0
DatosF$CONDHER[is.na(DatosF$CONDHER)]=0

DatosF$CLASE[DatosF$CLASE=='Sólo daños' & DatosF$TOT_HER>0 & DatosF$TOT_MUERT==0]='No fatal'


DatosF=DatosF |> 
  dplyr::mutate(CLASE=ifelse(
    TOT_HER>0 & TOT_MUERT==0,'No fatal',
    ifelse(TOT_MUERT>0,"Fatal",'Sólo daños')
  ))

#Seleccionamos las variables de interés para guardarlas

tabla = DatosF |> dplyr::select(ID,TIPACCID, CLASE, ANIO, MES, DIA, HORA, MINUTOS, EDO,
                                NOM_MUN, SEXO, EDAD, CAUSAACCI, DIASEMANA,CONDMUE,PASAMUE,
                                PEATMUE,CICLMUE,OTROMUE,CONDHER,PASAHER,PEATONH,CICLHER,OTROHER,TOT_MUERT,TOT_HER) |>
  dplyr::arrange(ANIO, MES, DIA, HORA, MINUTOS)

colnames(tabla) = c("ID","TIPACCID", "CLASE", "ANIO,", "MES", "DIA", "HORA", "MINUTOS", "EDO", 
                    "NOM_MUN", "SEXO", "EDAD", "CAUSAACCI", "DIASEMANA" ,
                    "CONDMUE","PASAMUE","PEATMUE","CICLMUE","OTROMUE","CONDHER","PASAHER","PEATONH",
                    "CICLHER","OTROHER","TOT_MUERT","TOT_HER","geometry")

#[AJUSTAR] Esto es lo que habrá que copiar para el copy.js
sf::st_write(tabla, "Accidentes_2025_Junio.geojson", driver = "GeoJSON",rewrite=TRUE)
sf::write_sf(tabla, "Accidentes_2025_Junio.shp",rewrite=TRUE)

