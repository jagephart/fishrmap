
# testing with new package at https://gitlab.sesync.org/sgold/tbl.viz.explorer
# install that locally (from command line) like: 
#   ~/sesync⇒  ls
#      R_training  fishrmap  pesticides  tbl.viz.explorer
#   ~/sesync⇒  R CMD INSTALL -l tbl.viz.explorer tbl.viz.explorer > pkg.log 2>&1
#
# then, in r studio:
#  > install_local('tbl.viz.explorer')
#     Installing package from '/Users/sigfried/sesync/tbl.viz.explorer/tbl.viz.explorer'
#     ...
# // install_local stopped working for me for some reason unless I gave full path:
# install_local('/Users/sigfried/sesync/tbl.viz.explorer', lib=tbl.viz.explorer)





#library(tbl.viz.explorer)




# to test:
#  > tbl.viz.explorer::hello()
#    [1] "Hello, world!"

library(tidyr)
library(dplyr)
library(ggplot2)
library(fishRmap)
library(countrycode)
agg <- read.csv("./Data/species_CT_agg_clean_13Oct17.csv")

agg$imp <- countrycode(agg$Importer.Code, origin = "iso3n", destination = "iso.name.en")
agg$imp <- coalesce(agg$imp, as.character(agg$Importer))
agg$impcont <- countrycode(agg$Importer.Code, origin = "iso3n", destination = "continent")

# make sure it's working
#agg$Importer <- as.character(agg$Importer)
#agg[agg$Importer != agg$imp,c('Importer','imp')]

agg$exp <- countrycode(agg$Exporter.Code, origin = "iso3n", destination = "iso.name.en")
agg$exp <- coalesce(agg$exp, as.character(agg$Exporter))
agg$expcont <- countrycode(agg$Exporter.Code, origin = "iso3n", destination = "continent")

#agg$Importer.Code <- countrycode(agg$Importer.ISO3c, origin = "iso3c", destination = "iso3n")
#agg$Exporter.Code <- countrycode(agg$Exporter.ISO3c, origin = "iso3c", destination = "iso3n")

agg <- select(agg, year, FS_group, Agg.Weight, Agg.Value, exp, expcont, imp, impcont)

tbl.viz.explorer::runApp(
  df=agg, logTransform=T,
  x="year", y="Agg.Weight", facetRowsBy='expcont', facetColsBy='impcont', colorBy='FS_group')

print('why not running?')


#test_app(df=agg, x="year", y="Agg.Weight",
#         facetRowsBy='expcont', facetColsBy='impcont', logTransform=T, colorBy='FS_group'
#)
