-- Schema for evaluator-service (Oracle)
-- NOTE: The canonical schema is in infrastructure/oracle/V1__init_schema.sql
-- This file is kept as a reference for this service's tables only.

-- EVALUATIONS table
DECLARE
    table_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO table_exists FROM user_tables WHERE table_name = 'EVALUATIONS';
    IF table_exists = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE TABLE EVALUATIONS (
                ID               NUMBER        NOT NULL,
                SESSION_ID       VARCHAR2(255) NOT NULL,
                STUDENT_ID       VARCHAR2(255) NOT NULL,
                QUESTION_TEXT    CLOB,
                STUDENT_ANSWER   CLOB,
                CORRECT_ANSWER   CLOB,
                SCORE            NUMBER(10),
                MAX_SCORE        NUMBER(10),
                FEEDBACK_SUMMARY CLOB,
                TOPIC_ID         NUMBER,
                EVALUATED_AT     TIMESTAMP,
                CONSTRAINT PK_EVALUATIONS PRIMARY KEY (ID)
            )
        ';
    END IF;
END;
/

-- Sequence
DECLARE
    seq_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO seq_exists FROM user_sequences WHERE sequence_name = 'SEQ_EVALUATIONS';
    IF seq_exists = 0 THEN
        EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_EVALUATIONS START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    END IF;
END;
/

-- Indexes on EVALUATIONS
DECLARE
    idx_exists NUMBER;
BEGIN
    SELECT COUNT(*) INTO idx_exists FROM user_indexes WHERE index_name = 'IDX_EVAL_STUDENT';
    IF idx_exists = 0 THEN
        EXECUTE IMMEDIATE 'CREATE INDEX IDX_EVAL_STUDENT ON EVALUATIONS(STUDENT_ID)';
    END IF;

    SELECT COUNT(*) INTO idx_exists FROM user_indexes WHERE index_name = 'IDX_EVAL_SESSION';
    IF idx_exists = 0 THEN
        EXECUTE IMMEDIATE 'CREATE INDEX IDX_EVAL_SESSION ON EVALUATIONS(SESSION_ID)';
    END IF;

    SELECT COUNT(*) INTO idx_exists FROM user_indexes WHERE index_name = 'IDX_EVAL_TOPIC';
    IF idx_exists = 0 THEN
        EXECUTE IMMEDIATE 'CREATE INDEX IDX_EVAL_TOPIC ON EVALUATIONS(TOPIC_ID)';
    END IF;
END;
/
