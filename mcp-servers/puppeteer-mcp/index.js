#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');
const puppeteer = require('puppeteer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('headless', {
    type: 'boolean',
    description: 'Run browser in headless mode',
    default: true
  })
  .option('width', {
    type: 'number',
    description: 'Browser viewport width',
    default: 1280
  })
  .option('height', {
    type: 'number',
    description: 'Browser viewport height',
    default: 720
  })
  .option('timeout', {
    type: 'number',
    description: 'Default timeout for operations (ms)',
    default: 30000
  })
  .help()
  .alias('help', 'h')
  .parse();

class PuppeteerMCPServer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.headless = argv.headless;
    this.width = argv.width;
    this.height = argv.height;
    this.timeout = argv.timeout;
    
    this.server = new Server(
      {
        name: 'puppeteer-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
  }

  async ensureBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      console.error('Launching browser...');
      this.browser = await puppeteer.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewport({
        width: this.width,
        height: this.height
      });
      
      // Set default timeout
      this.page.setDefaultTimeout(this.timeout);
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'navigate',
            description: 'Navigate to a URL',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to navigate to'
                }
              },
              required: ['url']
            }
          },
          {
            name: 'screenshot',
            description: 'Take a screenshot of the current page',
            inputSchema: {
              type: 'object',
              properties: {
                fullPage: {
                  type: 'boolean',
                  description: 'Capture full page including scrollable content',
                  default: false
                },
                selector: {
                  type: 'string',
                  description: 'CSS selector to screenshot specific element'
                }
              }
            }
          },
          {
            name: 'click',
            description: 'Click on an element',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector of the element to click'
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'type',
            description: 'Type text into an input field',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector of the input element'
                },
                text: {
                  type: 'string',
                  description: 'Text to type'
                },
                clear: {
                  type: 'boolean',
                  description: 'Clear the input before typing',
                  default: true
                }
              },
              required: ['selector', 'text']
            }
          },
          {
            name: 'select',
            description: 'Select an option from a dropdown',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector of the select element'
                },
                value: {
                  type: 'string',
                  description: 'Value to select'
                }
              },
              required: ['selector', 'value']
            }
          },
          {
            name: 'wait_for_element',
            description: 'Wait for an element to appear',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector to wait for'
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in milliseconds',
                  default: 30000
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'get_text',
            description: 'Get text content from an element',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector of the element'
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'get_page_content',
            description: 'Get the full HTML content of the current page',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'evaluate',
            description: 'Execute JavaScript code in the browser context',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'JavaScript code to execute'
                }
              },
              required: ['code']
            }
          },
          {
            name: 'scroll',
            description: 'Scroll the page',
            inputSchema: {
              type: 'object',
              properties: {
                x: {
                  type: 'number',
                  description: 'Horizontal scroll position',
                  default: 0
                },
                y: {
                  type: 'number',
                  description: 'Vertical scroll position',
                  default: 0
                }
              }
            }
          },
          {
            name: 'hover',
            description: 'Hover over an element',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: 'CSS selector of the element to hover over'
                }
              },
              required: ['selector']
            }
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      await this.ensureBrowser();
      
      switch (name) {
        case 'navigate':
          return await this.handleNavigate(args);
        case 'screenshot':
          return await this.handleScreenshot(args);
        case 'click':
          return await this.handleClick(args);
        case 'type':
          return await this.handleType(args);
        case 'select':
          return await this.handleSelect(args);
        case 'wait_for_element':
          return await this.handleWaitForElement(args);
        case 'get_text':
          return await this.handleGetText(args);
        case 'get_page_content':
          return await this.handleGetPageContent(args);
        case 'evaluate':
          return await this.handleEvaluate(args);
        case 'scroll':
          return await this.handleScroll(args);
        case 'hover':
          return await this.handleHover(args);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  async handleNavigate(args) {
    const { url } = args;
    
    if (!url) {
      throw new McpError(ErrorCode.InvalidParams, 'URL is required');
    }

    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      const finalUrl = this.page.url();
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully navigated to: ${finalUrl}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Navigation failed: ${error.message}`);
    }
  }

  async handleScreenshot(args) {
    const { fullPage = false, selector } = args || {};

    try {
      let screenshotOptions = {
        fullPage,
        encoding: 'base64'
      };

      let screenshot;
      if (selector) {
        const element = await this.page.$(selector);
        if (!element) {
          throw new Error(`Element with selector "${selector}" not found`);
        }
        screenshot = await element.screenshot({ encoding: 'base64' });
      } else {
        screenshot = await this.page.screenshot(screenshotOptions);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Screenshot taken successfully${selector ? ` of element "${selector}"` : ''}`
          },
          {
            type: 'text',
            text: `Base64 data length: ${screenshot.length} characters`
          }
        ],
        isError: false,
        metadata: {
          screenshot: screenshot,
          selector: selector || null,
          fullPage: fullPage
        }
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Screenshot failed: ${error.message}`);
    }
  }

  async handleClick(args) {
    const { selector } = args;
    
    if (!selector) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector is required');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully clicked element: ${selector}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Click failed: ${error.message}`);
    }
  }

  async handleType(args) {
    const { selector, text, clear = true } = args;
    
    if (!selector || !text) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector and text are required');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      if (clear) {
        await this.page.evaluate((sel) => {
          const element = document.querySelector(sel);
          if (element) element.value = '';
        }, selector);
      }
      
      await this.page.type(selector, text);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully typed "${text}" into element: ${selector}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Type failed: ${error.message}`);
    }
  }

  async handleSelect(args) {
    const { selector, value } = args;
    
    if (!selector || !value) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector and value are required');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.select(selector, value);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully selected "${value}" in element: ${selector}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Select failed: ${error.message}`);
    }
  }

  async handleWaitForElement(args) {
    const { selector, timeout = 30000 } = args;
    
    if (!selector) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector is required');
    }

    try {
      await this.page.waitForSelector(selector, { timeout });
      
      return {
        content: [
          {
            type: 'text',
            text: `Element appeared: ${selector}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Wait failed: ${error.message}`);
    }
  }

  async handleGetText(args) {
    const { selector } = args;
    
    if (!selector) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector is required');
    }

    try {
      const text = await this.page.$eval(selector, (element) => element.textContent);
      
      return {
        content: [
          {
            type: 'text',
            text: `Text from element "${selector}": ${text}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Get text failed: ${error.message}`);
    }
  }

  async handleGetPageContent(args) {
    try {
      const content = await this.page.content();
      
      return {
        content: [
          {
            type: 'text',
            text: `Page HTML content (${content.length} characters):\n\n${content}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Get page content failed: ${error.message}`);
    }
  }

  async handleEvaluate(args) {
    const { code } = args;
    
    if (!code) {
      throw new McpError(ErrorCode.InvalidParams, 'Code is required');
    }

    try {
      const result = await this.page.evaluate(code);
      
      return {
        content: [
          {
            type: 'text',
            text: `JavaScript execution result: ${JSON.stringify(result, null, 2)}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `JavaScript evaluation failed: ${error.message}`);
    }
  }

  async handleScroll(args) {
    const { x = 0, y = 0 } = args || {};

    try {
      await this.page.evaluate((scrollX, scrollY) => {
        window.scrollTo(scrollX, scrollY);
      }, x, y);
      
      return {
        content: [
          {
            type: 'text',
            text: `Scrolled to position (${x}, ${y})`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Scroll failed: ${error.message}`);
    }
  }

  async handleHover(args) {
    const { selector } = args;
    
    if (!selector) {
      throw new McpError(ErrorCode.InvalidParams, 'Selector is required');
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.hover(selector);
      
      return {
        content: [
          {
            type: 'text',
            text: `Successfully hovered over element: ${selector}`
          }
        ],
        isError: false
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Hover failed: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Puppeteer MCP Server is running...');
  }

  async cleanup() {
    if (this.browser) {
      try {
        await this.browser.close();
        console.error('Browser closed');
      } catch (error) {
        console.error('Error closing browser:', error.message);
      }
    }
  }
}

// Error handling and cleanup
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down...');
  if (global.puppeteerServer) {
    await global.puppeteerServer.cleanup();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down...');
  if (global.puppeteerServer) {
    await global.puppeteerServer.cleanup();
  }
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function main() {
  try {
    const server = new PuppeteerMCPServer();
    global.puppeteerServer = server;
    await server.run();
  } catch (error) {
    console.error('Failed to start Puppeteer MCP server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}