-- select * from email.email_subscriptions 
-- #where email_address = '' 
-- LIMIT 1000;

-- Get email_subscription
-- SELECT
--     [ALL | DISTINCT | DISTINCTROW ]
--       [HIGH_PRIORITY]
--       [STRAIGHT_JOIN]
--       [SQL_SMALL_RESULT] [SQL_BIG_RESULT] [SQL_BUFFER_RESULT]
--       [SQL_CACHE | SQL_NO_CACHE] [SQL_CALC_FOUND_ROWS]
--     select_expr [, select_expr ...]
--     [FROM table_references
--     [WHERE where_condition]
--     [GROUP BY {col_name | expr | position}
--       [ASC | DESC], ... [WITH ROLLUP]]
--     [HAVING where_condition]
--     [ORDER BY {col_name | expr | position}
--       [ASC | DESC], ...]
--     [LIMIT {[offset,] row_count | row_count OFFSET offset}]
--     [PROCEDURE procedure_name(argument_list)]
--     [INTO OUTFILE 'file_name'
--         [CHARACTER SET charset_name]
--         export_options
--       | INTO DUMPFILE 'file_name'
--       | INTO var_name [, var_name]]
--     [FOR UPDATE | LOCK IN SHARE MODE]]

SELECT email_address, hostsite, job_recommendation, marketing, partner, application_viewed, resume_viewed, sysinserteddt, sysmodifieddt
FROM `email`.`email_subscriptions` LIMIT 1000;

-- -- vEmailSubscriptions: get email_subscription
-- USE `email`;
-- CREATE 
--      OR REPLACE ALGORITHM = UNDEFINED 
--     DEFINER = `consumerland`@`%` 
--     SQL SECURITY DEFINER
-- VIEW `email`.`vEmailSubscription` AS
--     SELECT email_address, hostsite, job_recommendation, marketing, partner, application_viewed, resume_viewed, sysinserteddt, sysmodifieddt
-- FROM `email`.`email_subscriptions` LIMIT 1;

-- --Create email_subscription
-- INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
--     [INTO] tbl_name [(col_name,...)]
--     {VALUES | VALUE} ({expr | DEFAULT},...),(...),...
--     [ ON DUPLICATE KEY UPDATE
--       col_name=expr
--         [, col_name=expr] ... ]
-- # Or
-- INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
--     [INTO] tbl_name
--     SET col_name={expr | DEFAULT}, ...
--     [ ON DUPLICATE KEY UPDATE
--       col_name=expr
--         [, col_name=expr] ... ]
-- # Or
-- INSERT [LOW_PRIORITY | HIGH_PRIORITY] [IGNORE]
--     [INTO] tbl_name [(col_name,...)]
--     SELECT ...
--     [ ON DUPLICATE KEY UPDATE
--       col_name=expr
--         [, col_name=expr] ... ]
-- 

-- -- Update email_subscription
-- # Single-table syntax:
-- UPDATE [LOW_PRIORITY] [IGNORE] table_reference
--     SET col_name1={expr1|DEFAULT} [, col_name2={expr2|DEFAULT}] ...
--     [WHERE where_condition]
--     [ORDER BY ...]
--     [LIMIT row_count]
-- 
-- # Multiple-table syntax:
-- UPDATE [LOW_PRIORITY] [IGNORE] table_references
--     SET col_name1={expr1|DEFAULT} [, col_name2={expr2|DEFAULT}] ...
--     [WHERE where_condition]
-- 

