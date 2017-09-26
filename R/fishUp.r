#' Call update function to create hard links to package files in shiny shared dir
#' 
#' @param fishDir A string path to the directory of the fishRmap library
#' @param sroot A string path to the shiny shared directory 
#' @return An empty string
#' @export 
#' @examples 
#' someExample <- 'goes here' 


fishUp <- function(fishrDir, sroot){
  #fishrDir <- "c:/users/andrea/documents/github/fishrmap"
  #fishrDir <- mapPath; sroot <- servPath;
  dir.create(sroot, showWarnings = FALSE)
  
  froot <- paste0(fishrDir, '/inst/extdata/www/');
  
  
  fdFiles <- list.files(froot,recursive = T);
  sdFiles <- list.files(sroot,recursive = T);
  
  fullFdFiles <- paste0(froot, fdFiles);
  fullSdFiles <- paste0(sroot, sdFiles);
  
  missingFiles <- fdFiles[!(fdFiles %in% sdFiles)]
  if(length(missingFiles)>0){
    silencio <- lapply(missingFiles, function(fl){
      
      fp <- paste0(froot, fl);
      fpSplit <- strsplit(fp, split = '/')[[1]]
      fparent <- paste(
        fpSplit[1:(length(fpSplit)-1)], 
        collapse = '/'
      )
      
      
      sp <- paste0(sroot, '/', fl);
      spSplit <- strsplit(sp, split = '/')[[1]]
      sparent <- paste(
        spSplit[1:(length(spSplit)-1)], 
        collapse = '/'
      )
      
      dir.create(sparent, recursive = T, showWarnings = FALSE)
      
      file.link(fp, sp)
      return('');
    })
    
  }
  return('');
}
