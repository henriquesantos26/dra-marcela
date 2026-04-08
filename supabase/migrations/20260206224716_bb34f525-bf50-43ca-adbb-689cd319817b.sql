
-- Fix encryption functions using extensions schema
CREATE OR REPLACE FUNCTION public.encrypt_api_key(plain_key text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN encode(extensions.pgp_sym_encrypt(plain_key::bytea, '7zion_enc_key_2024'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_api_key(encrypted_key text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN convert_from(extensions.pgp_sym_decrypt(decode(encrypted_key, 'base64'), '7zion_enc_key_2024'), 'utf-8');
END;
$$;
