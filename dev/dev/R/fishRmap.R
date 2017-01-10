#' Call visualization function
#' 
#' @param userdata A string path to the file containing fishery data
#' @param import Character string name of column with three-character or -digit ISO code of country importing fish
#' @param export Character string name of column with three-character or -digit ISO code of country exporting fish
#' @param species Character string name of column with fish species names
#' @param value Character string name of column with value of trade
#' @param year Character string name of column with year
#' @return TBD 
#' @import shiny data.table
#' @importFrom jsonlite toJSON
#' @importFrom jsonlite fromJSON
#' @export 
#' @examples 
#' someExample <- 'goes here' 

fishRmap <- function(userdata, import = 'Import', export = 'Export', species = 'Species', value = 'value', year = 'Year', alpha = TRUE){
  requireNamespace('shiny', quietly = TRUE)
  requireNamespace('jsonlite', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)
  
	  if (class(userdata) == 'character'){
    if (substr(userdata, nchar(userdata), nchar(userdata)) == '/'){
      userPath <- substr(userdata, 1, nchar(userdata)-1)
    }
    #Can suppress because this is stored in sysdata
#    cNames <- data.table::data.table(utils::read.table(paste0(userPath, '/Country_Codes_Names.txt')))
    sTrade <- data.table::data.table(utils::read.table(userdata))
  } else {
    if('data.frame' %in% class(userdata)){
      sTrade <- data.table::data.table(userdata)
    } else {
      warning('Parameter "userdata" is not a valid file name or data.frame')
      return('Please pass a well-formed dataset to fishRmap')
  }
	
	userJSON <- jsonlite::toJSON(sTrade)
	
	userwd <- getwd()
	mapPath <- paste0(.libPaths(), '/fishRmap')
	setwd(mapPath)
	
	writeLines(userJSON, '/inst/extdata/www/ajax/userdata.json')
	
	ui <- fluidPage(
		tags$head(
			includeScript("inst/extdata/www/js/api.js"),  # Always include this file
			includeScript("inst/extdata/www/js/app.js")   # JavaScript specific to this app
		),
		actionButton("getRversion", "R version API call"),
		actionButton("errorFunction", "API call with error")
	)

	server <- function(input, output, session) {
		
		# include the API logic
		source("api.R", local = TRUE)$value
	 
		api.getRversion <- function(params) {
			# don't forget you have access to all the parameters sent by javascript
			# inside the "params" variable
			
			# need to return a list (can be an empty list)
			retval <- list(
				success = TRUE,
				rversion = R.version.string
			)
			retval
		}

		api.errorExample <- function(params) {
			# this function will throw an error to show what happens on the javsacript
			# side when an error occurs
			stop("sample error message")
		} 
	}

	shinyApp(ui = ui, server = server)	

	setwd(userwd)

}
