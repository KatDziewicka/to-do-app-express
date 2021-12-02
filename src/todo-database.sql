DROP TABLE IF EXISTS todos;
CREATE TABLE todos (
    id serial primary key,
    description text not null,
 	due_date date,
  	id_overdue bool,
    notes text,
   	creation_date timestamp not null default now()
);