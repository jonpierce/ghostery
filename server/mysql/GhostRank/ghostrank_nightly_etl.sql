

-- Notes
-- This query simply copies a days worth of data from a table with a primary key on bug to one on domain
-- MySQL isn't great on indexing high churn tables - so this is not necessary until GhostRank is at BIG DATA
-- Possibly some other data technology like Hive could be a better solution
REPLACE INTO ghostrank_entry_history_bydomain (bug_id,bug_name,domain_id,domain_name,pageviews,created_on,last_modified,timeslot)
  SELECT bug_id,bug_name,domain_id,domain_name,pageviews,created_on,last_modified,timeslot FROM ghostrank_entry_history_bybug
    WHERE timeslot = DATE_ADD(CURDATE(), INTERVAL -1 DAY);

-- Notes
-- This query does a 7 day average of the daily buckets - great for a base analytics display
-- clone for a 30 day average
REPLACE INTO ghostrank_entry_summary (bug_id,bug_name,domain_id,domain_name,avg_pageviews,created_on,last_modified,timeslot, term)
  SELECT bug_id,bug_name,domain_id,domain_name,
    ROUND(AVG(pageviews)) as avg_pageviews,
    MIN(created_on) as created_on,
    MAX(last_modified) as last_modified,
    DATE(MAX(timeslot)) as timeslot,
    DATEDIFF(DATE_ADD(CURDATE(), INTERVAL -1 DAY), DATE_ADD(CURDATE(), INTERVAL -7  DAY))+1 as term
    FROM ghostrank_entry_history_bybug
    WHERE timeslot >= DATE_ADD(CURDATE(), INTERVAL -7  DAY) AND timeslot <= DATE_ADD(CURDATE(), INTERVAL -1 DAY)
    GROUP BY bug_id,domain_id;

-- Notes
-- This query calcs bug stats over the last 7 days
-- again once GhostRank is at BIG DATA this can break down in efficiency.. but implementing this in Hadoop is trivial
REPLACE INTO ghostrank_bug_stats (bug_id,bug_name,domain_count,pageviews_sum,last_modified,timeslot)
  SELECT bug_id,bug_name,
    COUNT(DISTINCT(domain_id)) as domain_count,
    SUM(pageviews) as pageviews_sum,
    MAX(last_modified) as last_modified,
    DATE(MAX(timeslot)) as timeslot
    FROM ghostrank_entry_history_bybug
    WHERE timeslot >= DATE_ADD(CURDATE(), INTERVAL -7  DAY) AND timeslot <= DATE_ADD(CURDATE(), INTERVAL -1 DAY)
    GROUP BY bug_id;

-- Notes
-- This query calcs domain stats over the last 7 days
-- again once GhostRank is at BIG DATA this can break down in efficiency.. but implementing this in Hadoop is trivial
REPLACE INTO ghostrank_domain_stats (domain_id,domain_name,bug_count,pageviews_sum,last_modified,timeslot)
  SELECT domain_id,domain_name,
    COUNT(DISTINCT(bug_id)) as bug_count,
    SUM(pageviews) as pageviews_sum,
    MAX(last_modified) as last_modified,
    DATE(MAX(timeslot)) as timeslot
    FROM ghostrank_entry_history_bybug
    WHERE timeslot >= DATE_ADD(CURDATE(), INTERVAL -7  DAY) AND timeslot <= DATE_ADD(CURDATE(), INTERVAL -1 DAY)
    GROUP BY domain_id;



