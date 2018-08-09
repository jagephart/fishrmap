
test_app <- function(df, facetRowsBy, facetColsBy, colorBy, logTransform=F) {
  require(shiny)
  
  facetRowsBy <- enquo(facetRowsBy)
  colchoices <- names(df)

  ui <- fluidPage(
    
    # App title ----
    titlePanel("Reactivity"),
    
    # Sidebar layout with input and output definitions ----
    sidebarLayout(
      
      # Sidebar panel for inputs ----
      sidebarPanel(
        
        selectInput(inputId = "facetRowsBy",
                    label = "Group facet rows by:",
                    #selected = facetRowsBy,
                    choices = colchoices
        ),
        
        # Input: Text for providing a caption ----
        # Note: Changes made to the caption in the textInput control
        # are updated in the output area immediately as you type
        textInput(inputId = "caption",
                  label = "Caption:",
                  value = "some caption here"),
        
        checkboxInput(inputId = "logTransform",
                      label = "Log transform")
      ),
      
      # Main panel for displaying outputs ----
      mainPanel(

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

    facetRowsBy <- reactive({
      enquo(input$facetRowsBy)
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
#    output$summary <- renderPrint({
#      df %>% summary(facetRowsBy)
#    })
    
   
    # Show the first "n" observations ----
    # The output$view depends on both the databaseInput reactive
    # expression and input$obs, so it will be re-executed whenever
    # input$dataset or input$obs is changed
    output$view <- renderPlot({
      ggplot(df, 
        #aes(x=year, y=trnsfrm()(Agg.Weight), color=.data[[colorBy]])) +
        aes(x=year, y=trnsfrm()(Agg.Weight), color=FS_group)) +
        geom_line( stat = "summary", fun.y = "sum", alpha=1) +
        #facet_grid(rows=vars(.data[[UQ(facetRowsBy)]]))
        facet_grid(cols=vars(impcont), rows=vars(expcont))
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

#hold <- function(df) {}