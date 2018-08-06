#________________________________________________________________________________________________________________#
# TITLE: FishRmap_test.R
# AUTHOR: Jessica
# DATE: 13-Nov-17
# NOTES: 

#________________________________________________________________________________________________________________#
# Install packages
#________________________________________________________________________________________________________________#
#install.packages('Source/fishRmap_0.0.3.tar.gz', repos = NULL, type = 'source')

library(tidyr)
library(dplyr)
library(ggplot2)
library(fishRmap)
library(countrycode)

#________________________________________________________________________________________________________________#
# Load data
#________________________________________________________________________________________________________________#
agg <- read.csv("Data/species_CT_agg_clean_13Oct17.csv")

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

ggplot(agg, aes(x=year, y=log(Agg.Weight), color=FS_group)) +
  #geom_point( stat = "summary", fun.y = "sum") +
  geom_line( stat = "summary", fun.y = "sum", alpha=1) +
  facet_grid(cols=vars(expcont))
  #facet_grid(cols=vars(expcont), rows = vars(impcont))
ggplot(agg, aes(x=year, y=log(Agg.Weight), color=FS_group)) +
  #geom_point( stat = "summary", fun.y = "sum") +
  geom_line( stat = "summary", fun.y = "sum", alpha=1) +
  facet_grid(cols=vars(impcont))
#facet_grid(cols=vars(expcont), rows = vars(impcont))


#agg$Exporter.Code <- countrycode(agg$Exporter.Code, origin = "iso3c", destination = "iso3n")


#agg2$cname <- countrycode(agg2$Importer.Code,"iso3n","iso.name.en")



#small <- subset(agg, Importer %in% c('Albania','Algeria', 'Andorra'))
#small <- subset(small, Exporter %in% c('Italy', 'France', 'Spain'))



#ggplot(small, aes(x=year, y=log(Agg.Weight), color=FS_group)) +
#  geom_point( stat = "summary",
#             fun.y = "mean") +
#  geom_line( stat = "summary",
#              fun.y = "mean", alpha=.2) +
#  facet_grid(cols=vars(Importer), rows = vars(FS_group))





#________________________________________________________________________________________________________________#
# Test function
#________________________________________________________________________________________________________________#
#fishRmap(df, import="Importer.Code", export = "Exporter.Code", species = "FS_group", 
#         value = "Agg.Value", year = "year", iso = "numeric")
