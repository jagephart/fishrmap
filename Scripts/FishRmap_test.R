#________________________________________________________________________________________________________________#
# TITLE: FishRmap_test.R
# AUTHOR: Jessica
# DATE: 13-Nov-17
# NOTES: 

#________________________________________________________________________________________________________________#
# Install packages
#________________________________________________________________________________________________________________#
#install.packages('Source/fishRmap_0.0.3.tar.gz', repos = NULL, type = 'source')
library(fishRmap)
library(countrycode)
#________________________________________________________________________________________________________________#
# Load data
#________________________________________________________________________________________________________________#
df <- read.csv("Data/species_CT_agg_clean_13Oct17.csv")
df$Importer.Code <- countrycode(df$Importer.ISO3c, origin = "iso3c", destination = "iso3n")
df$Exporter.Code <- countrycode(df$Exporter.ISO3c, origin = "iso3c", destination = "iso3n")
#________________________________________________________________________________________________________________#
# Test function
#________________________________________________________________________________________________________________#
fishRmap(df, import="Importer.Code", export = "Exporter.Code", species = "FS_group", 
         value = "Agg.Value", year = "year", iso = "numeric")
