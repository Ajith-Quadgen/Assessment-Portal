show databases;
use quadgenassesmentportal;
DESCRIBE repeatrequest;
alter table repeatrequest add column userID varchar(10) not null; 
SELECT R.id as RequestID,R. from repeatrequest R,assessments A where R.assessmentkey = A.AssesmentKey;
SELECT * from repeatrequest;
SELECT * from assessments;
SELECT * from assessments where AssesmentKey="x0odn5E5WFv1QMA7IX49otPtSGl09n";
select A.CreatedBy,U.employeeName from assessments as A join userlogin as U where AssesmentKey="x0odn5E5WFv1QMA7IX49otPtSGl09n" and A.CreatedBy=U.empId;