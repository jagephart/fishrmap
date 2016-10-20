#' Parse text strings. Why bother? Because we do.call it in fishingLines 
#' 
#' @param  someStr  A character string that, when parsed, returns an object
#' @return An object (for our purposes, a single SpatialLine or gcIntermediate line, but may use elsewhere)
#' @import raster geosphere leaflet
#' @export 
#' @examples 
#' someExample <- 'goes here' 


parser <- function(someStr){
  requireNamespace('raster', quietly = TRUE)
  requireNamespace('geosphere', quietly = TRUE)
  requireNamespace('leaflet', quietly = TRUE)
  
  y <- eval(parse(text = someStr))
  return(y)  
}
