library(jsonlite)
library(data.table)
wj <- fromJSON('c:/users/andrea/documents/github/fishrmap/inst/extdata/www/ajax/world.geojson')
 wx <- as.data.table(cbind(wj$features$properties, wj$features$id))
 
 setnames(wx, old = 'wj$features$id', new = 'id')

 out <- wx[,.(
	id, 
	name,	
	iso_a2,
	iso_a3,
	iso_n3,
	un_a3, 
	wb_a2,
	wb_a3,
	admin,
	adm0_a3_is,
	adm0_a3_us,
	subunit,
	su_a3,
	type,
	sovereignt,
	sov_a3,
	name_long,
	pop_est,
	lastcensus,
	gdp_md_est,
	gdp_year,
	continent,
	region_un,
	subregion,
	abbrev
 )]
 
 writeLines(toJSON(out), 'c:/users/andrea/documents/github/fishrmap/inst/extdata/www/ajax/worldmeta.json')
 