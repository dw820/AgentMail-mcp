---
title: Messages
subtitle: The fundamental unit of communication for your agents.
slug: messages
description: >-
  Learn how to send, receive, and manage emails as Message objects with the
  AgentMail API.
---

## What is a Message?

In the AgentMail ecosystem, a `Message` is the API-first representation of a traditional email. It's a structured object containing all the elements you'd expect: a sender, recipients, a subject line, and the body of the email.

Every `Message` lives inside a `Thread` to keep conversations organized. When you send a new `Message`, a new `Thread` is created. When you reply, the new `Message` is added to the existing `Thread`. Literally a normal email thread as we now it.

One of the powerful features of AgentMail is the ability to seamlessly include humans in agent-driven conversations. You can `cc` or `bcc` a real person on any message your agent sends, creating a "human-in-the-loop" workflow for oversight, escalations, or quality assurance.

## Core Capabilities

You can interact with `Message` resources in several ways, from sending new `Messages` to listing a history of correspondence.

### 1. Initialize the Client

First, you need to initialize the AgentMail client with your API key. This client object is your gateway to interacting with the AgentMail API.

<CodeBlocks>
```python title="Python"
from agentmail import AgentMail

client = AgentMail(api_key="YOUR_API_KEY")

````
```typescript title="TypeScript"
import { AgentMailClient } from "agentmail";

const client = new AgentMailClient({ apiKey: "YOUR_API_KEY" });
````

</CodeBlocks>

### 2. Send a New `Message`

To start a new conversation, you can send a `Message` from one of your inboxes. This action will create a new `Thread` and return the `Message` object.

<CodeBlocks>
```python title="Python"
# You'll need an inbox ID to send from.
# Let's assume we have one:

sent_message = client.inboxes.messages.send(
inbox_id = 'my_inbox@domain.com'
labels=[
"outreach",
"startup"
],
subject="[YC S25] Founder Reachout ",
text="Hello, I'm Michael, and I'm a founder at AgentMail...",
html="<div dir=\"ltr\">Hello,<br><br>I'm Michael, and I'm a founder at AgentMail...")

print(f"Message sent successfully with ID: {sent_message.message_id}")

````
```typescript title="TypeScript"
// You'll need an inbox ID to send from.

const sentMessage = await client.inboxes.messages.send(
	"outreach@agentmail.to", // this is your inbox you are trying to send from
	{
		labels: [
				"outreach",
				"startup"
			],
		subject: "[YC S25] Founder Reachout ",
		text: "Hello, I'm Michael, and I'm a founder at AgentMail...",
		html: "<div dir=\"ltr\">Hello,<br><br>I'm Michael, and I'm a founder at AgentMail..."
	}
)

console.log(`Message sent successfully with ID: ${sentMessage.id}`);
````

</CodeBlocks>

### 3. List `Messages` in an `Inbox`

You can retrieve a list of all `Messages` within a specific `Inbox`. This is useful for getting a history of all correspondence.

<CodeBlocks>
```python title="Python"

all_messages = client.inboxes.messages.list(inbox_id='my_inbox@agentmail.to')

print(f"Found {all_messages.count} messages in the inbox.")
for message in all_messages:
print(f"- Subject: {message.subject}")

````
```typescript title="TypeScript"

const allMessages = await client.inboxes.messages.list("outreach@agentmail.to")

console.log(`Found ${allMessages.count} messages in the inbox.`);
allMessages.forEach((message) => {
  console.log(`- Subject: ${message.subject}`);
});
````

</CodeBlocks>

### 4. Reply to a `Message`

Replying to an existing `Message` adds your new `Message` to the same `Thread`, keeping the conversation organized.

<CodeBlocks>
```python title="Python" wordWrap

reply = client.inboxes.messages.reply(
inbox_id = 'my_inbox@domain.com'
message_id='msg_id',
text="Thanks for the referral!",
attachments=[
SendAttachment(
content="resume" # this would obviously be your resume content, refer to the attachment section of the core-concepts for more details
)
]
)

print(f"Reply sent successfully with ID: {reply.message_id}")

````
```typescript title="TypeScript"


const reply = await client.inboxes.messages.reply(
	"my_inbox@domain.com",
	"msg_id",
	{
		text: "Thanks for the referral!",
		attachments: [
				{
					content: "resume"
				}
			]
	}
)

console.log(`Reply sent successfully with ID: ${reply.id}`);
````

</CodeBlocks>

<Callout>
  Note that the `inbox_id` in reply is different from send, in that this is the
  `inbox_id` we are sending FROM. Remember we can have potentially infinite
  `Inboxes` to send from, so we need to tell the api which one we are sending
  from.
</Callout>
### 5. Get a `Message`

You can retrieve the details of any specific `Message` by providing its ID along with the `inbox_id` it belongs to.

<CodeBlocks>
```python title="Python"

message = client.inboxes.messages.get(inbox_id = 'my_inbox@agentmail.to', message_id = 'msg_id')

print(f"Retrieved message with subject: {message.subject}")

````
```typescript title="TypeScript"

await client.inboxes.messages.get(
	"my_inbox@domain.com",
	"msg_id"
)

console.log(`Retrieved message with subject: ${message.subject}`);
```
</CodeBlocks>

### Crafting Your Message: HTML, Text, and CSS

When sending a `Message`, you can provide the body in two formats: `text` for a plain-text version and `html` for a rich, styled version.

-   **`text`**: A simple, unformatted string. This is a fallback for email clients that don't render HTML, ensuring your message is always readable.
-   **`html`**: A full HTML document. This allows you to create visually rich emails with custom layouts, colors, fonts, and images.

<Tip>
  **Best Practice**: Always send both `text` and `html` versions.
</Tip>

## "Why both text and HTML?"

Most modern email clients will display the HTML version, not all of them can render HTML -- a text fallback makes sure your message is displayed regardless. Furthermore it significantly improves deliverability.

#### Styling with CSS

To style your HTML in the `Message`, you should embed your CSS directly inside a `<style>` tag in the `<head>` in the payload of the API request. This is the most reliable method for ensuring your styles are applied correctly across different email clients like Gmail, Outlook, and Apple Mail.

Here is an example of a well-structured and styled HTML header:

<CodeBlocks>
```html title="Styled HTML Email Example"
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AgentMail Invoice</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f8f9fa;
      }
      .email-wrapper {
        background: #ffffff;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }
      .email-header {
        background-color: #000000;
        color: #ffffff;
        padding: 24px;
        text-align: center;
      }
      .email-header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .email-content {
        padding: 32px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 24px;
      }
      .main-message {
        font-size: 16px;
        margin-bottom: 24px;
      }
      .cta-button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #1a73e8;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        font-size: 16px;
        margin-top: 8px;
        margin-bottom: 24px;
      }
      .invoice-details {
        background-color: #f8f9fa;
        padding: 16px;
        border-radius: 6px;
        margin-bottom: 24px;
        border: 1px solid #dee2e6;
      }
      .invoice-details p {
        margin: 0;
        font-size: 14px;
      }
      .invoice-details strong {
        color: #000;
      }
      .signature {
        margin-top: 24px;
        font-size: 14px;
        color: #555;
      }
      .email-footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #6c757d;
      }
      .email-footer a {
        color: #1a73e8;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="email-header">
        <h1>AgentMail</h1>
      </div>
      <div class="email-content">
        <div class="greeting">Hi there,</div>
        <div class="main-message">
          Your invoice for the period of October 2025 is ready. We've automatically charged your saved payment method. Thank you for your business!
        </div>

        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> INV-2025-10-0123</p>
          <p><strong>Amount:</strong> $49.00</p>
          <p><strong>Status:</strong> Paid</p>
        </div>

        <a href="#" class="cta-button">View Full Invoice</a>

        <div class="signature">
          Best regards,<br>
          The AgentMail Team
        </div>
      </div>
    </div>
    <div class="email-footer">
      <p>&copy; 2025 AgentMail, Inc. All Rights Reserved.</p>
      <p><a href="#">Unsubscribe</a> | <a href="#">Billing Settings</a></p>
    </div>
  </body>
</html>
```
</CodeBlocks>

<Frame caption="Look how pretty this message looks!">
  <img src="file:f33dc26f-d02d-4290-a47a-73ba9d341dd1" alt="rendered css" />
</Frame>

## Receiving `Messages`

While you can periodically list `Messages` to check for new emails, the most efficient way to handle incoming `Messages` for your agents is with `Webhooks`. By configuring a `Webhook` endpoint, AgentMail can notify your application/agent in real-time as soon as a new `Message` arrives, so you can take action on them.

<CardGroup>
  <Card
    title="Guide: Webhooks"
    icon="fa-solid fa-bolt"
    href="/overview"
  >
    Learn how to set up webhooks for real-time message processing.
  </Card>
</CardGroup>
````
