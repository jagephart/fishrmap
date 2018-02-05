#' Call visualization function
#' 
#' @param userdata A string path to the file containing fishery data
#' @param import Character string name of column with three-character or -digit ISO code of country importing fish
#' @param export Character string name of column with three-character or -digit ISO code of country exporting fish
#' @param species Character string name of column with fish species names
#' @param value Character string name of column with value of trade
#' @param year Character string name of column with year
#' @param iso Type of ISO country identifier used in "import" and "export" columns - either "character" or "numeric" 
#' @return TBD 
#' @import shiny data.table
#' @importFrom jsonlite toJSON
#' @importFrom jsonlite fromJSON
#' @export 
#' @examples 
#' someExample <- 'goes here' 

fishRmap <- function(userdata, import = 'Import', export = 'Export', species = 'Species', value = 'value', year = 'Year', iso = 'numeric', importOnly = FALSE, exportOnly = FALSE){
  requireNamespace('shiny', quietly = TRUE)
  requireNamespace('jsonlite', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)
  
  
  #Test datasets
  # userdata <- 'c:/users/andrea/documents/fishdata.txt'
  # userdata <- 'c:/users/andrea/documents/github/fishrmap/inst/rawdata/species_trade.txt'
  
  if (class(userdata) == 'character'){
    if (substr(userdata, nchar(userdata), nchar(userdata)) == '/'){
      userPath <- substr(userdata, 1, nchar(userdata)-1)
    }
    #Can suppress because this is stored in sysdata
    #    cNames <- data.table::data.table(utils::read.table(paste0(userPath, '/Country_Codes_Names.txt')))
    uDT <- data.table::data.table(utils::read.table(userdata))
    if(length(names(uDT)) < 3){
      uDT <- data.table::fread(userdata)
    }
  } else {
    if('data.frame' %in% class(userdata)){
      uDT <- data.table::data.table(userdata)
    } else {
      warning('Parameter "userdata" is not a valid file name or data.frame')
      return('Please pass a well-formed dataset to fishRmap')
    }
  }

  #For finished package  
  mapPath <- paste0(.libPaths(), '/fishRmap');
  
  ##For testing: 
  #mapPath <- 'c:/users/andrea/documents/github/fishrmap';
  
  servPath <- paste0(path.package('shiny'), '/www/shared/fishRmap');
  
  fishUp(mapPath, sroot = servPath);

#  import = 'Import'; export = 'Export'; species = 'Species'; value = 'value'; year = 'Year'; iso = 'numeric'
  ##end testing stuff
  
  params <- list()
  params$imp	= tolower(import) 
  params$exp	= tolower(export) 
  params$spc	= tolower(species)
  params$val	= tolower(value)
  params$yrs	= tolower(year)
  params$iso	= tolower(iso)
  
  data.table::setnames(uDT, old = names(uDT), new = tolower(names(uDT)))
  
  if(length(params[!(params %in% c(names(uDT), params$iso))]) > 0){
    message('Problem - the following required variables are missing from the dataset:')
    print(params[!(params %in% c(names(uDT), params$iso))])
    message('Returning dataset for your review.')
    return(uDT)
  } else {
    renames <- params[names(params) != 'iso' ]
    data.table::setnames(uDT, old = as.character(renames), new = names(renames))
  }
  
  
  userwd <- getwd()
#  setwd(mapPath)
  
  #	userJSON <- jsonlite::toJSON(uDT)
  #	writeLines( userJSON, 'inst/extdata/www/ajax/userdata.json')
  #	writeLines(paste0('var userdata = ', userJSON), 'inst/extdata/www/ajax/userdata.js')
  #wrldJS <- paste0('var userdata = ',  readLines('inst/extdata/www/ajax/world.json'))
  writeLines(jsonlite::toJSON(uDT[val != 0]), paste0(servPath, '/ajax/userdata.json'))
  #data.table::fwrite(uDT, paste0(servPath, '/ajax/userdata.csv'))
  
  iso_type <- ifelse(
    tolower(iso) == 'numeric', 
    'var iso = "iso_n3";', 
    'var iso = "iso_a3";'
  )
  
  if(length(mapPath) > 1){
    warning(paste0(
      'More than one possible fishRmap directory; using ', 
      mapPath[1], 
      '. try ".libPaths()" command for more information.'))
  }

  ui <- shiny::bootstrapPage(
    shiny::tags$head(
      shiny::tags$script(src="shared/fishRmap/js/api.js"),  # Always include this file this app

      # Leaflet stuff      
      shiny::tags$link(rel = "stylesheet", type = "text/css", href = "shared/fishRmap/build/leaflet/dist/leaflet.css"),
      shiny::tags$script(src="shared/fishRmap/build/leaflet/dist/leaflet.js"),
      shiny::tags$script(src="shared/fishRmap/build/Leaflet.Coordinates/dist/Leaflet.Coordinates-0.1.5.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/leaflet/dist/leaflet.js"),
      shiny::tags$script(src="shared/fishRmap/build/Leaflet.Coordinates/dist/Leaflet.Coordinates-0.1.5.min.js"),
      shiny::tags$link(rel = "stylesheet", type = "text/css", href = "shared/fishRmap/build/Leaflet.Coordinates/dist/Leaflet.Coordinates-0.1.5.css"),
      
      # D3 stuff
      shiny::tags$script(src="shared/fishRmap/build/d3/build/d3.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-scale/build/d3-scale.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-geo/build/d3-geo.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/topojson/dist/topojson.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-color/build/d3-color.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-dispatch/build/d3-dispatch.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-ease/build/d3-ease.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-interpolate/build/d3-interpolate.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-selection/build/d3-selection.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-timer/build/d3-timer.min.js"),
      shiny::tags$script(src="shared/fishRmap/build/d3/node_modules/d3-transition/build/d3-transition.min.js"),
      
      # Underscore
      shiny::tags$script(src="shared/fishRmap/build/underscore-min.js"),
      
      # Homebrew mod for D3 svg overlay interaction with leaflet
      shiny::tags$script(src="shared/fishRmap/build/L.D3SvgOverlay.v4.min.js"),
      
      
      # Custom CSS
      shiny::tags$link(rel = "stylesheet", type = "text/css", href = "shared/fishRmap/js/fishRstyle.css"),

      # This is handled in JS                         
#      shiny::includeScript("inst/extdata/www/js/world.js"),  # geojson

      shiny::tags$script(shiny::HTML(iso_type)) #Type of ISO code (character or numeric)
      
    ),		
    shiny::tags$body(
      shiny::tags$div(id = 'map-canvas'),
      shiny::tags$script(src="shared/fishRmap/js/fishRmap.js")
#      shiny::includeScript("inst/extdata/www/js/fishRmap.js")	# JavaScript specific to 		actionButton("getRversion", "R version API call"),
      #		actionButton("errorFunction", "API call with error")
    )
  )
  
  server <- function(input, output, session) {
    # include the API logic
    ##Suppress for development
    #		source("R/api.R", local = TRUE)$value
    source(paste0(mapPath[1], "/R/api.R"), local = TRUE)$value
    session$onSessionEnded(shiny::stopApp)
  }
  
  shiny::shinyApp(ui = ui, server = server)	
  
  
  
#  setwd(userwd)
  
}

