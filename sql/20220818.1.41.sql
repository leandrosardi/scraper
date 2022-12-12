alter table cnt_seminar add column if not exists "type" int not null default 0; 
-- 0: progressive seminar 
-- 1: plain article 

alter table cnt_seminar add column if not exists show_abstract boolean not null default true;

alter table cnt_seminar add column if not exists show_free_premium_badges boolean not null default true;

alter table cnt_seminar add column if not exists show_author boolean not null default true;

alter table cnt_seminar add column if not exists show_path boolean not null default true;
