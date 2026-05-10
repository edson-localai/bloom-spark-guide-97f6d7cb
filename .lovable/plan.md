To make WhatsApp functional, I will implement a connection to the Evolution API (the industry standard for WhatsApp CRMs). This includes handling both sending and receiving messages.

### 1. Infrastructure & Backend
- **Database Settings**: Add `whatsapp_api_url` and `whatsapp_api_key` to the `app_settings` table to store your Evolution API credentials securely.
- **Outbound Messages (Edge Function)**: Create a `whatsapp-outbound` Edge Function. I will set up a Supabase Database Webhook to trigger this function whenever a new message is inserted in the `messages` table (by an agent or the AI bot). This function will then call the Evolution API to send the message to the client's phone.
- **Inbound Messages (Edge Function)**: Create a `whatsapp-inbound` Edge Function to serve as a webhook receiver. You will configure this URL in your Evolution API panel. It will handle incoming messages, creating/updating contacts and conversations automatically.

### 2. UI Enhancements
- **WhatsApp Management Page**: Update the page to allow you to configure the API URL and API Key.
- **Instance Connection**: Implement the "Nova Conexão" button to actually create an instance in the Evolution API and display the QR Code in real-time for pairing.
- **Status Sync**: Implement a sync button to refresh the connection status and phone number of each instance.

### 3. Workflow
- Once configured, any message you type in the CRM will go to the client's WhatsApp.
- Any message the client sends will appear in your CRM in real-time.
- The AI "Clara" will be able to respond automatically if the bot status is active.

**Do you have an Evolution API instance ready, or should I proceed with the generic implementation so you can fill in the credentials later?**
