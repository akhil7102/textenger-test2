-- Create enums
create type room_role as enum ('owner','admin','moderator','member');
create type channel_type as enum ('text','voice');

-- Rooms table
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Room members (with roles)
create table if not exists room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role room_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Channels
create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  name text not null,
  type channel_type not null default 'text',
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text,
  attachments jsonb default '[]'::jsonb,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Message reactions
create table if not exists message_reactions (
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

-- Channel read status
create table if not exists channel_reads (
  channel_id uuid references channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

-- Invites
create table if not exists invites (
  token text primary key,
  room_id uuid not null references rooms(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Moderation reports
create table if not exists moderation_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete set null,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_messages_fts on messages using gin (to_tsvector('simple', coalesce(content,'')));
create index if not exists idx_messages_channel_time on messages(channel_id, created_at desc);
create index if not exists idx_room_members_user on room_members(user_id);
create index if not exists idx_channels_room_position on channels(room_id, position);

-- Enable RLS on all tables
alter table rooms enable row level security;
alter table room_members enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;
alter table message_reactions enable row level security;
alter table channel_reads enable row level security;
alter table invites enable row level security;
alter table moderation_reports enable row level security;

-- Helper function to check if user is member of room
create or replace function public.user_is_room_member(room_uuid uuid, user_uuid uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.room_members
    where room_id = room_uuid
      and user_id = user_uuid
  )
$$;

-- Helper function to get user role in room
create or replace function public.get_user_room_role(room_uuid uuid, user_uuid uuid)
returns room_role
language sql
stable
security definer
as $$
  select role
  from public.room_members
  where room_id = room_uuid
    and user_id = user_uuid
$$;

-- RLS Policies

-- Rooms: visible to members, insertable by authenticated users
create policy "Users can view rooms they are members of"
on public.rooms
for select
to authenticated
using (public.user_is_room_member(id, auth.uid()));

create policy "Authenticated users can create rooms"
on public.rooms
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Room owners and admins can update rooms"
on public.rooms
for update
to authenticated
using (
  public.get_user_room_role(id, auth.uid()) in ('owner', 'admin')
);

create policy "Room owners can delete rooms"
on public.rooms
for delete
to authenticated
using (owner_id = auth.uid());

-- Room members: visible to room members, manageable by owners/admins
create policy "Room members can view member list"
on public.room_members
for select
to authenticated
using (public.user_is_room_member(room_id, auth.uid()));

create policy "Users can join rooms"
on public.room_members
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Room owners and admins can manage members"
on public.room_members
for update
to authenticated
using (
  public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
);

create policy "Room owners and admins can remove members"
on public.room_members
for delete
to authenticated
using (
  public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
  or user_id = auth.uid() -- users can leave rooms themselves
);

-- Channels: visible to room members, manageable by admins/mods
create policy "Room members can view channels"
on public.channels
for select
to authenticated
using (public.user_is_room_member(room_id, auth.uid()));

create policy "Room admins can create channels"
on public.channels
for insert
to authenticated
with check (
  public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
);

create policy "Room admins can update channels"
on public.channels
for update
to authenticated
using (
  public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
);

create policy "Room admins can delete channels"
on public.channels
for delete
to authenticated
using (
  public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
);

-- Messages: visible to room members, insertable by members, editable by author or mods
create policy "Room members can view messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.channels c
    where c.id = channel_id
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Room members can send messages"
on public.messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.channels c
    where c.id = channel_id
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Users can edit own messages or mods can edit any"
on public.messages
for update
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.channels c
    where c.id = channel_id
      and public.get_user_room_role(c.room_id, auth.uid()) in ('owner', 'admin', 'moderator')
  )
);

create policy "Users can delete own messages or mods can delete any"
on public.messages
for delete
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.channels c
    where c.id = channel_id
      and public.get_user_room_role(c.room_id, auth.uid()) in ('owner', 'admin', 'moderator')
  )
);

-- Message reactions: room members only
create policy "Room members can view reactions"
on public.message_reactions
for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Room members can add reactions"
on public.message_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Users can remove own reactions"
on public.message_reactions
for delete
to authenticated
using (user_id = auth.uid());

-- Channel reads: users can manage their own read status
create policy "Users can manage their own read status"
on public.channel_reads
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Invites: room admins can create, anyone can view valid invites
create policy "Anyone can view valid invites"
on public.invites
for select
to authenticated
using (
  expires_at is null or expires_at > now()
);

create policy "Room admins can create invites"
on public.invites
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.get_user_room_role(room_id, auth.uid()) in ('owner', 'admin')
);

-- Moderation reports: room members can report, mods can view
create policy "Room members can create reports"
on public.moderation_reports
for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and exists (
    select 1
    from public.messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Room moderators can view reports"
on public.moderation_reports
for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    join public.channels c on c.id = m.channel_id
    where m.id = message_id
      and public.get_user_room_role(c.room_id, auth.uid()) in ('owner', 'admin', 'moderator')
  )
);

-- Storage buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('attachments', 'attachments', false)
on conflict (id) do nothing;

-- Storage policies for avatars (public read)
create policy "Avatar images are publicly accessible"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for attachments (private, signed URLs)
create policy "Room members can view attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'attachments'
  and exists (
    select 1
    from public.messages m
    join public.channels c on c.id = m.channel_id
    where m.attachments @> jsonb_build_array(jsonb_build_object('key', name))
      and public.user_is_room_member(c.room_id, auth.uid())
  )
);

create policy "Authenticated users can upload attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for relevant tables
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_reactions;
alter publication supabase_realtime add table channels;
alter publication supabase_realtime add table room_members;