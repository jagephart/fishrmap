
dimFields = tibble(
  var = c('x', 'y', 'facetRowsBy', 'facetColsBy', 'colorBy'),
  label = c('X', 'Y', 'Facet Rows', 'Facet Cols', 'Color'),
  val = NA
)
getSelectField <- function(fDesc, choices, defaultVal=NA) {
  selectInput(
    inputId = fDesc[['var']],
    label = fDesc[['label']],
    choices = choices,
    selected = defaultVal
  )
}
getSelectFields <- function(fieldDescs, choices, defaults) {
  lapply(
              1:nrow(fieldDescs),
              function(i) getSelectField(fieldDescs[i,], choices, defaults[[fieldDescs[[i,'var']]]])
              #selectInput(inputId='id',label='label',choices=c('choice1','choice2'))
              )
}


test_app <- function(df, logTransform=F, ...) {
  require(shiny)
  
  defaults <- data.frame(...)
  
  #facetRowsBy <- enquo(facetRowsBy)
  colChoices <- names(df)
  sfields <- getSelectFields(dimFields, colChoices, defaults)
  inputs <- c(sfields,
              list(textInput(inputId = "caption",
                                      label = "Caption:",
                                      value = "some caption here"),
                  checkboxInput(inputId = "logTransform",
                                          label = "Log transform"))
  )

  ui <- fluidPage(
    
    # App title ----
    titlePanel("Reactivity"),
    
    # Sidebar layout with input and output definitions ----
    sidebarLayout(
      
      
      # Sidebar panel for inputs ----
      sidebarPanel(
        inputs
      ),
      
      # Main panel for displaying outputs ----
      mainPanel(
        h4('dimAssignments'),
        tableOutput("dimAssignments"),
        h4('defaults'),
        tableOutput("defaults"),
        h4('inames'),
        tableOutput("inames"),
        
        h3(textOutput("facetRowsBy", container = span)),
        
        # Output: Formatted text for caption ----
        h3(textOutput("caption", container = span)),
        
        # Output: Verbatim text for data summary ----
        verbatimTextOutput("summary"),
        
        # Output: HTML table with requested number of observations ----
        plotOutput("view")
      )
    )
  )
  
  server <- function(input, output) {
    
    output$dimAssignments <- renderTable(dimFields)
    output$defaults <- renderTable(defaults)
    #reac <- reactiveValues()
    output$inames <- renderTable(reactive({reactiveValuesToList(input)}))
    #print(output$inames)
    #output$input <- reactive(renderTable(reac))
    
    

    facetRowsBy <- reactive({
      input$facetRowsBy
    })
    output$facetRowsBy <- reactive({
      input$facetRowsBy
    })
    
    trnsfrm <- reactive({
      if(input$logTransform) log2 else function(d) {d}
    })
    
    # Create caption ----
    # The output$caption is computed based on a reactive expression
    # that returns input$caption. When the user changes the
    # "caption" field:
    #
    # 1. This function is automatically called to recompute the output
    # 2. New caption is pushed back to the browser for re-display
    #
    # Note that because the data-oriented reactive expressions
    # below don't depend on input$caption, those expressions are
    # NOT called when input$caption changes
    output$caption <- renderText({
      glue::glue("logTransform: {input$logTransform}  {trnsfrm()(64)}")
    })
    
    #output$facetRowsBy <- renderText({
    #  glue::glue("facetRowsBy: {input$facetRowsBy}")
    #})
    # Generate a summary of the dataset ----
    # The output$summary depends on the datasetInput reactive
    # expression, so will be re-executed whenever datasetInput is
    # invalidated, i.e. whenever the input$dataset changes
    #output$summary <- reactive(renderPrint({
    #  df %>% summarise(mean())
    #}))
    
    
    # Show the first "n" observations ----
    # The output$view depends on both the databaseInput reactive
    # expression and input$obs, so it will be re-executed whenever
    # input$dataset or input$obs is changed
    output$view <- renderPlot({
      ggplot(df, 
             #aes(x=year, y=trnsfrm()(Agg.Weight), color=.data[[colorBy]])) +
             aes(x=year, y=trnsfrm()(Agg.Weight), color=FS_group)) +
        geom_line( stat = "summary", fun.y = "sum", alpha=1) +
        #facet_wrap("expcont")
#      facet_grid(cols=facetColsBy, rows=facetRowsBy) +
#      labs(colour = colorBy) +
#      labs(x = facetColsBy) +
#      labs(y = facetRowsBy) +
      ggtitle("testing title")
      #ggtitle(glue::glue('rows {facetRowsBy}, cols {facetColsBy}, color {colorBy}'))
      
      #facet_grid(rows=!!vars(facetRowsBy))
    })
    
  }
  return(
    shinyApp(
      ui, server,
      options = list(
        width = "100%", height = 550
      )
    )
  )
}
test_app(df=agg, x="year", y="Agg.Weight",
         facetRowsBy='expcont', facetColsBy='impcont', logTransform=T, colorBy='FS_group'
)
