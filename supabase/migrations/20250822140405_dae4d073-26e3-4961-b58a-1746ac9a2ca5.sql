-- Fix search path for security functions
drop function if exists public.user_is_room_member(uuid, uuid);
drop function if exists public.get_user_room_role(uuid, uuid);

-- Helper function to check if user is member of room (with proper search path)
create or replace function public.user_is_room_member(room_uuid uuid, user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members
    where room_id = room_uuid
      and user_id = user_uuid
  )
$$;

-- Helper function to get user role in room (with proper search path)
create or replace function public.get_user_room_role(room_uuid uuid, user_uuid uuid)
returns room_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.room_members
  where room_id = room_uuid
    and user_id = user_uuid
$$;