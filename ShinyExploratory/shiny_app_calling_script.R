library(tidyr)
library(dplyr)
library(ggplot2)
library(fishRmap)
library(countrycode)
agg <- read.csv("../Data/species_CT_agg_clean_13Oct17.csv")

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

#runApp('JustShinyExperiment')

source("JustShinyExperiment/app.R")
test_app(df=agg, x="year", y="Agg.Weight",
         facetRowsBy='expcont', facetColsBy='impcont', logTransform=T, colorBy='FS_group'
)
