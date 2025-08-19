const Docker = require('dockerode');
const { McpServer } = require(' @modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require(' @modelcontextprotocol/sdk/server/stdio.js');

const docker = new Docker();

(async () => {
  const server = new McpServer({ name: 'docker-mcp', version: '0.1.0' });

  server.registerTool('list_containers',
    { title: 'List containers', description: 'List Docker containers (all=true)' },
    async () => {
      const data = await docker.listContainers({ all: true });
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });

  server.registerTool('list_images',
    { title: 'List images', description: 'List Docker images' },
    async () => {
      const data = await docker.listImages();
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    });

  server.registerTool('create_container',
    {
      title: 'Create container',
      description: 'Create and start a container',
      inputSchema: {
        type: 'object',
        properties: {
          image: { type: 'string' },
          command: { type: 'array', items: { type: 'string' }, default: [] }
        },
        required: ['image']
      }
    },
    async ({ image, command = [] }) => {
      const c = await docker.createContainer({ Image: image, Cmd: command });
      await c.start();
      return { content: [{ type: 'text', text: `Started: ${c.id}` }] };
    });

  server.registerTool('stop_container',
    {
      title: 'Stop container',
      description: 'Stop a running container',
      inputSchema: {
        type: 'object',
        properties: { containerId: { type: 'string' } },
        required: ['containerId']
      }
    },
    async ({ containerId }) => {
      const c = docker.getContainer(containerId);
      await c.stop();
      return { content: [{ type: 'text', text: `Stopped: ${containerId}` }] };
    });

  await server.connect(new StdioServerTransport());
})();