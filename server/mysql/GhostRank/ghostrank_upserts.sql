
INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Doubleclick', MD5('Doubleclick'), 'engadgeted.net', MD5('engadgeted.net'), 
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Adsense', MD5('Google Adsense'), 'engadgeted.net', MD5('engadgeted.net'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Analytics', MD5('Google Analytics'), 'engadgeted.net', MD5('engadgeted.net'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Analytics', MD5('Google Analytics'), 'arizonagunrunners.net', MD5('arizonagunrunners.net'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Doubleclick', MD5('Doubleclick'), 'arizonagunrunners.net', MD5('arizonagunrunners.net'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Analytics', MD5('Google Analytics'), 'bumblebeeauctions.co.uk', MD5('bumblebeeauctions.co.uk'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Analytics', MD5('Google Analytics'), 'elecard.com', MD5('elecard.com'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Adsense', MD5('Google Adsense'), 'elecard.com', MD5('elecard.com'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Analytics', MD5('Google Analytics'), 'elecard.com', MD5('elecard.com'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Google Adsense', MD5('Google Adsense'), 'opponent.se', MD5('opponent.se'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);

INSERT INTO ghostrank_entry_history_bybug (timeslot,bug_name,bug_id,domain_name,domain_id,pageviews,created_on)
   VALUES (DATE(CURRENT_TIMESTAMP()), 'Doubleclick', MD5('Doubleclick'), 'opponent.se', MD5('opponent.se'),
   FLOOR(RAND() * 25), CURRENT_TIMESTAMP())
   ON DUPLICATE KEY UPDATE pageviews=pageviews+FLOOR(RAND() * 25);


