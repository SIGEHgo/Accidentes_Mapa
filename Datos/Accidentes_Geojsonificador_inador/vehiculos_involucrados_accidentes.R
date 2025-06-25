library(sf)
original_2021=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/2021_shp/ATUS_2021/conjunto_de_datos/BASE MUNICIPAL_ACCIDENTES DE TRANSITO GEORREFERENCIADOS_2021.shp")
geojson_2021=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2021/2021.geojson")

original_2022=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/2022_shp/conjunto_de_datos/BASE MUNICIPAL_ACCIDENTES DE TRANSITO GEORREFERENCIADOS_2022.shp")
geojson_2022=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2022/2022.geojson")

original_2023=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/2023_shp/conjunto_de_datos/BASE MUNICIPAL_ACCIDENTES DE TRANSITO GEORREFERENCIADOS_2023.shp")
geojson_2023=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2023/2023.geojson")

original_2021$TOTMUERTOS=original_2021$TOTMUERTOS+original_2021$CONDMUERTO
original_2022$TOTMUERTOS=original_2022$TOTMUERTOS+original_2022$CONDMUERTO
#original_2023$TOTMUERTOS=original_2023$TOTMUERTOS+original_2023$CONDMUERTO
geojson_2021_2=original_2021 |> 
  dplyr::filter(EDO==13) |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS) 

geojson_2021_2$vehiculos_invol=apply(geojson_2021_2 |> st_drop_geometry() |> dplyr::select(AUTOMOVIL:BICICLETA),MARGIN = 1,FUN=function(row){
  names_reng=names(row)
  cadena_final=''
  for(id in 1:12){
    val=row[id]
    if(val!=0){
      cadena_final=paste0(cadena_final,val," ",names_reng[id]," ")
    }
  }
  return(cadena_final)
})
identical(geojson_2021_2 |> dplyr::select(ANIO,MES,DIA,HORA,MINUTOS) |> st_drop_geometry(),
          geojson_2021 |> dplyr::select(ANIO:MINUTOS) |> st_drop_geometry())

geojson_2021$vehi_invol=geojson_2021_2$vehiculos_invol
geojson_2021$TOT_MUERT=geojson_2021_2$TOTMUERTOS
geojson_2021$TOT_HER=geojson_2021_2$TOTHERIDOS
geojson_2021$CONDMUE=geojson_2021_2$CONDMUERTO
geojson_2021$CONDHER=geojson_2021_2$CONDHERIDO

########
geojson_2022_2=original_2022 |> 
  dplyr::filter(EDO==13) |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS) 

geojson_2022_2$vehiculos_invol=apply(geojson_2022_2 |> st_drop_geometry() |> dplyr::select(AUTOMOVIL:BICICLETA),MARGIN = 1,FUN=function(row){
  names_reng=names(row)
  cadena_final=''
  for(id in 1:12){
    val=row[id]
    if(val!=0){
      cadena_final=paste0(cadena_final,val," ",names_reng[id]," ")
    }
  }
  return(cadena_final)
})
identical(geojson_2022_2 |> dplyr::select(ANIO,MES,DIA,HORA,MINUTOS) |> st_drop_geometry(),
          geojson_2022 |> dplyr::select(ANIO:MINUTOS) |> st_drop_geometry())

geojson_2022$vehi_invol=geojson_2022_2$vehiculos_invol
geojson_2022$TOT_MUERT=geojson_2022_2$TOTMUERTOS
geojson_2022$TOT_HER=geojson_2022_2$TOTHERIDOS
geojson_2022$CONDMUE=geojson_2022_2$CONDMUERTO
geojson_2022$CONDHER=geojson_2022_2$CONDHERIDO
########
geojson_2023_2=original_2023 |> 
  dplyr::filter(EDO==13) |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS) 

geojson_2023_2$vehiculos_invol=apply(geojson_2023_2 |> st_drop_geometry() |> dplyr::select(AUTOMOVIL:BICICLETA),MARGIN = 1,FUN=function(row){
  names_reng=names(row)
  cadena_final=''
  for(id in 1:12){
    val=row[id]
    if(val!=0){
      cadena_final=paste0(cadena_final,val," ",names_reng[id]," ")
    }
  }
  return(cadena_final)
})
identical(geojson_2023_2|> dplyr::filter(ID!='1118634-999-4') |> dplyr::select(ANIO,MES,DIA,HORA,MINUTOS) |> st_drop_geometry(),
          geojson_2023 |> dplyr::select(ANIO:MINUTOS) |> st_drop_geometry())
geojson_2023_2=geojson_2023_2|>
  dplyr::filter(ID!='1118634-999-4') 
geojson_2023$vehi_invol=geojson_2023_2$vehiculos_invol
geojson_2023$TOT_MUERT=geojson_2023_2$TOTMUERTOS
geojson_2023$TOT_HER=geojson_2023_2$TOTHERIDOS
geojson_2023$CONDMUE=geojson_2023_2$CONDMUERTO
geojson_2023$CONDHER=geojson_2023_2$CONDHERIDO
sf::st_write(geojson_2021 |> dplyr::relocate(geometry,.after = dplyr::last_col()),"../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2021/2021_b.geojson",append = F)
sf::st_write(geojson_2022 |> dplyr::relocate(geometry,.after = dplyr::last_col()),"../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2022/2022_b.geojson",append = F)
sf::st_write(geojson_2023 |> dplyr::relocate(geometry,.after = dplyr::last_col()),"../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2023/2023_b.geojson",append = F)


##############A partir de aquí es 2025
setwd("../../../")
c5_geojson=read_sf("../../../../Downloads/2025.geojson")#read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2025_C5/2025.geojson")
c5_2025=sf::read_sf("../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2025_C5/2025_C5/siniestros_bien.shp")

c5_2025$TOT_MUERT=c5_2025 |> dplyr::select(CONDMUE,PASAMUE,PEATMUE,CICLMUE,OTROMUE) |> st_drop_geometry() |> rowSums(na.rm = T)
c5_2025$TOT_HER=c5_2025 |> dplyr::select(CONDHER,PASAHER,PEATONH,CICLHER,OTROHER) |> st_drop_geometry() |> rowSums(na.rm = T)
c5_geojson=merge(c5_geojson,c5_2025 |> dplyr::select(ID,TOT_MUERT,TOT_HER,CONDMUE,CONDHER) |> st_drop_geometry(),by='ID',all.x=T)
c5_geojson=c5_geojson |> 
  dplyr::arrange(ANIO,MES,DIA,HORA,MINUTOS)
c5_2025=c5_2025 |> 
  dplyr::arrange(AÑO,MES,DIA,ID_HORA,ID_MINU)
(c5_2025$X-
    sf::st_coordinates(c5_geojson$geometry)[,1]) |> sort() |> max()
c5_geojson$CONDMUE=c5_2025$CONDMUE  
c5_geojson$CONDHER=c5_2025$CONDHER

c5_geojson$TIPACCID=c5_geojson$TIPACCID |> stringr::str_squish()
c5_geojson$CONDMUE[is.na(c5_geojson$CONDMUE)]=0
c5_geojson$CONDHER[is.na(c5_geojson$CONDHER)]=0
sf::st_write(c5_geojson |> dplyr::relocate(geometry,.after = dplyr::last_col())
             ,"../../../Jair/Repositorios/Accidentes_Mapa/Datos/Filtrados/2025_C5/2025_a.geojson",append = F)
c5_geojson$CLASE[c5_geojson$CLASE=='Sólo daños' & c5_geojson$TOT_HER>0 & c5_geojson$TOT_MUERT==0]='No fatal'


c5_geojson=c5_geojson |> 
  dplyr::mutate(CLASE=ifelse(
    TOT_HER>0 & TOT_MUERT==0,'No fatal',
    ifelse(TOT_MUERT>0,"Fatal",'Sólo daños')
  ))

