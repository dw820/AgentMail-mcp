#!/usr/bin/env node

import { AgentMailClient } from './dist/client.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testProduction() {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  
  if (!apiKey) {
    console.error('❌ AGENTMAIL_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Starting AgentMail Production Test...\n');

  const client = new AgentMailClient(apiKey);
  const testInboxId = 'opentable_3@agentmail.to';
  const testRecipient = 'opentable_1@agentmail.to';

  try {
    // Test 1: Get specific inbox
    console.log('📬 Test 1: Getting inbox details...');
    const inbox = await client.getInbox(testInboxId);
    console.log('✅ Inbox retrieved successfully:');
    console.log(`   - ID: ${inbox.id}`);
    console.log(`   - Name: ${inbox.name}`);
    console.log(`   - Address: ${inbox.address}`);
    console.log(`   - Created: ${inbox.created_at}\n`);

    // Test 2: Get messages from inbox
    console.log('📧 Test 2: Getting messages from inbox...');
    const messages = await client.getMessages(testInboxId, 5);
    console.log(`✅ Retrieved ${messages.length} messages:`);
    messages.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.subject} (from: ${msg.from.email})`);
    });
    console.log('');

    // Test 3: Get a specific message if any exist
    if (messages.length > 0) {
      console.log('📖 Test 3: Getting specific message details...');
      const firstMessage = messages[0];
      const messageDetails = await client.getMessage(testInboxId, firstMessage.id);
      console.log('✅ Message details retrieved:');
      console.log(`   - Subject: ${messageDetails.subject}`);
      console.log(`   - From: ${messageDetails.from.email}`);
      console.log(`   - Text: ${messageDetails.text?.substring(0, 100)}...`);
      console.log('');
    }

    // Test 4: Send a test message
    console.log('📤 Test 4: Sending test message...');
    const sentMessage = await client.sendMessage({
      inbox_id: testInboxId,
      to: testRecipient,
      subject: `AgentMail MCP Test - ${new Date().toISOString()}`,
      text: 'This is a test message sent from the AgentMail MCP server using the official SDK.',
      html: '<h1>Test Message</h1><p>This is a test message sent from the <strong>AgentMail MCP server</strong> using the official SDK.</p>'
    });
    console.log('✅ Message sent successfully:');
    console.log(`   - Message ID: ${sentMessage.id}`);
    console.log(`   - Subject: ${sentMessage.subject}`);
    console.log(`   - To: ${sentMessage.to.map(t => t.email).join(', ')}\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('✅ AgentMail SDK integration is working correctly with the production API.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testProduction();