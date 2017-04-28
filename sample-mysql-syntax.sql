#execute direct sql query
SELECT *, CONCAT(LOWER(employees.first_name), '.', LOWER(employees.last_name),'@company.com') as email 
FROM employees.employees LIMIT 1000;

#execute stored procedure
call employees.getEmployees;


/*
SELECT
`current_dept_emp`.`emp_no`,
`current_dept_emp`.`dept_no`,
`current_dept_emp`.`from_date`,
`current_dept_emp`.`to_date`
FROM `employees`.`current_dept_emp`;
*/
select * from `employees`.`dept_emp_latest_date`;
-- PROD
-- delimiter $$
-- 
-- CREATE TABLE `email_subscriptions` (
--   `email_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
--   `hostsite` varchar(2) COLLATE utf8_unicode_ci NOT NULL,
--   `job_recommendation` tinyint(1) NOT NULL DEFAULT '0',
--   `marketing` tinyint(1) NOT NULL DEFAULT '0',
--   `partner` tinyint(1) NOT NULL DEFAULT '0',
--   `application_viewed` tinyint(1) NOT NULL DEFAULT '0',
--   `resume_viewed` tinyint(1) NOT NULL DEFAULT '0',
--   `sysinserteddt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   `sysmodifieddt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (`email_address`),
--   KEY `idx_email` (`email_address`),
--   KEY `idx_hostsite` (`hostsite`),
--   KEY `idx_sysinserteddt` (`sysinserteddt`),
--   KEY `idx_sysmodifieddt` (`sysmodifieddt`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
-- /*!50100 PARTITION BY KEY ()
-- PARTITIONS 10 */$$

-- --LOCAL
/*
-- --SQL Statement:
CREATE TABLE `email_subscriptions` (
  `email_address` varchar(255)  COLLATE utf8_unicode_ci NOT NULL,
  `hostsite` varchar(2) COLLATE utf8_unicode_ci NOT NULL,
  `job_recommendation` tinyint(1) NOT NULL DEFAULT '0',
  `marketing` tinyint(1)  NOT NULL DEFAULT '0',
  `partner` tinyint(1) DEFAULT NULL,
  `application_viewed` tinyint(1)  NOT NULL DEFAULT '0',
  `resume_viewed` tinyint(1)  NOT NULL DEFAULT '0',
  `sysinserteddt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sysmodifieddt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`email_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
*/