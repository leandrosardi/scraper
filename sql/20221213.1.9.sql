-- scraping order is about replicating the fitlers of an `fl_search` on any site linke LinkedIn, and upload the HTML pages of its results.
-- user can request a reprocessing of the same search by duplicating the order.
create table if not exists scr_order (
    id uuid not null primary key,
    id_user uuid not null references "user"(id),
    create_time timestamp not null,
    delete_time timestamp null,
    "name" varchar(500) not null,
    "status" boolean not null,
    "type" int not null, -- 0: sales navigator 
    "url" text /*not*/ null -- the user don't have to provide it. It is added later by automation or manually.
);

-- HTML downloaded from the browser, and uploaded to CS, by the extension.
create table if not exists scr_page (
    id uuid not null primary key,
    create_time timestamp not null,
    id_order uuid not null references scr_order(id),
    -- pampa fields for visit/upload 
    upload_reservation_id varchar(500) null,
    upload_reservation_time timestamp null,
    upload_reservation_times int null,
    upload_start_time timestamp null,
    upload_end_time timestamp null,
    upload_success boolean null,
    upload_error_description text null,
    -- pampa fields for parsing
    parse_reservation_id varchar(500) null,
    parse_reservation_time timestamp null,
    parse_reservation_times int null,
    parse_start_time timestamp null,
    parse_end_time timestamp null,
    parse_success boolean null,
    parse_error_description text null
);

-- Trace when a user has its extension ACTIVE.
create table if not exists scr_activity (
    id uuid not null primary key,
    create_time timestamp not null,
    id_user uuid not null references "user"(id),
    "year" int not null,
    "month" int not null,
    "day" int not null,
    "hour" int not null,
    "minute" int not null,
    active boolean not null
);

-- the leads module will allow to filter by dfy_leads orders.
--alter table fl_search add column if not exists id_order uuid references scr_order(id) null;

-- users can install the linkedin-scraper extension on their browsers, and use it to scrape leads.
alter table "user" add column if not exists scraper_last_ping_time timestamp null;
alter table "user" add column if not exists scraper_last_ping_version varchar(500) null;

-- users can share their browsers to scrape other people orders and earn money.
alter table "user" add column if not exists scraper_share boolean not null default false;
alter table "user" add column if not exists scraper_ppp numeric(28,8) not null default 0.0025;

-- users can share their browsers to scrape other people orders and earn money.
alter table "user" add column if not exists scraper_stat_total_earnings numeric(28,8) not null default 0;
alter table "user" add column if not exists scraper_stat_total_payouts numeric(28,8) not null default 0;
alter table "user" add column if not exists scraper_stat_total_pages bigint not null default 0;

-- users can share their browsers to scrape other people orders and earn money.
create table scr_movement (
    id uuid not null primary key,
    create_time timestamp not null,
    id_user uuid not null references "user"(id),
    id_page uuid /*not*/ null references scr_page(id), -- required if it is an earning only
    "type" int not null, -- 0: earnings, 1: payout
    amount numeric(28,8) not null
);