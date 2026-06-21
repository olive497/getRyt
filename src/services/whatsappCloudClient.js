function getWhatsAppConfig() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || 'v25.0',
  };
}

function assertWhatsAppConfig(config) {
  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error('WhatsApp Cloud API is not configured.');
  }
}

async function sendWhatsAppTextMessage({ to, body, fetchImpl = fetch }) {
  if (!to || !body) {
    throw new Error('WhatsApp recipient and message body are required.');
  }

  const config = getWhatsAppConfig();
  assertWhatsAppConfig(config);

  const response = await fetchImpl(
    `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body,
        },
      }),
    },
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`WhatsApp send failed with status ${response.status}: ${responseText}`);
  }

  return response.json();
}

module.exports = {
  sendWhatsAppTextMessage,
};
