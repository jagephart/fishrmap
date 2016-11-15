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