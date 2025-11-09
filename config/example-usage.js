#!/usr/bin/env node

/**
 * ConfigurationManager - Example Usage
 *
 * Demonstrates all major features of the configuration system
 */

import { config } from './ConfigurationManager.js';

async function main() {
  console.log('🎓 CourseKit Configuration Manager - Example Usage\n');
  console.log('='.repeat(60));

  // 1. Initialize configuration
  console.log('\n📋 Step 1: Initialize Configuration');
  await config.initialize();
  console.log('✓ Configuration loaded from all sources');

  // 2. Get system information
  console.log('\n📊 Step 2: Get System Information');
  const systemName = config.get('system.name');
  const version = config.get('system.version');
  console.log(`System: ${systemName} v${version}`);

  // 3. Get provider status
  console.log('\n🔌 Step 3: Check Provider Status');
  const providers = config.getAllProviders();

  console.log('\nPresentation Providers:');
  for (const [name, provider] of Object.entries(providers.presentations || {})) {
    const status = provider.enabled ? '✓' : '✗';
    const apiKeyNeeded = provider.requirements?.apiKey ? '🔑' : '';
    console.log(`  ${status} ${name.padEnd(12)} ${apiKeyNeeded}`);
  }

  console.log('\nDocument Providers:');
  for (const [name, provider] of Object.entries(providers.documents || {})) {
    const status = provider.enabled ? '✓' : '✗';
    console.log(`  ${status} ${name.padEnd(12)}`);
  }

  // 4. Provider selection examples
  console.log('\n🎯 Step 4: Provider Selection Examples');

  // Example 1: Technical slides with code
  console.log('\nExample 1: Technical slides with code highlighting');
  const techProvider = config.getProvider('slides', {
    features: ['code-highlighting', 'mermaid'],
    techLevel: 'advanced'
  });
  if (techProvider) {
    console.log(`  Selected: ${techProvider.name} (score: ${techProvider.priority})`);
    console.log(`  Capabilities: ${techProvider.capabilities.features.slice(0, 3).join(', ')}...`);
  }

  // Example 2: Documentation in markdown
  console.log('\nExample 2: Documentation in markdown format');
  const docProvider = config.getProvider('documentation', {
    format: 'markdown'
  });
  if (docProvider) {
    console.log(`  Selected: ${docProvider.name} (score: ${docProvider.priority})`);
  }

  // Example 3: Beginner-friendly presentation
  console.log('\nExample 3: Beginner-friendly presentation');
  const beginnerProvider = config.getProvider('presentation', {
    techLevel: 'beginner'
  });
  if (beginnerProvider) {
    console.log(`  Selected: ${beginnerProvider.name} (score: ${beginnerProvider.priority})`);
  }

  // 5. Get specific provider configuration
  console.log('\n⚙️  Step 5: Get Provider Configuration');
  const slidevConfig = config.getProviderConfig('slidev');
  if (slidevConfig) {
    console.log('\nSlidev Configuration:');
    console.log(`  Default Theme: ${slidevConfig.config.defaultTheme}`);
    console.log(`  Highlighter: ${slidevConfig.config.highlighter}`);
    console.log(`  Transition: ${slidevConfig.config.transition}`);
    console.log(`  Features: ${slidevConfig.capabilities.features.length} available`);
  }

  // 6. Check API key availability
  console.log('\n🔐 Step 6: API Key Status');
  const gammaKey = config.getAPIKey('gamma');
  if (gammaKey) {
    console.log('  ✓ Gamma AI: API key configured');
  } else {
    console.log('  ℹ Gamma AI: No API key (set GAMMA_API_KEY to enable)');
  }

  // 7. User preferences
  console.log('\n👤 Step 7: User Preferences');
  const currentPref = config.get('providers.presentations.preferredProvider');
  console.log(`  Current preferred provider: ${currentPref || 'auto-select'}`);

  // Set a preference (commented out to avoid modifying user config)
  // config.set('providers.presentations.preferredProvider', 'slidev');
  // await config.save();
  // console.log('  ✓ Preference saved');

  // 8. Configuration paths
  console.log('\n📁 Step 8: Important Paths');
  const coursekitPath = config.get('paths.coursekit');
  const outputPath = config.get('paths.output');
  console.log(`  CourseKit directory: ${coursekitPath}`);
  console.log(`  Output directory: ${outputPath}`);

  // 9. Security features
  console.log('\n🔒 Step 9: Security Features');
  const safeConfig = config.getSafeConfig();
  console.log('  ✓ Sensitive fields redacted in safe config');
  console.log(`  ✓ Configuration validation: ${config.validateConfig(safeConfig).valid ? 'passed' : 'failed'}`);

  // Test path sanitization (safely)
  try {
    const safePath = config.sanitizePath('./config/default.json');
    console.log('  ✓ Path sanitization: working');
  } catch (error) {
    console.log('  ✗ Path sanitization: failed');
  }

  // 10. Export for debugging
  console.log('\n🔍 Step 10: Configuration Sources');
  const exported = config.exportConfig();
  console.log(`  System defaults loaded: ${Object.keys(exported.systemDefaults).length > 0 ? 'yes' : 'no'}`);
  console.log(`  Provider defaults loaded: ${Object.keys(exported.providerDefaults).length > 0 ? 'yes' : 'no'}`);
  console.log(`  User preferences loaded: ${Object.keys(exported.userPreferences).length > 0 ? 'yes' : 'no'}`);
  console.log(`  Environment variables: ${Object.keys(exported.envConfig).length} found`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✓ Example completed successfully!');
  console.log('\nNext steps:');
  console.log('  1. Copy .env.example to .env and add your API keys');
  console.log('  2. Customize user-preferences.json for your needs');
  console.log('  3. Run: node config/ConfigurationManager.test.js');
  console.log('\nSee config/README.md for full documentation.');
  console.log('='.repeat(60) + '\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
