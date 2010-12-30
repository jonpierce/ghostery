This is a set of executable notes for a GhostRank MySQL schema, Insert/Update statements and Analytics ETL queries.

To check it out:

create the DB
%mysqladmin create ghostrank 

load the schema
%mysql ghostrank < ghostrank_schema.sql

load 7 days of randomish data
%./write_data_7_days.sh

%run etls for last 7 days
./etl_last_7_days.sh

start over with empty tables
%mysql ghostrank < ghostrank_schema.sql

TODO:
 Outline Analytics UI queries for various displays and searching

