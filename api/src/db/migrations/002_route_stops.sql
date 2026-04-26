-- ─── TABLE : route_stops ──────────────────────────────────────────
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  stop_order INT NOT NULL,
  arrival_time_offset_min INT, -- min depuis le départ
  departure_time_offset_min INT, -- min depuis le départ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, station_id),
  UNIQUE(route_id, stop_order)
);

CREATE INDEX idx_route_stops_route ON route_stops(route_id);
