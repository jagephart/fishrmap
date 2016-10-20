#' Redraw trade lines 
#' 
#' @param spLines Vector of SpatialLine/gcIntermediate functions populated in fishTrade()
#' @return An object of class 'SpatialLinesDataFrame' to be appended to leaflet
#' @import raster foreach leaflet geosphere
#' @export 
#' @examples 
#' someExample <- 'goes here' 


fishingLines <- function(spLines){
  requireNamespace('foreach', quietly = TRUE)
  requireNamespace('raster', quietly = TRUE)
  requireNamespace('geosphere', quietly = TRUE)
  requireNamespace('leaflet', quietly = TRUE)
  `%do%` <- foreach::`%do%`
  lst <- foreach::foreach(i = 1:length(spLines)) %do% parser(spLines[i]);
#  print(lst)
  sln <- do.call(raster::bind, lst);
  
  return(sln);

}  