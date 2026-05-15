UPDATE app_settings 
SET value = REPLACE(value, 'Sábado: 8h às 13h', 'Sábado: 8h às 12h')
WHERE key = 'system_prompt';