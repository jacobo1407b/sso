CREATE OR REPLACE FUNCTION generate_client_id(app_type TEXT)
RETURNS TEXT AS $$
DECLARE
  timestamp BIGINT := EXTRACT(EPOCH FROM clock_timestamp()) * 1000;
  hash TEXT := encode(gen_random_bytes(11), 'hex'); -- 22 caracteres
BEGIN
  RETURN format('sso:%s:%s:%s', timestamp, app_type, hash);
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE OR REPLACE FUNCTION set_client_id_from_app_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.CLIENT_ID = '1' THEN
    NEW.CLIENT_ID := generate_client_id(NEW.APP_TYPE);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_client_id
BEFORE INSERT ON "public"."SSO_AUTH_CLIENTS_T"
FOR EACH ROW
EXECUTE FUNCTION set_client_id_from_app_type();
