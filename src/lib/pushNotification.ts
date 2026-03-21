interface PushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
}

export async function sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, unknown>) {
  if (!pushToken || !pushToken.startsWith('ExponentPushToken')) return

  const message: PushMessage = {
    to: pushToken,
    title,
    body,
    data,
  }

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
  } catch (e) {
    console.error('[Push] Failed to send notification:', e)
  }
}
