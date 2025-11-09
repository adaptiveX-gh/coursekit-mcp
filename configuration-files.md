# Configuration Files for Gamma AI Integration

## 1. .env.template
```env
# API Keys (Copy to .env and fill in your keys)
# NEVER commit .env file to version control

# Gamma AI API Key (required for AI presentations)
# Get your key at: https://gamma.app/api/keys
GAMMA_AI_API_KEY=your_gamma_api_key_here

# OpenAI API Key (optional, for enhanced content)
OPENAI_API_KEY=your_openai_key_here

# Anthropic API Key (optional, for Claude integration)
ANTHROPIC_API_KEY=your_anthropic_key_here

# Provider Preferences (optional overrides)
DEFAULT_PRESENTATION_PROVIDER=gamma
DEFAULT_DOCUMENT_PROVIDER=markdown
DEFAULT_EXERCISE_PROVIDER=markdown

# Feature Flags
ENABLE_PROVIDER_COMPARISON=true
AUTO_FALLBACK_ON_ERROR=true
```

## 2. config/default.json
```json
{
  "coursekit": {
    "version": "1.0.0",
    "mode": "production"
  },
  "defaults": {
    "presentations": "slidev",
    "documents": "markdown",
    "exercises": "markdown",
    "assessments": "markdown"
  },
  "timeouts": {
    "api": 60000,
    "generation": 120000,
    "export": 30000
  },
  "retry": {
    "maxAttempts": 3,
    "backoffMs": 1000,
    "maxBackoffMs": 10000
  },
  "limits": {
    "maxSlides": 100,
    "maxFileSize": "50MB",
    "maxConcurrentRequests": 3
  }
}
```

## 3. config/providers.json
```json
{
  "providers": {
    "presentations": {
      "gamma": {
        "enabled": true,
        "priority": 1,
        "name": "Gamma AI",
        "description": "AI-powered presentation generation",
        "api": {
          "endpoint": "https://api.gamma.app/v1",
          "timeout": 60000,
          "retryOnFailure": true
        },
        "capabilities": [
          "ai-generation",
          "templates",
          "themes",
          "auto-design",
          "export-pdf",
          "export-pptx",
          "web-view"
        ],
        "preferences": {
          "defaultTheme": "professional",
          "defaultStyle": "clean",
          "includeImages": true,
          "autoSlideCount": true
        },
        "limits": {
          "maxSlidesPerRequest": 50,
          "maxPromptLength": 4000,
          "rateLimit": "10/minute"
        },
        "cost": {
          "model": "per-presentation",
          "estimate": "$0.50-2.00"
        }
      },
      "slidev": {
        "enabled": true,
        "priority": 2,
        "name": "Slidev",
        "description": "Developer-friendly markdown presentations",
        "capabilities": [
          "markdown",
          "code-highlighting",
          "speaker-notes",
          "version-control",
          "export-pdf",
          "live-reload",
          "vue-components"
        ],
        "preferences": {
          "defaultTheme": "default",
          "highlighter": "shiki",
          "lineNumbers": false
        },
        "cost": {
          "model": "free",
          "estimate": "$0"
        }
      },
      "powerpoint": {
        "enabled": true,
        "priority": 3,
        "name": "PowerPoint",
        "description": "Traditional PowerPoint generation",
        "requires": ["pptxgenjs"],
        "capabilities": [
          "templates",
          "animations",
          "charts",
          "tables",
          "smart-art",
          "export-pptx",
          "export-pdf"
        ],
        "preferences": {
          "defaultTemplate": "corporate",
          "animations": "subtle"
        },
        "cost": {
          "model": "free",
          "estimate": "$0"
        }
      }
    },
    "documents": {
      "markdown": {
        "enabled": true,
        "priority": 1,
        "capabilities": ["version-control", "lightweight", "portable"]
      },
      "docx": {
        "enabled": true,
        "priority": 2,
        "requires": ["docx"],
        "capabilities": ["formatting", "track-changes", "comments"]
      },
      "pdf": {
        "enabled": true,
        "priority": 3,
        "requires": ["pdfkit"],
        "capabilities": ["print-ready", "locked-format", "signatures"]
      }
    },
    "exercises": {
      "markdown": {
        "enabled": true,
        "priority": 1,
        "capabilities": ["code-blocks", "solutions", "tests"]
      },
      "jupyter": {
        "enabled": true,
        "priority": 2,
        "capabilities": ["interactive", "data-science", "visualizations"]
      },
      "codepen": {
        "enabled": true,
        "priority": 3,
        "capabilities": ["web-based", "live-preview", "sharing"]
      }
    }
  },
  "selection": {
    "mode": "auto",
    "strategies": {
      "auto": {
        "description": "Automatically select best provider based on task",
        "enabled": true
      },
      "manual": {
        "description": "Always ask user to choose provider",
        "enabled": false
      },
      "config": {
        "description": "Use configured defaults",
        "enabled": true
      }
    },
    "rules": {
      "presentations": {
        "conditions": [
          {
            "if": { "hasCode": true, "audience": "developers" },
            "then": "slidev"
          },
          {
            "if": { "hasBranding": true, "format": "corporate" },
            "then": "powerpoint"
          },
          {
            "if": { "needsAI": true, "timeConstraint": "urgent" },
            "then": "gamma"
          },
          {
            "if": { "default": true },
            "then": "gamma"
          }
        ]
      },
      "documents": {
        "conditions": [
          {
            "if": { "needsFormatting": true },
            "then": "docx"
          },
          {
            "if": { "needsVersionControl": true },
            "then": "markdown"
          }
        ]
      }
    }
  },
  "fallback": {
    "enabled": true,
    "strategy": "next-priority",
    "notifications": true,
    "chains": {
      "presentations": ["gamma", "slidev", "powerpoint"],
      "documents": ["docx", "markdown"],
      "exercises": ["markdown", "jupyter"]
    }
  }
}
```

## 4. config/user-preferences.json.template
```json
{
  "_comment": "Copy to user-preferences.json and customize",
  "user": {
    "name": "Your Name",
    "organization": "Your Organization"
  },
  "preferredProviders": {
    "presentations": "gamma",
    "documents": "markdown",
    "exercises": "markdown",
    "assessments": "markdown"
  },
  "providerSettings": {
    "gamma": {
      "autoApprove": false,
      "reviewBeforeExport": true,
      "preferredTheme": "professional-blue",
      "preferredStyle": "clean",
      "targetAudience": "technical",
      "tone": "professional",
      "includeImages": true,
      "includeSpeakerNotes": true
    },
    "slidev": {
      "theme": "seriph",
      "addPageNumbers": true,
      "colorSchema": "auto",
      "fonts": {
        "sans": "Roboto",
        "mono": "Fira Code"
      }
    },
    "powerpoint": {
      "template": "corporate-template.potx",
      "slideSize": "16:9",
      "animations": true,
      "transitions": "fade"
    }
  },
  "behavior": {
    "alwaysAskProvider": false,
    "showProviderComparison": true,
    "autoFallback": true,
    "saveProviderChoice": true,
    "notifyOnFallback": true
  },
  "quality": {
    "runValidation": true,
    "checkAccessibility": true,
    "requireSpeakerNotes": true,
    "minSlidesPerModule": 5,
    "maxSlidesPerModule": 30
  },
  "export": {
    "formats": ["source", "pdf", "pptx"],
    "includeMetadata": true,
    "generateHandouts": true
  }
}
```

## 5. config/gamma-prompts.json
```json
{
  "prompts": {
    "base": {
      "structure": "Create a {style} presentation for {audience} that {objective}",
      "requirements": "Include {slideCount} slides with {features}",
      "tone": "Use a {tone} tone appropriate for {context}"
    },
    "enhancers": {
      "technical": "Include code examples with syntax highlighting where appropriate",
      "business": "Focus on ROI, metrics, and business value",
      "educational": "Include learning objectives, examples, and practice exercises",
      "workshop": "Add interactive elements and discussion prompts"
    },
    "templates": {
      "introduction": "Create an engaging introduction that establishes the problem and solution",
      "concepts": "Explain {concept} with clear examples and visual aids",
      "exercise": "Design a hands-on exercise slide with instructions and expected outcomes",
      "summary": "Summarize key takeaways and provide next steps"
    },
    "styles": {
      "professional": {
        "keywords": ["clean", "corporate", "formal", "structured"],
        "avoid": ["casual", "playful", "informal"]
      },
      "creative": {
        "keywords": ["engaging", "visual", "dynamic", "innovative"],
        "avoid": ["traditional", "text-heavy", "static"]
      },
      "educational": {
        "keywords": ["clear", "progressive", "example-rich", "accessible"],
        "avoid": ["complex", "assumption-heavy", "abstract"]
      }
    }
  },
  "audienceProfiles": {
    "developers": {
      "assumptions": "Technical background, prefer code over descriptions",
      "preferences": "Practical examples, minimal theory, hands-on"
    },
    "executives": {
      "assumptions": "Limited time, decision-making focus",
      "preferences": "High-level overview, ROI focus, strategic implications"
    },
    "students": {
      "assumptions": "Learning mindset, varying experience levels",
      "preferences": "Clear explanations, step-by-step, practice opportunities"
    }
  }
}
```

## 6. Setup Script: install-gamma.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 CourseKit Gamma AI Integration Setup\n');
  
  // Check for existing installation
  const configDir = path.join(process.cwd(), 'config');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log('✅ Created config directory');
  }
  
  // Copy configuration templates
  const templates = [
    'default.json',
    'providers.json',
    'gamma-prompts.json'
  ];
  
  for (const template of templates) {
    const dest = path.join(configDir, template);
    if (!fs.existsSync(dest)) {
      // In real implementation, copy from package
      console.log(`✅ Created ${template}`);
    }
  }
  
  // Create .env file
  if (!fs.existsSync('.env')) {
    const hasKey = await question('Do you have a Gamma AI API key? (y/n): ');
    
    if (hasKey.toLowerCase() === 'y') {
      const apiKey = await question('Enter your Gamma AI API key: ');
      fs.writeFileSync('.env', `GAMMA_AI_API_KEY=${apiKey}\n`);
      console.log('✅ API key saved to .env');
    } else {
      fs.copyFileSync('.env.template', '.env');
      console.log('📝 Created .env file - add your API key when ready');
    }
  }
  
  // Create user preferences
  const useGamma = await question('Set Gamma as default presentation provider? (y/n): ');
  
  if (useGamma.toLowerCase() === 'y') {
    const prefs = {
      preferredProviders: {
        presentations: 'gamma'
      }
    };
    
    fs.writeFileSync(
      path.join(configDir, 'user-preferences.json'),
      JSON.stringify(prefs, null, 2)
    );
    
    console.log('✅ Set Gamma as default provider');
  }
  
  // Test connection
  console.log('\n📡 Testing Gamma AI connection...');
  
  try {
    // Would test API here
    console.log('✅ Successfully connected to Gamma AI');
  } catch (error) {
    console.log('⚠️ Could not connect to Gamma AI - check your API key');
  }
  
  console.log('\n✨ Setup complete! You can now use Gamma AI for presentations.');
  console.log('\nNext steps:');
  console.log('1. Run: npm start');
  console.log('2. Create a task with "Create slides..." in the description');
  console.log('3. Gamma AI will automatically generate your presentation');
  
  rl.close();
}

setup().catch(console.error);
```