# fishRmap
An interactive visualization and filtering tool for geospatial trade data tailored for use by SESYNC research groups.

## Installation
Because this is currently a private repository, installation has an extra step or two:

1. [Generate a SESYNC GitLab token](https://gitlab.sesync.org/profile/personal_access_tokens)
2. Run the code:

```{r install} 
#Install packages if needed
install.packages(c('devtools', 'httr'));

library(devtools);
library(httr);

httr::set_config( config( ssl_verifypeer = 0L ));

devtools::install_github(
	'ajulca/fishRmap', 
	auth_user = '[your SESYNC GitLab username]', 
	auth_token = '[The token you just made]',
	host = 'https://gitlab.sesync.org/api/v3'
) 

library(fishRmap)
```

```{r use}
## fishRmap - probably won't work for anyone else at this point; still in development
fishRmap([either a 'String path to your data', or a data.frame])
```

## For Developers
### "fishRmap/R/"" directory contains the R wrapper for the application 
* _fishRmap_ is the central function for the R interface to the application; the R script is primarily a wrapper for the JavaScript code contained in "fishRmap/inst/extdata/www/", although it also depends on api.R and fishUp.R
* _fishUp_ is used to creat hard links in "[shiny library directory]/www/shared/fishRmap/"  to files in "fishRmap/inst/extdata/www/"; this is used only indirectly through the fishRmap function
* _api_ is used to transfer data back and forth from JS app; this is used only indirectly through the fishRmap function

### "fishRmap/inst/extdata/www/" directory contains the bulk of the visualization's core code
The user does not interact with this directly, but it is where the developer will do most of their work.
* _"js/fishRmap.js"_ is the primary script for the interface
* _"js/api.js"_ is the correllary to api.R; this allows communication between client and "server" side  
* _"js/fishRmap.css"_ is main css file
* _"build/"_ directory contains dependency libraries
* _"ajax/"_ directory contains geo/topojson data to be used for map



