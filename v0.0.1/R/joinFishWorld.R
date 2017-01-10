#' Merge user data with shapefile data to get a spatial object with a very wide data socket 
#' 
#' @param  userDT A data.table returned from fishReader
#' @param  world  A spatial object returned from worldEater
#' @return An object of class 'SpatialLinesDataFrame' to be appended to leaflet
#' @importFrom raster merge 
#' @import data.table 
#' @export 
#' @examples 
#' someExample <- 'goes here' 



joinFishWorld <- function(userDT, world){
  requireNamespace('raster', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)

  #  `.` <- data.table::`.`
  `.` <- NULL
  ISO_Alpha <- NULL
  TotVal <- NULL
  value <- NULL
  Year <- NULL
  Species <- NULL
  
##Previous method split for each country... may be unnecessary, should just aggregate 
#  reshpDT <- data.table::dcast(
#    userDT[,.(Year, Species, ISO_Alpha, Exp_Alpha, value)],  
#    ISO_Alpha ~ Year + Species + Exp_Alpha, 
#    value.var = "value"
#  )
  
  aggDT <- userDT[,.(TotVal = sum(value)), by=c('ISO_Alpha', 'Species', 'Year')]
  
  reshpDT <- data.table::dcast(
    aggDT[,.(Year, Species, ISO_Alpha, TotVal)],  
    ISO_Alpha ~ Year + Species, 
    value.var = "TotVal"
  )
  
  
  worldData <- raster::merge(world, reshpDT, by.x = "iso_a3", by.y = "ISO_Alpha")

  return(worldData)
}