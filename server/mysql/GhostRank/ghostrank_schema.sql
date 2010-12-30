
-- Notes:
-- The xx_id fields are simple MD5 hashes of the varchar fields - MySQL sucks at indexing varchars in large tables
-- Select things by looking for an MD5 of a string

-------- Daily history of bugs & domains ordered by bug --------
-- this table will get big
-- keep it down to 7-30 days and export older data to a more scalable solution?

DROP TABLE IF EXISTS ghostrank_entry_history_bybug;
CREATE TABLE ghostrank_entry_history_bybug (
  bug_id 			binary(32) NOT NULL DEFAULT 0,
  bug_name			varchar(255) NOT NULL DEFAULT '',
  domain_id 			binary(32) NOT NULL DEFAULT 0,
  domain_name			varchar(255) NOT NULL DEFAULT '',
  pageviews 			INTEGER NOT NULL DEFAULT 1,
  created_on	 		TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  last_modified 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  timeslot 			DATETIME NOT NULL,
  PRIMARY KEY (timeslot,bug_id,domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

-------- Daily history of bugs & domains ordered by domains --------
-- this table will get big
-- keep it down to 7-30 days and export older data to a more scalable solution?

DROP TABLE IF EXISTS ghostrank_entry_history_bydomain;
CREATE TABLE ghostrank_entry_history_bydomain (
  bug_id 			binary(32) NOT NULL DEFAULT 0,
  bug_name			varchar(255) NOT NULL DEFAULT '',
  domain_id 			binary(32) NOT NULL DEFAULT 0,
  domain_name			varchar(255) NOT NULL DEFAULT '',
  pageviews 			INTEGER NOT NULL DEFAULT 1,
  created_on	 		TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  last_modified 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  timeslot 			DATETIME NOT NULL,
  PRIMARY KEY (timeslot,domain_id,bug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

--------- Summarized history of bugs and domains ----------
DROP TABLE IF EXISTS ghostrank_entry_summary;
-- This table should be an accumulated view of ghostrank_entry_history with 'old' data deleted

CREATE TABLE ghostrank_entry_summary (
  bug_id 			binary(32) NOT NULL DEFAULT 0,
  bug_name			varchar(255) NOT NULL DEFAULT '',
  domain_id 			binary(32) NOT NULL DEFAULT 0,
  domain_name			varchar(255) NOT NULL DEFAULT '',
  avg_pageviews 		DOUBLE NOT NULL DEFAULT 1,
  created_on	 		TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
  last_modified 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  timeslot 			DATETIME NOT NULL,
  term 				INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (timeslot,term,bug_id,domain_id),
  KEY idx_did_bid (timeslot,term,domain_id,bug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

----------------
-- The size of this table is linear in the number of bugs
-- The Like operator is 'good' enough for this

DROP TABLE IF EXISTS ghostrank_bug_stats;

CREATE TABLE ghostrank_bug_stats (
  bug_id 			binary(32) NOT NULL DEFAULT 0,
  bug_name			varchar(255) NOT NULL DEFAULT '',
  domain_count			NUMERIC NOT NULL DEFAULT 1,
  pageviews_sum			NUMERIC NOT NULL DEFAULT 1,
  last_modified 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  timeslot 			DATETIME NOT NULL,
  PRIMARY KEY (timeslot,bug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;

----------------
-- The size of this table is linear in the number of domains
-- We'll need some other method of indexing the domain_names - MySQL is not a great solution

DROP TABLE IF EXISTS ghostrank_domain_stats;

CREATE TABLE ghostrank_domain_stats (
  domain_id 			binary(32) NOT NULL DEFAULT 0,
  domain_name			varchar(255) NOT NULL DEFAULT '',
  bug_count			NUMERIC NOT NULL DEFAULT 1,
  pageviews_sum			NUMERIC NOT NULL DEFAULT 1,
  last_modified 		TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
  timeslot 			DATETIME NOT NULL,
  PRIMARY KEY (timeslot,domain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;






