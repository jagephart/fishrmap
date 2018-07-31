/*
"year","FS_group","Importer","Importer.Code","Importer.ISO3c","Exporter","Exporter.Code","Exporter.ISO3c","Agg.Weight","Agg.Value"
1994,"Cods, hakes, haddocks","Algeria",12,"DZA","Areas, nes",899,NA,18,397
1994,"Cods, hakes, haddocks","Andorra",20,"AND","Portugal",620,"PRT",22898,119605
1994,"Cods, hakes, haddocks","Andorra",20,"AND","Spain",724,"ESP",40597,259852
*/

drop table agg;
create table agg (
  year integer,
  fs_group text,
  importer text,
  importer_code integer,
  importer_iso3c text,
  exporter text,
  exporter_code integer,
  exporter_iso3c text,
  weight numeric,
  value numeric
);

copy agg from '/Users/sigfried/Sites/fishrmap/Data/species_CT_agg_clean_13Oct17.csv' with (format csv);

create materialized view all_combos as 
select * from 
  (select distinct year from agg) y, 
  (select distinct fs_group from agg) g, 
  (select distinct importer from agg) i, 
  (select distinct exporter from agg) e;

create index agidx on agg(fs_group, importer, exporter, year);
create index acidx on all_combos(fs_group, importer, exporter, year);

select ac.fs_group, ac.importer, ac.exporter, 
        array_agg(coalesce(weight)), array_agg(ac.year), 
        sum(coalesce(weight,0)), 
        count(ac.year) 
from all_combos ac
left join agg on ac.fs_group = agg.fs_group
             and ac.importer = agg.importer
             and ac.exporter = agg.exporter
             and ac.year = agg.year
group by 1,2,3;
