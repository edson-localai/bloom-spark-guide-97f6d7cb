UPDATE app_settings 
SET value = REPLACE(value, 'Até 8 meses em produtos selecionados', 'Garantia de peças até 6 meses')
WHERE key = 'system_prompt';