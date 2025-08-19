# Docker MCP Server

This MCP server provides access to the Docker API, allowing you to manage containers and images.

## Configuration

This server connects to the Docker daemon via the default Unix socket (`/var/run/docker.sock`). No additional configuration is required.

### Connecting from a container

If you are running this MCP server inside a container, you will need to mount the Docker socket into the container:

```
docker run -v /var/run/docker.sock:/var/run/docker.sock ...
```

Alternatively, you can set the `DOCKER_HOST` environment variable to point to the Docker daemon's TCP address.

## Usage

// TODO: Add usage examples here