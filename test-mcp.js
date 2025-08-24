#!/usr/bin/env node

import { AgentMailServer } from './dist/server.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testMCPServer() {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  
  if (!apiKey) {
    console.error('❌ AGENTMAIL_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Testing MCP Server initialization...\n');

  try {
    const server = new AgentMailServer();
    console.log('✅ AgentMailServer created successfully');
    
    console.log('📋 Available MCP tools:');
    console.log('   - agentmail_list_inboxes: List all available inboxes');
    console.log('   - agentmail_get_inbox: Get details of a specific inbox');
    console.log('   - agentmail_create_inbox: Create a new inbox');
    console.log('   - agentmail_get_messages: Get messages from an inbox');
    console.log('   - agentmail_get_message: Get details of a specific message');
    console.log('   - agentmail_send_message: Send a new message');
    
    console.log('\n🎉 MCP Server is ready for use!');
    console.log('💡 You can now test it with MCP Inspector or integrate with Claude Desktop');
    
  } catch (error) {
    console.error('❌ MCP Server test failed:', error.message);
    process.exit(1);
  }
}

testMCPServer();