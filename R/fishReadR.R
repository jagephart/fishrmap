#' Read txt data
#' 
#' @param userData A data.frame or a string path to a file (eventually an R data type instead/in addition, but for now we use local text file) 
#' @return TBD 
#' @import data.table
#' @export 
#' @examples 
#' someExample <- 'goes here' 


fishReadR <- function(userData){
  #  `.` <- data.table::`.`
  `.` <- NULL
  ISO_Code <- NULL 
  Area_Name <- NULL 
  ISO_Alpha <- NULL 
  Exp_Code  <- NULL
  i.ISO_Code <- NULL 
  Exp_Name <- NULL
    i.Area_Name <- NULL
  Exp_Alpha <- NULL
    i.ISO_Alpha <- NULL
  Species <- NULL
  value <- NULL
  Year <- NULL
  Import <- NULL
  Export <- NULL
  #Not advisable, but you can just specify a path to a CSV
  if (class(userData) == 'character'){
    if (substr(userData, nchar(userData), nchar(userData)) == '/'){
      userPath <- substr(userData, 1, nchar(userData)-1)
    }
    #Can suppress because this is stored in sysdata
#    cNames <- data.table::data.table(utils::read.table(paste0(userPath, '/Country_Codes_Names.txt')))
    sTrade <- data.table::data.table(utils::read.table(userData))
  } else {
    if('data.frame' %in% class(userData)){
      sTrade <- data.table::data.table(userData)
    } else {
      warning('Parameter "userdata" is not a valid file name or data.frame')
      return('Please pass a well-formed dataset to fishRmap')
      
  }
    
    data.table::setkey(cNames, key = ISO_Code)
    data.table::setkey(sTrade, key = Import)
    
    impDT <- cNames[sTrade]
    
    data.table::setkey(impDT, key = Export)
    
    wDT <- cNames[impDT][, .(ISO_Code, Area_Name, ISO_Alpha, Exp_Code = i.ISO_Code, Exp_Name = i.Area_Name, Exp_Alpha = i.ISO_Alpha, Species, value, Year)]
  
    return(wDT)
  
  }
}
