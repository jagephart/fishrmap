#' Read txt data
#' 
#' @param userdata A string path to a file (eventually an R data type instead/in addition, but for now we use local text file) 
#' @return TBD 
#' @import data.table
#' @export 
#' @examples 
#' someExample <- 'goes here' 


fishReadR <- function(userPath){
  if (class(userPath) == 'character'){
    
    cNames <- data.table::data.table(read.table(paste0(userPath, 'Country_Codes_Names.txt')))
    sTrade <- data.table::data.table(read.table(paste0(userPath, 'species_trade.txt')))
    data.table::setkey(cNames, key = ISO_Code)
    data.table::setkey(sTrade, key = Import)
    
    impDT <- cNames[sTrade]
    
    data.table::setkey(impDT, key = Export)
    
    wDT <- cNames[impDT][, .(ISO_Code, Area_Name, ISO_Alpha, Exp_Code = i.ISO_Code, Exp_Name = i.Area_Name, Exp_Alpha = i.ISO_Alpha, Species, value, Year)]
  
    return(wDT)
  
  } else {
    warning('Parameter "userdata" is not a valid file name or data.frame')
    return('Please pass a well-formed dataset to fishRmap')
  }
}
