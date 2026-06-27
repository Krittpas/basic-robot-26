-- =====================================================
-- Basic Robot 26 — Database Schema
-- รันใน Supabase SQL Editor (Project → SQL Editor → New query)
-- =====================================================

-- ลบของเก่าก่อน (ถ้ารันซ้ำ)
drop table if exists heats cascade;
drop table if exists groups cascade;
drop table if exists mission_state cascade;

-- =====================================================
-- HEATS — ตารางแข่งวิ่งเร็ว 8 heats, 6 เลน
-- =====================================================
create table heats (
  id            int primary key,
  heat_order    int not null,
  round_name    text not null,           -- 'แบ่งกลุ่ม' | 'รอบรองชนะเลิศ' | 'รอบชิงชนะเลิศ'
  heat_label    text not null,           -- 'สาย A' | 'Semi Final 1' | 'Final'
  lane1_team    text,
  lane2_team    text,
  lane3_team    text,
  lane4_team    text,
  lane5_team    text,
  lane6_team    text,
  lane1_time    numeric(6,3),            -- วินาที ทศนิยม 3 ตำแหน่ง
  lane2_time    numeric(6,3),
  lane3_time    numeric(6,3),
  lane4_time    numeric(6,3),
  lane5_time    numeric(6,3),
  lane6_time    numeric(6,3),
  is_finished   boolean default false,
  updated_at    timestamptz default now()
);

-- Seed 8 heats ตาม bracket
insert into heats (id, heat_order, round_name, heat_label, lane1_team, lane2_team, lane3_team, lane4_team, lane5_team, lane6_team) values
  (1, 1, 'แบ่งกลุ่ม',       'สาย A',        '46-01',  '46-02',  '46-03',  '46-04',  '46-05',  null),
  (2, 2, 'แบ่งกลุ่ม',       'สาย B',        '46-06',  '46-07',  '46-08',  '46-09',  '46-10',  null),
  (3, 3, 'แบ่งกลุ่ม',       'สาย C',        '410-01', '410-02', '410-03', '410-04', '410-05', null),
  (4, 4, 'แบ่งกลุ่ม',       'สาย D',        '410-06', '410-07', '410-08', '410-09', '410-10', null),
  (5, 5, 'แบ่งกลุ่ม',       'สาย E',        '410-11', '410-12', '410-13', '410-14', '46-11',  '46-12'),
  (6, 6, 'รอบรองชนะเลิศ',   'Semi Final 1', null, null, null, null, null, null),
  (7, 7, 'รอบรองชนะเลิศ',   'Semi Final 2', null, null, null, null, null, null),
  (8, 8, 'รอบชิงชนะเลิศ',   'Final',        null, null, null, null, null, null);

-- =====================================================
-- GROUPS — 13 กลุ่ม
-- =====================================================
create table groups (
  id          int primary key,
  name        text not null,
  score       int not null default 0,
  updated_at  timestamptz default now()
);

insert into groups (id, name, score)
select n, 'กลุ่ม ' || n, 0
from generate_series(1, 13) as n;

-- =====================================================
-- MISSION STATE — ภารกิจ (ล็อคไว้ก่อน)
-- =====================================================
create table mission_state (
  id          int primary key default 1,
  is_locked   boolean not null default true,
  message     text default 'ภารกิจจะเปิดให้เข้าถึงในวันแข่งขัน',
  updated_at  timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into mission_state (id) values (1);

-- =====================================================
-- RLS — เปิด read ทั่วถึง, write บล็อกหมด (เขียนผ่าน service role เท่านั้น)
-- =====================================================
alter table heats         enable row level security;
alter table groups        enable row level security;
alter table mission_state enable row level security;

create policy "public read heats"   on heats         for select using (true);
create policy "public read groups"  on groups        for select using (true);
create policy "public read mission" on mission_state for select using (true);

-- ไม่สร้าง policy สำหรับ insert/update/delete
-- → anon key เขียนไม่ได้ ต้องเขียนผ่าน API route ที่ใช้ service_role
