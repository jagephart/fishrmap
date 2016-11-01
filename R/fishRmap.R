#' Call visualization function
#' 
#' @param userdata A string path to a directory file (eventually R vars instead/in addition, but for now we use dir to 2 text files) 
#' @return TBD 
#' @import leaflet shiny RColorBrewer data.table magrittr
#' @export 
#' @examples 
#' someExample <- 'goes here' 

fishRmap <- function(userdata){
  requireNamespace('magrittr', quietly = TRUE)
  requireNamespace('leaflet', quietly = TRUE)
  requireNamespace('shiny', quietly = TRUE)
  requireNamespace('RColorBrewer', quietly = TRUE)
  requireNamespace('geospherce', quietly = TRUE)
  requireNamespace('data.table', quietly = TRUE)
  
  `%>%` <- magrittr::`%>%`
  
  #front-load data
  #May want to take a more OOP approach later, but this is fine for now
  userDT <- fishReadR(userdata);
  newWorld   <- worldEater();
  world <- joinFishWorld(userDT, newWorld);
  tradeDT <- fishTrade(userDT, newWorld);
  
  #This will crash the program...
  #sink('c:/users/andrea/documents/testout.json'); jsonlite::toJSON(tradeDT[, c(colnames(tradeDT)[colnames(tradeDT) != 'spLine']), with = FALSE]); sink();
  
  #This may work, however... just need to set colors etc
  #  sink('c:/users/andrea/documents/testout.json'); 
  #  jsonlite::toJSON(tradeDT[, .(Source = ISO_Alpha, Long, Lat, Target = Exp_Alpha, trgLong = i.Long, trgLat = i.Lat)]); 
  #  sink();
  
  
  #Set some color options
  palImp <- colorRampPalette(c("pink", "red"))
  colorImp <- palImp(100)
  
  palExp <- colorRampPalette(c("white", "black"))
  colorExp <- palExp(100)
  
  #a few other options for map style - make it user pref selection?
  #leaflet() %>% addProviderTiles('Stamen.Toner') %>% 
  #leaflet() %>% addProviderTiles('Esri.WorldTopoMap') %>% 
  #leaflet() %>% addProviderTiles('OpenStreetMap.BlackAndWhite') %>% 
  
  
  
  #  leaflet::leaflet() %>% leaflet::addProviderTiles('CartoDB.Positron') %>% 
  #    leaflet::addPolygons(data=subset(world, iso_a3 %in% userDT[, ISO_Alpha]), weight=0.5) #%>% 
  ##    leaflet::addPolylines(data=sln, weight=1, color = "red")
  
  
  #thisISO is defined within shiny
  #spLines <- tradeDT[ISO_Alpha == thisISO | Exp_Alpha == thisISO]
  
  ui <- shiny::bootstrapPage(
    tags$style(type = "text/css", "html, body {width:100%;height:100%}"),
    leaflet::leafletOutput("map", width = "100%", height = "100%")#,
    #    shiny::absolutePanel(top = 10, right = 10,
    #                  shiny::sliderInput("range", "Year", min(userDT$Year), max(userDT$Year),
    #                              value = range(userDT$Year), step = 1
    #                  ),
    #                  shiny::selectInput("colors", "Color Scheme",
    #                              rownames(subset(RColorBrewer::brewer.pal.info, category %in% c("seq", "div")))
    #                  ),
    #                  shiny::checkboxInput("legend", "Show legend", TRUE)
    #    )
  )
  
  #  ui <- shiny::fluidPage(
  #    leaflet::leafletOutput("map")
  #  ) 
  
  server <- function(input, output, session) {
    
    # Reactive expression for the data subsetted to what the user selected
    ##    filteredData <- reactive({
    ##      quakes[quakes$mag >= input$range[1] & quakes$mag <= input$range[2],]
    ##    })
    
    # This reactive expression represents the palette function,
    # which changes as the user makes selections in UI.
    #colorpal <- shiny::reactive({
    #  leaflet::colorNumeric(input$colors, userDT$Year)
    #})
    
    output$map <- leaflet::renderLeaflet({
      # Use leaflet() here, and only include aspects of the map that
      # won't need to change dynamically (at least, not unless the
      # entire map is being torn down and recreated).
      leaflet::leaflet() %>% leaflet::addProviderTiles('CartoDB.Positron') %>% 
        leaflet::addPolygons(data=subset(world, iso_a3 %in% userDT[, ISO_Alpha]), weight=0.5, layerId=subset(world, iso_a3 %in% userDT[, ISO_Alpha])@data$iso_a3)
    })
    
    # Incremental changes to the map (in this case, replacing the
    # circles when a new color is chosen) should be performed in
    # an observer. Each independent set of things that can change
    # should be managed in its own observer.
    shiny::observe({
      ##      pal <- colorpal()
      
      event <- input$map_shape_click
      if (is.null(event))
        return()
      
      if (is.na(event))
        return()
      
      #Log event
      print(event)
      
      #For now, use dummy year = 2011 and dummy species = 'a'
      year <- list('selected' = '2011')
      species <- list('selected' = 'a')
      
      thisSubset <- tradeDT[(ISO_Alpha == event$id | Exp_Alpha == event$id) & 
                              Year == year$selected &
                              Species == species$selected]
      
      
      spLines <- thisSubset[, spLine]
      
      colIndex <- thisSubset[,.(
        ind = length(colorImp)*value/max(value),
        colVal = ifelse(
          ISO_Alpha == event$id,
          colorImp[round(length(colorImp)*value/max(value))],
          colorExp[round(length(colorImp)*value/max(value))]
        )
      )]
      
      
      try(leaflet::leafletProxy("map") %>%  clearGroup("tradelines"), silent = TRUE);
      try(leaflet::leafletProxy("map") %>%
            #        clearGroup("tradelines") %>%
            #        clearShapes() %>%
            leaflet::addPolylines(
              data=fishingLines(spLines), 
              weight=0.15+colIndex[,ind/length(colorImp)], 
              col = colIndex[,colVal], 
              group = 'tradelines'
            ), 
          silent = TRUE);
      #silent = FALSE);
    })
    
    # Use a separate observer to recreate the legend as needed.
    #    observe({
    #      proxy <- leafletProxy("map", data = quakes)
    
    # Remove any existing legend, and only if the legend is
    # enabled, create a new one.
    ##      proxy %>% clearControls()
    ##      if (input$legend) {
    ##        pal <- colorpal()
    ##        proxy %>% addLegend(position = "bottomright",
    ##                            pal = pal, values = ~mag
    ##        )
    ##      }
    #    })
  }
  
  shiny::shinyApp(ui, server)
  
}
