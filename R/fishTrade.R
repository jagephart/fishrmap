#' Merge user data with shapefile data to get a spatial object with a very wide data socket 
#' 
#' @param  userDT A data.table returned from fishReader
#' @param  world  A spatial object returned from worldEater
#' @return A data.table containing column with line graphs to be appended to leaflet
#' @import sp data.table 
#' @export 
#' @examples 
#' someExample <- 'goes here' 

fishTrade <-function(userDT, world){
#  requireNamespace('raster', quietly = TRUE)
  requireNamespace('sp', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)

  #  `.` <- data.table::`.`
  `.` <- NULL
  iso_a3 <- NULL
  ISO_Alpha <- NULL
  Species <- NULL
  Exp_Alpha <- NULL
  spLine <- NULL
  i.Long <- NULL
  Long <- NULL
  Lat <- NULL
  i.Lat <- NULL
  
  worldDT  <- data.table::data.table(world@data);
  wCoord <- sp::coordinates(world);
  colnames(wCoord) <- c('Long', 'Lat');
  
  worldDT <- data.table::data.table(cbind(world@data, wCoord));
  
  data.table::setkey(worldDT, key = iso_a3);
  data.table::setkey(userDT, key = ISO_Alpha);
  
  spDT <- userDT[worldDT][!is.na(Species)];
  data.table::setkey(spDT, key = Exp_Alpha);
  
  mapDT <- spDT[worldDT][!is.na(Species), ];
  data.table::setkey(mapDT, key = ISO_Alpha, Exp_Alpha);

  #Create line-generating code as string; to computationally costly to do all at once
  #Also note - dateline causes weirdness with gcIntermediate (eastern side of line doesn't render), so
  #as a workaround, we draw straight lines when the diff in longitude is >= 180 degrees

  mapDT[,
    spLine := ifelse(abs(i.Long - Long) < 180, 
       paste0('gcIntermediate(c(', 
              Long, ',', 
              Lat, '), c(',
              i.Long, ',', 
              i.Lat, '), n = 50, sp = TRUE, addStartEnd=TRUE, breakAtDateLine=TRUE)'
       ), 
       paste0('SpatialLines(list(Lines(list(Line(rbind(c(', 
              Long, ',', 
              Lat, '), c(',
              i.Long, ',', 
              i.Lat, ')))), ID = "', 
              Exp_Alpha, '")),proj4string = CRS("+init=epsg:4326"))'
       )  
    )
  ];
  
  return(mapDT);
  
}