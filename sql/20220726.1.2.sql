create table IF NOT EXISTS cnt_seminar (
    id uuid not null primary key,
    id_user uuid not null references "user"(id), -- creator
    create_time timestamp not null,
    "name" varchar(255) not null,
    "path" varchar(255) not null,
    "description" varchar(8000) not null,
    public boolean not null
);

create table IF NOT EXISTS cnt_version (
    id uuid not null primary key,
    id_user uuid not null references "user"(id), -- creator
    id_seminar uuid not null references cnt_seminar(id),
    create_time timestamp not null,
    "version" integer not null,
    "notes" varchar(8000) not null
);

create table IF NOT EXISTS cnt_section (
    id uuid not null primary key,
    id_user uuid not null references "user"(id), -- creator
    id_seminar uuid not null references cnt_seminar(id),
    create_time timestamp not null,
    "name" varchar(255) not null,
    "description" varchar(8000) not null,
    "type" int not null, -- 0:html, 1:markdown
    "content" text not null,
    premium boolean not null,
    premium_required_product varchar(500) null -- what is the I2P product required - TODO: convert this into a FK when the I2P extension is ready
);

create table IF NOT EXISTS cnt_changelog (
    id uuid not null primary key,
    id_user uuid not null references "user"(id), -- creator
    id_section uuid not null references cnt_section(id),
    create_time timestamp not null,
    "name" varchar(255) not null,
    "description" varchar(8000) not null,
    "type" int not null, -- 0:html, 1:markdown
    "content" text not null,
    premium boolean not null,
    premium_required_product varchar(500) null -- what is the I2P product required - TODO: convert this into a FK when the I2P extension is ready
);

create table IF NOT EXISTS cnt_action (
    id uuid not null primary key,
    id_user uuid not null references "user"(id), -- creator
    id_changelog uuid not null references cnt_changelog(id),
    create_time timestamp not null,
    "type" int not null -- 0:seen, 1:marked as done.
);

alter table cnt_seminar add column if not exists delete_time timestamp null;

alter table cnt_section add column if not exists delete_time timestamp null;

alter table cnt_section add column if not exists premium_blured_screenshot_url varchar(8000) null;

alter table cnt_changelog add column if not exists premium_blured_screenshot_url varchar(8000) null;