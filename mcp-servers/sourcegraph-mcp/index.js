import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fetch from 'node-fetch';

const SG_URL = process.env.SOURCEGRAPH_URL?.replace(/\/\/+$/,'');
const SG_TOKEN = process.env.SOURCEGRAPH_TOKEN;

async function sgQuery(query, variables) {
  const res = await fetch(`${SG_URL}/.api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${SG_TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error(`Sourcegraph ${res.status}`);
  return res.json();
}

(async () => {
  const server = new McpServer({ name: 'sourcegraph-mcp', version: '0.1.0' });

  server.registerTool('sg_search',
    {
      title: 'Sourcegraph search',
      description: 'Search code across repositories',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' }, first: { type: 'integer', default: 10 } },
        required: ['query']
      }
    },
    async ({ query, first = 10 }) => {
      const gql = `
        query ($query:String!, $first:Int!) {
          search(query:$query, version:V3) {
            results {
              results(first:$first) {
                __typename
                ... on FileMatch {
                  repository { name }
                  file { path }
                  lineMatches { lineNumber preview }
                }
              }
            }
          }
        }`;
      const data = await sgQuery(gql, { query, first });
      return { content: [{ type: 'text', text: JSON.stringify(data.data.search.results.results, null, 2) }] };
    });

  server.registerTool('sg_get_file',
    {
      title: 'Get file content',
      description: 'Fetch file content by repo @rev and path',
      inputSchema: {
        type: 'object',
        properties: {
          repo: { type: 'string', description: 'github.com/owner/repo' },
          rev:  { type: 'string', description: 'branch/commit, optional' },
          path: { type: 'string' }
        },
        required: ['repo', 'path']
      }
    },
    async ({ repo, rev = 'HEAD', path }) => {
      const res = await fetch(`${SG_URL}/api/contents/${encodeURIComponent(repo)}/${encodeURIComponent(path)}?ref=${encodeURIComponent(rev)}`, {
        headers: { Authorization: `token ${SG_TOKEN}` }
      });
      if (!res.ok) throw new Error(`Sourcegraph file ${res.status}`);
      const text = await res.text();
      return { content: [{ type: 'text', text }] };
    });

  await server.connect(new StdioServerTransport());
})();