# Puppeteer MCP Server

A comprehensive browser automation server using Puppeteer and the Model Context Protocol (MCP). This server enables AI assistants to interact with web pages, take screenshots, and perform various browser automation tasks.

## Features

- **Navigation**: Navigate to any URL with network idle detection
- **Screenshots**: Take full-page or element-specific screenshots 
- **Element Interaction**: Click, type, hover, and select from dropdowns
- **Content Extraction**: Get text content and full HTML from pages
- **JavaScript Execution**: Run custom JavaScript in the browser context
- **Page Control**: Scroll, wait for elements, and handle dynamic content
- **Configurable**: Headless/headed mode, custom viewport, timeouts

## Tools

### Navigation
- `navigate` - Navigate to a URL

### Screenshots  
- `screenshot` - Take screenshots (full page or specific elements)

### Element Interaction
- `click` - Click on elements using CSS selectors
- `type` - Type text into input fields with optional clearing
- `select` - Select options from dropdown menus
- `hover` - Hover over elements

### Content Extraction
- `get_text` - Extract text content from elements
- `get_page_content` - Get full HTML content of the current page

### Advanced Operations
- `evaluate` - Execute JavaScript code in the browser context
- `wait_for_element` - Wait for elements to appear with custom timeouts
- `scroll` - Scroll to specific positions

## Installation

```bash
cd puppeteer-mcp
npm install
```

## Usage

### Basic Usage

```bash
npm start
```

### With Custom Options

```bash
node index.js --headless=false --width=1920 --height=1080 --timeout=60000
```

### Options

- `--headless` - Run browser in headless mode (default: true)
- `--width` - Browser viewport width (default: 1280)
- `--height` - Browser viewport height (default: 720)
- `--timeout` - Default timeout for operations in ms (default: 30000)
- `--help` - Show help

## Example Usage

### Navigate and Screenshot
```json
{
  "tool": "navigate",
  "arguments": {
    "url": "https://example.com"
  }
}

{
  "tool": "screenshot",
  "arguments": {
    "fullPage": true
  }
}
```

### Fill a Form
```json
{
  "tool": "type",
  "arguments": {
    "selector": "#email",
    "text": "user@example.com"
  }
}

{
  "tool": "click",
  "arguments": {
    "selector": "#submit-button"
  }
}
```

### Extract Content
```json
{
  "tool": "get_text",
  "arguments": {
    "selector": "h1"
  }
}
```

### Execute JavaScript
```json
{
  "tool": "evaluate",
  "arguments": {
    "code": "document.title"
  }
}
```

## Browser Configuration

The server automatically configures Chromium with safe defaults:
- Disabled sandbox for Docker compatibility
- Optimized for headless operation
- Reduced memory usage settings
- Network idle detection for reliable loading

## Security Considerations

- **Sandbox**: Running with `--no-sandbox` for Docker compatibility
- **Resource Limits**: Configure appropriate timeouts to prevent hanging
- **Network**: Only navigates to URLs provided by the client
- **JavaScript**: Executes custom code in browser context (use with caution)

## Troubleshooting

### Chrome/Chromium Issues
If Puppeteer fails to launch Chrome:
```bash
# On Ubuntu/Debian
sudo apt-get install chromium-browser

# On CentOS/RHEL
sudo yum install chromium
```

### Memory Issues
For low-memory environments:
- Use headless mode (default)
- Reduce viewport size
- Set shorter timeouts

### Docker Compatibility
The server includes Docker-friendly Chrome flags:
- `--no-sandbox`
- `--disable-setuid-sandbox` 
- `--disable-dev-shm-usage`

## Performance Tips

- Use `headless: true` for better performance
- Set appropriate timeouts for your use case
- Close the browser when done (handled automatically)
- Use element screenshots instead of full page when possible

## License

MIT License