#' Merge user data with shapefile data to get a spatial object with a very wide data socket 
#' 
#' @param  userDT A data.table returned from fishReader
#' @param  world  A spatial object returned from worldEater
#' @param spLines Vector of SpatialLine/gcIntermediate functions populated in fishTrade()
#' @return An object of class 'SpatialLinesDataFrame' to be appended to leaflet
#' @import raster data.table 
#' @export 
#' @examples 
#' someExample <- 'goes here' 



joinFishWorld <- function(userDT, world){
  requireNamespace('raster', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)
  
  reshpDT <- data.table::dcast(
    userDT[,.(Year, Species, ISO_Alpha, Exp_Alpha, value)],  
    ISO_Alpha ~ Year + Species + Exp_Alpha, 
    value.var = "value"
  )
  
  worldData <- raster::merge(world, reshpDT, by.x = "iso_a3", by.y = "ISO_Alpha")

  return(worldData)
}