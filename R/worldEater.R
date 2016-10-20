#' Read (and, if needed, first get and extract) world file. Note: If we include shapefile with library, this may be unnecessary
#' 
#' @return A spatial object to be appended to leaflet
#' @import rgdal 
#' @export 
#' @examples 
#' someExample <- 'goes here' 

 
worldEater <- function(){
  requireNamespace('rgdal', quietly = TRUE)
  
  shapePath <- paste0(.libPaths()[1], '/fishTrade/data/worldOGR/');
  try(load(paste0(shapePath, 'world.RData')));
  if(exists('world')){
    return(world)
  } else {
    tryCatch({
      world <- rgdal::readOGR(shapePath, 'ne_50m_admin_0_countries', encoding='UTF-8');
    }, 
    error = function(e){
      dir.create(shapePath, showWarnings = FALSE, recursive = TRUE);
      
      download.file(file.path('http://www.naturalearthdata.com/http/',
                              'www.naturalearthdata.com/download/50m/cultural',
                              'ne_50m_admin_0_countries.zip'), 
                    f <- tempfile());
      unzip(f, exdir=shapePath);
      
    }, 
    finally = {
      if(!exists('world')){
        world <- rgdal::readOGR(shapePath, 'ne_50m_admin_0_countries', encoding='UTF-8');
      }
    })
    save(world, file = paste0(shapePath, 'world.RData'));
    return(world);
  }
}