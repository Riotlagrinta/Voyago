-- Voyago Database Schema for Supabase
-- Converted from Prisma schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Role Enum
create type user_role as enum ('passenger', 'company_admin', 'driver', 'super_admin');

-- Company Status Enum
create type company_status as enum ('pending', 'active', 'suspended');

-- Bus Type Enum
create type bus_type as enum ('standard', 'vip', 'climatise', 'minibus');

-- Bus Status Enum
create type bus_status as enum ('active', 'maintenance', 'inactive');

-- Seat Type Enum
create type seat_type as enum ('standard', 'vip');

-- Booking Status Enum
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

-- Payment Method Enum
create type payment_method as enum ('tmoney', 'flooz', 'cash');

-- Payment Status Enum
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');

-- Users Table
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    email varchar(150) unique not null,
    phone varchar(20) unique,
    password_hash text not null,
    role user_role default 'passenger',
    avatar_url text,
    is_active boolean default true,
    email_verified boolean default false,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now()
);

-- Companies Table
create table public.companies (
    id uuid primary key default uuid_generate_v4(),
    name varchar(150) not null,
    slug varchar(150) unique not null,
    logo_url text,
    banner_url text,
    theme_color varchar(7) default '#50C9CE',
    slogan varchar(200),
    description text,
    phone varchar(20),
    email varchar(150),
    address text,
    city varchar(100),
    status company_status default 'pending',
    certified boolean default false,
    admin_id uuid not null,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (admin_id) references public.users(id) on delete restrict
);

-- Company Gallery Table
create table public.company_gallery (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null,
    image_url text not null,
    caption varchar(200),
    display_order integer default 0,
    created_at timestamptz(6) default now(),
    foreign key (company_id) references public.companies(id) on delete cascade
);

-- Buses Table
create table public.buses (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null,
    plate_number varchar(20) unique not null,
    name varchar(100),
    type bus_type default 'standard',
    capacity integer not null,
    status bus_status default 'active',
    photo_url text,
    amenities text[] default '{}',
    manufacture_year integer,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (company_id) references public.companies(id) on delete cascade
);

-- Seats Table
create table public.seats (
    id uuid primary key default uuid_generate_v4(),
    bus_id uuid not null,
    seat_number integer not null,
    type seat_type default 'standard',
    row_pos integer not null,
    col_pos integer not null,
    foreign key (bus_id) references public.buses(id) on delete cascade,
    unique(bus_id, seat_number)
);

-- Drivers Table
create table public.drivers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid,
    company_id uuid not null,
    name varchar(100) not null,
    phone varchar(20) not null,
    license_number varchar(50) unique not null,
    license_expiry date,
    experience_years integer default 0,
    photo_url text,
    is_active boolean default true,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (user_id) references public.users(id) on delete set null,
    foreign key (company_id) references public.companies(id) on delete cascade
);

-- Stations Table (with PostGIS extension)
create extension if not exists postgis;

create table public.stations (
    id uuid primary key default uuid_generate_v4(),
    name varchar(150) not null,
    city varchar(100) not null,
    address text,
    location geography(Point, 4326),
    created_at timestamptz(6) default now()
);

-- Routes Table
create table public.routes (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid not null,
    departure_station_id uuid not null,
    arrival_station_id uuid not null,
    distance_km decimal(8,2),
    duration_min integer,
    is_active boolean default true,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (company_id) references public.companies(id) on delete cascade,
    foreign key (departure_station_id) references public.stations(id),
    foreign key (arrival_station_id) references public.stations(id)
);

-- Route Stops Table
create table public.route_stops (
    id uuid primary key default uuid_generate_v4(),
    route_id uuid not null,
    station_id uuid not null,
    stop_order integer not null,
    arrival_time_offset_min integer,
    departure_time_offset_min integer,
    created_at timestamptz(6) default now(),
    foreign key (route_id) references public.routes(id) on delete cascade,
    foreign key (station_id) references public.stations(id),
    unique(route_id, station_id),
    unique(route_id, stop_order)
);

-- Schedules Table
create table public.schedules (
    id uuid primary key default uuid_generate_v4(),
    route_id uuid not null,
    bus_id uuid not null,
    driver_id uuid,
    departure_time timestamptz(6) not null,
    arrival_time timestamptz(6),
    price decimal(10,2) not null,
    available_seats integer not null,
    status varchar(20) default 'scheduled',
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (route_id) references public.routes(id) on delete cascade,
    foreign key (bus_id) references public.buses(id),
    foreign key (driver_id) references public.drivers(id) on delete set null
);

-- Bookings Table
create table public.bookings (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    schedule_id uuid not null,
    seat_id uuid not null,
    seat_number integer not null,
    status booking_status default 'pending',
    qr_code varchar unique,
    total_price decimal(10,2) not null,
    passenger_name varchar(100),
    passenger_phone varchar(20),
    locked_until timestamptz(6),
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (user_id) references public.users(id) on delete restrict,
    foreign key (schedule_id) references public.schedules(id) on delete restrict,
    foreign key (seat_id) references public.seats(id),
    unique(schedule_id, seat_id)
);

-- Payments Table
create table public.payments (
    id uuid primary key default uuid_generate_v4(),
    booking_id uuid not null,
    amount decimal(10,2) not null,
    method payment_method not null,
    status payment_status default 'pending',
    phone_number varchar(20),
    reference varchar(100) unique,
    gateway_response jsonb,
    created_at timestamptz(6) default now(),
    updated_at timestamptz(6) default now(),
    foreign key (booking_id) references public.bookings(id) on delete restrict
);

-- Reviews Table
create table public.reviews (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null,
    company_id uuid not null,
    booking_id uuid unique,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamptz(6) default now(),
    foreign key (user_id) references public.users(id) on delete cascade,
    foreign key (company_id) references public.companies(id) on delete cascade,
    foreign key (booking_id) references public.bookings(id) on delete set null
);

-- GPS Positions Table
create table public.gps_positions (
    id uuid primary key default uuid_generate_v4(),
    schedule_id uuid not null,
    location geography(Point, 4326) not null,
    speed decimal(5,2),
    recorded_at timestamptz(6) default now(),
    foreign key (schedule_id) references public.schedules(id) on delete cascade
);

-- Enable Row Level Security (RLS) on all tables
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.company_gallery enable row level security;
alter table public.buses enable row level security;
alter table public.seats enable row level security;
alter table public.drivers enable row level security;
alter table public.stations enable row level security;
alter table public.routes enable row level security;
alter table public.route_stops enable row level security;
alter table public.schedules enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.gps_positions enable row level security;

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';

-- Apply updated_at triggers to tables that have this column
do $$
declare
    tables text[] := array[
        'users', 'companies', 'company_gallery', 'buses', 
        'drivers', 'routes', 'schedules', 'payments'
    ];
    table_name text;
begin
    foreach table_name in array tables loop
        execute format(
            'create trigger update_%s_updated_at before update on %s for each row execute procedure update_updated_at_column();',
            table_name, table_name
        );
    end loop;
end $$;