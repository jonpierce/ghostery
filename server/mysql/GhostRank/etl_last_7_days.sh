#!/bin/sh

cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-7  DAY/g" | sed "s/-1 DAY/-1 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-8  DAY/g" | sed "s/-1 DAY/-2 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-9  DAY/g" | sed "s/-1 DAY/-3 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-10  DAY/g" | sed "s/-1 DAY/-4 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-11  DAY/g" | sed "s/-1 DAY/-5 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-12  DAY/g" | sed "s/-1 DAY/-6 DAY/g"  | mysql -v -v  ghostrank
cat ghostrank_nightly_etl.sql |sed "s/-7  DAY/-13  DAY/g" | sed "s/-1 DAY/-7 DAY/g"  | mysql -v -v  ghostrank
