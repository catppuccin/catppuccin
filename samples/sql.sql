-- DDL section
create table crm.product (
                           id numeric primary key,
                           title varchar(255) character set utf8
);
-- DML section
insert into product
values (1, 'Product1');

select count(*) from crm.product;
select id as ProductID, title as ProductName
from crm.product where id = :id;

\set content `cat data.txt`
