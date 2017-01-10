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

fishRmap <- function(userdata, import = 'Import', export = 'Export', species = 'Species', value = 'value', year = 'Year', iso = 'numeric'){
  requireNamespace('shiny', quietly = TRUE)
  requireNamespace('jsonlite', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)
  
#Test dataset
# userdata <- 'c:/users/andrea/documents/fishdata.txt'
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

	#mapPath <- paste0(.libPaths(), '/fishRmap')

	##For testing: 
	 mapPath <- 'c:/users/andrea/documents/github/fishrmap'
	import = 'Import'; export = 'Export'; species = 'Species'; value = 'value'; year = 'Year'; iso = 'numeric'
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
	}
	
	
	userwd <- getwd()
	setwd(mapPath)
	
#	userJSON <- jsonlite::toJSON(uDT)
#	writeLines( userJSON, 'inst/extdata/www/ajax/userdata.json')
#	writeLines(paste0('var geodata = ', userJSON), 'inst/extdata/www/ajax/userdata.js')
	userJS <- paste0('var geodata = ',  jsonlite::toJSON(uDT))
	ui <- shiny::bootstrapPage(
		shiny::tags$head(
			shiny::includeScript("inst/extdata/www/js/api.js"),  # Always include this file this app
			shiny::tags$script(src="https://unpkg.com/leaflet@1.0.2/dist/leaflet.js"), #Leaflet JS
			shiny::tags$script(src="https://d3js.org/d3.v4.js"), #D3.js
			shiny::tags$script(src="https://d3js.org/topojson.v1.min.js"), #D3 topojson
			shiny::includeScript("inst/extdata/www/js/L.D3SvgOverlay.min.js"), #D3-leaflet integration plugin
			shiny::tags$link(rel = "stylesheet", type = "text/css", href = "https://unpkg.com/leaflet@1.0.2/dist/leaflet.css"),
			shiny::tags$link(rel = "stylesheet", type = "text/css", href = "https://unpkg.com/leaflet@1.0.2/dist/leaflet.css"),
			shiny::tags$style(HTML('        
				html { height: 100% }
        body { height: 100%; margin: 0; padding: 0 }
        #map-canvas { height: 100%; width: 100% }')),
			shiny::tags$script(HTML(userJS)) #user data

		),		
		shiny::tags$body(
			shiny::tags$div(id = 'map-canvas'),
			shiny::includeScript("inst/extdata/www/js/fishRmap.js")	# JavaScript specific to 		actionButton("getRversion", "R version API call"),
#		actionButton("errorFunction", "API call with error")
		)
	)

	server <- function(input, output, session) {
		# include the API logic
##Suppress for development
#		source("R/api.R", local = TRUE)$value
		source("dev/dev/R/api.R", local = TRUE)$value
		session$onSessionEnded(shiny::stopApp)
	}

	shiny::shinyApp(ui = ui, server = server)	

	setwd(userwd)

}

